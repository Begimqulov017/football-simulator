// ============================================================
// NATIONAL TEAMS + INTERNATIONAL TOURNAMENTS (server-side)
// ============================================================
// Runs on the SAME shared calendar as the league worlds: the admin advances
// one day, every league resolves whatever fixtures fall on that date, and then
// this module resolves whatever international fixtures fall on it.
//
// Two kinds of international fixture exist:
//   * International breaks  - friendlies, every ~70 days during the season.
//   * Major tournaments     - one per summer, on a fixed rotation so a World
//                             Cup and a continental cup never collide:
//                               year % 4 === 2  -> World Cup   (2026, 2030...)
//                               year % 4 === 0  -> Euro + Copa America +
//                                                  Asian Cup + Africa Cup
//                               odd years       -> friendlies only
//
// Squads are RE-PICKED from scratch before every international fixture: the
// best players of each nationality alive in the world right now, human players
// included. Nobody has a permanent place - if a user's rating climbs high
// enough they get called up, and if it slips they get dropped again.
// ============================================================

const engine = require('./engine');
const { LEAGUES } = require('./gamedata/leaguesData');
const { INITIAL_TEAMS } = require('./gamedata/teamsData');
const { NATIONS, nationsOf, nationalityFor, flagFor, confederationOf } = require('./gamedata/nationsData');

const SQUAD_SIZE = 23;
const MIN_SQUAD_FOR_ELIGIBILITY = 11; // smaller nations simply don't enter
const BREAK_INTERVAL_DAYS = 70;
const CALENDAR_EPOCH = '2026-08-01';
const TOURNAMENT_START_MMDD = '-06-10';
// No friendlies inside this window - the summer belongs to the tournaments.
const SUMMER_START_MMDD = '-06-01';
const SUMMER_END_MMDD = '-07-20';

const DAY_MS = 24 * 60 * 60 * 1000;
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / DAY_MS);
const addDays = engine.addDays;
const yearOf = (iso) => Number(iso.slice(0, 4));

// ------------------------------------------------------------
// Player pool
// ------------------------------------------------------------
// Every player in the game is eligible, not just the ones in leagues somebody
// has started a career in. Clubs whose league has an active shared world are
// read from that world (so ageing/retirement/academy intake is reflected);
// every other club falls back to the static shipped squad, with nationality
// derived from the player id - identical to what the world would have given
// them, so a league joining the shared world never reshuffles nationalities.
function buildPlayerPool(db) {
  const pool = {};
  const add = (p) => {
    if (!p.nationality) return;
    (pool[p.nationality] = pool[p.nationality] || []).push(p);
  };

  LEAGUES.forEach((league) => {
    const world = db.leagueWorlds?.[league.id];
    league.teamIds.forEach((clubId) => {
      const team = INITIAL_TEAMS.find((t) => t.id === clubId);
      if (!team) return;
      const squad = world?.squads?.[clubId] || team.squad;
      squad.forEach((p) => add({
        id: p.id,
        name: p.name,
        pos: p.pos,
        ovr: p.ovr || 68,
        age: p.age || null,
        nationality: p.nationality || nationalityFor(p.id, league.country),
        clubId,
        clubName: team.name,
        username: null
      }));
    });
  });

  // Human players. Their careerSave is the source of truth for rating and club.
  (db.users || []).forEach((u) => {
    const cs = u.careerSave;
    if (!cs?.nationality) return;
    add({
      id: cs.id || `user_${u.username}`,
      name: `${cs.name} ${cs.surname}`.trim(),
      pos: cs.position,
      ovr: cs.overall || 60,
      age: cs.age || null,
      nationality: cs.nationality,
      clubId: cs.club?.id || null,
      clubName: cs.club?.name || null,
      username: u.username,
      injured: !!cs.career?.injury?.daysLeft
    });
  });

  return pool;
}

// Best SQUAD_SIZE players of a nation, but with a floor on keepers and
// defenders so a "national team" is never 23 strikers - the match engine
// reads positions when it decides who scores.
function pickSquad(players) {
  const byOvr = [...players].filter((p) => !p.injured).sort((a, b) => b.ovr - a.ovr);
  const squad = [];
  const taken = new Set();
  const takeSome = (filterFn, count) => {
    for (const p of byOvr) {
      if (squad.length >= SQUAD_SIZE || count <= 0) break;
      if (taken.has(p.id) || !filterFn(p)) continue;
      squad.push(p); taken.add(p.id); count -= 1;
    }
  };
  takeSome((p) => p.pos === 'GK', 3);
  takeSome((p) => ['CB', 'LB', 'RB'].includes(p.pos), 7);
  takeSome((p) => ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(p.pos), 6);
  takeSome((p) => ['ST', 'LW', 'RW'].includes(p.pos), 5);
  takeSome(() => true, SQUAD_SIZE); // fill any remaining slots with the best left
  // Positional quotas mean the array is built keepers-first; sort it so the
  // squad reads as a real call-up list (best player at the top).
  return squad.sort((a, b) => b.ovr - a.ovr);
}

function buildNationalTeams(db) {
  const pool = buildPlayerPool(db);
  const teams = {};
  NATIONS.forEach((n) => {
    const players = pool[n.name] || [];
    if (players.length < MIN_SQUAD_FOR_ELIGIBILITY) return;
    const squad = pickSquad(players);
    teams[n.name] = {
      country: n.name,
      flag: n.flag,
      confederation: n.confederation,
      squad,
      strength: engine.teamStrength(squad),
      humans: squad.filter((p) => p.username).map((p) => p.username)
    };
  });
  return teams;
}

// ------------------------------------------------------------
// Calendar
// ------------------------------------------------------------
function isSummerWindow(date) {
  const y = yearOf(date);
  return date >= `${y}${SUMMER_START_MMDD}` && date <= `${y}${SUMMER_END_MMDD}`;
}

function isBreakDay(date) {
  if (isSummerWindow(date)) return false;
  const diff = daysBetween(CALENDAR_EPOCH, date);
  return diff > 0 && diff % BREAK_INTERVAL_DAYS === 0;
}

// The rotation that keeps a World Cup year and a continental year apart.
function tournamentsForYear(year) {
  if (year % 4 === 2) {
    return [{ key: 'world_cup', name: 'FIFA World Cup', confederation: null, size: 32 }];
  }
  if (year % 4 === 0) {
    return [
      { key: 'euro', name: 'UEFA European Championship', confederation: 'UEFA', size: 16 },
      { key: 'copa_america', name: 'Copa América', confederation: 'CONMEBOL', size: 8 },
      { key: 'asian_cup', name: 'AFC Asian Cup', confederation: 'AFC', size: 16 },
      { key: 'africa_cup', name: 'Africa Cup of Nations', confederation: 'CAF', size: 8 }
    ];
  }
  return [];
}

// Group matchdays first, then one knockout round every 4 days.
function stageDatesFor(startDate, size) {
  const groupDates = [0, 4, 8].map((d) => addDays(startDate, d));
  const knockoutRounds = Math.log2(size / 2); // 32 -> 4 (R16,QF,SF,F); 16 -> 3; 8 -> 2
  const knockoutDates = [];
  for (let i = 0; i < knockoutRounds; i += 1) knockoutDates.push(addDays(startDate, 13 + i * 4));
  return { groupDates, knockoutDates };
}

const ROUND_LABEL = { 16: 'Round of 16', 8: 'Quarter-final', 4: 'Semi-final', 2: 'Final' };

// ------------------------------------------------------------
// Match resolution
// ------------------------------------------------------------
function humanPseudoPlayer(db, username) {
  const u = (db.users || []).find((x) => x.username === username);
  if (!u?.careerSave) return null;
  const cs = u.careerSave;
  return {
    username,
    id: cs.id,
    overall: cs.overall,
    position: cs.position,
    // Everyone called up is in the national team's first XI picture.
    club: { tier: 'starter' },
    career: { form: cs.career?.form, stamina: cs.career?.stamina }
  };
}

function playNationalMatch(db, teamA, teamB, topScorers, allowDraw) {
  let { golA, golB } = engine.simulateTeamMatch(teamA.squad, teamB.squad);

  const humanResults = [];
  [['home', teamA, teamB], ['away', teamB, teamA]].forEach(([side, team, opponent]) => {
    team.humans.forEach((username) => {
      const pp = humanPseudoPlayer(db, username);
      if (!pp) return;
      humanResults.push({ username, side, country: team.country, opponentCountry: opponent.country, pStats: engine.simulateHumanPlayerMatch(pp, opponent.squad) });
    });
  });

  const humanGoals = (side) => humanResults.filter((h) => h.side === side).reduce((s, h) => s + (h.pStats.goals || 0), 0);
  golA = Math.max(golA, humanGoals('home'));
  golB = Math.max(golB, humanGoals('away'));

  const humanIdsA = teamA.squad.filter((p) => p.username).map((p) => p.id);
  const humanIdsB = teamB.squad.filter((p) => p.username).map((p) => p.id);
  engine.distributeGoals(teamA.squad, teamA.country, teamA.country, golA - humanGoals('home'), topScorers, humanIdsA);
  engine.distributeGoals(teamB.squad, teamB.country, teamB.country, golB - humanGoals('away'), topScorers, humanIdsB);

  // Human goals still belong in the tournament's top-scorer table.
  humanResults.forEach((h) => {
    if (!h.pStats.goals) return;
    const team = h.side === 'home' ? teamA : teamB;
    const entry = team.squad.find((p) => p.username === h.username);
    if (!entry) return;
    topScorers[entry.id] = topScorers[entry.id] || { id: entry.id, name: entry.name, teamId: team.country, teamName: team.country, goals: 0 };
    topScorers[entry.id].goals += h.pStats.goals;
  });

  let penalties = null;
  if (!allowDraw && golA === golB) {
    // Shootout, weighted by squad strength but far from a formality.
    const edge = (teamA.strength - teamB.strength) / 40;
    const aWins = Math.random() < 0.5 + Math.max(-0.2, Math.min(0.2, edge));
    penalties = aWins ? { a: 5, b: 4 } : { a: 4, b: 5 };
  }

  return { golA, golB, penalties, humanResults };
}

// Writes a national-team appearance onto a human player's careerSave.
function recordHumanInternational(db, hr, context) {
  const u = (db.users || []).find((x) => x.username === hr.username);
  if (!u?.careerSave) return;
  const cs = u.careerSave;
  cs.career = cs.career || {};
  const intl = cs.career.international = cs.career.international || {
    country: hr.country, caps: 0, goals: 0, assists: 0, tournaments: [], trophies: [], lastCallUp: null
  };
  intl.country = hr.country;
  intl.lastCallUp = { date: context.date, opponent: hr.opponentCountry, competition: context.competition };
  if (hr.pStats.played) {
    intl.caps += 1;
    intl.goals += hr.pStats.goals || 0;
    intl.assists += hr.pStats.assists || 0;
    intl.lastCallUp.rating = hr.pStats.rating;
    intl.lastCallUp.goals = hr.pStats.goals || 0;
  }
  u.careerSavedAt = new Date().toISOString();
}

// ------------------------------------------------------------
// Tournament lifecycle
// ------------------------------------------------------------
const VALID_SIZES = [32, 16, 8];

function createTournament(def, year, teams) {
  const pool = Object.values(teams)
    .filter((t) => !def.confederation || t.confederation === def.confederation)
    .sort((a, b) => b.strength - a.strength);

  // The advertised size is a ceiling, not a promise. Confederations differ a
  // lot in how many nations can actually field a squad (CONMEBOL has ten
  // members, and only some of them have 11+ professionals in the game world),
  // so the tournament shrinks to the largest format that fits rather than
  // silently not happening at all.
  const size = VALID_SIZES.filter((n) => n <= def.size && n <= pool.length).sort((a, b) => b - a)[0];
  if (!size) return null;
  const eligible = pool.slice(0, size);

  // Seeded draw: strongest team of each pot into a different group.
  const groupCount = size / 4;
  const groups = Array.from({ length: groupCount }, (_, i) => ({
    name: String.fromCharCode(65 + i), teams: [], table: {}
  }));
  for (let pot = 0; pot < 4; pot += 1) {
    const potTeams = eligible.slice(pot * groupCount, (pot + 1) * groupCount);
    // shuffle within the pot so the same group never repeats every edition
    for (let i = potTeams.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [potTeams[i], potTeams[j]] = [potTeams[j], potTeams[i]];
    }
    potTeams.forEach((t, i) => groups[i].teams.push(t.country));
  }
  groups.forEach((g) => g.teams.forEach((c) => {
    g.table[c] = { country: c, played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, pts: 0 };
  }));

  const startDate = `${year}${TOURNAMENT_START_MMDD}`;
  const { groupDates, knockoutDates } = stageDatesFor(startDate, size);

  return {
    id: `${def.key}_${year}`,
    key: def.key,
    name: def.name,
    confederation: def.confederation,
    year,
    size,
    startDate,
    groupDates,
    knockoutDates,
    groups,
    knockout: [],          // one entry per round: { label, ties: [...] }
    topScorers: {},
    results: [],           // flat log of every match played
    winner: null,
    runnerUp: null,
    finished: false
  };
}

// The three group matchdays as a fixed round-robin of four teams.
const GROUP_PAIRINGS = [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]]];

function playGroupMatchday(db, tournament, matchdayIndex, teams) {
  const played = [];
  tournament.groups.forEach((group) => {
    GROUP_PAIRINGS[matchdayIndex].forEach(([i, j]) => {
      const a = teams[group.teams[i]];
      const b = teams[group.teams[j]];
      if (!a || !b) return;
      const r = playNationalMatch(db, a, b, tournament.topScorers, true);
      const ta = group.table[a.country];
      const tb = group.table[b.country];
      ta.played += 1; tb.played += 1;
      ta.gf += r.golA; ta.ga += r.golB; tb.gf += r.golB; tb.ga += r.golA;
      if (r.golA > r.golB) { ta.win += 1; ta.pts += 3; tb.loss += 1; }
      else if (r.golA < r.golB) { tb.win += 1; tb.pts += 3; ta.loss += 1; }
      else { ta.draw += 1; tb.draw += 1; ta.pts += 1; tb.pts += 1; }

      const match = { stage: `Group ${group.name}`, home: a.country, away: b.country, homeFlag: a.flag, awayFlag: b.flag, golA: r.golA, golB: r.golB };
      played.push(match);
      tournament.results.push(match);
      r.humanResults.forEach((hr) => recordHumanInternational(db, hr, { date: tournament.groupDates[matchdayIndex], competition: tournament.name }));
    });
  });
  return played;
}

function groupWinners(tournament) {
  // Top two of each group, ordered winners-first so the bracket pairs
  // group winners against runners-up the way real draws do.
  const firsts = [];
  const seconds = [];
  tournament.groups.forEach((g) => {
    const table = Object.values(g.table).sort((a, b) =>
      (b.pts - a.pts) || ((b.gf - b.ga) - (a.gf - a.ga)) || (b.gf - a.gf));
    firsts.push(table[0].country);
    seconds.push(table[1].country);
  });
  const order = [];
  for (let i = 0; i < firsts.length; i += 1) {
    order.push(firsts[i]);
    order.push(seconds[(i + 1) % seconds.length]); // winner of A vs runner-up of B
  }
  return order;
}

function playKnockoutRound(db, tournament, roundIndex, teams) {
  const lineup = roundIndex === 0
    ? groupWinners(tournament)
    : tournament.knockout[roundIndex - 1].ties.map((t) => t.winner);
  const label = ROUND_LABEL[lineup.length] || `Round of ${lineup.length}`;
  const ties = [];
  const played = [];

  for (let i = 0; i < lineup.length; i += 2) {
    const a = teams[lineup[i]];
    const b = teams[lineup[i + 1]];
    if (!a || !b) continue;
    const r = playNationalMatch(db, a, b, tournament.topScorers, false);
    const winner = r.penalties
      ? (r.penalties.a > r.penalties.b ? a.country : b.country)
      : (r.golA > r.golB ? a.country : b.country);
    const tie = {
      home: a.country, away: b.country, homeFlag: a.flag, awayFlag: b.flag,
      golA: r.golA, golB: r.golB, penalties: r.penalties, winner
    };
    ties.push(tie);
    const match = { stage: label, ...tie };
    played.push(match);
    tournament.results.push(match);
    r.humanResults.forEach((hr) => recordHumanInternational(db, hr, { date: tournament.knockoutDates[roundIndex], competition: `${tournament.name} · ${label}` }));
  }

  tournament.knockout[roundIndex] = { label, ties };

  if (ties.length === 1) {
    tournament.winner = ties[0].winner;
    tournament.runnerUp = ties[0].winner === ties[0].home ? ties[0].away : ties[0].home;
    tournament.finished = true;
    awardTrophies(db, tournament, teams);
  }
  return { label, played };
}

// Every human in the winning squad gets the trophy on their career record.
function awardTrophies(db, tournament, teams) {
  const champion = teams[tournament.winner];
  if (!champion) return;
  champion.humans.forEach((username) => {
    const u = (db.users || []).find((x) => x.username === username);
    if (!u?.careerSave) return;
    const cs = u.careerSave;
    cs.career = cs.career || {};
    cs.career.international = cs.career.international || { country: tournament.winner, caps: 0, goals: 0, assists: 0, tournaments: [], trophies: [] };
    cs.career.international.trophies = [...(cs.career.international.trophies || []), { name: tournament.name, year: tournament.year, country: tournament.winner }];
    cs.career.trophies = [...(cs.career.trophies || []), `${tournament.name} ${tournament.year}`];
    u.careerSavedAt = new Date().toISOString();
  });
}

// ------------------------------------------------------------
// Friendlies during an international break
// ------------------------------------------------------------
function playFriendlies(db, teams, date) {
  const byConf = {};
  Object.values(teams).forEach((t) => { (byConf[t.confederation] = byConf[t.confederation] || []).push(t); });
  const played = [];
  Object.values(byConf).forEach((list) => {
    const shuffled = [...list];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    for (let i = 0; i + 1 < shuffled.length; i += 2) {
      const a = shuffled[i];
      const b = shuffled[i + 1];
      const r = playNationalMatch(db, a, b, {}, true);
      const match = { stage: 'Friendly', home: a.country, away: b.country, homeFlag: a.flag, awayFlag: b.flag, golA: r.golA, golB: r.golB };
      played.push(match);
      r.humanResults.forEach((hr) => recordHumanInternational(db, hr, { date, competition: 'International friendly' }));
    }
  });
  return played;
}

// 4-BOSQICH: birinchi marta (yoki har yangi chaqiruv oynasida) terma
// jamoaga kiritilgan HAQIQIY foydalanuvchilarga xabar yuboradi - "Siz X
// terma jamoasiga chaqirildingiz" - qaysi turnir/o'rtoqlik uchun ekani
// bilan birga.
function notifyCallUps(db, teams, countries, contextLabel, dateStr) {
  const uniqueCountries = [...new Set(countries)];
  uniqueCountries.forEach((country) => {
    const team = teams[country];
    if (!team) return;
    team.humans.forEach((username) => {
      const u = (db.users || []).find((x) => x.username === username);
      if (!u?.careerSave) return;
      const cs = u.careerSave;
      cs.career = cs.career || {};
      cs.career.messages = cs.career.messages || [];
      cs.career.messages.push({
        id: `msg_intl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        type: 'national',
        date: dateStr,
        from: `${team.flag} ${country}`,
        subject: `Siz ${country} terma jamoasiga chaqirildingiz!`,
        body: `${contextLabel} uchun ${country} milliy terma jamoasi tarkibiga kiritildingiz. Tarkib va o'yinlarni "National Team" sahifasida kuzatib boring. Omad!`,
        read: false, resolved: true
      });
      u.careerSavedAt = new Date().toISOString();
    });
  });
}

// ------------------------------------------------------------
// Entry point - called once per advanced day
// ------------------------------------------------------------
function ensureInternational(db) {
  db.international = db.international || { activeTournaments: [], history: [], newsLog: [], lastDate: null };
  db.international.activeTournaments = db.international.activeTournaments || [];
  db.international.history = db.international.history || [];
  db.international.newsLog = db.international.newsLog || [];
  return db.international;
}

function pushNews(intl, entry) {
  intl.newsLog = [entry, ...(intl.newsLog || [])].slice(0, 120);
}

function advanceInternational(db, date) {
  const intl = ensureInternational(db);
  intl.lastDate = date;
  const year = yearOf(date);
  const events = [];

  // Squads are rebuilt only on days something actually happens - this walks
  // every club in the game, so doing it on quiet days would be pure waste.
  const tournamentStart = `${year}${TOURNAMENT_START_MMDD}`;
  const startingToday = date === tournamentStart ? tournamentsForYear(year) : [];
  const active = intl.activeTournaments.filter((t) => !t.finished);
  const isActiveDay = active.some((t) => t.groupDates.includes(date) || t.knockoutDates.includes(date));
  const breakDay = isBreakDay(date);
  if (!startingToday.length && !isActiveDay && !breakDay) return events;

  const teams = buildNationalTeams(db);

  // 1) New tournaments kicking off today
  startingToday.forEach((def) => {
    const t = createTournament(def, year, teams);
    if (!t) return;
    intl.activeTournaments.push(t);
    pushNews(intl, { type: 'tournament_start', date, title: `${t.name} ${year} boshlandi`, detail: `${t.size} terma jamoa · ${t.groups.length} guruh` });
    events.push({ type: 'tournament_start', tournament: t.name, teams: t.size });
    const tournamentCountries = t.groups.flatMap((g) => g.teams);
    notifyCallUps(db, teams, tournamentCountries, `${t.name} ${year}`, date);
  });

  // 2) Resolve whatever stage falls on this date
  intl.activeTournaments.filter((t) => !t.finished).forEach((t) => {
    const gIdx = t.groupDates.indexOf(date);
    if (gIdx >= 0) {
      const played = playGroupMatchday(db, t, gIdx, teams);
      events.push({ type: 'group', tournament: t.name, matchday: gIdx + 1, matches: played });
      return;
    }
    const kIdx = t.knockoutDates.indexOf(date);
    if (kIdx >= 0) {
      const { label, played } = playKnockoutRound(db, t, kIdx, teams);
      events.push({ type: 'knockout', tournament: t.name, round: label, matches: played });
      if (t.finished) {
        const scorers = Object.values(t.topScorers).sort((a, b) => b.goals - a.goals);
        pushNews(intl, {
          type: 'tournament_won', date,
          title: `${flagFor(t.winner)} ${t.winner} — ${t.name} ${t.year} chempioni!`,
          detail: `Finalda ${t.runnerUp} mag'lub bo'ldi${scorers[0] ? ` · eng ko'p gol: ${scorers[0].name} (${scorers[0].goals})` : ''}`
        });
        intl.history = [{
          id: t.id, name: t.name, year: t.year, winner: t.winner, runnerUp: t.runnerUp,
          topScorer: scorers[0] || null, finalScore: t.knockout[t.knockout.length - 1]?.ties[0] || null
        }, ...intl.history].slice(0, 40);
      }
    }
  });

  // finished tournaments stop being carried around in full
  intl.activeTournaments = intl.activeTournaments.filter((t) => !t.finished || t.knockoutDates[t.knockoutDates.length - 1] >= addDays(date, -30));

  // 3) International break friendlies (never inside the summer window)
  if (breakDay && !active.length) {
    const played = playFriendlies(db, teams, date);
    if (played.length) {
      pushNews(intl, { type: 'break', date, title: `Xalqaro pauza — ${played.length} ta o'rtoqlik o'yini`, detail: date });
      events.push({ type: 'break', matches: played });
      const friendlyCountries = played.flatMap((m) => [m.home, m.away]);
      notifyCallUps(db, teams, friendlyCountries, "Xalqaro do'stlik uchrashuvlari", date);
    }
  }

  return events;
}

module.exports = {
  advanceInternational, ensureInternational, buildNationalTeams, buildPlayerPool,
  tournamentsForYear, isBreakDay, stageDatesFor, SQUAD_SIZE, BREAK_INTERVAL_DAYS
};
