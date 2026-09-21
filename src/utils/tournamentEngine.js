import {
  calculatePreMatchChances,
  resolveAttackOutcome,
  resolveRegularShot,
  getKeeperSavePower,
  checkRandomMatchEvent,
  getPosCategory,
} from './engine';
import { pickAutoFormation, selectBestXI, getMatchupModifier } from './formations';
// 3-BAND: bu yerdagi rand() ham rand()ga o'tkazildi - shootout va
// tezkor simulyatsiya endi LiveMatch bilan BIR XIL seedlanadigan generatorga
// tayanadi (seed berilmasa avvalgidek haqiqiy tasodifiy).
import { rand } from './rng';

// Bitta o'yin uchun HAR bir maydonga chiqqan o'yinchining (zahiradan chiqqanlar
// ham) taxminiy bali — real jonli o'yindagi Sofascore uslubidagi tizimning
// soddalashtirilgan, tezkor simulyatsiyaga mos versiyasi.
function computeMatchRatings(players, teamKey, events, goalsFor, goalsAgainst, cards) {
  const ratings = {};
  const isWinner = goalsFor > goalsAgainst;
  const isDraw = goalsFor === goalsAgainst;
  const cleanSheet = goalsAgainst === 0;

  players.forEach((p) => {
    let r = 6.5 + ((p.ovr || 75) - 75) / 50;
    r += (rand() - 0.5) * 0.5;
    if (isWinner) r += 0.2;
    else if (!isDraw) r -= 0.15;
    if (cleanSheet && ['GK', 'CB', 'LB', 'RB', 'CDM'].includes(p.pos)) r += 0.2;
    ratings[p.id] = { name: p.name, pos: p.pos, rating: r };
  });

  events.forEach((ev) => {
    if (ev.teamKey !== teamKey) return;
    if (ev.scorerId && ratings[ev.scorerId]) ratings[ev.scorerId].rating += 0.5;
    if (ev.assisterId && ratings[ev.assisterId]) ratings[ev.assisterId].rating += 0.3;
  });

  Object.entries(cards).forEach(([pid, type]) => {
    if (!ratings[pid]) return;
    ratings[pid].rating += type === 'red' ? -1.0 : -0.25;
  });

  Object.values(ratings).forEach((r) => { r.rating = Math.max(4.0, Math.min(9.5, Math.round(r.rating * 10) / 10)); });
  return ratings;
}

// ============================================================
// TEZKOR (UI'siz) O'YIN SIMULYATSIYASI — turnir o'yinlarini
// daqiqama-daqiqa "jonli" ko'rsatmasdan, lekin AYNAN o'sha statistik
// dvijoklardan (darvozabon, taktika, marker, almashtirish, kartochka va h.k.)
// foydalanib, bir zumda yakuniy hisobni va HAR bir o'yingan o'yinchining
// (zahiradan chiqqanlar ham) shu o'yindagi balini chiqaradi.
// ============================================================
export function simulateMatchInstant(teamA, teamB) {
  const fullSquadA = teamA.squad.map((p) => ({ ...p, stamina: 100 }));
  const fullSquadB = teamB.squad.map((p) => ({ ...p, stamina: 100 }));

  const ovrA = fullSquadA.reduce((s, p) => s + (p.ovr || 75), 0) / fullSquadA.length;
  const ovrB = fullSquadB.reduce((s, p) => s + (p.ovr || 75), 0) / fullSquadB.length;

  let formA = pickAutoFormation(fullSquadA, null, ovrA - ovrB);
  let formB = pickAutoFormation(fullSquadB, formA, ovrB - ovrA);

  let { startingXI: playersA, bench: benchA } = selectBestXI(fullSquadA, formA);
  let { startingXI: playersB, bench: benchB } = selectBestXI(fullSquadB, formB);

  const score = { a: 0, b: 0 };
  const events = []; // { minute, teamKey, scorerId, scorerName, assisterId, assisterName, type }
  const cardsA = {}; // playerId -> 'yellow' | 'red'
  const cardsB = {};
  const appearedA = new Map(); // playerId -> player obyekti (shu o'yinda maydonga chiqqanlar)
  const appearedB = new Map();
  playersA.forEach((p) => appearedA.set(p.id, p));
  playersB.forEach((p) => appearedB.set(p.id, p));

  let yellowCards = [];
  let redA = 0, redB = 0, subsA = 0, subsB = 0;

  const addedTime = Math.floor(rand() * 6) + 1;
  const matchEnd = 90 + addedTime;

  const logGoal = (minute, teamKey, o) => {
    events.push({
      minute,
      teamKey,
      scorerId: o.scorer?.id, scorerName: o.scorer?.name,
      assisterId: o.assister?.id, assisterName: o.assister?.name,
      type: o.result,
    });
  };

  for (let minute = 1; minute <= matchEnd; minute++) {
    playersA = playersA.map((p) => ({ ...p, stamina: Math.max(30, (p.stamina || 100) - (rand() * 0.4 + 0.4)) }));
    playersB = playersB.map((p) => ({ ...p, stamina: Math.max(30, (p.stamina || 100) - (rand() * 0.4 + 0.4)) }));

    const matchupA = getMatchupModifier(formA, formB);
    const matchupB = getMatchupModifier(formB, formA);

    const freshChances = calculatePreMatchChances(teamA, playersA, teamB, playersB, redA, redB);
    let chanceA = (freshChances.winA / 90) * 2.5;
    let chanceB = (freshChances.winB / 90) * 2.5;
    let regChanceA = (freshChances.winA / 90) * 15;
    let regChanceB = (freshChances.winB / 90) * 15;

    const formRatioA = (formA.attack * matchupA.attackMod) / (formB.defense * matchupB.defenseMod);
    const formRatioB = (formB.attack * matchupB.attackMod) / (formA.defense * matchupA.defenseMod);
    chanceA *= formRatioA; chanceB *= formRatioB;
    regChanceA *= formRatioA; regChanceB *= formRatioB;

    const roll = rand() * 100;
    if (roll < chanceA) {
      const o = resolveAttackOutcome(playersA, playersB);
      if (o && (o.result === 'GOAL' || o.result === 'PENALTY_GOAL')) { score.a++; logGoal(minute, 'a', o); }
      if (o && o.result === 'OWN_GOAL') { score.a++; }
    } else if (roll > 100 - chanceB) {
      const o = resolveAttackOutcome(playersB, playersA);
      if (o && (o.result === 'GOAL' || o.result === 'PENALTY_GOAL')) { score.b++; logGoal(minute, 'b', o); }
      if (o && o.result === 'OWN_GOAL') { score.b++; }
    }
    if (rand() * 100 < regChanceA) {
      const o = resolveRegularShot(playersA, playersB);
      if (o && o.result === 'GOAL') { score.a++; logGoal(minute, 'a', o); }
    }
    if (rand() * 100 < regChanceB) {
      const o = resolveRegularShot(playersB, playersA);
      if (o && o.result === 'GOAL') { score.b++; logGoal(minute, 'b', o); }
    }

    // Kartochka / Almashtirish (ikkala jamoa uchun) — zahiradagilar ham shu orqali maydonga chiqadi
    const evA = checkRandomMatchEvent(teamA, playersA, benchA, yellowCards, redA, minute, subsA, score.a - score.b, false, playersB);
    if (evA) {
      if (evA.type === 'YELLOW') { yellowCards.push(evA.player.id); cardsA[evA.player.id] = 'yellow'; }
      else if (evA.type.includes('RED')) {
        playersA = playersA.filter((p) => p.id !== evA.player.id);
        cardsA[evA.player.id] = 'red'; redA++;
      } else if (evA.type === 'SUBSTITUTION') {
        playersA = [...playersA.filter((p) => p.id !== evA.playerOut.id), evA.playerIn];
        benchA = benchA.filter((p) => p.id !== evA.playerIn.id);
        appearedA.set(evA.playerIn.id, evA.playerIn);
        subsA++;
      }
    }
    const evB = checkRandomMatchEvent(teamB, playersB, benchB, yellowCards, redB, minute, subsB, score.b - score.a, false, playersA);
    if (evB) {
      if (evB.type === 'YELLOW') { yellowCards.push(evB.player.id); cardsB[evB.player.id] = 'yellow'; }
      else if (evB.type.includes('RED')) {
        playersB = playersB.filter((p) => p.id !== evB.player.id);
        cardsB[evB.player.id] = 'red'; redB++;
      } else if (evB.type === 'SUBSTITUTION') {
        playersB = [...playersB.filter((p) => p.id !== evB.playerOut.id), evB.playerIn];
        benchB = benchB.filter((p) => p.id !== evB.playerIn.id);
        appearedB.set(evB.playerIn.id, evB.playerIn);
        subsB++;
      }
    }
  }

  events.sort((a, b) => a.minute - b.minute);

  const ratingsA = computeMatchRatings([...appearedA.values()], 'a', events, score.a, score.b, cardsA);
  const ratingsB = computeMatchRatings([...appearedB.values()], 'b', events, score.b, score.a, cardsB);

  return {
    scoreA: score.a, scoreB: score.b, events,
    cardsA, cardsB,
    ratingsA, ratingsB, // { playerId: { name, pos, rating } }
  };
}

// Penalti seriyasi — TAFSILOTLI versiya (3-band). Avvalgi
// `simulatePenaltyShootout` faqat yakuniy hisobni (penA/penB) qaytarardi va
// hisoblash butunlay FONDA, foydalanuvchiga ko'rinmasdan bajarilardi. Bu
// funksiya har bir zarbani ({side, round, kicker, scored}) alohida
// qaytaradi, shunda LiveMatch ularni birma-bir animatsiya qilib ko'rsata
// oladi - foydalanuvchi kim zarba qilayotganini va gol/otkazib
// yuborganini jonli ko'radi, jadvalga yozilgan yakuniy hisob bilan bir xil
// bo'lib qoladi (chunki ANA SHU natija jadvalga yoziladi, ikkinchi marta
// qaytadan hisoblanmaydi).
export function simulatePenaltyShootoutDetailed(teamA, teamB) {
  const keeperA = teamA.squad.find((p) => p.pos === 'GK');
  const keeperB = teamB.squad.find((p) => p.pos === 'GK');
  const savePowerA = getKeeperSavePower(keeperA);
  const savePowerB = getKeeperSavePower(keeperB);
  const kickerScoreChance = (opponentSavePower) => Math.max(0.62, Math.min(0.88, 0.82 - (opponentSavePower - 75) / 300));

  // Eng yaxshi (OVR bo'yicha) 5 nafar dala o'yinchisi zarba qiladi;
  // shundan ko'p kerak bo'lsa (oltin penalti), ro'yxat aylanib davom etadi.
  const kickersFor = (team) => {
    const outfield = team.squad.filter((p) => p.pos !== 'GK').sort((a, b) => (b.ovr || 0) - (a.ovr || 0));
    return outfield.length ? outfield : team.squad;
  };
  const kickersA = kickersFor(teamA);
  const kickersB = kickersFor(teamB);
  const nextKicker = (list, idx) => list[idx % list.length];

  const kicks = [];
  let a = 0, b = 0, idx = 0;

  const takeKick = (side) => {
    const kicker = side === 'a' ? nextKicker(kickersA, idx) : nextKicker(kickersB, idx);
    const chance = side === 'a' ? kickerScoreChance(savePowerB) : kickerScoreChance(savePowerA);
    const scored = rand() < chance;
    if (scored) { if (side === 'a') a += 1; else b += 1; }
    kicks.push({ side, round: kicks.filter((k) => k.side === side).length + 1, kicker: { id: kicker?.id, name: kicker?.name }, scored });
    return scored;
  };

  for (let round = 1; round <= 5; round += 1) {
    takeKick('a');
    takeKick('b');
    idx += 1;
  }
  // Durang bo'lsa — "oltin penalti": kim birinchi xato qilmasa g'olib.
  while (a === b) {
    takeKick('a');
    takeKick('b');
    idx += 1;
  }
  return { penA: a, penB: b, winner: a > b ? 'a' : 'b', kicks };
}

// Eski (faqat yakuniy hisob) interfeys - resolveTie va boshqa mavjud
// chaqiruvchilar hech narsani o'zgartirmasdan ishlatishda davom etadi.
export function simulatePenaltyShootout(teamA, teamB) {
  const { penA, penB, winner } = simulatePenaltyShootoutDetailed(teamA, teamB);
  return { penA, penB, winner };
}

// ============================================================
// LIGA (ROUND ROBIN) FIKSTURALARI — "circle method"
// ============================================================
export function generateRoundRobinFixtures(teamIds, isDouble) {
  const teams = [...teamIds];
  if (teams.length % 2 !== 0) teams.push(null); // toq bo'lsa — "dam olish"
  const n = teams.length;
  const rounds = [];

  const arr = [...teams];
  for (let r = 0; r < n - 1; r++) {
    const roundFixtures = [];
    for (let i = 0; i < n / 2; i++) {
      const home = arr[i];
      const away = arr[n - 1 - i];
      if (home !== null && away !== null) {
        roundFixtures.push(r % 2 === 0 ? { home, away } : { home: away, away: home });
      }
    }
    rounds.push(roundFixtures);
    arr.splice(1, 0, arr.pop());
  }

  if (isDouble) {
    const secondLeg = rounds.map((round) => round.map((f) => ({ home: f.away, away: f.home })));
    return [...rounds, ...secondLeg];
  }
  return rounds;
}

// ============================================================
// TURNIR JADVALI (STANDINGS) HISOBLASH
// ============================================================
export function computeStandings(teamIds, results) {
  const table = {};
  teamIds.forEach((id) => { table[id] = { id, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 }; });

  results.forEach((r) => {
    if (r.scoreHome == null || r.scoreAway == null) return;
    const h = table[r.home];
    const a = table[r.away];
    if (!h || !a) return;
    h.played++; a.played++;
    h.gf += r.scoreHome; h.ga += r.scoreAway;
    a.gf += r.scoreAway; a.ga += r.scoreHome;
    if (r.scoreHome > r.scoreAway) { h.won++; h.points += 3; a.lost++; }
    else if (r.scoreHome < r.scoreAway) { a.won++; a.points += 3; h.lost++; }
    else { h.draw++; a.draw++; h.points++; a.points++; }
  });

  Object.values(table).forEach((t) => { t.gd = t.gf - t.ga; });
  return Object.values(table).sort((x, y) => y.points - x.points || y.gd - x.gd || y.gf - x.gf);
}

// ============================================================
// PLEY-OFF (KNOCKOUT) DARAXTI
// ============================================================
// Bitta bosqichdagi juftliklarni yaratadi (masalan 8 jamoadan 4 ta juftlik)
export function pairUpForKnockout(teamIds) {
  const shuffled = [...teamIds];
  const pairs = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    pairs.push({ home: shuffled[i], away: shuffled[i + 1] ?? null });
  }
  return pairs;
}

// Ikki turli (leg) natijalarni yig'indi hisobi bo'yicha, yoki bitta o'yin natijasi
// bo'yicha g'olibni aniqlaydi. Durang bo'lsa (va bu final bo'lmasa yoki ikkalasi
// ham durang bo'lsa) — penalti seriyasiga o'tadi.
//
// `precomputedShootout` (ixtiyoriy) — agar LiveMatch foydalanuvchiga penalti
// seriyasini JONLI ko'rsatib bergan bo'lsa (3-band), {penA, penB, winner}
// shu yerga uzatiladi va ANA SHU natija yozib qo'yiladi - resolveTie
// qaytadan (foydalanuvchi ko'rmagan, mos kelmaydigan) yangi seriya
// "o'ynamaydi". Berilmasa (masalan hali animatsiya qilinmagan eski
// chaqiruv joylari), avvalgidek o'zi hisoblab oladi - orqaga qarab to'liq
// moslashuvchan (backward compatible).
export function resolveTie(fixture, teamsById, precomputedShootout) {
  const { leg1, leg2 } = fixture;
  let aggA = leg1.scoreHome + (leg2 ? leg2.scoreAway : 0);
  let aggB = leg1.scoreAway + (leg2 ? leg2.scoreHome : 0);

  if (aggA === aggB) {
    const teamA = teamsById[fixture.home];
    const teamB = teamsById[fixture.away];
    const { winner, penA, penB } = precomputedShootout || simulatePenaltyShootout(teamA, teamB);
    return { winnerId: winner === 'a' ? fixture.home : fixture.away, aggA, aggB, penA, penB };
  }
  return { winnerId: aggA > aggB ? fixture.home : fixture.away, aggA, aggB, penA: null, penB: null };
}

// ============================================================
// CHAMPIONS LEAGUE (KLASSIK FORMAT) SOZLAMALARI — tayyor shablon
// ============================================================
export const CHAMPIONS_LEAGUE_PRESET = {
  format: 'champions_league',
  leaguePhaseGames: 6,
  clDirectSlots: 4,
  clPlayoffSlots: 8, // bular 4 ta juftlikka bolinadi, g'oliblari QF ga qo'shiladi
  knockoutTwoLegged: true,
  thirdPlacePlayoff: false,
};

export const FORMAT_INFO = {
  round_robin: { label: 'Liga (Round Robin)', minTeams: 4, maxTeams: 23 },
  knockout: { label: 'Pley-off (Knockout)', minTeams: 4, maxTeams: 16 },
  group_knockout: { label: 'Guruh bosqichi + Pley-off', minTeams: 8, maxTeams: 23 },
  champions_league: { label: 'Champions League formati (16 jamoa: Liga fazasi + Pley-off)', minTeams: 16, maxTeams: 16 },
};

// ============================================================
// TURNIRNI BOSHLASH — konfiguratsiyadan boshlang'ich holatni quradi
// ============================================================
export function initializeTournament(config) {
  const base = {
    id: `t_${Date.now()}_${Math.floor(rand() * 10000)}`,
    createdAt: Date.now(),
    name: config.name,
    format: config.format,
    isDouble: !!config.isDouble,
    thirdPlacePlayoff: !!config.thirdPlacePlayoff,
    knockoutTwoLegged: !!config.knockoutTwoLegged,
    groupsCount: config.groupsCount || null,
    teamsPerGroup: config.teamsPerGroup || null,
    advancePerGroup: config.advancePerGroup || null,
    groupDouble: !!config.groupDouble,
    teamIds: config.teamIds,
    status: 'in_progress',
    champion: null,
  };

  if (config.format === 'round_robin') {
    const rounds = generateRoundRobinFixtures(config.teamIds, config.isDouble);
    const fixtures = [];
    rounds.forEach((round, ri) => {
      round.forEach((f) => fixtures.push({ round: ri + 1, home: f.home, away: f.away, scoreHome: null, scoreAway: null }));
    });
    return { ...base, fixtures };
  }

  if (config.format === 'knockout') {
    const shuffled = [...config.teamIds].sort(() => rand() - 0.5);
    const pairs = pairUpForKnockout(shuffled);
    const round1 = pairs.map((p) => ({
      home: p.home, away: p.away, leg1: null, leg2: config.knockoutTwoLegged ? null : undefined, winnerId: null,
    }));
    return { ...base, bracket: { rounds: [round1] }, thirdPlaceMatch: null };
  }

  if (config.format === 'champions_league') {
    const teamIds = config.teamIds;
    const games = config.leaguePhaseGames || 6;
    const allRounds = generateRoundRobinFixtures(teamIds, false).slice(0, games);
    const fixtures = [];
    allRounds.forEach((round, ri) => {
      round.forEach((f) => fixtures.push({ round: ri + 1, home: f.home, away: f.away, scoreHome: null, scoreAway: null }));
    });
    return {
      ...base,
      clDirectSlots: config.clDirectSlots || 4,
      clPlayoffSlots: config.clPlayoffSlots || 8,
      clPhase: 'league',
      leagueFixtures: fixtures,
      playoffBracket: null,
      clDirectQualifiers: null,
      bracket: null,
      thirdPlaceMatch: null,
    };
  }

  // group_knockout
  const shuffledTeams = [...config.teamIds].sort(() => rand() - 0.5);
  const groups = [];
  for (let g = 0; g < config.groupsCount; g++) {
    const groupTeamIds = shuffledTeams.slice(g * config.teamsPerGroup, (g + 1) * config.teamsPerGroup);
    const rounds = generateRoundRobinFixtures(groupTeamIds, config.groupDouble);
    const fixtures = [];
    rounds.forEach((round, ri) => {
      round.forEach((f) => fixtures.push({ round: ri + 1, home: f.home, away: f.away, scoreHome: null, scoreAway: null }));
    });
    groups.push({ name: String.fromCharCode(65 + g), teamIds: groupTeamIds, fixtures });
  }
  return { ...base, groups, phase: 'groups', bracket: null, thirdPlaceMatch: null };
}

// Bitta fikschurani (uy/mehmon) tezkor simulyatsiya qilib, natijasini va
// gol/assist voqealarini yozadi
function playFixture(fixture, teamsById) {
  const result = simulateMatchInstant(teamsById[fixture.home], teamsById[fixture.away]);
  fixture.scoreHome = result.scoreA;
  fixture.scoreAway = result.scoreB;
  fixture.events = result.events;
  fixture._ratingsHome = result.ratingsA;
  fixture._ratingsAway = result.ratingsB;
  fixture._cardsHome = result.cardsA;
  fixture._cardsAway = result.cardsB;
}

// Jonli (LiveMatch) o'ynalgan o'yin natijasini tournament.playerStats ga qo'shadi
export function registerLiveMatchStats(tournament, teamA, teamB, playerRatings, playerEventsMap) {
  tournament.playerStats = tournament.playerStats || {};
  const idsA = new Set(teamA.squad.map((p) => p.id));
  const findPlayer = (id) => teamA.squad.find((p) => p.id === id) || teamB.squad.find((p) => p.id === id);

  const ensure = (id) => {
    if (tournament.playerStats[id]) return tournament.playerStats[id];
    const p = findPlayer(id);
    const teamId = idsA.has(id) ? teamA.id : teamB.id;
    tournament.playerStats[id] = {
      id, name: p?.name || id, teamId, pos: p?.pos, goals: 0, assists: 0, yellow: 0, red: 0, ratingSum: 0, appearances: 0,
    };
    return tournament.playerStats[id];
  };

  Object.entries(playerRatings || {}).forEach(([id, rating]) => {
    const rec = ensure(id);
    rec.ratingSum += rating;
    rec.appearances += 1;
  });
  Object.entries(playerEventsMap || {}).forEach(([id, ev]) => {
    const rec = ensure(id);
    rec.goals += ev.goals || 0;
    rec.assists += ev.assists || 0;
    if (ev.yellow) rec.yellow += 1;
    if (ev.red) rec.red += 1;
  });
}

function registerMatchStats(tournament, homeTeamId, awayTeamId, events, ratingsHome, ratingsAway, cardsHome, cardsAway) {
  tournament.playerStats = tournament.playerStats || {};

  const ensure = (id, name, teamId, pos) => {
    tournament.playerStats[id] = tournament.playerStats[id] || {
      id, name, teamId, pos, goals: 0, assists: 0, yellow: 0, red: 0, ratingSum: 0, appearances: 0,
    };
    return tournament.playerStats[id];
  };

  (events || []).forEach((ev) => {
    const teamId = ev.teamKey === 'a' ? homeTeamId : awayTeamId;
    if (ev.scorerId) ensure(ev.scorerId, ev.scorerName, teamId).goals++;
    if (ev.assisterId) ensure(ev.assisterId, ev.assisterName, teamId).assists++;
  });

  const applyRatings = (ratings, teamId, cards) => {
    if (!ratings) return;
    Object.entries(ratings).forEach(([pid, info]) => {
      const rec = ensure(pid, info.name, teamId, info.pos);
      rec.pos = info.pos;
      rec.ratingSum += info.rating;
      rec.appearances += 1;
    });
    if (cards) {
      Object.entries(cards).forEach(([pid, type]) => {
        const rec = tournament.playerStats[pid];
        if (!rec) return;
        if (type === 'yellow') rec.yellow++;
        else rec.red++;
      });
    }
  };
  applyRatings(ratingsHome, homeTeamId, cardsHome);
  applyRatings(ratingsAway, awayTeamId, cardsAway);
}

function registerFixtureStats(tournament, fixture) {
  registerMatchStats(
    tournament, fixture.home, fixture.away, fixture.events,
    fixture._ratingsHome, fixture._ratingsAway, fixture._cardsHome, fixture._cardsAway
  );
}

// LIGA yoki GURUH — barcha o'ynalmagan fiksturalarni simulyatsiya qiladi
export function simulateAllFixtures(fixtures, teamsById, tournament) {
  fixtures.forEach((f) => {
    if (f.scoreHome == null) {
      playFixture(f, teamsById);
      if (tournament) registerFixtureStats(tournament, f);
    }
  });
}

// Faqat KEYINGI o'ynalmagan turni simulyatsiya qiladi (bosqichma-bosqich kuzatish uchun)
export function simulateNextRound(fixtures, teamsById, tournament) {
  const unplayedRounds = fixtures.filter((f) => f.scoreHome == null).map((f) => f.round);
  if (unplayedRounds.length === 0) return null;
  const nextRound = Math.min(...unplayedRounds);
  const roundFixtures = fixtures.filter((f) => f.round === nextRound && f.scoreHome == null);
  roundFixtures.forEach((f) => {
    playFixture(f, teamsById);
    if (tournament) registerFixtureStats(tournament, f);
  });
  return nextRound;
}

// Turnirning "Top bombardir / Top assist / Eng yaxshi o'yinchi (o'rtacha reyting
// bo'yicha)" sovrindorlarini hisoblaydi
export function getTournamentAwards(tournament) {
  const stats = Object.values(tournament.playerStats || {});
  if (stats.length === 0) return null;

  const withAvg = stats.map((s) => ({ ...s, avgRating: s.appearances > 0 ? s.ratingSum / s.appearances : 0 }));
  const maxApps = stats.reduce((m, x) => Math.max(m, x.appearances), 0);

  const topScorer = [...withAvg].sort((a, b) => b.goals - a.goals)[0];
  const topAssist = [...withAvg].sort((a, b) => b.assists - a.assists)[0];
  const eligible = withAvg.filter((s) => s.appearances >= Math.max(2, Math.min(3, maxApps)));
  const mvpPool = eligible.length > 0 ? eligible : withAvg;
  const mvp = [...mvpPool].sort((a, b) => b.avgRating - a.avgRating)[0];

  return {
    topScorer: topScorer && topScorer.goals > 0 ? topScorer : null,
    topAssist: topAssist && topAssist.assists > 0 ? topAssist : null,
    mvp: mvp && mvp.appearances > 0 ? mvp : null,
  };
}

// Turnir yakunida, o'rtacha reytinglar asosida "Turnirning eng yaxshi 11tasi"ni tuzadi
export function getTeamOfTournament(tournament) {
  const stats = Object.values(tournament.playerStats || {}).filter((s) => s.appearances > 0);
  if (stats.length < 11) return null;

  const withAvg = stats.map((s) => ({ ...s, avgRating: s.ratingSum / s.appearances }));
  const catOf = (pos) => {
    if (['ST', 'CF', 'SS', 'LW', 'RW'].includes(pos)) return 'FW';
    if (['CAM', 'CM', 'CDM', 'RM', 'LM'].includes(pos)) return 'MF';
    if (['CB', 'LB', 'RB'].includes(pos)) return 'DF';
    return 'GK';
  };
  const byCat = { GK: [], DF: [], MF: [], FW: [] };
  withAvg.forEach((s) => { byCat[catOf(s.pos)].push(s); });
  Object.values(byCat).forEach((arr) => arr.sort((a, b) => b.avgRating - a.avgRating));

  const need = { GK: 1, DF: 4, MF: 3, FW: 3 };
  const xi = [];
  ['GK', 'DF', 'MF', 'FW'].forEach((cat) => xi.push(...byCat[cat].slice(0, need[cat])));
  if (xi.length < 11) {
    const usedIds = new Set(xi.map((p) => p.id));
    const rest = withAvg.filter((p) => !usedIds.has(p.id)).sort((a, b) => b.avgRating - a.avgRating);
    xi.push(...rest.slice(0, 11 - xi.length));
  }
  return xi.slice(0, 11);
}

// GURUHLAR tugagach — har guruhdan belgilangan sondagi jamoani pley-offga chiqaradi
// CL LIGA FAZASI tugagach — top N to'g'ridan-to'g'ri QF ga, keyingi M jamoa
// pley-off (2 legli) o'ynab, g'oliblari QF ning qolgan joylarini to'ldiradi
export function advanceCLLeagueToPlayoff(tournament) {
  const standings = computeStandings(tournament.teamIds, tournament.leagueFixtures);
  const direct = standings.slice(0, tournament.clDirectSlots).map((s) => s.id);
  const playoffTeams = standings.slice(tournament.clDirectSlots, tournament.clDirectSlots + tournament.clPlayoffSlots).map((s) => s.id);

  const shuffled = [...playoffTeams].sort(() => rand() - 0.5);
  const pairs = pairUpForKnockout(shuffled);
  tournament.playoffBracket = pairs.map((p) => ({ home: p.home, away: p.away, leg1: null, leg2: null, winnerId: null }));
  tournament.clDirectQualifiers = direct;
  tournament.clPhase = 'playoff';
}

// Barcha CL pley-off juftliklari hal bo'lgan bo'lsa — QF (yakuniy pley-off
// daraxti)ni tuzadi va bosqichni "knockout"ga o'tkazadi. Bitta juftlik JONLI
// (LiveMatch) yoki bir zumda hal qilingandan so'ng ham chaqirilishi mumkin.
export function finalizeCLPlayoffIfComplete(tournament) {
  if (!tournament.playoffBracket.every((f) => f.winnerId)) return false;
  const playoffWinners = tournament.playoffBracket.map((f) => f.winnerId);
  const combined = [...tournament.clDirectQualifiers, ...playoffWinners];
  const shuffled = [...combined].sort(() => rand() - 0.5);
  const pairs = pairUpForKnockout(shuffled);
  tournament.bracket = {
    rounds: [pairs.map((p) => ({
      home: p.home, away: p.away, leg1: null, leg2: tournament.knockoutTwoLegged ? null : undefined, winnerId: null,
    }))],
  };
  tournament.clPhase = 'knockout';
  return true;
}

// CL PLEY-OFF bosqichi — barcha juftliklarni (har doim 2 legli) hal qiladi
export function simulateCLPlayoffRound(tournament, teamsById) {
  tournament.playoffBracket.forEach((fixture) => {
    if (fixture.winnerId) return;
    const teamHome = teamsById[fixture.home];
    const teamAway = teamsById[fixture.away];

    const leg1 = simulateMatchInstant(teamHome, teamAway);
    fixture.leg1 = { scoreHome: leg1.scoreA, scoreAway: leg1.scoreB, events: leg1.events };
    registerMatchStats(tournament, fixture.home, fixture.away, leg1.events, leg1.ratingsA, leg1.ratingsB, leg1.cardsA, leg1.cardsB);

    const leg2raw = simulateMatchInstant(teamAway, teamHome);
    fixture.leg2 = { scoreHome: leg2raw.scoreB, scoreAway: leg2raw.scoreA, events: leg2raw.events };
    registerMatchStats(tournament, fixture.away, fixture.home, leg2raw.events, leg2raw.ratingsA, leg2raw.ratingsB, leg2raw.cardsA, leg2raw.cardsB);

    const result = resolveTie(fixture, teamsById);
    fixture.winnerId = result.winnerId;
    fixture.aggA = result.aggA; fixture.aggB = result.aggB;
    fixture.penA = result.penA; fixture.penB = result.penB;
  });

  finalizeCLPlayoffIfComplete(tournament);
}

export function advanceGroupsToKnockout(tournament, teamsById) {
  const qualifiers = [];
  tournament.groups.forEach((g) => {
    const standings = computeStandings(g.teamIds, g.fixtures);
    qualifiers.push(...standings.slice(0, tournament.advancePerGroup).map((s) => s.id));
  });
  // Aralashtirib, guruhdoshlar birinchi bosqichda to'qnashmasligiga (iloji boricha) harakat qilamiz
  const shuffled = [...qualifiers].sort(() => rand() - 0.5);
  const pairs = pairUpForKnockout(shuffled);
  const round1 = pairs.map((p) => ({
    home: p.home, away: p.away, leg1: null, leg2: tournament.knockoutTwoLegged ? null : undefined, winnerId: null,
  }));
  tournament.bracket = { rounds: [round1] };
  tournament.phase = 'knockout';
}

// Joriy pley-off bosqichidagi bitta juftlik hal bo'lgandan so'ng (yoki barcha
// juftliklar allaqachon hal qilingan bo'lsa) — agar JORIY bosqichdagi BARCHA
// juftliklar g'olibga ega bo'lsa, chempionni belgilaydi / 3-o'rin o'yinini
// tayyorlaydi / keyingi bosqich juftliklarini tuzadi. Aks holda hech narsa
// qilmaydi (bosqich hali to'liq tugamagan). Buni ham "Darhol Yakunlash"
// (barcha juftliklarni birdan hal qilib bo'lgach), ham JONLI (bitta-bitta
// juftlikni LiveMatch orqali o'ynagach) rejimlar ishlata oladi.
export function finalizeKnockoutRoundIfComplete(tournament) {
  const rounds = tournament.bracket.rounds;
  const currentRound = rounds[rounds.length - 1];
  if (!currentRound.every((f) => f.winnerId)) return false;

  const isFinalRound = currentRound.length === 1;
  const losers = currentRound.filter((f) => f.away).map((f) => (f.winnerId === f.home ? f.away : f.home));

  if (isFinalRound) {
    tournament.champion = currentRound[0].winnerId;
    tournament.status = 'completed';
    // 3-o'rin o'yini (agar yoqilgan bo'lsa va hali o'ynalmagan bo'lsa)
    if (tournament.thirdPlacePlayoff && !tournament.thirdPlaceMatch && losers.length === 2) {
      tournament.thirdPlaceMatch = { home: losers[0], away: losers[1], leg1: null, winnerId: null };
    }
    return true;
  }

  // Yarim final bosqichi tugagandan so'ng — 3-o'rin o'yinini shu yerda tayyorlaymiz
  if (currentRound.length === 2 && tournament.thirdPlacePlayoff && !tournament.thirdPlaceMatch) {
    tournament.thirdPlaceMatch = { home: losers[0], away: losers[1], leg1: null, winnerId: null };
  }

  const winners = currentRound.map((f) => f.winnerId);
  const nextPairs = pairUpForKnockout(winners);
  const nextRound = nextPairs.map((p) => ({
    home: p.home, away: p.away, leg1: null, leg2: (tournament.knockoutTwoLegged && nextPairs.length > 1) ? null : undefined, winnerId: null,
  }));
  rounds.push(nextRound);
  return true;
}

// Bitta pley-off juftligini (bir yoki ikki legli) hal qiladi — leg(lar)ni
// simulyatsiya qilib, g'olibni aniqlaydi. `resolveTie`dan foydalanadi.
function resolveKnockoutFixture(tournament, teamsById, fixture, useTwoLegged) {
  const teamHome = teamsById[fixture.home];
  const teamAway = teamsById[fixture.away];

  const leg1 = simulateMatchInstant(teamHome, teamAway);
  fixture.leg1 = { scoreHome: leg1.scoreA, scoreAway: leg1.scoreB, events: leg1.events };
  registerMatchStats(tournament, fixture.home, fixture.away, leg1.events, leg1.ratingsA, leg1.ratingsB, leg1.cardsA, leg1.cardsB);

  if (useTwoLegged) {
    const leg2raw = simulateMatchInstant(teamAway, teamHome);
    // leg2: away jamoa endi "uy egasi" — natijani asl home/away ga qaytaramiz
    fixture.leg2 = { scoreHome: leg2raw.scoreB, scoreAway: leg2raw.scoreA, events: leg2raw.events };
    registerMatchStats(tournament, fixture.away, fixture.home, leg2raw.events, leg2raw.ratingsA, leg2raw.ratingsB, leg2raw.cardsA, leg2raw.cardsB);
  } else {
    fixture.leg2 = undefined;
  }

  const result = resolveTie(fixture, teamsById);
  fixture.winnerId = result.winnerId;
  fixture.aggA = result.aggA;
  fixture.aggB = result.aggB;
  fixture.penA = result.penA;
  fixture.penB = result.penB;
}

// Joriy pley-off bosqichidagi BARCHA juftliklarni bir zumda hal qiladi, so'ng
// bosqichni yakunlaydi (chempion / keyingi bosqich).
export function simulateKnockoutRound(tournament, teamsById) {
  const rounds = tournament.bracket.rounds;
  const currentRound = rounds[rounds.length - 1];
  const isFinalRound = currentRound.length === 1;
  const useTwoLegged = tournament.knockoutTwoLegged && !isFinalRound;

  currentRound.forEach((fixture) => {
    if (fixture.winnerId) return; // allaqachon hal qilingan
    if (!fixture.away) { fixture.winnerId = fixture.home; return; } // bye
    resolveKnockoutFixture(tournament, teamsById, fixture, useTwoLegged);
  });

  finalizeKnockoutRoundIfComplete(tournament);
}

// 3-o'rin o'yinini hal qiladi (har doim bitta o'yin)
export function simulateThirdPlaceMatch(tournament, teamsById) {
  const m = tournament.thirdPlaceMatch;
  if (!m || m.winnerId) return;
  const result = simulateMatchInstant(teamsById[m.home], teamsById[m.away]);
  m.leg1 = { scoreHome: result.scoreA, scoreAway: result.scoreB, events: result.events };
  registerMatchStats(tournament, m.home, m.away, result.events, result.ratingsA, result.ratingsB, result.cardsA, result.cardsB);
  if (result.scoreA === result.scoreB) {
    const { winner, penA, penB } = simulatePenaltyShootout(teamsById[m.home], teamsById[m.away]);
    m.winnerId = winner === 'a' ? m.home : m.away;
    m.penA = penA; m.penB = penB;
  } else {
    m.winnerId = result.scoreA > result.scoreB ? m.home : m.away;
  }
}
