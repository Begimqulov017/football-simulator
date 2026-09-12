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
const GAP_DAYS = 4; // days between rounds

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

export function buildSeasonSchedule(league, startDate = '2026-08-01', gapDays = GAP_DAYS) {
  const rounds = generateRoundRobinRounds(league.teamIds);
  return rounds.map((matches, i) => ({
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
export function isMatchdayNext(player) {
  if (!player) return false;
  const newDate = addDays(player.career.gameDate, 1);
  const schedule = player.career.schedule || [];
  return schedule.some((r) => r.date === newDate && !r.matches.every((m) => m.played));
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

  const roundIdx = schedule.findIndex((r) => r.date === newDate && !r.matches.every((m) => m.played));
  if (roundIdx !== -1) {
    const { updatedMatches, messages: roundMessages, playerPatch } = processRound(schedule[roundIdx], player, standings, topScorers);
    schedule = schedule.map((r, i) => (i === roundIdx ? { ...r, matches: updatedMatches } : r));
    messages = [...messages, ...roundMessages];
    if (playerPatch?.careerUpdate) career = { ...career, ...playerPatch.careerUpdate };
    if (playerPatch?.potential !== undefined) potential = playerPatch.potential;

    if (playerPatch) {
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
    // Quiet day: stamina trickles back, injuries heal a little, and there's
    // a small chance of a flavour message (scout interest / teammate banter)
    // to keep the inbox from going completely silent between matchdays.
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
  }

  if (career.injury) {
    const daysLeft = career.injury.daysLeft - 1;
    career.injury = daysLeft > 0 ? { ...career.injury, daysLeft } : null;
  }

  if (newDay % 7 === 0) {
    career.money = (career.money || 0) + (career.weeklyWage || 0);
  }

  const nextPlayer = {
    ...player,
    potential,
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
