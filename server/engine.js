// ============================================================
// SHARED WORLD ENGINE (server-side)
// ============================================================
// A CommonJS port of the pure simulation logic from
// src/career/utils/season.js, so it can run on the backend and resolve
// ONE shared calendar/schedule/standings per league for every human player
// in it - instead of each browser simulating its own private copy.
//
// Kept deliberately close to the client engine's math (goal formulas, player
// rating formula, etc.) so results feel consistent with the rest of the app.
// ============================================================

const { INITIAL_TEAMS } = require('./gamedata/teamsData');
const { LEAGUES, NATIONALITIES } = require('./gamedata/leaguesData');
const { nationalityFor } = require('./gamedata/nationsData');

const DAY_MS = 24 * 60 * 60 * 1000;
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function addDays(iso, days) {
  return new Date(new Date(iso).getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

// ------------------------------------------------------------
// Schedule generation (identical approach to the client engine)
// ------------------------------------------------------------
function generateRoundRobinRounds(teamIds) {
  const teams = [...teamIds];
  if (teams.length % 2 !== 0) teams.push(null);
  const n = teams.length;
  const half = n / 2;
  let arr = [...teams];
  const firstLeg = [];
  for (let r = 0; r < n - 1; r += 1) {
    const roundMatches = [];
    for (let i = 0; i < half; i += 1) {
      const home = arr[i];
      const away = arr[n - 1 - i];
      if (home !== null && away !== null) {
        roundMatches.push(r % 2 === 0 ? { home, away } : { home: away, away: home });
      }
    }
    firstLeg.push(roundMatches);
    arr = [arr[0], arr[n - 1], ...arr.slice(1, n - 1)];
  }
  const secondLeg = firstLeg.map((round) => round.map(({ home, away }) => ({ home: away, away: home })));
  return [...firstLeg, ...secondLeg];
}

const SEASON_TARGET_DAYS = 270;
const TARGET_GAP_DAYS = 7;

function buildSeasonSchedule(league, startDate) {
  const baseRounds = generateRoundRobinRounds(league.teamIds);
  const roundsPerCycle = Math.max(1, baseRounds.length);
  const targetRoundCount = Math.max(roundsPerCycle, Math.round(SEASON_TARGET_DAYS / TARGET_GAP_DAYS));
  const cyclesNeeded = roundsPerCycle >= targetRoundCount * 0.8 ? 1 : Math.max(1, Math.ceil(targetRoundCount / roundsPerCycle));
  let allRounds = [];
  for (let c = 0; c < cyclesNeeded; c += 1) {
    const cycle = c % 2 === 0 ? baseRounds : baseRounds.map((round) => round.map(({ home, away }) => ({ home: away, away: home })));
    allRounds = allRounds.concat(cycle);
  }
  const totalRounds = allRounds.length;
  const gapDays = clamp(Math.round(SEASON_TARGET_DAYS / totalRounds), 3, 10);
  return allRounds.map((matches, i) => ({
    round: i + 1,
    date: addDays(startDate, i * gapDays),
    matches: matches.map((m) => ({ ...m, played: false, golA: null, golB: null }))
  }));
}

function initStandings(teamIds) {
  const standings = {};
  teamIds.forEach((id) => { standings[id] = { teamId: id, played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, pts: 0 }; });
  return standings;
}

// ------------------------------------------------------------
// Match simulation
// ------------------------------------------------------------
// Every function below takes a `squad` array explicitly (rather than
// reaching into team.squad directly) so the shared world's OWN evolving
// copy of each club's players (world.squads[teamId] - aged, retired,
// academy graduates and all) is what actually gets used, not the frozen
// static data the game shipped with.
function teamStrength(squad) {
  if (!squad?.length) return 70;
  const top = [...squad].sort((a, b) => (b.ovr || 0) - (a.ovr || 0)).slice(0, 11);
  return top.reduce((s, p) => s + (p.ovr || 68), 0) / top.length;
}

function rollGoals(lambda) {
  let goals = 0;
  const l = Math.max(0.15, lambda);
  for (let i = 0; i < 6; i += 1) if (Math.random() < l / 6) goals += 1;
  return goals;
}

function simulateTeamMatch(squadA, squadB) {
  const diff = teamStrength(squadA) - teamStrength(squadB);
  const golA = rollGoals(1.25 + diff / 18 + (Math.random() - 0.5) * 0.6);
  const golB = rollGoals(1.25 - diff / 18 + (Math.random() - 0.5) * 0.6);
  return { golA, golB };
}

const ATTACK_WEIGHT = { ST: 1, LW: 0.9, RW: 0.9, CAM: 0.8, CM: 0.45, LM: 0.5, RM: 0.5, CDM: 0.2, LB: 0.15, RB: 0.15, CB: 0.08, GK: 0 };

// A single human player's personal contribution to a match they're involved
// in (same formula as the client engine, so career progression feels the
// same whether it happened locally or was resolved by the shared world).
function simulateHumanPlayerMatch(player, opponentSquad) {
  const tier = player.club?.tier || 'starter';
  let minutes = 90;
  if (tier === 'bench') {
    if (Math.random() > 0.55) return { played: false };
    minutes = randInt(15, 45);
  }
  const oppStrength = teamStrength(opponentSquad);
  const formValue = { Poor: -0.6, Average: 0, Good: 0.5, Excellent: 1.0 }[player.career?.form] ?? 0;
  const staminaPenalty = (player.career?.stamina ?? 100) < 35 ? -0.7 : (player.career?.stamina ?? 100) < 65 ? -0.25 : 0;
  const strengthGap = ((player.overall || 70) - oppStrength) / 20;
  let rating = 6.0 + strengthGap + formValue + staminaPenalty + (Math.random() * 1.6 - 0.8);
  rating = Math.round(clamp(rating, 3.0, 10) * 10) / 10;

  const bias = ATTACK_WEIGHT[player.position] ?? 0.3;
  let goals = 0;
  let assists = 0;
  if (bias > 0 && minutes > 25) {
    const goalChance = bias * 0.11 * (rating / 7) * (minutes / 90);
    if (Math.random() < goalChance) goals += 1;
    if (Math.random() < goalChance * 0.35) goals += 1;
    const assistChance = bias * 0.13 * (rating / 7) * (minutes / 90);
    if (Math.random() < assistChance) assists += 1;
  }

  let injured = false;
  let injuryDays = 0;
  const injuryChance = 0.018 + ((player.career?.stamina ?? 100) < 30 ? 0.03 : 0);
  if (Math.random() < injuryChance) { injured = true; injuryDays = randInt(3, 21); }

  return { played: true, minutes, rating, goals, assists, injured, injuryDays };
}

function weightedPick(list) {
  const weights = list.map((p) => Math.max(1, p.ovr || 60) ** 2);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < list.length; i += 1) { r -= weights[i]; if (r <= 0) return list[i]; }
  return list[list.length - 1];
}

function distributeGoals(squad, teamId, teamName, goalsCount, topScorers, excludeIds) {
  if (!squad?.length || goalsCount <= 0) return;
  const pool = squad.filter((p) => !excludeIds.includes(p.id));
  const attackers = pool.filter((p) => (ATTACK_WEIGHT[p.pos] ?? 0) > 0.3);
  const list = attackers.length ? attackers : pool;
  if (!list.length) return;
  for (let i = 0; i < goalsCount; i += 1) {
    const scorer = weightedPick(list);
    if (!scorer) continue;
    if (!topScorers[scorer.id]) topScorers[scorer.id] = { id: scorer.id, name: scorer.name, teamId, teamName, goals: 0 };
    topScorers[scorer.id].goals += 1;
  }
}

function applyResultToStandings(standings, homeId, awayId, golA, golB) {
  const h = standings[homeId] || { teamId: homeId, played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, pts: 0 };
  const a = standings[awayId] || { teamId: awayId, played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, pts: 0 };
  h.played += 1; a.played += 1;
  h.gf += golA; h.ga += golB; a.gf += golB; a.ga += golA;
  if (golA > golB) { h.win += 1; h.pts += 3; a.loss += 1; }
  else if (golA < golB) { a.win += 1; a.pts += 3; h.loss += 1; }
  else { h.draw += 1; a.draw += 1; h.pts += 1; a.pts += 1; }
  standings[homeId] = h; standings[awayId] = a;
}

// Resolves one match, folding in EVERY human player at either club (there
// can be more than one - two friends could both be at the same club, or at
// each other's opposing clubs). Returns the final score plus each human
// player's individual match result for their own careerSave to be updated.
function resolveMatch(homeTeam, awayTeam, homeSquad, awaySquad, humanHome, humanAway, topScorers) {
  let { golA, golB } = simulateTeamMatch(homeSquad, awaySquad);
  const humanResults = [];

  humanHome.forEach((hp) => {
    const pStats = hp.injury ? { played: false } : simulateHumanPlayerMatch(hp, awaySquad);
    humanResults.push({ username: hp.username, side: 'home', pStats, opponentTeam: awayTeam });
  });
  humanAway.forEach((hp) => {
    const pStats = hp.injury ? { played: false } : simulateHumanPlayerMatch(hp, homeSquad);
    humanResults.push({ username: hp.username, side: 'away', pStats, opponentTeam: homeTeam });
  });

  const humanHomeGoals = humanResults.filter((h) => h.side === 'home').reduce((s, h) => s + (h.pStats.goals || 0), 0);
  const humanAwayGoals = humanResults.filter((h) => h.side === 'away').reduce((s, h) => s + (h.pStats.goals || 0), 0);
  golA = Math.max(golA, humanHomeGoals);
  golB = Math.max(golB, humanAwayGoals);

  const humanHomeIds = humanHome.map((h) => h.id).filter(Boolean);
  const humanAwayIds = humanAway.map((h) => h.id).filter(Boolean);
  distributeGoals(homeSquad, homeTeam.id, homeTeam.name, golA - humanHomeGoals, topScorers, humanHomeIds);
  distributeGoals(awaySquad, awayTeam.id, awayTeam.name, golB - humanAwayGoals, topScorers, humanAwayIds);

  return { golA, golB, humanResults };
}

// ------------------------------------------------------------
// NPC lifecycle: ageing, decline, retirement, academy graduates.
// Runs once per in-game year (tied to season boundaries) for every club's
// squad in a league world, so the football world keeps turning over even
// for clubs no human ever joins.
// ------------------------------------------------------------
const FIRST_NAMES = ['Carlos', 'Luca', 'Kwame', 'Yuki', 'Ivan', 'Mateus', 'Aleksandr', 'Diego', 'Omar', 'Kenji', 'Bruno', 'Marco', 'Milan', 'Tomás', 'Hassan', 'Erik', 'Rafael', 'Andrei', 'Jamal', 'Felix'];
const LAST_NAMES = ['Silva', 'Novak', 'Osei', 'Tanaka', 'Petrov', 'Alves', 'Kowalski', 'Fernández', 'Haddad', 'Sato', 'Rossi', 'Dubois', 'Horvat', 'Costa', 'Khalil', 'Nilsson', 'Souza', 'Ivanov', 'Diallo', 'Weber'];
const ACADEMY_POSITIONS = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'ST', 'LW', 'RW'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Monotonically increasing suffix so two academy graduates created inside the
// same millisecond (which happens constantly - a whole league rolls over in
// one tick) can never collide on id. Duplicate ids would silently merge two
// different players in the top-scorer table.
let academySeq = 0;
function newPlayerId(prefix) {
  academySeq += 1;
  return `${prefix}_${Date.now().toString(36)}_${academySeq}_${Math.random().toString(36).slice(2, 6)}`;
}

// The static squads the game shipped with have no `age` and no `nationality`
// (they were only ever used for a strength number and a scorer name). The
// shared world needs both: age to make players actually grow old and retire,
// nationality so a future national-team module has somebody to call up. Both
// are seeded ONCE, when a league world is first created, and then live in
// db.leagueWorlds[leagueId].squads from that point on.
const NATION_POOL = NATIONALITIES.map((n) => n.name);
const HOME_NATION_SHARE = 0.55; // roughly half a club's squad is homegrown
const MIN_GK = 2;                // a club must never be left without keepers

// Bell-ish age curve: plenty of 24-28 year olds, a few teenagers, a few
// veterans - rather than a flat 18..34 spread which would make entire
// leagues retire in the same season.
function randomSquadAge() {
  return Math.round((randInt(17, 35) + randInt(18, 33)) / 2);
}

function randomRetireAge(age) {
  return Math.max(age + 1, randInt(33, 40));
}

// Academy graduates only carry the fields the engine actually reads
// (id/name/pos/ovr), plus lifecycle fields. `stats` is filled in roughly from
// ovr so that if these players are ever surfaced to a client they don't render
// as blank rows.
function roughStatsFor(pos, ovr) {
  const j = () => clamp(ovr + randInt(-6, 6), 30, 94);
  if (pos === 'GK') return { div: j(), han: j(), kic: j(), ref: j(), spd: clamp(ovr - randInt(25, 40), 20, 70), pos: j() };
  return { pac: j(), sho: j(), pas: j(), dri: j(), def: j(), phy: j() };
}

function randomAcademyPlayer(homeCountry) {
  const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  const pos = pick(ACADEMY_POSITIONS);
  const ovr = randInt(52, 66);
  const age = randInt(16, 18);
  const id = newPlayerId('academy');
  return {
    id,
    name,
    pos,
    ovr,
    age,
    retireAge: randomRetireAge(age),
    nationality: nationalityFor(id, homeCountry),
    stats: roughStatsFor(pos, ovr),
    isAcademy: true
  };
}

// Deep copy of a club's shipped squad, with the lifecycle fields the shared
// world needs seeded in. Deep copy matters: without it every league world
// would be mutating the module-level INITIAL_TEAMS array, so ageing one
// league's Real Madrid would age it for every other world too (and the
// changes would vanish on the next server restart).
function initWorldSquad(team, homeCountry) {
  if (!team?.squad?.length) return [];
  const seeded = team.squad.map((p) => {
    const age = randomSquadAge();
    return {
      ...JSON.parse(JSON.stringify(p)),
      ovr: p.ovr || 68, // a couple of shipped entries are missing ovr entirely
      age,
      retireAge: randomRetireAge(age),
      // Deterministic, so a player keeps the same nationality whether they
      // are read from this evolving world or from the static shipped data.
      nationality: p.nationality || nationalityFor(p.id, homeCountry)
    };
  });
  // A couple of shipped squads (valencia, malaga) only list one keeper.
  let gks = seeded.filter((p) => p.pos === 'GK').length;
  while (gks < MIN_GK) {
    seeded.push({ ...randomAcademyPlayer(homeCountry), pos: 'GK', stats: roughStatsFor('GK', 58) });
    gks += 1;
  }
  return seeded;
}

// How a club values a player when deciding who to let go: current rating,
// with a bonus for youngsters who still have room to grow and a penalty for
// veterans on the way down. Keeps clubs from cutting a promising 18-year-old
// in favour of a declining 35-year-old with the same rating today.
function squadValue(p) {
  const age = p.age || 24;
  let bonus = 0;
  if (age <= 20) bonus = 6;
  else if (age <= 23) bonus = 3;
  else if (age >= 34) bonus = -6;
  else if (age >= 31) bonus = -3;
  return (p.ovr || 60) + bonus;
}

// Ages every player in a squad by a year, nudging OVR along a rough
// real-world development curve (rises through the early-mid twenties,
// peaks around 27-29, tails off after 30), retires anyone too old, tops the
// squad back up with 2-5 fresh academy graduates, and then TRIMS back to a
// realistic size.
//
// The trim is not cosmetic. Retirements average well under one per club per
// season while the academy adds 2-5, so without a cap squads snowball - a
// 10-season test run grew La Liga from 319 to 830 players (40+ per club),
// diluting the top-scorer table across fringe players and bloating db.json.
// Clubs now release their least valuable fringe players instead, which also
// keeps average squad quality stable rather than sliding as academy intake
// piles up.
//
// Pure: returns a NEW array, never mutates the squad it is handed.
function ageAndRefreshSquad(squad, retirementLog, clubName, homeCountry, releaseLog) {
  const incoming = squad || [];
  // Hold squad size steady at whatever this club shipped with (18-22 players
  // depending on the club), never letting it fall below a playable XI+subts.
  const targetSize = clamp(incoming.length, 18, 26);

  const survivors = [];
  incoming.forEach((p) => {
    const age = (p.age || 24) + 1;
    const retireAge = p.retireAge || randomRetireAge(age);
    if (age >= retireAge) {
      retirementLog.push({ name: p.name, club: clubName, finalOvr: p.ovr || 0, age, nationality: p.nationality || null });
      return; // retired - drops out of the squad
    }
    let ovrDelta = 0;
    if (age <= 23) ovrDelta = randInt(1, 3);
    else if (age <= 29) ovrDelta = randInt(-1, 2);
    else if (age <= 33) ovrDelta = randInt(-3, 0);
    else ovrDelta = randInt(-5, -1);
    survivors.push({ ...p, age, retireAge, ovr: clamp((p.ovr || 65) + ovrDelta, 40, 94) });
  });

  const academyCount = randInt(2, 5);
  for (let i = 0; i < academyCount; i += 1) survivors.push(randomAcademyPlayer(homeCountry));

  let kept = survivors;
  let cut = [];
  if (survivors.length > targetSize) {
    const ranked = [...survivors].sort((a, b) => squadValue(b) - squadValue(a));
    kept = ranked.slice(0, targetSize);
    cut = ranked.slice(targetSize);
  }

  // A squad must never run out of goalkeepers. Retirement alone can empty a
  // club's keeper slots (two clubs even ship with a single GK), and the cut
  // pool may hold no keeper to promote - so when nothing is available the
  // club signs an academy keeper rather than fielding an outfielder in goal.
  let gkCount = kept.filter((p) => p.pos === 'GK').length;
  while (gkCount < MIN_GK) {
    const spareIdx = cut.findIndex((p) => p.pos === 'GK');
    const keeper = spareIdx >= 0 ? cut.splice(spareIdx, 1)[0] : { ...randomAcademyPlayer(homeCountry), pos: 'GK', stats: roughStatsFor('GK', 58) };
    if (kept.length >= targetSize) {
      // make room by dropping the least valuable outfielder
      let worstIdx = -1;
      for (let i = 0; i < kept.length; i += 1) {
        if (kept[i].pos === 'GK') continue;
        if (worstIdx === -1 || squadValue(kept[i]) < squadValue(kept[worstIdx])) worstIdx = i;
      }
      if (worstIdx >= 0) cut.push(kept.splice(worstIdx, 1)[0]);
    }
    kept.push(keeper);
    gkCount += 1;
  }

  const finalIds = new Set(kept.map((p) => p.id));
  cut.filter((p) => !finalIds.has(p.id)).forEach((p) => {
    if (releaseLog) releaseLog.push({ name: p.name, club: clubName, ovr: p.ovr, age: p.age });
  });
  return kept;
}

// A season is over once every match of every round has been resolved.
function isSeasonComplete(world) {
  return !!world?.schedule?.length && world.schedule.every((r) => r.matches.every((m) => m.played));
}

// Final table, best first. Used for the champion line in the season-rollover
// news and for the archived history entry.
function sortedTable(standings) {
  return Object.values(standings || {}).sort((a, b) =>
    (b.pts - a.pts) || ((b.gf - b.ga) - (a.gf - a.ga)) || (b.gf - a.gf)
  );
}

module.exports = {
  addDays, generateRoundRobinRounds, buildSeasonSchedule, initStandings,
  teamStrength, simulateTeamMatch, simulateHumanPlayerMatch, distributeGoals,
  applyResultToStandings, resolveMatch,
  initWorldSquad, randomAcademyPlayer, ageAndRefreshSquad,
  isSeasonComplete, sortedTable,
  INITIAL_TEAMS, LEAGUES, NATIONALITIES
};
