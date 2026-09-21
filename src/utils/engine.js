// ============================================================
// POZITSIYA GURUHLARI VA KO'PAYTIRUVCHILAR
// ============================================================
// 3-BAND: barcha rand() chaqiruvlari `rand()` bilan almashtirildi -
// odatda bu haqiqiy rand() bilan bir xil ishlaydi, lekin
// rng.js:setSeed() chaqirilgandan keyin DETERMINISTIK bo'lib qoladi (bir
// xil seed = bir xil o'yin natijasi, qayta tomosha uchun kerak).
import { rand } from './rng';

// Gol urish ehtimoliga pozitsiya bo'yicha ko'paytiruvchi
const GOAL_POS_MULTIPLIER = {
  ST: 1.8, CF: 1.7, SS: 1.65, LW: 1.6, RW: 1.6,
  CAM: 1.3, RM: 1.1, LM: 1.1, CM: 0.9, CDM: 0.5,
  CB: 0.4, LB: 0.45, RB: 0.45, GK: 0.01
};

// Foul/kartochka olish ehtimoliga pozitsiya bo'yicha ko'paytiruvchi
const FOUL_POS_MULTIPLIER = {
  CB: 1.8, CDM: 1.6, LB: 1.4, RB: 1.4,
  CM: 1.1, CAM: 0.7, RM: 0.6, LM: 0.6,
  RW: 0.5, LW: 0.5, ST: 0.5, CF: 0.5, SS: 0.5, GK: 0.1
};

// Har bir pozitsiya qaysi "yo'lak"da o'ynaydi — raqib bilan to'g'ridan-to'g'ri
// duel/matchup (masalan RW vs LB) shu asosda aniqlanadi
const LANE = {
  LW: 'L', LM: 'L', LB: 'L',
  RW: 'R', RM: 'R', RB: 'R',
  ST: 'C', CF: 'C', SS: 'C', CAM: 'C', CM: 'C', CDM: 'C', CB: 'C', GK: 'C'
};

export const getPosCategory = (pos) => {
  if (['ST', 'CF', 'SS', 'LW', 'RW'].includes(pos)) return 'FW';
  if (['CAM', 'CM', 'CDM', 'RM', 'LM'].includes(pos)) return 'MF';
  if (['CB', 'LB', 'RB'].includes(pos)) return 'DF';
  if (pos === 'GK') return 'GK';
  return 'MF';
};

// ============================================================
// OVR HISOB-KITOBLARI
// ============================================================

// ICHKI (real, charchoq bilan pasayadigan) OVR — faqat hisob-kitoblar uchun,
// interfeysda hech qachon to'g'ridan-to'g'ri ko'rsatilmaydi
export const getEffectivePlayerOvr = (player) => {
  const stamina = player.stamina !== undefined ? player.stamina : 100;
  const staminaFactor = 0.85 + (stamina / 100) * 0.15;
  return Math.round((player.ovr || 75) * staminaFactor);
};

// Ichki (dinamik, charchoqqa bog'liq) jamoa OVR — g'alaba foizini hisoblash uchun
export const calculateTeamOvr = (players) => {
  if (!players || players.length === 0) return 0;
  const sum = players.reduce((acc, p) => acc + getEffectivePlayerOvr(p), 0);
  return Math.round(sum / players.length);
};

// EKRANDA KO'RSATILADIGAN OVR — statik, o'yin davomida charchoqdan "tushib ketmaydi".
// Foydalanuvchi buni Stats/Lineup'da ko'radi; ichki hisoblash esa "miyada" (calculateTeamOvr) davom etadi.
export const calculateDisplayTeamOvr = (players) => {
  if (!players || players.length === 0) return 0;
  const sum = players.reduce((acc, p) => acc + (p.ovr || 75), 0);
  return Math.round(sum / players.length);
};

// ============================================================
// O'YINCHI VAZNLARI (statistikaga asoslangan, OVR'ga emas)
// ============================================================

// Zarba/gol urish kuchi — sho/pac/dri + (ST/CF/SS uchun) qo'shimcha "heading" komponenti (phy asosida)
export const getPlayerGoalWeight = (player) => {
  if (player.pos === 'GK') return 0.01;
  const stats = player.stats || {};
  const sho = stats.sho || 60;
  const pac = stats.pac || 60;
  const dri = stats.dri || 60;
  const phy = stats.phy || 60;

  const isAerialThreat = ['ST', 'CF', 'SS'].includes(player.pos);
  const headingPower = isAerialThreat ? phy * 0.18 : phy * 0.06;

  const effectiveOvrRatio = getEffectivePlayerOvr(player) / (player.ovr || 75);
  const basePower = ((sho * 0.52) + (pac * 0.22) + (dri * 0.18) + headingPower * 0.08) * effectiveOvrRatio;
  const posMultiplier = GOAL_POS_MULTIPLIER[player.pos] || 1.0;
  return basePower * posMultiplier;
};

// Assist berish vazni — pas statistikasi hal qiluvchi
export const getPlayerAssistWeight = (player) => {
  if (player.pos === 'GK') return 0.1;
  const stats = player.stats || {};
  const pas = stats.pas || 60;
  const dri = stats.dri || 60;
  const pac = stats.pac || 60;

  const effectiveOvrRatio = getEffectivePlayerOvr(player) / (player.ovr || 75);
  return ((pas * 0.60) + (dri * 0.25) + (pac * 0.15)) * effectiveOvrRatio;
};

// Foul / Kartochka olish vazni
export const getPlayerFoulWeight = (player) => {
  const stats = player.stats || {};
  let baseFoulRisk = 50;

  if (player.pos === 'GK') {
    baseFoulRisk = (stats.pos || 50) * 0.2;
  } else {
    const def = stats.def || 50;
    const phy = stats.phy || 50;
    baseFoulRisk = (def * 0.50) + (phy * 0.50);
  }

  const stamina = player.stamina !== undefined ? player.stamina : 100;
  const fatigueFoulFactor = 1 + ((100 - stamina) / 100) * 0.3;

  const posMultiplier = FOUL_POS_MULTIPLIER[player.pos] || 1.0;
  return baseFoulRisk * posMultiplier * fatigueFoulFactor;
};

// Darvozabon save kuchi
export const getKeeperSavePower = (keeper) => {
  if (!keeper || keeper.pos !== 'GK') return 75;
  const stats = keeper.stats || {};
  const div = stats.div || 80;
  const ref = stats.ref || 80;
  const pos = stats.pos || 80;

  const effectiveOvrRatio = getEffectivePlayerOvr(keeper) / (keeper.ovr || 75);
  return ((ref * 0.45) + (div * 0.35) + (pos * 0.20)) * effectiveOvrRatio;
};

// ============================================================
// POZITSION MATCHUP (masalan: RW vs LB) — raqib qanchalik kuchli
// bo'lsa, hujumchining samaradorligi shunchalik pasayadi va aksincha
// ============================================================
// Marker sifatida ANIQ himoyachi obyektini qaytaradi (jonli sharh uchun, masalan
// "Militaodan podkat" kabi matnlarda ishlatish uchun)
export const getMarker = (attacker, defendPlayers) => {
  if (!defendPlayers || defendPlayers.length === 0) return null;
  const lane = LANE[attacker.pos] || 'C';
  let markers = defendPlayers.filter(
    (p) => LANE[p.pos] === lane && ['CB', 'LB', 'RB', 'CDM', 'CM'].includes(p.pos)
  );
  if (markers.length === 0) {
    markers = defendPlayers.filter((p) => ['CB', 'LB', 'RB', 'CDM'].includes(p.pos));
  }
  if (markers.length === 0) return null;
  return markers[Math.floor(rand() * markers.length)];
};

export const getMarkerModifier = (attacker, defendPlayers) => {
  if (!defendPlayers || defendPlayers.length === 0) return 1;

  const lane = LANE[attacker.pos] || 'C';
  let markers = defendPlayers.filter(
    (p) => LANE[p.pos] === lane && ['CB', 'LB', 'RB', 'CDM', 'CM'].includes(p.pos)
  );
  if (markers.length === 0) {
    markers = defendPlayers.filter((p) => ['CB', 'LB', 'RB', 'CDM'].includes(p.pos));
  }
  if (markers.length === 0) return 1;

  const avgDef =
    markers.reduce((acc, p) => acc + (p.stats?.def || 50) * 0.7 + (p.stats?.phy || 50) * 0.3, 0) /
    markers.length;

  // 70 — neytral chiziq. Kuchli markerlovchi (def yuqori) hujumchini kamaytiradi (-18%..+18%)
  return 1 - Math.max(-0.18, Math.min(0.18, (avgDef - 70) / 180));
};

// ============================================================
// PRE-MATCH VA LIVE G'ALABA FOIZLARI
// ============================================================
export const calculatePreMatchChances = (
  teamA,
  currentPlayersA,
  teamB,
  currentPlayersB,
  redCardsA = 0,
  redCardsB = 0
) => {
  if (!teamA || !teamB) return { winA: 33, draw: 34, winB: 33 };

  const ratingA = calculateTeamOvr(currentPlayersA?.length ? currentPlayersA : teamA.squad);
  const ratingB = calculateTeamOvr(currentPlayersB?.length ? currentPlayersB : teamB.squad);

  const keeperA = currentPlayersA?.find((p) => p.pos === 'GK') || teamA.squad.find((p) => p.pos === 'GK');
  const keeperB = currentPlayersB?.find((p) => p.pos === 'GK') || teamB.squad.find((p) => p.pos === 'GK');

  const savePowerA = getKeeperSavePower(keeperA);
  const savePowerB = getKeeperSavePower(keeperB);

  const effectiveRatingA = (ratingA * 0.85) + (savePowerA * 0.15) - (redCardsA * 12);
  const effectiveRatingB = (ratingB * 0.85) + (savePowerB * 0.15) - (redCardsB * 12);

  const diff = effectiveRatingA - effectiveRatingB;
  let winA = 40 + (diff * 2.5);
  winA = Math.max(15, Math.min(75, Math.round(winA)));

  const draw = 22;
  const winB = 100 - (winA + draw);

  return { winA, draw, winB };
};

export const calculateLiveChances = (
  preMatchChances,
  score = { a: 0, b: 0 },
  currentMinute = 0,
  isRiskA = false,
  isRiskB = false
) => {
  let { winA, draw, winB } = preMatchChances;

  if (isRiskA) { winA += 8; winB += 6; draw -= 14; }
  if (isRiskB) { winB += 8; winA += 6; draw -= 14; }

  const scoreDiff = score.a - score.b;
  const timeProgress = Math.pow(currentMinute / 90, 1.5);

  if (scoreDiff === 0) {
    const addedDraw = Math.round(timeProgress * 30);
    draw = Math.min(75, draw + addedDraw);

    const remaining = 100 - draw;
    const ratioA = winA / (winA + winB || 1);
    winA = Math.round(remaining * ratioA);
    winB = 100 - (winA + draw);
  } else {
    const leaderIsA = scoreDiff > 0;
    const absDiff = Math.abs(scoreDiff);

    let leadBonus = absDiff * 7;
    leadBonus += timeProgress * (15 + absDiff * 10);

    if (leaderIsA) {
      winA = Math.min(95, winA + leadBonus);
      draw = Math.round((100 - winA) * 0.35);
      winB = 100 - (winA + draw);
    } else {
      winB = Math.min(95, winB + leadBonus);
      draw = Math.round((100 - winB) * 0.35);
      winA = 100 - (winB + draw);
    }
  }

  winA = Math.max(1, Math.round(winA));
  winB = Math.max(1, Math.round(winB));
  draw = Math.max(1, 100 - (winA + winB));

  return { winA, draw, winB };
};

// ============================================================
// GOL MUALLIFI VA ASSISTNI TANLASH (endi RAQIB MARKIROVKASI bilan)
// ============================================================
export const getRandomScorerAndAssister = (currentPlayers, defendPlayers = null) => {
  if (!currentPlayers || currentPlayers.length === 0) {
    return { scorer: { name: "Noma'lum" }, assister: null };
  }

  const goalWeights = currentPlayers.map((p) => {
    const base = getPlayerGoalWeight(p);
    const marker = defendPlayers ? getMarkerModifier(p, defendPlayers) : 1;
    return base * marker;
  });
  const totalGoalWeight = goalWeights.reduce((acc, w) => acc + w, 0);

  let randomGoal = rand() * totalGoalWeight;
  let scorer = currentPlayers[0];

  for (let i = 0; i < currentPlayers.length; i++) {
    if (randomGoal <= goalWeights[i]) {
      scorer = currentPlayers[i];
      break;
    }
    randomGoal -= goalWeights[i];
  }

  let assister = null;
  const hasAssist = rand() < 0.70;

  if (hasAssist) {
    const possibleAssisters = currentPlayers.filter((p) => p.id !== scorer.id);
    if (possibleAssisters.length > 0) {
      const assistWeights = possibleAssisters.map((p) => getPlayerAssistWeight(p));
      const totalAssistWeight = assistWeights.reduce((acc, w) => acc + w, 0);

      let randAssist = rand() * totalAssistWeight;
      for (let i = 0; i < possibleAssisters.length; i++) {
        if (randAssist <= assistWeights[i]) {
          assister = possibleAssisters[i];
          break;
        }
        randAssist -= assistWeights[i];
      }
    }
  }

  return { scorer, assister };
};

// Kuch shkalalari — darvozabon kuchi (savePower, taxminan 60-90) bilan bir xil
// o'lchamda solishtirish uchun zarba kuchini kalibrlash koeffitsientlari.
// (Ilgari bu qiymat *9 edi — bu darvozabonni deyarli foydasiz qilib qo'ygan edi.)
const BIG_CHANCE_POWER_SCALE = 1.3;   // katta imkoniyat — yuqori sifatli zarba
const REGULAR_SHOT_POWER_SCALE = 0.4; // oddiy zarba — past sifatli, ko'proq chetga ketadi

// ============================================================
// ZARBA NATIJASINI HAL QILISH — darvozabon, marker va aniqlik hisobga olinadi
// ============================================================
// Bitta "katta imkoniyat" yuzaga kelganda: Ofsayd (12%) -> Avtogol (2%) ->
// Penalti (8%, darvozabonga bog'liq) -> Oddiy zarba (78%: nishonga tegmaslik +
// darvozabon ushlab qolishi shooter kuchi/keeper kuchi nisbatiga bog'liq)
export const resolveAttackOutcome = (attackPlayers, defendPlayers) => {
  if (!attackPlayers || attackPlayers.length === 0) return null;

  const subRand = rand() * 100;
  const keeper = (defendPlayers || []).find((p) => p.pos === 'GK');

  // 1. OFSAYD — 12%
  if (subRand < 12) {
    const { scorer } = getRandomScorerAndAssister(attackPlayers, defendPlayers);
    return { result: 'OFFSIDE', scorer };
  }

  // 2. AVTOGOL — 2%
  if (subRand < 14 && defendPlayers && defendPlayers.length > 0) {
    const ownGoalPlayer = defendPlayers[Math.floor(rand() * defendPlayers.length)];
    return { result: 'OWN_GOAL', player: ownGoalPlayer };
  }

  // 3. PENALTI — 8%
  if (subRand < 22) {
    const { scorer } = getRandomScorerAndAssister(attackPlayers, defendPlayers);
    const savePower = getKeeperSavePower(keeper);
    // Kuchli darvozabon (yuqori save power) penalti gol ehtimolini kamaytiradi (55%–85% oralig'i)
    const scoreChance = Math.max(0.55, Math.min(0.85, 0.82 - (savePower - 75) / 250));
    if (rand() < scoreChance) {
      return { result: 'PENALTY_GOAL', scorer, keeper };
    }
    return { result: 'PENALTY_MISSED', scorer, keeper };
  }

  // 4. ODDIY ZARBA (katta imkoniyat ichida) — qolgan 78%
  const { scorer, assister } = getRandomScorerAndAssister(attackPlayers, defendPlayers);
  const savePower = getKeeperSavePower(keeper);
  const marker = getMarker(scorer, defendPlayers);
  const markerMod = getMarkerModifier(scorer, defendPlayers);
  const shotPower = getPlayerGoalWeight(scorer) * markerMod * BIG_CHANCE_POWER_SCALE;

  const MISS_CHANCE = 0.32; // to'p darvoza tashqarisiga ketishi (nishonga tegmaydi)
  const saveChance = savePower / (savePower + shotPower); // nishonga tegsa, ushlanish ehtimoli

  const outcomeRand = rand();
  if (outcomeRand < MISS_CHANCE) {
    return { result: 'MISSED', scorer, marker };
  }
  if (outcomeRand < MISS_CHANCE + (1 - MISS_CHANCE) * saveChance) {
    return { result: 'SAVED', scorer, keeper, marker };
  }
  return { result: 'GOAL', scorer, assister, keeper, marker };
};

// ============================================================
// ODDIY ZARBA (katta imkoniyatdan tashqari) — bu daqiqada sodir bo'ladigan,
// past sifatli, lekin ko'p sonli oddiy hujum urinishlari. Aynan shu funksiya
// jamoaning umumiy "Zarbalar"/"Aniq zarbalar" statistikasini real futboldagidek
// (o'yin boshiga ~10-14 ta) darajaga olib chiqadi. Ofsayd/penalti/avtogol
// bu yerda hisobga olinmaydi — ular faqat "katta imkoniyat"da bo'ladi.
export const resolveRegularShot = (attackPlayers, defendPlayers) => {
  if (!attackPlayers || attackPlayers.length === 0) return null;

  const { scorer, assister } = getRandomScorerAndAssister(attackPlayers, defendPlayers);
  const keeper = (defendPlayers || []).find((p) => p.pos === 'GK');
  const savePower = getKeeperSavePower(keeper);
  const marker = getMarker(scorer, defendPlayers);
  const markerMod = getMarkerModifier(scorer, defendPlayers);
  const shotPower = getPlayerGoalWeight(scorer) * markerMod * REGULAR_SHOT_POWER_SCALE;

  const MISS_CHANCE = 0.70; // oddiy zarbalarning aksariyati chetga/bloklanib ketadi (gollarni real darajaga tushirish uchun oshirildi)
  const saveChance = savePower / (savePower + shotPower);

  const outcomeRand = rand();
  if (outcomeRand < MISS_CHANCE) {
    return { result: 'MISSED', scorer, marker };
  }
  if (outcomeRand < MISS_CHANCE + (1 - MISS_CHANCE) * saveChance) {
    return { result: 'SAVED', scorer, keeper, marker };
  }
  return { result: 'GOAL', scorer, assister, keeper, marker };
};

// ============================================================
// FON STATISTIKALARI — Ball egaligi, Tacklelar, Burchak zarbalari
// ============================================================

// Bitta daqiqada qaysi jamoa to'pni ko'proq nazorat qilishi (pas/dribbling asosida)
export const getPossessionWeight = (players) => {
  if (!players || players.length === 0) return 50;
  const relevant = players.filter((p) => ['CM', 'CAM', 'CDM', 'RM', 'LM'].includes(p.pos));
  const pool = relevant.length ? relevant : players;
  const avgPas = pool.reduce((acc, p) => acc + (p.stats?.pas || 60), 0) / pool.length;
  const avgDri = pool.reduce((acc, p) => acc + (p.stats?.dri || 60), 0) / pool.length;
  return avgPas * 0.65 + avgDri * 0.35;
};

// Tackle va burchak zarbasi — faqat statistikaga ta'sir qiluvchi fon hodisalari
// (Koeffitsientlar o'yin boshiga real futboldagidek ~15-18 tackle va ~4-6 burchakka moslashtirilgan)
export const rollBackgroundStats = (attackPlayers, defendPlayers) => {
  const defenders = (defendPlayers || []).filter((p) => ['CB', 'LB', 'RB', 'CDM'].includes(p.pos));
  const avgDef = defenders.length
    ? defenders.reduce((acc, p) => acc + (p.stats?.def || 50), 0) / defenders.length
    : 50;
  const tackle = rand() < (avgDef / 100) * 0.45;

  const attackers = (attackPlayers || []).filter((p) => ['ST', 'CF', 'SS', 'LW', 'RW'].includes(p.pos));
  const avgAtkPower = attackers.length
    ? attackers.reduce((acc, p) => acc + (p.stats?.pac || 60) + (p.stats?.dri || 60), 0) / (attackers.length * 2)
    : 60;
  const corner = rand() < (avgAtkPower / 100) * 0.12;

  return { tackle, corner };
};

// Ofsayd — endi faqat "katta imkoniyat"ga bog'liq emas, har daqiqa mustaqil tekshiriladi
// (o'yin boshiga real futboldagidek jamoa boshiga ~1.5-2 ofsayd chiqishi uchun)
export const rollOffside = (attackPlayers) => {
  const attackers = (attackPlayers || []).filter((p) => ['ST', 'CF', 'SS', 'LW', 'RW'].includes(p.pos));
  const avgPac = attackers.length
    ? attackers.reduce((acc, p) => acc + (p.stats?.pac || 60), 0) / attackers.length
    : 60;
  return rand() < (avgPac / 100) * 0.02;
};

// Kartochkasiz oddiy foul (statistikaga kiradi, lekin voqealar tasmasida ko'rinmaydi)
export const checkPlainFoul = (currentPlayers) => {
  if (!currentPlayers || currentPlayers.length === 0) return null;
  if (rand() * 100 >= 11) return null; // ~11% => o'rtacha ~10 foul/jamoa/o'yin (kartochkalar bilan birga)

  const foulWeights = currentPlayers.map((p) => getPlayerFoulWeight(p));
  const total = foulWeights.reduce((acc, w) => acc + w, 0);
  let r = rand() * total;
  for (let i = 0; i < currentPlayers.length; i++) {
    if (r <= foulWeights[i]) return currentPlayers[i];
    r -= foulWeights[i];
  }
  return currentPlayers[0];
};

// Juda kam uchraydigan jarohat ehtimoli
export const checkInjuryEvent = (currentPlayers) => {
  if (!currentPlayers || currentPlayers.length === 0) return null;
  if (rand() < 0.0006) {
    return currentPlayers[Math.floor(rand() * currentPlayers.length)];
  }
  return null;
};

// ============================================================
// KARTOCHKA / ALMASHTIRISH HODISALARI
// ============================================================
export const checkRandomMatchEvent = (
  team,
  currentPlayers,
  benchPlayers,
  yellowCards,
  teamRedCardsCount,
  currentMinute,
  subCount,
  scoreDiff,
  hasUsedRisk,
  opponentPlayers = null
) => {
  if (currentPlayers.length === 0) return null;

  const roll = rand() * 100;

  // Foul qurbonini (raqibning to'p egallagan hujumchisi) jonli sharh uchun tanlash
  const pickVictim = () => {
    if (!opponentPlayers || opponentPlayers.length === 0) return null;
    const attackers = opponentPlayers.filter((p) => ['ST', 'CF', 'SS', 'LW', 'RW', 'CAM', 'RM', 'LM'].includes(p.pos));
    const pool = attackers.length ? attackers : opponentPlayers;
    return pool[Math.floor(rand() * pool.length)];
  };

  const getFoulPlayer = () => {
    const foulWeights = currentPlayers.map((p) => getPlayerFoulWeight(p));
    const totalFoulWeight = foulWeights.reduce((acc, w) => acc + w, 0);
    let r = rand() * totalFoulWeight;
    for (let i = 0; i < currentPlayers.length; i++) {
      if (r <= foulWeights[i]) return currentPlayers[i];
      r -= foulWeights[i];
    }
    return currentPlayers[0];
  };

  // 1. SARIQ KARTOCHKA (real futboldagidek ~3-4 sariq/o'yin bo'lishi uchun oshirilgan)
  if (roll < 1.80) {
    const player = getFoulPlayer();
    const victim = pickVictim();
    const hasYellow = yellowCards.includes(player.id);

    if (hasYellow && teamRedCardsCount < 4) {
      return { type: 'RED_FROM_YELLOW', player, victim, teamId: team.id };
    } else {
      return { type: 'YELLOW', player, victim, teamId: team.id };
    }
  }

  // 2. TO'G'RIDAN-TO'G'RI QIZIL KARTOCHKA
  if (roll >= 1.80 && roll < 1.85 && teamRedCardsCount < 4) {
    const player = getFoulPlayer();
    const victim = pickVictim();
    return { type: 'DIRECT_RED', player, victim, teamId: team.id };
  }

  // 3. ALMASHTIRISH — endi ENG KUCHLI mos zahiradagi o'yinchi kiritiladi (tasodifiy emas),
  // shuning uchun Customization orqali transfer qilingan yulduz doim zahirada qolib ketmaydi
  if (benchPlayers.length > 0 && subCount < 5) {
    const isLosing = scoreDiff < 0;
    if (currentMinute >= 60 && isLosing && !hasUsedRisk && roll > 97.15) {
      const defenders = currentPlayers.filter((p) => getPosCategory(p.pos) === 'DF');
      const benchAttackers = [...benchPlayers.filter((p) => getPosCategory(p.pos) === 'FW')].sort((a, b) => (b.ovr || 0) - (a.ovr || 0));

      if (defenders.length > 0 && benchAttackers.length > 0) {
        // eng charchagan (stamina eng past) himoyachi chiqariladi
        const playerOut = [...defenders].sort((a, b) => (a.stamina ?? 100) - (b.stamina ?? 100))[0];
        const playerIn = benchAttackers[0]; // eng kuchli zahiradagi hujumchi kiradi
        return { type: 'SUBSTITUTION', playerOut, playerIn: { ...playerIn, stamina: 100 }, isRisk: true, teamId: team.id };
      }
    }

    if (currentMinute >= 45 && roll > 96.2) {
      const fieldPlayers = currentPlayers.filter((p) => p.pos !== 'GK');
      if (fieldPlayers.length === 0) return null;

      // Eng charchagan o'yinchi chiqariladi (real futboldagidek)
      const playerOut = [...fieldPlayers].sort((a, b) => (a.stamina ?? 100) - (b.stamina ?? 100))[0];
      const outCategory = getPosCategory(playerOut.pos);

      let suitableBench = benchPlayers.filter((p) => getPosCategory(p.pos) === outCategory);
      if (suitableBench.length === 0) {
        suitableBench = benchPlayers.filter((p) => p.pos !== 'GK');
      }
      // Zahiradagi ENG KUCHLI (OVR bo'yicha) mos o'yinchi tanlanadi
      suitableBench = [...suitableBench].sort((a, b) => (b.ovr || 0) - (a.ovr || 0));

      if (suitableBench.length > 0) {
        const playerIn = suitableBench[0];
        return { type: 'SUBSTITUTION', playerOut, playerIn: { ...playerIn, stamina: 100 }, isRisk: false, teamId: team.id };
      }
    }
  }

  return null;
};

// ============================================================
// SOFASCORE USLUBIDAGI DAQIQALIK MIKRO-BAHOLASH
// ============================================================
// Har daqiqada, gol/kartochka kabi katta hodisa bo'lmasa ham, maydondagi HAR BIR
// futbolchi o'z pozitsiyasiga mos statistikasi asosida kichik ehtimol bilan
// "harakatda ishtirok etadi" (muvaffaqiyatli pas/dribbling/tackle yoxud aksincha
// xato/to'p yo'qotish). Natijada bali o'yin davomida ~55-65 marta asta-sekin
// sifatiga qarab siljib boradi — hujumchi ham, "sokin" himoyachi ham baholanadi.
export const getMinuteMicroDelta = (player) => {
  if (rand() > 0.68) return 0; // har doim emas — real "ishtirok" chastotasi

  const stats = player.stats || {};
  const cat = getPosCategory(player.pos);
  let posQuality;

  if (cat === 'GK') {
    posQuality = ((stats.ref || 75) + (stats.div || 75) + (stats.pos || 75)) / 3;
  } else if (cat === 'DF') {
    posQuality = (stats.def || 60) * 0.55 + (stats.phy || 60) * 0.25 + (stats.pas || 60) * 0.20;
  } else if (cat === 'MF') {
    posQuality = (stats.pas || 60) * 0.45 + (stats.dri || 60) * 0.30 + (stats.def || 60) * 0.25;
  } else {
    posQuality = (stats.dri || 60) * 0.40 + (stats.sho || 60) * 0.30 + (stats.pac || 60) * 0.30;
  }

  // 70 — neytral chiziq: undan yuqori bo'lsa ijobiy, past bo'lsa salbiy ehtimol oshadi
  const successProb = Math.max(0.25, Math.min(0.8, 0.5 + (posQuality - 70) / 200));

  if (rand() < successProb) {
    return 0.015 + rand() * 0.02;
  }
  return -(0.01 + rand() * 0.02);
};

// ============================================================
// SUMMARY UCHUN TOZA, STANDART MATNLAR
// ============================================================
// Summary faqat asosiy hodisalarni (gol, kartochka, ofsayd, almashtirish) ko'rsatishi
// kerak — shuning uchun bu yerda ortiqcha "badiiy" jumlalar emas, aniq va qisqa
// standart formatlar ishlatiladi (haqiqiy futbol translyatsiyalaridagidek).
const pickTemplate = (arr) => arr[Math.floor(rand() * arr.length)];

export const commentaryGoal = (scorerName, assisterName) => ({
  text: `GOOOL! ${scorerName}`,
  sub: assisterName ? `Assist: ${assisterName}` : null,
});

export const commentaryOffside = (scorerName) => ({
  text: `Ofsayd — gol bekor qilindi`,
  sub: `${scorerName} ofsaydda qolib ketdi`,
});

export const commentarySave = (keeperName, scorerName) => ({
  text: `Zo'r himoya!`,
  sub: `${keeperName} ${scorerName}ning zarbasini ushladi`,
});

export const commentaryPenaltyGoal = (scorerName) => ({
  text: `GOL! ${scorerName} (Penalti)`,
  sub: null,
});

export const commentaryPenaltyMissed = (scorerName, keeperName) => ({
  text: `Penalti otkazib yuborildi`,
  sub: keeperName ? `${keeperName} to'g'ri tomonga uchdi` : `${scorerName} imkoniyatni boy berdi`,
});

// ============================================================
// JONLI TIKER — Summary'da qolmaydigan, o'tkinchi status matnlari.
// Endi hujumchi + uni "belgilagan" himoyachi nomi bilan, xuddi jonli
// translyatsiyadagidek: "Real Madrid hujumda! Mbappe to'p bilan!
// Rüdigerdan qutulib zarba... GOOOL!!" uslubida.
// ============================================================
export const tickerAttackBuildup = (teamName, scorerName, markerName) => pickTemplate([
  `${teamName} hujumda! ${scorerName} to'p bilan${markerName ? `, ${markerName}dan qutulib zarba urdi...` : ' zarba urdi...'}`,
  `${teamName} tezkor hujum! ${scorerName} zarba tayyorlamoqda...`,
  `${scorerName} to'p bilan${markerName ? ` ${markerName}ni orqada qoldirdi` : ''}, zarba!`,
]);

export const tickerSave = (keeperName, scorerName) => pickTemplate([
  `... ammo ${keeperName}dan zo'r seyv! (${scorerName})`,
  `🧤 ${keeperName} zarbani ushladi!`,
  `🧤 ${keeperName} darvozani asrab qoldi!`,
]);

export const tickerMiss = (scorerName) => pickTemplate([
  `... ${scorerName}ning zarbasi darvoza yonidan o'tdi!`,
  `... to'singa tegdi!! Gol bo'lmadi`,
  `... zarba chetga ketdi, katta imkoniyat qoldi-ketdi!`,
]);

export const tickerCorner = (teamName) => pickTemplate([
  `🚩 Burchak zarbasi — ${teamName}`,
  `🚩 ${teamName} burchakdan xavf tug'dirmoqchi`,
]);

export const tickerFoul = () => pickTemplate([
  `⚠️ Foul — erkin zarba`,
  `⚠️ Qoidabuzarlik, o'yin to'xtadi`,
]);

export const tickerFreeKick = (teamName, scorerName) => pickTemplate([
  `${teamName} erkin zarba oldi. To'p ${scorerName} oldida...`,
  `${teamName}ga erkin zarba! ${scorerName} tayyorlanmoqda...`,
]);

export const tickerCard = (teamName, victimName, playerName, isRed) => {
  const action = isRed ? 'QIZIL KARTOCHKA' : 'sariq kartochka';
  if (victimName) {
    return `${teamName} hujumda, ${victimName} to'p bilan — ${playerName}dan qattiq podkat, ${action}!`;
  }
  return `${playerName} qo'pol harakat qildi — ${action}!`;
};

export const tickerCleanTackle = (defenderName, attackerName) => pickTemplate([
  `${defenderName}dan toza podkat — ${attackerName}ning hujumi to'xtatildi`,
  `Ajoyib himoya! ${defenderName} to'pni tozalab oldi`,
]);

export const tickerBigMiss = (scorerName) => pickTemplate([
  `😮 ${scorerName} zo'r imkoniyatni boy berdi!`,
  `😮 Bu zarba darvozadan chetlab o'tdi!`,
]);

export const tickerPossession = (teamName) => pickTemplate([
  `${teamName} hujumni tashkil qilmoqda...`,
  `${teamName} to'pni ushlab turibdi`,
  `O'yin markazda davom etmoqda...`,
]);
