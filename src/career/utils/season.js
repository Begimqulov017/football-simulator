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

import { INITIAL_TEAMS } from '../../data/teamsData';
import { LEAGUES } from '../../data/leaguesData';
import { getMergedSquad } from '../data/clubRosterStore';
import { isMvpPerformance, resolveVeteranProgression, getRetirementChance, calcMainStats, calcGoalkeeperOVR, calcOVR, clampStat } from './statCalc';

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

// Fauldan ko'ra ko'proq mudofaachi/opardgichlar sariq kartochka oladi -
// hujumchilar deyarli olmaydi. GK juda kam.
const FOUL_WEIGHT = { CB: 1, LB: 0.8, RB: 0.8, CDM: 1, CM: 0.6, LM: 0.4, RM: 0.4, CAM: 0.3, LW: 0.25, RW: 0.25, ST: 0.2, GK: 0.05 };

function weightedPickByFoul(list) {
  const weights = list.map((p) => Math.max(0.05, FOUL_WEIGHT[p.pos] ?? 0.4));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < list.length; i += 1) {
    r -= weights[i];
    if (r <= 0) return list[i];
  }
  return list[list.length - 1];
}

// 2-BOSQICH: bitta oʻyin uchun (bitta jamoa) sariq/qizil kartochkalarni
// tasodifiy, lekin real futbolga oʻxshab (mudofaachilarga koʻproq) hosil
// qiladi. Har bir kartochka egasining ismi qaytariladi - shu sababli
// endi "kim jarohat oldi" kabi "kim kartochka oldi" ham koʻrinadi.
function generateTeamCards(team) {
  if (!team?.squad?.length) return [];
  const cards = [];
  const yellowCount = Math.random() < 0.55 ? (Math.random() < 0.65 ? 1 : 2) : 0;
  const usedIds = new Set();
  for (let i = 0; i < yellowCount; i += 1) {
    const pool = team.squad.filter((p) => !usedIds.has(p.id));
    if (!pool.length) break;
    const player = weightedPickByFoul(pool);
    usedIds.add(player.id);
    cards.push({ id: player.id, name: player.name, type: 'yellow' });
  }
  // Juda kam holatda (~3%) qizil kartochka - alohida futbolchiga.
  if (Math.random() < 0.03) {
    const pool = team.squad.filter((p) => !usedIds.has(p.id));
    const player = weightedPickByFoul(pool.length ? pool : team.squad);
    if (player) cards.push({ id: player.id, name: player.name, type: 'red' });
  }
  return cards;
}

function distributeGoals(team, goalsCount, topScorers, excludeId) {
  if (!team || goalsCount <= 0) return [];
  const pool = team.squad.filter((p) => p.id !== excludeId);
  const attackers = pool.filter((p) => (ATTACK_WEIGHT[p.pos] ?? 0) > 0.3);
  const list = attackers.length ? attackers : pool;
  if (!list.length) return [];
  const scored = [];
  for (let i = 0; i < goalsCount; i += 1) {
    const scorer = weightedPick(list);
    if (!scorer) continue;
    if (!topScorers[scorer.id]) {
      topScorers[scorer.id] = { id: scorer.id, name: scorer.name, teamId: team.id, teamName: team.name, goals: 0 };
    }
    topScorers[scorer.id].goals += 1;

    // 2-BOSQICH: bu golni kim uzatgani (assist) - ~68% ehtimol bilan,
    // to'purchining o'zidan boshqa birov, ko'proq CAM/CM/qanotchilardan.
    let assistName = null;
    if (Math.random() < 0.68) {
      const assistPool = pool.filter((p) => p.id !== scorer.id);
      if (assistPool.length) assistName = weightedPick(assistPool).name;
    }
    scored.push({ id: scorer.id, name: scorer.name, assistName });
  }
  return scored;
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
  // 3-BOSQICH: eski qat'iy 8% ehtimol + faqat "juda yaxshi o'ynagan kunlar"
  // talabi transfer takliflarini yillar davomida deyarli yo'qolib ketishiga
  // sabab bo'lgan edi. Endi bazaviy ehtimol OVR bilan birga o'sadi - kuchli
  // futbolchi doim ko'proq e'tibor tortadi, lekin zaif futbolchi ham
  // umuman umidsiz qolmaydi.
  const chance = 0.10 + clamp((player.overall - 60) / 200, 0, 0.12);
  if (Math.random() > chance) return null;
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
// 7-BOSQICH: jamoadoshlar endi o'zbekcha, jonli gaplashadi - reytingga
// qarab 3 xil kayfiyatda (zo'r o'yin / o'rtacha / yomon o'yin).
function maybeGenerateTeammateMessage(player, gameDate) {
  if (Math.random() > 0.16) return null;
  const team = INITIAL_TEAMS.find((t) => t.id === player.club.id);
  if (!team) return null;
  const squad = getMergedSquad(team).filter((p) => p.id !== player.id);
  if (!squad.length) return null;
  const mate = pick(squad);
  const lastRating = player.career.matchRatings?.length ? player.career.matchRatings[player.career.matchRatings.length - 1] : null;

  let lines;
  if (lastRating != null && lastRating >= 8) {
    lines = [
      `Ajoyib o'yin! Qoyil qoldirding, bugun haqiqiy jangchi eding!`,
      `Zo'r o'ynading! Menimcha bu senga oddiy kun emas edi - primedasan!`,
      `Bugungi o'yining hammani hayratda qoldirdi. Shunday davom et!`
    ];
  } else if (lastRating != null && lastRating >= 6.5) {
    lines = [
      `Yaxshi o'ynading bugun, jamoaga foyda berding.`,
      `Baxtli natija, sen ham o'z hissangni qo'shding - rahmat!`,
      `Solid o'yin edi, keyingisiga ham shunday tayyorlanamiz.`
    ];
  } else {
    lines = [
      `Bugun unchalik bo'lmadi, lekin xafa bo'lma - keyingi o'yinda qaytaramiz.`,
      `Menimcha bu sening to'liq kuching emas edi. Dam ol, keyingisiga tayyorlan.`,
      `Hammada shunaqa kunlar bo'ladi. Ertaga mashg'ulotda birga ishlaymiz, ko'tarilamiz.`
    ];
  }
  return {
    id: newId('msg'), type: 'teammate', date: gameDate, from: mate.name || 'Jamoadosh',
    subject: `${mate.name || 'Jamoadosh'}dan xabar`,
    body: pick(lines), read: false, resolved: true
  };
}

// 7-BOSQICH: murabbiydan alohida xabarlar - reyting va shakl (form)ga qarab
// turlicha ohangda (maqtov, ogohlantirish, motivatsiya).
function maybeGenerateCoachMessage(player, gameDate) {
  if (Math.random() > 0.14) return null;
  const lastRating = player.career.matchRatings?.length ? player.career.matchRatings[player.career.matchRatings.length - 1] : null;
  const clubName = player.club.name;
  let lines;
  if (lastRating != null && lastRating >= 8) {
    lines = [
      `Sen hozircha jamoamizning asosiy o'yinchisisan. Shu darajani ushlab tur, senga kelajakda ko'proq imkoniyat beraman.`,
      `Bugungi o'yining haqiqatan ham prayimdagi futbolchining o'yini edi. Qoyil!`,
      `Menejment sen bilan faxrlanadi. Shunday davom eting, ${clubName} senga tayanadi.`
    ];
  } else if (lastRating != null && lastRating < 6) {
    lines = [
      `Oxirgi o'yinlaringda o'zingizning kuchingizda emassiz - biroz pasayish sezyapman. Mashg'ulotlarda ko'proq qatnashing.`,
      `Har kim shunday davrdan o'tadi, lekin mashg'ulotga jiddiyroq yondashishing kerak. Ishlaymiz, tuzatamiz.`,
      `Stamina va shaklingga e'tibor bering - keyingi muhim o'yin oldidan tiklanib olishingiz kerak.`
    ];
  } else {
    lines = [
      `Muhim o'yin bor - staminangizni ushlab turing, sizga tayanaman.`,
      `Yaxshi ishlayapsiz, lekin mashg'ulotlarda yana bir bosqich yuqoriga chiqishimiz mumkin.`,
      `Jamoa siz bilan hisoblashadi - shunday tayyorlaning.`
    ];
  }
  return {
    id: newId('msg'), type: 'club', date: gameDate, from: `${clubName} bosh murabbiyi`,
    subject: 'Murabbiydan xabar',
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
    const homeScorers = distributeGoals(homeTeam, homeGoalsForNpc, topScorers, playerIsHome ? player.id : null);
    const awayScorers = distributeGoals(awayTeam, awayGoalsForNpc, topScorers, playerIsAway ? player.id : null);
    // 2-BOSQICH: kartochkalar faqat FOYDALANUVCHI ISHTIROK ETGAN o'yin
    // uchun hisoblanadi (pastda matchInfo'ga yoziladi) - boshqa yuzlab
    // o'yin uchun har kuni bekorga hisoblab o'tirmaslik uchun.
    let homeCards = null;
    let awayCards = null;

    if (involvesPlayer && pStats?.played && pStats.goals > 0) {
      if (!topScorers[player.id]) {
        topScorers[player.id] = { id: player.id, name: `${player.name} ${player.surname}`, teamId: player.club.id, teamName: player.club.name, goals: 0 };
      }
      topScorers[player.id].goals += pStats.goals;
    }

    if (involvesPlayer) {
      homeCards = generateTeamCards(homeTeam);
      awayCards = generateTeamCards(awayTeam);
    }

    updatedMatches.push({ ...m, played: true, golA, golB });

    if (involvesPlayer) {
      const opponent = playerIsHome ? awayTeam : homeTeam;
      playerPatch = {
        pStats, opponent, isHome: playerIsHome, golA, golB,
        homeScorers, awayScorers, homeCards, awayCards
      };
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

      if (!pStats.injured && pStats.rating >= 6.5) {
        const offer = maybeGenerateTransferOffer(player, league, round.date);
        if (offer) messages.push(offer);
        else {
          const scout = maybeGenerateScoutInterest(player, league, round.date);
          if (scout) messages.push(scout);
        }
      }
      const teammateMsg = maybeGenerateTeammateMessage(player, round.date);
      if (teammateMsg) messages.push(teammateMsg);
      const coachMsg = maybeGenerateCoachMessage(player, round.date);
      if (coachMsg) messages.push(coachMsg);

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

export function getConfederation(leagueId) {
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
  // 2-BOSQICH: kubok o'yinlarida ham endi "kim urdi/kim assist qildi/kim
  // kartochka oldi" to'liq - league filiali bilan bir xil mantiq.
  const npcGoalsFor = pStats?.played ? golA - pStats.goals : golA;
  const forScorers = distributeGoals(playerTeam, npcGoalsFor, topScorers, player.id);
  const againstScorers = distributeGoals(opponent, golB, topScorers, null);
  const forCards = generateTeamCards(playerTeam);
  const againstCards = generateTeamCards(opponent);

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
    forScorers, againstScorers, forCards, againstCards,
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
  if (!player || player.career.freeAgent) return false;
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
  // 9-BOSQICH: klub sahifasidagi kubkalar viteni ENDI o'yinchining shaxsiy
  // yutuqlaridan (Profile) FARQLI - bu yerga har mavsum g'olib bo'lgan
  // klub (garchi bu o'yinchining o'zi bo'lmasa ham) yoziladi, shu orqali
  // klub sahifasi haqiqatan ham "shu klubning" kubkalar viteni bo'ladi.
  const clubTrophyHistory = [...(career.clubTrophyHistory || [])];
  if (championId) {
    clubTrophyHistory.push({
      teamId: championId, teamName: championTeam?.name || championId,
      name: `${league?.name || 'League'} Champion`, year: seasonYear, icon: '🏆'
    });
  }
  let newMessages = [...messages];

  const wonLeague = championId === player.club.id;
  if (wonLeague) {
    trophies.push({ name: `${league?.name || 'League'} Champion`, year: seasonYear, icon: '🏆', teamId: player.club.id, teamName: player.club.name });
    newMessages.push({
      id: newId('msg'), type: 'club', date: career.gameDate, from: player.club.name,
      subject: 'CHAMPIONS!', body: `${player.club.name} have won the ${league?.name || 'league'} title! An unforgettable season.`,
      read: false, resolved: true
    });
  }

  const wonGoldenBoot = goldenBoot && goldenBoot.id === player.id && goldenBoot.goals > 0;
  if (wonGoldenBoot) {
    trophies.push({ name: `${league?.name || 'League'} Golden Boot`, year: seasonYear, icon: '⚽', teamId: player.club.id, teamName: player.club.name });
    newMessages.push({
      id: newId('msg'), type: 'club', date: career.gameDate, from: 'League Awards',
      subject: 'Golden Boot!', body: `You finished the season as top scorer with ${goldenBoot.goals} goals - the Golden Boot is yours!`,
      read: false, resolved: true
    });
  }

  // Cup silverware from the season that's ending (career.domesticCup /
  // continentalCup are about to be replaced with fresh ones for next season).
  if (career.domesticCup?.won) {
    trophies.push({ name: career.domesticCup.name, year: seasonYear, icon: '🏆', teamId: player.club.id, teamName: player.club.name });
    clubTrophyHistory.push({ teamId: player.club.id, teamName: player.club.name, name: career.domesticCup.name, year: seasonYear, icon: '🏆' });
  }
  if (career.continentalCup?.won) {
    trophies.push({ name: career.continentalCup.name, year: seasonYear, icon: '🌍', teamId: player.club.id, teamName: player.club.name });
    clubTrophyHistory.push({ teamId: player.club.id, teamName: player.club.name, name: career.continentalCup.name, year: seasonYear, icon: '🌍' });
  }

  // Continental qualification for NEXT season, based on where the club
  // finished in its own league this season.
  // 5-BOSQICH: endi UEFA uchun 3 daraja (Champions/Europa/Conference League)
  // va AFC uchun 2 daraja (Champions League Elite / Two) bor - avvalgi
  // versiyada Konferensiya va AFC "2" ligalari butunlay yo'q edi.
  const confederation = getConfederation(player.club.leagueId);
  let qualifiedContinentalNextSeason = null;
  if (confederation && playerPosition > 0) {
    if (confederation === 'UEFA') {
      if (playerPosition <= 2) qualifiedContinentalNextSeason = { confederation, name: 'UEFA Champions League', tier: 'cl' };
      else if (playerPosition <= 4) qualifiedContinentalNextSeason = { confederation, name: 'UEFA Europa League', tier: 'el' };
      else if (playerPosition <= 6) qualifiedContinentalNextSeason = { confederation, name: 'UEFA Conference League', tier: 'ecl' };
    } else if (confederation === 'AFC') {
      if (playerPosition <= 2) qualifiedContinentalNextSeason = { confederation, name: 'AFC Champions League Elite', tier: 'afc_elite' };
      else if (playerPosition <= 4) qualifiedContinentalNextSeason = { confederation, name: 'AFC Champions League Two', tier: 'afc_two' };
    }
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

  // 5-BOSQICH: "ligaga kirib, o'tgan sezonni jadvalini ko'rish" - shu
  // sezonning yakuniy jadvali saqlanadi, LeaguePage'da "Bu sezon / O'tgan
  // sezon" almashtirgichi bilan ko'rsatiladi.
  const previousSeasonTable = ranking.map((r, i) => {
    const t = INITIAL_TEAMS.find((tt) => tt.id === r.teamId);
    return { position: i + 1, teamId: r.teamId, name: t?.name || r.teamId, logo: t?.logo || '⚽', ...r, gd: r.gf - r.ga };
  });

  return {
    trophies,
    clubTrophyHistory,
    seasonHistory,
    schedule: newSchedule,
    standings: newStandings,
    topScorers: {},
    domesticCup,
    continentalCup,
    qualifiedContinentalNextSeason,
    previousSeasonTable,
    previousSeasonYear: seasonYear,
    previousSeasonLeagueName: league?.name || '',
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
  // 8-BAND: pensiyaga chiqgan karyera to'liq "muzlatiladi" - boshqa hech
  // qanday kun/o'yin/mashg'ulot davom etmaydi. Foydalanuvchi RetirementPage
  // orqali yangi ("<Familiya> Jr.") karyera boshlashi kerak.
  if (player.career.retired) {
    return { nextPlayer: player, matchInfo: null };
  }

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
  let overall = player.overall;
  let mainStats = player.mainStats;
  let subStats = player.subStats;

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

    // 8-BAND: NPC futbolchilar uchun bu allaqachon ishlaydi
    // (server/engine.js: ageAndRefreshSquad - 30+ da forma past bo'lsa
    // pasayadi). Inson o'yinchi uchun ESA bu HECH QAYERDA ishlatilmagan
    // edi (`resolveVeteranProgression` yozilgan, lekin chaqirilmagan) -
    // shuning uchun 30+ yoshda past formadagi inson o'yinchi CHEKSIZ
    // yuqori qolib ketardi. Endi xuddi shu chegara (o'rtacha reyting
    // <= 7.5) bilan, subStats/mainStats/overall biroz pasayadi.
    const recentRatings = career.matchRatings || [];
    const recentAvgRating = recentRatings.length
      ? recentRatings.reduce((a, b) => a + b, 0) / recentRatings.length
      : 6.0;
    const progression = resolveVeteranProgression(age, recentAvgRating);
    if (progression.regressing) {
      const isGk = player.position === 'GK';
      const decline = 1 + Math.random(); // 1.0-2.0 stat point, har yili
      const newSubStats = {};
      Object.keys(subStats || {}).forEach((k) => { newSubStats[k] = clampStat(subStats[k] - decline); });
      subStats = newSubStats;
      mainStats = isGk ? subStats : calcMainStats(subStats);
      overall = isGk ? calcGoalkeeperOVR(subStats) : calcOVR(player.position, mainStats);
      messages = [...messages, {
        id: newId('msg'), type: 'club', date: newDate, from: player.club.name,
        subject: 'Age is catching up',
        body: `At ${age}, your recent form hasn't been enough to hold back time - your attributes have declined slightly this year.`,
        read: false, resolved: true
      }];
    }

    // 8-BAND: MAJBURIY PENSIYA. 35 yoshdan boshlab har tug'ilgan kunda
    // pensiyaga chiqish ehtimoli tashlanadi (getRetirementChance - 45
    // yoshda 100%, kafolatlangan). Chiqsa: karyera "retired" deb
    // belgilanadi, joriy pul (career.money) MEROS sifatida saqlanadi -
    // keyingi karyera (o'g'il, "<Familiya> Jr.") shu pul bilan boshlanadi
    // (RetirementPage/StartPage orqali). Pensiyaga chiqgandan keyin bu
    // funksiya boshqa hech narsa qilmaydi - o'yin/mashg'ulot/kubok
    // davom etmaydi, faqat pensiya xabari va meros saqlanadi.
    const retireChance = getRetirementChance(age);
    if (retireChance > 0 && Math.random() < retireChance) {
      const retiredCareer = {
        ...career,
        retired: true,
        retirementLegacy: { money: career.money || 0, surname: player.surname, retiredAge: age },
        messages: [...messages, {
          id: newId('msg'), type: 'club', date: newDate, from: player.club.name,
          subject: 'Retirement',
          body: `At ${age}, you've decided to retire from professional football. Thank you for an incredible career.`,
          read: false, resolved: true
        }],
      };
      return {
        nextPlayer: { ...player, age, overall, mainStats, subStats, career: retiredCareer },
        matchInfo: null,
      };
    }
  }

  // Free agents don't have a club schedule to advance through - just wait
  // for offers (generated below) instead of simulating any matches.
  if (career.freeAgent) {
    if (Math.random() < 0.18) {
      const offer = maybeGenerateFreeAgentOffer(player, newDate);
      if (offer) messages = [...messages, offer];
    }
    return {
      nextPlayer: { ...player, age, overall, mainStats, subStats, career: { ...career, messages } },
      matchInfo: null
    };
  }

  // Contract talks / expiry - checked before anything else, since an
  // expiring deal should be visible well before matchday logic below.
  ({ career, messages } = checkContractStatus(player, career, newDay, messages));
  if (career.freeAgent) {
    // Just went free THIS tick - no more club-specific logic applies today.
    return { nextPlayer: { ...player, age, overall, mainStats, subStats, career }, matchInfo: null };
  }

  // 3-BOSQICH: kecha yuborilgan kontrakt kontr-taklifiga (negotiate) klub
  // javobini shu yerda, kuniga bir marta ishlab chiqamiz - bu ishlov
  // o'yin kuni bo'ladimi yoki tinch kunmi, baribir ishlaydi.
  ({ career, messages } = resolveContractNegotiations(player, career, newDate, messages));

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
      const { pStats, opponent, isHome, golA, golB, homeScorers, awayScorers, homeCards, awayCards } = playerPatch;
      matchInfo = {
        opponentName: opponent.name,
        opponentLogo: opponent.logo,
        isHome,
        golFor: isHome ? golA : golB,
        golAgainst: isHome ? golB : golA,
        pStats: pStats || { played: false },
        // 2-BOSQICH: "kim gol urdi / kim assist qildi / kim kartochka
        // oldi" endi to'liq - forScorers/againstScorers har biri
        // {id,name,assistName}, forCards/againstCards {id,name,type}.
        forScorers: isHome ? homeScorers : awayScorers,
        againstScorers: isHome ? awayScorers : homeScorers,
        forCards: isHome ? homeCards : awayCards,
        againstCards: isHome ? awayCards : homeCards,
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
        pStats: outcome.pStats || { played: false },
        forScorers: outcome.forScorers,
        againstScorers: outcome.againstScorers,
        forCards: outcome.forCards,
        againstCards: outcome.againstCards,
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
      // 3-BOSQICH: haqiqiy (aniq pul bilan) transfer taklifi endi faqat
      // "juda yaxshi o'ynalgan kun"ga bog'liq emas - tinch kunlarda ham,
      // kamdan-kam, OVR asosida (kuchli o'yinchiga ko'proq) kelishi mumkin.
      if (league && !player.career.freeAgent) {
        const quietChance = 0.02 + clamp((player.overall - 65) / 400, 0, 0.05);
        if (Math.random() < quietChance) {
          const offer = maybeGenerateTransferOffer(player, league, newDate);
          if (offer) messages = [...messages, offer];
        }
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
    overall,
    mainStats,
    subStats,
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

// Contracts run for a FIXED length (3-8 years, bigger/more ambitious clubs
// offer longer deals) - not indefinitely, and not something you can just
// keep asking to raise forever. Somewhere around 2-3 months before it
// expires the club will want to talk about a new one.
// 3-BOSQICH: oldingi versiyada katta (prestijli) liga klublari uchun bu
// deyarli har doim 8 yilga "yopishib qolardi" (tor oraliq + qattiq
// tavan tufayli). Endi markazga nisbatan kengroq, tekisroq tarqaladi va
// eng uzun muddat 6 yilga tushirildi - 8 yillik shartnoma haqiqiy
// futbolda ham kamdan-kam uchraydi.
export function rollContractLength(leagueId) {
  const prestige = LEAGUE_PRESTIGE[leagueId] || 0.55; // taxminan 0..1
  const center = 2.2 + prestige * 2.3; // ~2.2 (kichik liga) dan ~4.5 (top liga) gacha
  const roll = center + (Math.random() - 0.5) * 3.6; // +-1.8 yil atrofida tarqalish
  return clamp(Math.round(roll), 1, 6);
}

export function computeContractOffer(player) {
  const ratings = player.career.matchRatings;
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 6;
  const perfMult = 0.9 + Math.max(0, avgRating - 6) * 0.25;
  const growthMult = 1 + Math.max(0, player.overall - player.firstRating) / 60;
  const newWage = Math.round((player.career.weeklyWage || 200) * perfMult * growthMult * (1 + Math.random() * 0.2));
  return { wage: Math.max(newWage, player.career.weeklyWage || 200), years: rollContractLength(player.club.leagueId) };
}

// 3-BOSQICH: haqiqiy "negotiate" (kontr-taklif) mexanizmi.
// O'yinchi MessagesPage'da "Negotiate" tugmasini bosib o'z summasi va
// muddatini yuboradi (buning o'zi zudlik bilan, kun kutmasdan sodir
// bo'ladi - shu yerda faqat KLUBNING javobi hisoblanadi, u esa 1 kun
// o'tgach keladi):
//   - agar so'ralgan summa klub taklifidan ko'pi bilan ~12% ko'p bo'lsa ->
//     klub roziligini beradi, aynan shu shartlarda shartnoma imzolanadi.
//   - ~45% gacha ko'p bo'lsa (va muzokara aylanasi tugamagan bo'lsa) ->
//     klub o'rtacha summa bilan QARSHI TAKLIF yuboradi (yana Accept/
//     Negotiate/Decline chiqadi) - jami 3 martagacha aylana bo'lishi mumkin.
//   - undan ham ko'p bo'lsa (yoki aylanalar tugasa-yu hali ko'p bo'lsa) ->
//     klub xafa bo'ladi: muzokara yopiladi, juda ochko'zlik qilingan bo'lsa
//     (>60% ortiqcha) esa futbolchi TO'G'RIDAN-TO'G'RI ERKIN AGENT bo'lib
//     qoladi - xato/ochko'z taklif haqiqatan ham xavfli bo'lishi kerak.
function resolveContractNegotiations(player, career, newDate, messages) {
  let nextCareer = career;
  let nextMessages = messages;
  let releasedNow = false;

  nextMessages = nextMessages.map((m) => {
    if (releasedNow) return m;
    if (m.type !== 'contract' || m.resolved || !m.negotiation?.counterOffer) return m;
    if (m.negotiation.awaitingClubSince >= newDate) return m; // hali 1 kun to'lmagan

    const clubWage = m.offer.wage;
    const askWage = m.negotiation.counterOffer.wage;
    const askYears = clamp(Math.round(m.negotiation.counterOffer.years || m.offer.years || 3), 1, 6);
    const ratio = askWage / Math.max(1, clubWage);
    const round = m.negotiation.round || 0;

    if (ratio <= 1.12) {
      nextCareer = {
        ...nextCareer,
        weeklyWage: askWage,
        contract: { yearsTotal: askYears, signedDay: player.career.day + 1 },
        contractTalksOpened: false,
        contractFailedNegotiations: 0
      };
      return {
        ...m, resolved: true, read: false, outcome: 'accepted',
        subject: 'Contract agreed!',
        body: `${m.from} accepted your terms: $${askWage.toLocaleString()}/week over ${askYears} years.`
      };
    }

    if (ratio <= 1.45 && round < 2) {
      const counterWage = Math.round(clubWage * 0.55 + askWage * 0.45);
      return {
        ...m,
        read: false,
        offer: { wage: counterWage, years: askYears },
        negotiation: { round: round + 1, counterOffer: null, awaitingClubSince: null },
        subject: 'Counter-offer',
        body: `${m.from} came back with a new offer: $${counterWage.toLocaleString()}/week over ${askYears} years. Accept, negotiate again, or walk away.`
      };
    }

    // Juda ochko'z taklif - klub sabrini yo'qotadi.
    const tooGreedy = ratio > 1.6;
    if (tooGreedy) releasedNow = true;
    return {
      ...m, resolved: true, read: false, outcome: 'declined',
      subject: tooGreedy ? 'Talks collapsed - released' : 'Talks broke down',
      body: tooGreedy
        ? `${m.from} felt your $${askWage.toLocaleString()}/week demand was unrealistic and ended talks completely - you've been released and are now a free agent.`
        : `${m.from} weren't willing to meet your $${askWage.toLocaleString()}/week demand. Talks are off for now.`
    };
  });

  if (releasedNow) {
    nextCareer = { ...nextCareer, freeAgent: true, contract: null };
  }

  return { career: nextCareer, messages: nextMessages };
}

const CONTRACT_TALKS_WINDOW_DAYS = 75; // start negotiating ~2.5 months out

// Checks whether it's time to open contract talks or the deal has run out
// entirely - called once per day from prepareNextDay.
function checkContractStatus(player, career, newDay, messages) {
  if (!career.contract || career.freeAgent) return { career, messages };
  const daysLeft = (career.contract.signedDay + career.contract.yearsTotal * 365) - newDay;

  if (daysLeft <= 0) {
    // Contract ran out with no renewal - free agency.
    return {
      career: { ...career, freeAgent: true, contract: null },
      messages: [...messages, {
        id: newId('msg'), type: 'club', date: career.gameDate, from: player.club.name,
        subject: 'Contract expired',
        body: `Your contract with ${player.club.name} has run out and wasn't renewed in time - you're now a free agent. Offers from other clubs should start coming in.`,
        read: false, resolved: true
      }]
    };
  }

  if (daysLeft <= CONTRACT_TALKS_WINDOW_DAYS && !career.contractTalksOpened) {
    const offer = computeContractOffer(player);
    return {
      career: { ...career, contractTalksOpened: true },
      messages: [...messages, {
        id: newId('msg'), type: 'contract', date: career.gameDate, from: player.club.name,
        subject: 'Contract renewal talks',
        body: `Your deal with ${player.club.name} runs out in a few months. They're offering a new ${offer.years}-year contract at $${offer.wage.toLocaleString()}/week - accept, negotiate, or wait for something else before time runs out.`,
        read: false, resolved: false,
        offer,
        negotiation: { round: 0, counterOffer: null, awaitingClubSince: null }
      }]
    };
  }

  return { career, messages };
}

// Free agents get the occasional club offer (from anywhere) until they sign
// with someone - the equivalent of "waiting by the phone".
function maybeGenerateFreeAgentOffer(player, gameDate) {
  if (Math.random() > 0.18) return null;
  const candidates = INITIAL_TEAMS.filter((t) => t.id !== player.club?.id);
  if (!candidates.length) return null;
  const team = pick(candidates);
  const league = LEAGUES.find((l) => l.teamIds.includes(team.id));
  if (!league) return null;
  const wage = Math.max(120, Math.round((player.career.weeklyWage || 250) * (0.7 + Math.random() * 0.5)));
  const years = rollContractLength(league.id);
  return {
    id: newId('msg'), type: 'transfer', date: gameDate, from: team.name,
    subject: `Contract offer from ${team.name}`,
    body: `${team.name} want to sign you as a free agent: a ${years}-year deal at $${wage.toLocaleString()}/week.`,
    read: false, resolved: false,
    offer: { teamId: team.id, leagueId: league.id, wage, years, freeAgentSigning: true }
  };
}

// Generic: turns a raw standings object ({ teamId: {played,win,draw,loss,gf,ga,pts} })
// into a sorted, display-ready table. Works for BOTH the player's own
// client-side standings AND a shared-world standings object fetched from the
// server (used by the "browse any league" screen), since the shape is the
// same either way.
export function computeStandingsTable(standings) {
  return Object.values(standings || {})
    .map((row) => {
      const team = INITIAL_TEAMS.find((t) => t.id === row.teamId);
      return { ...row, name: team?.name || row.teamId, logo: team?.logo || '⚽', gd: row.gf - row.ga };
    })
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
}

export function getLeagueTable(player) {
  const standings = player?.career?.standings || {};
  return computeStandingsTable(standings);
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
  const { golFor, golAgainst, pStats, forScorers, againstScorers, forCards, againstCards } = matchInfo;
  const events = [];

  const usedMinutes = new Set();
  const rollMinute = () => {
    let m = randInt(1, 90);
    while (usedMinutes.has(m)) m = randInt(1, 90);
    usedMinutes.add(m);
    return m;
  };

  for (let i = 0; i < golFor; i += 1) events.push({ minute: rollMinute(), side: 'for', kind: 'goal' });
  for (let i = 0; i < golAgainst; i += 1) events.push({ minute: rollMinute(), side: 'against', kind: 'goal' });

  // 2-BOSQICH: sariq/qizil kartochkalar ham endi voqealar chizig'ida -
  // har biriga alohida (gollardan farqli) daqiqa beriladi.
  (forCards || []).forEach((c) => events.push({ minute: rollMinute(), side: 'for', kind: 'card', card: c }));
  (againstCards || []).forEach((c) => events.push({ minute: rollMinute(), side: 'against', kind: 'card', card: c }));

  events.sort((a, b) => a.minute - b.minute);

  // Tag which of "our" goals are the player's own, and (separately) which
  // are assisted by the player - both counts come straight from pStats, so
  // they always add up to what the post-match summary shows. The
  // REMAINING "for" goals get a real NPC scorer name (+ assist, if any)
  // from forScorers - and every "against" goal gets a real NPC scorer name
  // from the opponent's squad (againstScorers) - so nothing is anonymous
  // anymore.
  const forEvents = events.filter((e) => e.kind === 'goal' && e.side === 'for');
  const againstEvents = events.filter((e) => e.kind === 'goal' && e.side === 'against');
  const npcForScorers = [...(forScorers || [])];

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

  // Player golisiz/assistsiz qolgan har bir "for" voqeaga navbat bilan bitta
  // haqiqiy NPC to'purchi (va bo'lsa, uning assistchisi) biriktiriladi.
  forEvents.forEach((e) => {
    if (e.isPlayerGoal || e.isPlayerAssist) return;
    const npc = npcForScorers.shift();
    if (npc) { e.scorerName = npc.name; e.assistName = npc.assistName; }
  });

  // Raqib gollarining barchasi NPC - to'g'ridan-to'g'ri biriktiramiz.
  const npcAgainstScorers = [...(againstScorers || [])];
  againstEvents.forEach((e) => {
    const npc = npcAgainstScorers.shift();
    if (npc) { e.scorerName = npc.name; e.assistName = npc.assistName; }
  });

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

  // 6-BOSQICH: transfer bozori tikeri (klublar orasidagi NPC transferlari)
  // ham endi yangiliklar oqimida ko'rinadi - avval bu faqat orqa fonda
  // hisoblanardi, hech qayerda ko'rsatilmasdi.
  (player.career.transferLog || []).slice(-15).forEach((t) => {
    items.push({
      id: `news_transfer_${t.id}`, date: t.date, icon: '💸',
      headline: 'Transfer done deal',
      body: `${t.playerName} (${t.playerPos}, OVR ${t.ovr}) moves from ${t.fromClub} to ${t.toClub} for $${(t.fee || 0).toLocaleString()}.`
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
