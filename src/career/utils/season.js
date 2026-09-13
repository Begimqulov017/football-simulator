// ---------------------------------------------------------------------------
// Season engine
// ---------------------------------------------------------------------------
// Generates a double round-robin schedule for the player's league, then
// simulates every round as the calendar advances: results for every club in
// the league (not just the player's), a league table, a top-scorers table,
// the player's own match stats (rating/goals/assists/injury), club messages,
// occasional transfer interest, weekly wages, stamina/injury/potential
// changes tied to age and how the match went.
// ---------------------------------------------------------------------------

import { INITIAL_TEAMS } from '../data/teamsData';
import { LEAGUES } from '../data/leaguesData';
import { getMergedSquad } from '../data/clubRosterStore';
import { isMvpPerformance } from './statCalc';

const DAY_MS = 24 * 60 * 60 * 1000;

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export function addDays(iso, days) {
  return new Date(new Date(iso).getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

function newId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ---------------------------------------------------------------------------
// Schedule generation (circle method double round-robin)
// ---------------------------------------------------------------------------
export function generateRoundRobinRounds(teamIds) {
  const teams = [...teamIds];
  if (teams.length % 2 !== 0) teams.push(null); // bye slot for odd-sized leagues
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

// Leagues vary wildly in size (3 teams up to 20), so a single double
// round-robin would make tiny leagues finish in a couple of weeks while big
// ones run for months. To keep every league running roughly Aug -> ~May (one
// full season) regardless of size, small leagues repeat their round-robin
// cycle enough times to fill out a comparable number of matchdays.
export const SEASON_TARGET_DAYS = 270; // ~1 Aug -> ~28 Apr
const TARGET_GAP_DAYS = 7;

export function buildSeasonSchedule(league, startDate = '2026-08-01') {
  const baseRounds = generateRoundRobinRounds(league.teamIds);
  const roundsPerCycle = Math.max(1, baseRounds.length);
  const targetRoundCount = Math.max(roundsPerCycle, Math.round(SEASON_TARGET_DAYS / TARGET_GAP_DAYS));
  // Only repeat the cycle for leagues that are SIGNIFICANTLY smaller than the
  // target (e.g. a 4-team league) - a big league that's already close to a
  // full season's worth of rounds (e.g. 20 teams = 38) shouldn't get doubled
  // to 76 just because it's a handful of rounds short of the target.
  const cyclesNeeded = roundsPerCycle >= targetRoundCount * 0.8 ? 1 : Math.max(1, Math.ceil(targetRoundCount / roundsPerCycle));

  let allRounds = [];
  for (let c = 0; c < cyclesNeeded; c += 1) {
    // Every other cycle flips home/away so a repeated cycle isn't a literal
    // copy of the one before it.
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

export function initStandings(teamIds) {
  const standings = {};
  teamIds.forEach((id) => {
    standings[id] = { teamId: id, played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, pts: 0 };
  });
  return standings;
}

// ---------------------------------------------------------------------------
// Team & player match simulation
// ---------------------------------------------------------------------------
function teamStrength(team) {
  if (!team || !team.squad?.length) return 70;
  const top = [...team.squad].sort((a, b) => (b.ovr || 0) - (a.ovr || 0)).slice(0, 11);
  return top.reduce((s, p) => s + (p.ovr || 68), 0) / top.length;
}

function rollGoals(lambda) {
  let goals = 0;
  const l = Math.max(0.15, lambda);
  for (let i = 0; i < 6; i += 1) {
    if (Math.random() < l / 6) goals += 1;
  }
  return goals;
}

function simulateTeamMatch(teamA, teamB) {
  const diff = teamStrength(teamA) - teamStrength(teamB);
  const golA = rollGoals(1.25 + diff / 18 + (Math.random() - 0.5) * 0.6);
  const golB = rollGoals(1.25 - diff / 18 + (Math.random() - 0.5) * 0.6);
  return { golA, golB };
}

const ATTACK_WEIGHT = { ST: 1, LW: 0.9, RW: 0.9, CAM: 0.8, CM: 0.45, LM: 0.5, RM: 0.5, CDM: 0.2, LB: 0.15, RB: 0.15, CB: 0.08, GK: 0 };

function simulatePlayerMatch(player, opponentTeam) {
  const tier = player.club.tier;
  let minutes = 90;
  if (tier === 'bench') {
    if (Math.random() > 0.55) return { played: false };
    minutes = randInt(15, 45);
  }

  const oppStrength = teamStrength(opponentTeam);
  const formValue = { Poor: -0.6, Average: 0, Good: 0.5, Excellent: 1.0 }[player.career.form] ?? 0;
  const staminaPenalty = player.career.stamina < 35 ? -0.7 : player.career.stamina < 65 ? -0.25 : 0;
  const strengthGap = (player.overall - oppStrength) / 20;
  let rating = 6.0 + strengthGap + formValue + staminaPenalty + (Math.random() * 1.6 - 0.8);
  rating = clamp(rating, 3.0, 10);
  rating = Math.round(rating * 10) / 10;

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
  const injuryChance = 0.018 + (player.career.stamina < 30 ? 0.03 : 0);
  if (Math.random() < injuryChance) {
    injured = true;
    injuryDays = randInt(3, 21);
  }

  return { played: true, minutes, rating, goals, assists, injured, injuryDays };
}

function weightedPick(list) {
  const weights = list.map((p) => (Math.max(1, p.ovr || 60)) ** 2);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < list.length; i += 1) {
    r -= weights[i];
    if (r <= 0) return list[i];
  }
  return list[list.length - 1];
}

function distributeGoals(team, goalsCount, topScorers, excludeId) {
  if (!team || goalsCount <= 0) return;
  const pool = team.squad.filter((p) => p.id !== excludeId);
  const attackers = pool.filter((p) => (ATTACK_WEIGHT[p.pos] ?? 0) > 0.3);
  const list = attackers.length ? attackers : pool;
  if (!list.length) return;
  for (let i = 0; i < goalsCount; i += 1) {
    const scorer = weightedPick(list);
    if (!scorer) continue;
    if (!topScorers[scorer.id]) {
      topScorers[scorer.id] = { id: scorer.id, name: scorer.name, teamId: team.id, teamName: team.name, goals: 0 };
    }
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
  standings[homeId] = h;
  standings[awayId] = a;
}

function formFromRatings(ratings) {
  if (!ratings.length) return 'Average';
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  if (avg >= 8) return 'Excellent';
  if (avg >= 7) return 'Good';
  if (avg >= 5.5) return 'Average';
  return 'Poor';
}

// Recomputes whether the player is currently good enough for the Starting
// XI or should be on the bench, based on their CURRENT OVR against the rest
// of the club's current squad - called before every matchday so someone who
// has trained their way up (or fallen behind) actually gets promoted or
// dropped, instead of being stuck with whatever tier they were assigned the
// day they signed.
export function recomputeTier(player) {
  const team = INITIAL_TEAMS.find((t) => t.id === player.club.id);
  if (!team) return player.club.tier;
  const squad = getMergedSquad(team).filter((p) => p.id !== player.id);
  const betterCount = squad.filter((p) => (p.ovr || 0) > (player.overall || 0)).length;
  return betterCount < 11 ? 'starter' : 'bench';
}

function maybeGenerateTransferOffer(player, league, gameDate) {
  if (Math.random() > 0.08) return null;
  const candidates = league.teamIds.filter((id) => id !== player.club.id);
  if (!candidates.length) return null;
  const team = INITIAL_TEAMS.find((t) => t.id === pick(candidates));
  if (!team) return null;
  const wageOffer = Math.round((player.career.weeklyWage || 300) * (1.15 + Math.random() * 0.6));
  return {
    id: newId('msg'),
    type: 'transfer',
    date: gameDate,
    from: team.name,
    subject: `Transfer interest from ${team.name}`,
    body: `${team.name} have been watching your recent performances and want to sign you for $${wageOffer.toLocaleString()}/week.`,
    read: false,
    resolved: false,
    offer: { teamId: team.id, wage: wageOffer }
  };
}

// A softer, no-offer-attached version of the message above: other clubs
// noticing you exists as its own flavour message, separate from (and more
// frequent than) an actual formal transfer offer.
function maybeGenerateScoutInterest(player, league, gameDate) {
  if (Math.random() > 0.12) return null;
  const candidates = league.teamIds.filter((id) => id !== player.club.id);
  if (!candidates.length) return null;
  const team = INITIAL_TEAMS.find((t) => t.id === pick(candidates));
  if (!team) return null;
  const lines = [
    `${team.name}'s scouts were in the stands for your last match - nothing formal yet, but they're keeping an eye on you.`,
    `Rumours in the press: ${team.name} have added you to their list of transfer targets for the upcoming window.`,
    `A source close to ${team.name} says the club's recruitment team rates you highly and will "monitor the situation".`
  ];
  return {
    id: newId('msg'),
    type: 'scout',
    date: gameDate,
    from: team.name,
    subject: `${team.name} are watching you`,
    body: pick(lines),
    read: false,
    resolved: true
  };
}

// Random dressing-room banter from a teammate - pure flavour, always
// resolved, never blocks anything. Pulled from the player's own club squad
// (built-in pros + any other human players who joined the same club).
function maybeGenerateTeammateMessage(player, gameDate) {
  if (Math.random() > 0.16) return null;
  const team = INITIAL_TEAMS.find((t) => t.id === player.club.id);
  if (!team) return null;
  const squad = getMergedSquad(team).filter((p) => p.id !== player.id);
  if (!squad.length) return null;
  const mate = pick(squad);
  const won = player.career.matchRatings?.length && player.career.matchRatings[player.career.matchRatings.length - 1] >= 7;
  const lines = won
    ? [
      `Great game out there today, that performance deserved the three points!`,
      `Was a pleasure playing alongside you today, let's keep this run going.`,
      `Coach was buzzing about your display in the dressing room after the match.`
    ]
    : [
      `Rough one today, but we'll bounce back next week - heads up.`,
      `Fancy an extra shooting session tomorrow before training? Could help both of us.`,
      `Don't worry about today's result too much, one bad game means nothing over a season.`
    ];
  return {
    id: newId('msg'), type: 'teammate', date: gameDate, from: mate.name || 'Teammate',
    subject: `Message from ${mate.name || 'a teammate'}`,
    body: pick(lines), read: false, resolved: true
  };
}

// ---------------------------------------------------------------------------
// One round, every match in the league
// ---------------------------------------------------------------------------
function processRound(round, player, standings, topScorers) {
  const league = LEAGUES.find((l) => l.id === player.club.leagueId);
  const updatedMatches = [];
  const messages = [];
  let playerPatch = null;

  round.matches.forEach((m) => {
    const homeTeam = INITIAL_TEAMS.find((t) => t.id === m.home);
    const awayTeam = INITIAL_TEAMS.find((t) => t.id === m.away);
    let { golA, golB } = simulateTeamMatch(homeTeam, awayTeam);

    const involvesPlayer = player.club.id === m.home || player.club.id === m.away;
    let pStats = null;

    if (involvesPlayer && !player.career.injury) {
      pStats = simulatePlayerMatch(player, player.club.id === m.home ? awayTeam : homeTeam);
      if (pStats.played) {
        if (player.club.id === m.home) golA = Math.max(golA, pStats.goals);
        else golB = Math.max(golB, pStats.goals);
      }
    }

    applyResultToStandings(standings, m.home, m.away, golA, golB);

    const playerIsHome = involvesPlayer && player.club.id === m.home;
    const playerIsAway = involvesPlayer && player.club.id === m.away;
    const homeGoalsForNpc = playerIsHome && pStats?.played ? golA - pStats.goals : golA;
    const awayGoalsForNpc = playerIsAway && pStats?.played ? golB - pStats.goals : golB;
    distributeGoals(homeTeam, homeGoalsForNpc, topScorers, playerIsHome ? player.id : null);
    distributeGoals(awayTeam, awayGoalsForNpc, topScorers, playerIsAway ? player.id : null);

    if (involvesPlayer && pStats?.played && pStats.goals > 0) {
      if (!topScorers[player.id]) {
        topScorers[player.id] = { id: player.id, name: `${player.name} ${player.surname}`, teamId: player.club.id, teamName: player.club.name, goals: 0 };
      }
      topScorers[player.id].goals += pStats.goals;
    }

    updatedMatches.push({ ...m, played: true, golA, golB });

    if (involvesPlayer) {
      const opponent = playerIsHome ? awayTeam : homeTeam;
      playerPatch = { pStats, opponent, isHome: playerIsHome, golA, golB };
    }
  });

  // ---- Apply the player's own match outcome to their career ----
  if (playerPatch) {
    const { pStats, opponent, isHome, golA, golB } = playerPatch;
    const resultLine = `${isHome ? player.club.name : opponent.name} ${golA} - ${golB} ${isHome ? opponent.name : player.club.name}`;

    if (pStats?.played) {
      const ratings = [...player.career.matchRatings, pStats.rating].slice(-10);
      const form = formFromRatings(ratings);
      let potential = player.potential;
      let injury = player.career.injury;

      if (pStats.rating < 5.0 && Math.random() < 0.3) potential = Math.max(player.overall, potential - 1);
      if (player.age >= 24 && player.age <= 29 && pStats.rating >= 8.5 && Math.random() < 0.4) {
        potential = Math.min(99, potential + 1);
      }
      if (pStats.injured) {
        injury = { daysLeft: pStats.injuryDays, description: 'Match injury' };
        potential = Math.max(player.overall, potential - randInt(1, 3));
      }

      let body = `${resultLine}. You played ${pStats.minutes}' and rated ${pStats.rating}/10`;
      if (pStats.goals) body += ` with ${pStats.goals} goal${pStats.goals > 1 ? 's' : ''}`;
      if (pStats.assists) body += `${pStats.goals ? ' and' : ' with'} ${pStats.assists} assist${pStats.assists > 1 ? 's' : ''}`;
      const mvp = isMvpPerformance(pStats);
      if (mvp) body += ' - Man of the Match!';
      body += '.';
      if (pStats.injured) body += ` You picked up a knock and will be out for around ${pStats.injuryDays} days.`;

      messages.push({
        id: newId('msg'), type: 'club', date: round.date, from: player.club.name,
        subject: pStats.injured ? 'Injury update' : `Match report: ${resultLine}`,
        body, read: false, resolved: true
      });

      if (!pStats.injured && pStats.rating >= 7.5) {
        const offer = maybeGenerateTransferOffer(player, league, round.date);
        if (offer) messages.push(offer);
        else {
          const scout = maybeGenerateScoutInterest(player, league, round.date);
          if (scout) messages.push(scout);
        }
      }
      const teammateMsg = maybeGenerateTeammateMessage(player, round.date);
      if (teammateMsg) messages.push(teammateMsg);

      const historyEntry = {
        id: newId('hist'), date: round.date, round: round.round,
        opponent: (isHome ? opponent.name : opponent.name), opponentLogo: opponent.logo,
        isHome, golFor: isHome ? golA : golB, golAgainst: isHome ? golB : golA,
        minutes: pStats.minutes, rating: pStats.rating, goals: pStats.goals, assists: pStats.assists,
        mvp, injured: pStats.injured
      };

      playerPatch.careerUpdate = {
        appearances: player.career.appearances + 1,
        goals: player.career.goals + pStats.goals,
        assists: player.career.assists + pStats.assists,
        seasonAppearances: (player.career.seasonAppearances || 0) + 1,
        seasonGoals: (player.career.seasonGoals || 0) + pStats.goals,
        seasonAssists: (player.career.seasonAssists || 0) + pStats.assists,
        matchRatings: ratings,
        matchHistory: [...(player.career.matchHistory || []), historyEntry].slice(-40),
        mvpCount: (player.career.mvpCount || 0) + (mvp ? 1 : 0),
        form,
        stamina: clamp(player.career.stamina - randInt(15, 25), 0, 100),
        injury
      };
      playerPatch.potential = potential;
    } else {
      messages.push({
        id: newId('msg'), type: 'club', date: round.date, from: player.club.name,
        subject: `Matchday: ${resultLine}`,
        body: `${resultLine}. You stayed on the bench this time - keep training to force your way into the XI.`,
        read: false, resolved: true
      });
      playerPatch.careerUpdate = { stamina: clamp(player.career.stamina + 5, 0, 100) };
    }
  }

  return { updatedMatches, messages, playerPatch };
}

// ---------------------------------------------------------------------------
// Is the very next day a scheduled matchday for the player's own club? Used
// to swap the Home page's "Next Day" button for a "Play Match" button, and
// to flag the right fixture on the Games page.
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Cups: a domestic knockout cup (every season, same-country opponents) plus
// continental competitions (Champions League / Europa League for European
// leagues, AFC Champions League for Asian leagues) for clubs that qualify by
// league position. Both are modelled as a personal knockout ladder: the
// player is drawn against one opponent per round; win and advance, lose (or
// draw, decided on penalties) and the run ends for the season. This keeps
// the feature honest and safe to run without simulating every other club's
// entire bracket in parallel.
// ---------------------------------------------------------------------------
const UEFA_LEAGUE_IDS = ['la_liga', 'premier_league', 'bundesliga', 'ligue_1', 'serie_a', 'primeira_liga', 'eredivisie', 'belgian_pro_league', 'super_lig', 'swiss_super_league'];
const AFC_LEAGUE_IDS = ['uzbekistan_super_league', 'saudi_pro_league', 'j1_league', 'k_league', 'qatar_stars_league', 'uae_pro_league', 'iran_pro_league', 'iraqi_premier_league', 'chinese_super_league'];

function getConfederation(leagueId) {
  if (UEFA_LEAGUE_IDS.includes(leagueId)) return 'UEFA';
  if (AFC_LEAGUE_IDS.includes(leagueId)) return 'AFC';
  return null;
}

function confederationClubPool(confederation, excludeClubId) {
  const leagueIds = confederation === 'UEFA' ? UEFA_LEAGUE_IDS : AFC_LEAGUE_IDS;
  const pool = [];
  LEAGUES.filter((l) => leagueIds.includes(l.id)).forEach((l) => l.teamIds.forEach((id) => { if (id !== excludeClubId) pool.push(id); }));
  return pool;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Finds the next date on/after `fromDate` that isn't already taken by a
// league round or another cup fixture, so cup matches never collide with a
// league matchday (or with each other).
function pickFreeDate(fromDate, takenDates) {
  let d = fromDate;
  let guard = 0;
  while (takenDates.has(d) && guard < 60) {
    d = addDays(d, 1);
    guard += 1;
  }
  takenDates.add(d);
  return d;
}

const DOMESTIC_CUP_ROUND_NAMES = ['Round of 16', 'Quarterfinal', 'Semifinal', 'Final'];
const CONTINENTAL_ROUND_NAMES = ['Quarterfinal', 'Semifinal', 'Final'];

// Builds this season's domestic cup run (every club's league re-enters every
// year) and, if the player qualified last season, their continental cup run.
export function setupSeasonCups(player, league, seasonStartDate, leagueSchedule) {
  const takenDates = new Set(leagueSchedule.map((r) => r.date));

  const domesticPool = league.teamIds.filter((id) => id !== player.club.id);
  const domesticRounds = Math.min(DOMESTIC_CUP_ROUND_NAMES.length, Math.max(1, domesticPool.length));
  const domesticNames = DOMESTIC_CUP_ROUND_NAMES.slice(DOMESTIC_CUP_ROUND_NAMES.length - domesticRounds);
  const domesticCup = initCupRun(
    `${league.country || league.name} Cup`, domesticPool, domesticRounds,
    pickFreeDate(addDays(seasonStartDate, 24), takenDates), 1, domesticNames
  );
  // Re-roll each subsequent fixture's date to avoid collisions too.
  domesticCup.fixtures = domesticCup.fixtures.map((f, i) => (
    i === 0 ? f : { ...f, date: pickFreeDate(addDays(seasonStartDate, 24 + i * 40), takenDates) }
  ));

  let continentalCup = null;
  const qualifiedFor = player.career.qualifiedContinentalNextSeason;
  if (qualifiedFor) {
    const pool = confederationClubPool(qualifiedFor.confederation, player.club.id);
    const rounds = Math.min(CONTINENTAL_ROUND_NAMES.length, Math.max(1, pool.length));
    const names = CONTINENTAL_ROUND_NAMES.slice(CONTINENTAL_ROUND_NAMES.length - rounds);
    continentalCup = initCupRun(qualifiedFor.name, pool, rounds, pickFreeDate(addDays(seasonStartDate, 40), takenDates), 1, names);
    continentalCup.fixtures = continentalCup.fixtures.map((f, i) => (
      i === 0 ? f : { ...f, date: pickFreeDate(addDays(seasonStartDate, 40 + i * 45), takenDates) }
    ));
  }

  return { domesticCup, continentalCup };
}

function initCupRun(name, opponentPool, rounds, startDate, gapDays, roundNames) {
  const picks = shuffle(opponentPool).slice(0, rounds);
  return {
    name,
    roundNames,
    stage: 0,
    eliminated: false,
    won: false,
    fixtures: picks.map((teamId, i) => ({
      round: i + 1, opponentId: teamId, date: addDays(startDate, i * gapDays), played: false, golFor: null, golAgainst: null
    }))
  };
}

// Simulates one cup fixture (uses the same team/player match engine as the
// league) and returns the outcome plus an updated cup-run object.
function resolveCupFixture(player, cupRun, career, standings /* unused, kept for symmetry */, topScorers, gameDate) {
  const fixture = cupRun.fixtures[cupRun.stage];
  if (!fixture || fixture.date !== gameDate || fixture.played) return null;
  const opponent = INITIAL_TEAMS.find((t) => t.id === fixture.opponentId);
  const playerTeam = INITIAL_TEAMS.find((t) => t.id === player.club.id);
  if (!opponent || !playerTeam) return null;

  let { golA, golB } = simulateTeamMatch(playerTeam, opponent); // golA = player's club
  let pStats = null;
  if (!player.career.injury) {
    pStats = simulatePlayerMatch(player, opponent);
    if (pStats.played) golA = Math.max(golA, pStats.goals);
  }
  if (pStats?.played && pStats.goals > 0) {
    if (!topScorers[player.id]) topScorers[player.id] = { id: player.id, name: `${player.name} ${player.surname}`, teamId: player.club.id, teamName: player.club.name, goals: 0 };
    topScorers[player.id].goals += pStats.goals;
  }

  let won = golA > golB;
  if (golA === golB) won = Math.random() < 0.5; // decided on penalties

  const roundName = cupRun.roundNames[cupRun.stage] || `Round ${fixture.round}`;
  const updatedFixtures = cupRun.fixtures.map((f, i) => (i === cupRun.stage ? { ...f, played: true, golFor: golA, golAgainst: golB, won } : f));
  const isLastRound = cupRun.stage === cupRun.fixtures.length - 1;

  const message = {
    id: newId('msg'), type: 'club', date: gameDate, from: cupRun.name,
    subject: won ? `${roundName} won!` : `${roundName}: eliminated`,
    body: `${cupRun.name} ${roundName}: ${player.club.name} ${golA}-${golB} ${opponent.name}${golA === golB ? ' (won on penalties)' : ''}. ${
      won ? (isLastRound ? `You've won the ${cupRun.name}!` : 'You advance to the next round.') : 'Your run in this competition ends here.'
    }`,
    read: false, resolved: true
  };

  return {
    pStats,
    message,
    nextCupRun: {
      ...cupRun,
      fixtures: updatedFixtures,
      stage: won ? cupRun.stage + 1 : cupRun.stage,
      eliminated: !won,
      won: won && isLastRound
    }
  };
}

// ---------------------------------------------------------------------------
// Is the very next day a scheduled matchday for the player's own club? Used
// to swap the Home page's "Next Day" button for a "Play Match" button, and
// to flag the right fixture on the Games page. Checks the league, domestic
// cup, and continental cup schedules.
// ---------------------------------------------------------------------------
export function getNextFixtureLabel(player) {
  if (!player) return null;
  const newDate = addDays(player.career.gameDate, 1);
  const round = (player.career.schedule || []).find((r) => r.date === newDate && !r.matches.every((m) => m.played));
  if (round) {
    const clubId = player.club.id;
    const m = round.matches.find((mm) => mm.home === clubId || mm.away === clubId);
    if (m) {
      const oppId = m.home === clubId ? m.away : m.home;
      const opp = INITIAL_TEAMS.find((t) => t.id === oppId);
      return opp ? opp.name : null;
    }
  }
  for (const cupKey of ['domesticCup', 'continentalCup']) {
    const cup = player.career[cupKey];
    if (!cup || cup.eliminated) continue;
    const fixture = cup.fixtures[cup.stage];
    if (fixture && fixture.date === newDate && !fixture.played) {
      const opp = INITIAL_TEAMS.find((t) => t.id === fixture.opponentId);
      return opp ? `${opp.name} (${cup.name})` : cup.name;
    }
  }
  return null;
}

export function isMatchdayNext(player) {
  if (!player) return false;
  const newDate = addDays(player.career.gameDate, 1);
  const schedule = player.career.schedule || [];
  if (schedule.some((r) => r.date === newDate && !r.matches.every((m) => m.played))) return true;
  const cups = [player.career.domesticCup, player.career.continentalCup].filter(Boolean);
  return cups.some((cup) => cup.fixtures[cup.stage] && cup.fixtures[cup.stage].date === newDate && !cup.fixtures[cup.stage].played);
}

// ---------------------------------------------------------------------------
// Season end: crowns a champion, hands out the Golden Boot, records a
// seasonHistory entry (used by the All Stats page's year-by-year
// breakdown), and rolls straight into a freshly-generated next season.
// ---------------------------------------------------------------------------
function rankStandings(standings) {
  return Object.values(standings).sort((a, b) => (b.pts - a.pts) || ((b.gf - b.ga) - (a.gf - a.ga)) || (b.gf - a.gf));
}

function finalizeSeason(player, career, standings, topScorers, schedule, messages) {
  const league = LEAGUES.find((l) => l.id === player.club.leagueId);
  const ranking = rankStandings(standings);
  const championId = ranking[0]?.teamId;
  const championTeam = INITIAL_TEAMS.find((t) => t.id === championId);
  const playerPosition = ranking.findIndex((r) => r.teamId === player.club.id) + 1;
  const scorersSorted = Object.values(topScorers).sort((a, b) => b.goals - a.goals);
  const goldenBoot = scorersSorted[0];
  const seasonYear = Number(career.gameDate.slice(0, 4));

  const trophies = [...(career.trophies || [])];
  let newMessages = [...messages];

  const wonLeague = championId === player.club.id;
  if (wonLeague) {
    trophies.push({ name: `${league?.name || 'League'} Champion`, year: seasonYear, icon: '🏆' });
    newMessages.push({
      id: newId('msg'), type: 'club', date: career.gameDate, from: player.club.name,
      subject: 'CHAMPIONS!', body: `${player.club.name} have won the ${league?.name || 'league'} title! An unforgettable season.`,
      read: false, resolved: true
    });
  }

  const wonGoldenBoot = goldenBoot && goldenBoot.id === player.id && goldenBoot.goals > 0;
  if (wonGoldenBoot) {
    trophies.push({ name: `${league?.name || 'League'} Golden Boot`, year: seasonYear, icon: '⚽' });
    newMessages.push({
      id: newId('msg'), type: 'club', date: career.gameDate, from: 'League Awards',
      subject: 'Golden Boot!', body: `You finished the season as top scorer with ${goldenBoot.goals} goals - the Golden Boot is yours!`,
      read: false, resolved: true
    });
  }

  // Cup silverware from the season that's ending (career.domesticCup /
  // continentalCup are about to be replaced with fresh ones for next season).
  if (career.domesticCup?.won) {
    trophies.push({ name: career.domesticCup.name, year: seasonYear, icon: '🏆' });
  }
  if (career.continentalCup?.won) {
    trophies.push({ name: career.continentalCup.name, year: seasonYear, icon: '🌍' });
  }

  // Continental qualification for NEXT season, based on where the club
  // finished in its own league this season.
  const confederation = getConfederation(player.club.leagueId);
  let qualifiedContinentalNextSeason = null;
  if (confederation && playerPosition > 0) {
    if (playerPosition <= 2) qualifiedContinentalNextSeason = { confederation, name: confederation === 'UEFA' ? 'UEFA Champions League' : 'AFC Champions League' };
    else if (playerPosition <= 4 && confederation === 'UEFA') qualifiedContinentalNextSeason = { confederation, name: 'UEFA Europa League' };
  }
  if (qualifiedContinentalNextSeason && !career.continentalCup) {
    newMessages.push({
      id: newId('msg'), type: 'club', date: career.gameDate, from: player.club.name,
      subject: 'Continental qualification!',
      body: `Finishing ${playerPosition}${['th','st','nd','rd'][((playerPosition%100)-20)%10] || 'th'} means ${player.club.name} have qualified for the ${qualifiedContinentalNextSeason.name} next season!`,
      read: false, resolved: true
    });
  }

  if (!wonLeague) {
    newMessages.push({
      id: newId('msg'), type: 'club', date: career.gameDate, from: player.club.name,
      subject: 'Season Review',
      body: `The season has ended - ${player.club.name} finished ${playerPosition}${['th','st','nd','rd'][((playerPosition%100)-20)%10] || 'th'} in the ${league?.name || 'league'}, with ${championTeam?.name || 'a rival'} taking the title.`,
      read: false, resolved: true
    });
  }

  const seasonHistory = [...(career.seasonHistory || []), {
    year: seasonYear,
    league: league?.name || '',
    club: player.club.name,
    position: playerPosition,
    appearances: career.seasonAppearances || 0,
    goals: career.seasonGoals || 0,
    assists: career.seasonAssists || 0,
    wonLeague,
    wonGoldenBoot
  }];

  // Straight into next season: fresh schedule, standings, top scorers - but
  // trophies/history/lifetime totals/money all carry over. gameDate is set
  // to the day BEFORE the new season's kickoff, since prepareNextDay always
  // advances by exactly one day before checking the schedule - setting it to
  // kickoff day itself would skip the new season's very first round.
  // A season that starts in August of year Y always ends in the spring of
  // year Y+1 - so seasonYear (taken from the end-of-season date) IS the
  // year the next season's August kickoff falls in. Using seasonYear + 1
  // here would skip an entire year between seasons.
  const nextStartDate = `${seasonYear}-08-01`;
  const newSchedule = buildSeasonSchedule(league, nextStartDate);
  const newStandings = initStandings(league.teamIds);
  const { domesticCup, continentalCup } = setupSeasonCups(player, league, nextStartDate, newSchedule);

  newMessages.push({
    id: newId('msg'), type: 'club', date: nextStartDate, from: player.club.name,
    subject: 'New Season Begins', body: `A new season kicks off today at ${player.club.name}. Good luck!`,
    read: false, resolved: true
  });

  return {
    trophies,
    seasonHistory,
    schedule: newSchedule,
    standings: newStandings,
    topScorers: {},
    domesticCup,
    continentalCup,
    qualifiedContinentalNextSeason,
    seasonAppearances: 0,
    seasonGoals: 0,
    seasonAssists: 0,
    gameDate: addDays(nextStartDate, -1),
    messages: newMessages
  };
}

// ---------------------------------------------------------------------------
// Advance the calendar by exactly one day, resolving any scheduled round,
// injury recovery, stamina trickle and weekly wages along the way. Returns
// both the fully-updated player AND (when the day involved the player's own
// match) a compact "matchInfo" summary describing just that match, so a live
// playback screen can replay it before the result is committed to the save.
// ---------------------------------------------------------------------------
export function prepareNextDay(player) {
  const newDate = addDays(player.career.gameDate, 1);
  const newDay = player.career.day + 1;

  let schedule = player.career.schedule || [];
  let standings = { ...(player.career.standings || {}) };
  let topScorers = { ...(player.career.topScorers || {}) };
  let messages = [...(player.career.messages || [])];
  let career = { ...player.career, gameDate: newDate, day: newDay };
  let potential = player.potential;
  let matchInfo = null;
  let age = player.age;

  // Birthdays: once a full in-game year (365 days) has passed since the last
  // age-up, the player turns a year older and their yearly OVR growth
  // allowance (see yearlyOvrCap in statCalc.js) resets for the new year.
  const lastAgeUpDay = career.lastAgeUpDay ?? 1;
  if (newDay - lastAgeUpDay >= 365) {
    age = player.age + 1;
    career.lastAgeUpDay = newDay;
    career.growthUsedThisYear = 0;
    messages = [...messages, {
      id: newId('msg'), type: 'club', date: newDate, from: player.club.name,
      subject: 'Happy Birthday!', body: `You've turned ${age} today. Here's to another year of your career.`,
      read: false, resolved: true
    }];
  }

  let clubTier = player.club.tier;
  const roundIdx = schedule.findIndex((r) => r.date === newDate && !r.matches.every((m) => m.played));
  if (roundIdx !== -1) {
    // Re-check Starting XI vs Bench against the player's CURRENT OVR right
    // before this match is simulated - training/improving (or falling
    // behind) actually moves you, instead of being stuck at whatever tier
    // you were assigned on day one.
    clubTier = recomputeTier(player);
    if (clubTier !== player.club.tier) {
      messages = [...messages, {
        id: newId('msg'), type: 'club', date: newDate, from: player.club.name,
        subject: clubTier === 'starter' ? "You're in the Starting XI!" : 'Squad update',
        body: clubTier === 'starter'
          ? "Your recent form and improvement have earned you a place in the Starting XI - go show what you can do."
          : "The manager has decided to rotate the squad - you're back among the substitutes for now. Keep training.",
        read: false, resolved: true
      }];
    }
    const effectivePlayer = clubTier === player.club.tier ? player : { ...player, club: { ...player.club, tier: clubTier } };

    const { updatedMatches, messages: roundMessages, playerPatch } = processRound(schedule[roundIdx], effectivePlayer, standings, topScorers);
    schedule = schedule.map((r, i) => (i === roundIdx ? { ...r, matches: updatedMatches } : r));
    messages = [...messages, ...roundMessages];
    if (playerPatch?.careerUpdate) career = { ...career, ...playerPatch.careerUpdate };
    if (playerPatch?.potential !== undefined) potential = playerPatch.potential;

    // Full round results (every match, not just the player's own) - powers
    // the League page's "browse any round" view and the News feed.
    career.roundResultsLog = [
      ...(career.roundResultsLog || []),
      { round: schedule[roundIdx].round, date: newDate, matches: updatedMatches }
    ].slice(-20);

    if (playerPatch && playerPatch.opponent) {
      const { pStats, opponent, isHome, golA, golB } = playerPatch;
      matchInfo = {
        opponentName: opponent.name,
        opponentLogo: opponent.logo,
        isHome,
        golFor: isHome ? golA : golB,
        golAgainst: isHome ? golB : golA,
        pStats: pStats || { played: false }
      };
    }
  } else {
    // No league round today - check for a domestic/continental cup fixture
    // before falling back to a fully quiet day.
    let cupPlayed = false;
    for (const cupKey of ['domesticCup', 'continentalCup']) {
      const cupRun = career[cupKey];
      if (!cupRun || cupRun.eliminated || cupRun.stage >= cupRun.fixtures.length) continue;
      const outcome = resolveCupFixture(player, cupRun, career, standings, topScorers, newDate);
      if (!outcome) continue;
      cupPlayed = true;
      career[cupKey] = outcome.nextCupRun;
      messages = [...messages, outcome.message];
      const fixture = cupRun.fixtures[cupRun.stage];
      const opponent = INITIAL_TEAMS.find((t) => t.id === fixture.opponentId);
      matchInfo = {
        opponentName: opponent?.name || 'Cup opponent',
        opponentLogo: opponent?.logo || '⚽',
        isHome: true,
        golFor: outcome.nextCupRun.fixtures[cupRun.stage].golFor,
        golAgainst: outcome.nextCupRun.fixtures[cupRun.stage].golAgainst,
        pStats: outcome.pStats || { played: false }
      };
      break;
    }

    if (!cupPlayed) {
      // Fully quiet day: stamina trickles back, injuries heal a little, and
      // there's a small chance of a flavour message (scout interest /
      // teammate banter) to keep the inbox from going completely silent.
      career.stamina = clamp(career.stamina + 8, 0, 100);
      const league = LEAGUES.find((l) => l.id === player.club.leagueId);
      if (league && Math.random() < 0.10) {
        const scout = maybeGenerateScoutInterest(player, league, newDate);
        if (scout) messages = [...messages, scout];
      }
      if (Math.random() < 0.10) {
        const teammateMsg = maybeGenerateTeammateMessage(player, newDate);
        if (teammateMsg) messages = [...messages, teammateMsg];
      }
      if (Math.random() < 0.35) {
        const transfers = maybeGenerateTransferMarketActivity(newDate);
        if (transfers.length) {
          career.transferLog = [...(career.transferLog || []), ...transfers].slice(-150);
        }
      }
    }
  }

  if (career.injury) {
    const daysLeft = career.injury.daysLeft - 1;
    career.injury = daysLeft > 0 ? { ...career.injury, daysLeft } : null;
  }

  if (newDay % 7 === 0) {
    career.money = (career.money || 0) + (career.weeklyWage || 0);
  }

  // Season end: once every fixture in the schedule has been played, crown a
  // champion, hand out the Golden Boot, record this season in history, and
  // generate the next one - seasons run indefinitely, one after another.
  if (schedule.length && schedule.every((r) => r.matches.every((m) => m.played))) {
    const seasonResult = finalizeSeason(player, career, standings, topScorers, schedule, messages);
    career = { ...career, ...seasonResult };
    schedule = seasonResult.schedule;
    standings = seasonResult.standings;
    topScorers = seasonResult.topScorers;
    messages = seasonResult.messages;
  }

  const nextPlayer = {
    ...player,
    age,
    potential,
    club: { ...player.club, tier: clubTier },
    career: { ...career, schedule, standings, topScorers, messages }
  };

  return { nextPlayer, matchInfo };
}

// Back-compat convenience wrapper for call sites (quiet days, or anywhere
// the match playback screen isn't involved) that just want the next state.
export function advanceOneDay(player) {
  return prepareNextDay(player).nextPlayer;
}

// ---------------------------------------------------------------------------
// Misc helpers used by the Start Page / Money Page
// ---------------------------------------------------------------------------
const LEAGUE_PRESTIGE = {
  la_liga: 1.7, premier_league: 1.7, bundesliga: 1.5, serie_a: 1.5, ligue_1: 1.4,
  primeira_liga: 1.1, eredivisie: 1.0, super_lig: 1.0, saudi_pro_league: 1.2,
  belgian_pro_league: 0.9, swiss_super_league: 0.8, mls: 1.0
};

export function computeStartingWage(overall, tier, leagueId) {
  const prestige = LEAGUE_PRESTIGE[leagueId] || 0.55;
  const tierMult = tier === 'starter' ? 1.4 : 0.85;
  return Math.max(150, Math.round(overall * 6 * tierMult * prestige));
}

export function computeContractOffer(player) {
  const ratings = player.career.matchRatings;
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 6;
  const perfMult = 0.9 + Math.max(0, avgRating - 6) * 0.25;
  const growthMult = 1 + Math.max(0, player.overall - player.firstRating) / 60;
  const newWage = Math.round((player.career.weeklyWage || 200) * perfMult * growthMult * (1 + Math.random() * 0.2));
  return Math.max(newWage, player.career.weeklyWage || 200);
}

export function getLeagueTable(player) {
  const standings = player?.career?.standings || {};
  return Object.values(standings)
    .map((row) => {
      const team = INITIAL_TEAMS.find((t) => t.id === row.teamId);
      return { ...row, name: team?.name || row.teamId, logo: team?.logo || '⚽', gd: row.gf - row.ga };
    })
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
}

export function getTopScorers(player) {
  const scorers = player?.career?.topScorers || {};
  return Object.values(scorers).sort((a, b) => b.goals - a.goals);
}

export function getPlayerFixtures(player) {
  const schedule = player?.career?.schedule || [];
  const clubId = player?.club?.id;
  return schedule
    .filter((r) => r.matches.some((m) => m.home === clubId || m.away === clubId))
    .map((r) => {
      const m = r.matches.find((mm) => mm.home === clubId || mm.away === clubId);
      const isHome = m.home === clubId;
      const oppId = isHome ? m.away : m.home;
      const oppTeam = INITIAL_TEAMS.find((t) => t.id === oppId);
      return {
        round: r.round, date: r.date, played: m.played, isHome,
        opponent: oppTeam?.name || oppId, opponentLogo: oppTeam?.logo || '⚽',
        golFor: isHome ? m.golA : m.golB, golAgainst: isHome ? m.golB : m.golA
      };
    });
}

// ---------------------------------------------------------------------------
// Live match playback timeline
// ---------------------------------------------------------------------------
// The final score/rating/goals/assists are already decided (by
// prepareNextDay, above) the moment "Play Match" is pressed - this just
// builds a plausible minute-by-minute goal sequence so the match can be
// watched unfold instead of being revealed instantly. It never re-rolls the
// outcome, only the presentation of it.
export function buildMatchTimeline(matchInfo) {
  if (!matchInfo) return [];
  const { golFor, golAgainst, pStats } = matchInfo;
  const events = [];

  const usedMinutes = new Set();
  const rollMinute = () => {
    let m = randInt(1, 90);
    while (usedMinutes.has(m)) m = randInt(1, 90);
    usedMinutes.add(m);
    return m;
  };

  for (let i = 0; i < golFor; i += 1) events.push({ minute: rollMinute(), side: 'for' });
  for (let i = 0; i < golAgainst; i += 1) events.push({ minute: rollMinute(), side: 'against' });
  events.sort((a, b) => a.minute - b.minute);

  // Tag which of "our" goals are the player's own, and (separately) which
  // are assisted by the player - both counts come straight from pStats, so
  // they always add up to what the post-match summary shows.
  const forEvents = events.filter((e) => e.side === 'for');
  if (pStats?.played) {
    const scorerIdx = new Set();
    const goalCount = Math.min(pStats.goals || 0, forEvents.length);
    while (scorerIdx.size < goalCount) scorerIdx.add(Math.floor(Math.random() * forEvents.length));
    scorerIdx.forEach((idx) => { forEvents[idx].isPlayerGoal = true; });

    const assistCount = Math.min(pStats.assists || 0, forEvents.length - scorerIdx.size);
    const assistIdx = new Set();
    let guard = 0;
    while (assistIdx.size < assistCount && guard < 200) {
      guard += 1;
      const idx = Math.floor(Math.random() * forEvents.length);
      if (!scorerIdx.has(idx)) assistIdx.add(idx);
    }
    assistIdx.forEach((idx) => { forEvents[idx].isPlayerAssist = true; });
  }

  return events.map((e, i) => ({ id: `ev_${i}`, ...e }));
}

// ---------------------------------------------------------------------------
// News feed - scans recent round results, the player's own match history,
// and their trophy cabinet for storylines worth surfacing: big scorelines,
// upsets (a much weaker side beating a much stronger one), streaks, MVP
// performances and silverware.
// ---------------------------------------------------------------------------
export function generateNews(player) {
  if (!player) return [];
  const items = [];
  const log = player.career.roundResultsLog || [];

  log.forEach((round) => {
    round.matches.forEach((m) => {
      const home = INITIAL_TEAMS.find((t) => t.id === m.home);
      const away = INITIAL_TEAMS.find((t) => t.id === m.away);
      if (!home || !away) return;
      const totalGoals = m.golA + m.golB;
      const margin = Math.abs(m.golA - m.golB);
      const homeStrength = teamStrength(home);
      const awayStrength = teamStrength(away);

      if (totalGoals >= 6) {
        items.push({
          id: `news_goalfest_${round.round}_${m.home}_${m.away}`, date: round.date, icon: '🔥',
          headline: 'Goal-fest!',
          body: `${home.name} ${m.golA}-${m.golB} ${away.name} - a thriller with ${totalGoals} goals.`
        });
      } else if (margin >= 4) {
        items.push({
          id: `news_thrash_${round.round}_${m.home}_${m.away}`, date: round.date, icon: '💥',
          headline: 'One-sided affair',
          body: `${home.name} ${m.golA}-${m.golB} ${away.name} - a heavy result for one side to take.`
        });
      }

      // Upset: the much weaker side (by squad strength) won outright.
      const diff = homeStrength - awayStrength;
      if (m.golA > m.golB && diff <= -6) {
        items.push({
          id: `news_upset_${round.round}_${m.home}_${m.away}`, date: round.date, icon: '😱',
          headline: 'Shock result!',
          body: `${home.name} were massive underdogs but beat ${away.name} ${m.golA}-${m.golB}.`
        });
      } else if (m.golB > m.golA && diff >= 6) {
        items.push({
          id: `news_upset2_${round.round}_${m.home}_${m.away}`, date: round.date, icon: '😱',
          headline: 'Shock result!',
          body: `${away.name} pulled off a huge upset, beating ${home.name} ${m.golB}-${m.golA} away from home.`
        });
      }
    });
  });

  // Player's own storylines: MVP awards and win/unbeaten streaks.
  const history = player.career.matchHistory || [];
  history.filter((h) => h.mvp).forEach((h) => {
    items.push({
      id: `news_mvp_${h.id}`, date: h.date, icon: '⭐',
      headline: 'Man of the Match',
      body: `${player.name} ${player.surname} was named Man of the Match after a ${h.rating.toFixed(1)}-rated display (${h.golFor}-${h.golAgainst} vs ${h.opponent}).`
    });
  });

  let streak = 0;
  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (history[i].golFor > history[i].golAgainst) streak += 1; else break;
  }
  if (streak >= 3) {
    items.push({
      id: `news_streak_${history.length}`, date: history[history.length - 1]?.date, icon: '📈',
      headline: 'On a run!',
      body: `${player.club.name} have now won ${streak} matches in a row with ${player.name} ${player.surname} in the side.`
    });
  }

  (player.career.trophies || []).slice(-3).forEach((t) => {
    items.push({
      id: `news_trophy_${t.name}_${t.year}`, date: `${t.year}-05-01`, icon: t.icon || '🏆',
      headline: t.name, body: `${player.name} ${player.surname} won the ${t.name} in ${t.year}.`
    });
  });

  return items.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 40);
}

// ---------------------------------------------------------------------------
// Transfer market flavour - clubs across the game world are always dealing:
// bigger/more ambitious clubs periodically buy players from smaller ones.
// This is presentation only (the News/Transfers feed) - it doesn't move
// players between the static squad data used for match simulation, so
// nothing about team strength or the player's own squad changes because of
// it; it exists to make the world feel alive.
// ---------------------------------------------------------------------------
function estimateFee(ovr, age) {
  const base = Math.max(0.5, (ovr - 60) * 1.8);
  const ageMult = age <= 24 ? 1.4 : age <= 29 ? 1 : 0.5;
  const noise = 0.7 + Math.random() * 0.8;
  return Math.max(0.3, Math.round(base * ageMult * noise * 10) / 10); // in millions
}

export function maybeGenerateTransferMarketActivity(gameDate) {
  const transfers = [];
  const count = Math.random() < 0.5 ? 1 : (Math.random() < 0.7 ? 2 : 3);
  for (let i = 0; i < count; i += 1) {
    const fromTeam = pick(INITIAL_TEAMS);
    let toTeam = pick(INITIAL_TEAMS);
    let guard = 0;
    while (toTeam.id === fromTeam.id && guard < 10) { toTeam = pick(INITIAL_TEAMS); guard += 1; }
    if (toTeam.id === fromTeam.id || !fromTeam.squad?.length) continue;
    const player = pick(fromTeam.squad);
    if (!player) continue;
    const age = randInt(19, 31);
    const fee = estimateFee(player.ovr || 70, age);
    transfers.push({
      id: newId('transfer'), date: gameDate, playerName: player.name, playerPos: player.pos,
      ovr: player.ovr, fromClub: fromTeam.name, fromLogo: fromTeam.logo,
      toClub: toTeam.name, toLogo: toTeam.logo, fee
    });
  }
  return transfers;
}
