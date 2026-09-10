import { getPosCategory } from './engine';

// Mavjud taktikalar ro'yxati (23 ta) — foydalanuvchi ro'yxati asosida.
// Har birining hujum/himoya koeffitsienti jonli o'yin davomida gol urish
// ehtimoliga bevosita ta'sir qiladi. Ba'zi taktikalar bir xil df/mf/fw
// sonini ishlatadi, lekin uslubi (attack/defense) har xil.
export const FORMATIONS = [
  { name: '4-3-3',     df: 4, mf: 3, fw: 3, attack: 1.18, defense: 0.90, label: '4-3-3 Hujumkor' },
  { name: '4-2-3-1',   df: 4, mf: 5, fw: 1, attack: 1.05, defense: 1.05, label: '4-2-3-1 Muvozanatli' },
  { name: '4-4-2',     df: 4, mf: 4, fw: 2, attack: 1.00, defense: 1.00, label: '4-4-2 Klassik' },
  { name: '4-1-2-1-2', df: 4, mf: 4, fw: 2, attack: 1.04, defense: 0.98, label: '4-1-2-1-2 Romb' },
  { name: '4-1-4-1',   df: 4, mf: 5, fw: 1, attack: 0.95, defense: 1.12, label: '4-1-4-1 Ehtiyotkor' },
  { name: '4-3-2-1',   df: 4, mf: 5, fw: 1, attack: 1.00, defense: 1.06, label: '4-3-2-1 Yog\u02bboch' },
  { name: '4-3-1-2',   df: 4, mf: 4, fw: 2, attack: 1.08, defense: 0.96, label: '4-3-1-2 Trident' },
  { name: '4-5-1',     df: 4, mf: 5, fw: 1, attack: 0.90, defense: 1.14, label: '4-5-1 Kompakt' },
  { name: '4-2-2-2',   df: 4, mf: 4, fw: 2, attack: 1.10, defense: 0.90, label: '4-2-2-2 Diamond hujum' },
  { name: '4-2-4',     df: 4, mf: 2, fw: 4, attack: 1.30, defense: 0.72, label: '4-2-4 Ashaddiy hujum' },
  { name: '4-6-0',     df: 4, mf: 6, fw: 0, attack: 0.92, defense: 1.08, label: '4-6-0 Yolg\u02bbon 9' },
  { name: '3-5-2',     df: 3, mf: 5, fw: 2, attack: 1.10, defense: 0.94, label: '3-5-2 O\u02bbrta maydon' },
  { name: '3-4-3',     df: 3, mf: 4, fw: 3, attack: 1.24, defense: 0.82, label: '3-4-3 Keng hujum' },
  { name: '3-4-2-1',   df: 3, mf: 6, fw: 1, attack: 1.20, defense: 0.85, label: '3-4-2-1 Yarim tanga' },
  { name: '3-4-1-2',   df: 3, mf: 5, fw: 2, attack: 1.16, defense: 0.88, label: '3-4-1-2 Hujumkor tortma' },
  { name: '3-3-3-1',   df: 3, mf: 6, fw: 1, attack: 1.14, defense: 0.90, label: '3-3-3-1 Total futbol' },
  { name: '3-5-1-1',   df: 3, mf: 5, fw: 2, attack: 1.08, defense: 0.96, label: '3-5-1-1 Yolg\u02bbon striker' },
  { name: '3-2-4-1',   df: 3, mf: 6, fw: 1, attack: 1.18, defense: 0.84, label: '3-2-4-1 Bosim' },
  { name: '3-1-4-2',   df: 3, mf: 5, fw: 2, attack: 1.14, defense: 0.90, label: '3-1-4-2 Kontrolli' },
  { name: '5-3-2',     df: 5, mf: 3, fw: 2, attack: 0.86, defense: 1.20, label: '5-3-2 Himoyaviy' },
  { name: '5-4-1',     df: 5, mf: 4, fw: 1, attack: 0.78, defense: 1.28, label: '5-4-1 Qal\u02bba' },
  { name: '5-2-3',     df: 5, mf: 2, fw: 3, attack: 1.02, defense: 1.02, label: '5-2-3 Kontratak' },
  { name: '5-2-1-2',   df: 5, mf: 3, fw: 2, attack: 0.84, defense: 1.22, label: '5-2-1-2 Betonli mudofaa' },
];

const DEFAULT_FORMATION = FORMATIONS[2]; // 4-4-2 — hech narsa mos kelmasa shu ishlatiladi

export function countOutfieldByCategory(players) {
  const counts = { DF: 0, MF: 0, FW: 0 };
  (players || []).forEach((p) => {
    const cat = getPosCategory(p.pos);
    if (counts[cat] !== undefined) counts[cat] += 1;
  });
  return counts;
}

// O'yinchining formatsiya ehtiyojiga qarab EFFEKTIV toifasini aniqlaydi — agar
// asosiy pozitsiyasi bo'yicha toifa "ortiqcha" bo'lsa-yu, boshqa toifa "kam" bo'lsa,
// o'sha o'yinchining altPos (haqiqiy hayotdagi qo'shimcha pozitsiyalari)dan biri
// kerakli toifaga to'g'ri kelsa — o'sha toifaga "qarz beriladi" (versatile o'yinchi
// sifatida). Bu bo'sh joy qolishining oldini oladi va tarkibni moslashuvchan qiladi.
export function assignEffectiveCategories(players, formation) {
  const need = { DF: formation.df, MF: formation.mf, FW: formation.fw };
  const list = (players || []).map((p) => ({ player: p, cat: getPosCategory(p.pos) }));

  const have = { DF: 0, MF: 0, FW: 0, GK: 0 };
  list.forEach(({ cat }) => { if (have[cat] !== undefined) have[cat]++; });

  const assigned = new Map();
  list.forEach(({ player, cat }) => assigned.set(player.id, cat));

  ['DF', 'MF', 'FW'].forEach((deficitCat) => {
    let deficit = need[deficitCat] - have[deficitCat];
    if (deficit <= 0) return;

    for (const surplusCat of ['MF', 'DF', 'FW']) {
      if (surplusCat === deficitCat || deficit <= 0) continue;
      let surplus = have[surplusCat] - need[surplusCat];
      if (surplus <= 0) continue;

      const candidates = list.filter(({ player, cat }) =>
        cat === surplusCat &&
        assigned.get(player.id) === surplusCat &&
        (player.altPos || []).some((ap) => getPosCategory(ap) === deficitCat)
      );

      for (const { player } of candidates) {
        if (deficit <= 0 || surplus <= 0) break;
        assigned.set(player.id, deficitCat);
        have[surplusCat]--;
        have[deficitCat]++;
        deficit--;
        surplus--;
      }
    }
  });

  return assigned; // Map<playerId, 'DF'|'MF'|'FW'|'GK'>
}

function personnelFitScore(f, players) {
  const assigned = assignEffectiveCategories(players, f);
  const have = { DF: 0, MF: 0, FW: 0 };
  assigned.forEach((cat) => { if (have[cat] !== undefined) have[cat]++; });
  return Math.abs(f.df - have.DF) + Math.abs(f.mf - have.MF) + Math.abs(f.fw - have.FW);
}

// Berilgan taktikaning MA'LUM BIR raqib taktikasiga qarshi qanchalik yaxshi ishlashini
// hisoblaydi. G'oya: hujumchi/o'rta maydon soni raqibning himoyachi/o'rta maydonidan
// ko'p bo'lsa — sonli ustunlik (overload) yuzaga keladi va hujum kuchayadi; aksincha bo'lsa,
// himoya bosim ostida qoladi.
export function getMatchupModifier(formation, opponentFormation) {
  if (!opponentFormation) return { attackMod: 1, defenseMod: 1 };

  const overload = (formation.fw + formation.mf * 0.3) - (opponentFormation.df + opponentFormation.mf * 0.2);
  const attackMod = 1 + Math.max(-0.12, Math.min(0.12, overload * 0.015));

  const pressure = (opponentFormation.fw + opponentFormation.mf * 0.3) - (formation.df + formation.mf * 0.2);
  const defenseMod = 1 - Math.max(-0.12, Math.min(0.12, pressure * 0.015));

  return { attackMod, defenseMod };
}

// O'yinchilar tarkibiga (maydondagi holatga) qarab eng mos taktikani avtomatik tanlaydi.
//
// - Avval FAQAT personnel jihatdan ANIQ mos keladigan taktikalar ko'riladi (bo'sh joy
//   qolib ketmasligi uchun); agar aniq mos kelmasa, moslashuv kengaytiriladi.
// - Agar bir nechtasi bab-baravar mos kelsa, raqib taktikasiga qarshi eng samaralisi
//   tanlanadi (matchup), YANA jamoaning nisbiy kuchi (strengthDiff) hisobga olinadi:
//   kuchsizroq jamoa himoyaviy, kuchliroq jamoa hujumkor taktikaga moyil bo'ladi.
export function pickAutoFormation(players, opponentFormation = null, strengthDiff = 0) {
  if (!players || players.length === 0) return DEFAULT_FORMATION;

  let bestScore = Infinity;
  FORMATIONS.forEach((f) => {
    const score = personnelFitScore(f, players);
    if (score < bestScore) bestScore = score;
  });

  // Avval ANIQ (0 farq bilan) mos keladiganlarni izlaymiz — bo'sh joy qolmasligi uchun.
  // Agar aniq mos kelmasa, moslashuvni asta kengaytiramiz.
  const tolerance = bestScore === 0 ? 0 : bestScore;
  const candidates = FORMATIONS.filter((f) => personnelFitScore(f, players) <= tolerance);

  const scoreCandidate = (f) => {
    const { attackMod, defenseMod } = getMatchupModifier(f, opponentFormation);
    // Kuchsiz jamoa (strengthDiff manfiy) hujumkor taktikalarni kamroq, himoyaviylarni
    // ko'proq afzal ko'radi; kuchli jamoa (strengthDiff musbat) aksincha.
    const styleBias = strengthDiff * 0.01 * (f.attack - f.defense);
    return (f.attack * attackMod) + (f.defense * defenseMod) + styleBias;
  };

  let best = candidates[0] || DEFAULT_FORMATION;
  let bestValue = -Infinity;
  candidates.forEach((f) => {
    const value = scoreCandidate(f);
    if (value > bestValue) { bestValue = value; best = f; }
  });
  return best;
}

// Bitta taktika liniyasi uchun maydonda gorizontal joylashuv (foizlarda)
function buildLine(count, y) {
  const positions = [];
  for (let i = 0; i < count; i++) {
    const x = count === 1 ? 50 : 12 + i * (76 / (count - 1));
    positions.push({ x, y });
  }
  return positions;
}

export function getFormationLayout(formation) {
  return {
    GK: buildLine(1, 92),
    DF: buildLine(formation.df, 74),
    MF: buildLine(formation.mf, 47),
    FW: buildLine(formation.fw, 17),
  };
}

// Har bir pozitsiya qaysi "yo'lak"da turishi kerak (0=chap, 1=markaz, 2=o'ng) —
// shu asosida chapdagi x-koordinataga L-pozitsiyalar, o'ngdagiga R-pozitsiyalar
// qo'yiladi (masalan LW doim chapda, RW doim o'ngda, ST/CF markazda turadi).
const LANE_ORDER = {
  LW: 0, LM: 0, LB: 0,
  CB: 1, CM: 1, CDM: 1, CAM: 1, ST: 1, CF: 1, SS: 1, GK: 1,
  RW: 2, RM: 2, RB: 2,
};

// O'yinchilarni tanlangan taktika bo'yicha maydon koordinatalariga bog'laydi.
// Har bir liniya ichida o'yinchilar o'z pozitsiyasi (chap/markaz/o'ng) bo'yicha
// tartiblanadi — shuning uchun LW doim chap qanotda, RW doim o'ng qanotda chiqadi,
// tasodifiy tartibda emas.
export function buildPitchSlots(players, formation) {
  const layout = getFormationLayout(formation);
  const byCat = { GK: [], DF: [], MF: [], FW: [] };
  const effective = assignEffectiveCategories(players, formation);

  (players || []).forEach((p) => {
    const cat = effective.get(p.id) || getPosCategory(p.pos);
    if (byCat[cat]) byCat[cat].push(p);
  });

  // Har bir kategoriya ichida chap->markaz->o'ng tartibida saralaymiz
  ['GK', 'DF', 'MF', 'FW'].forEach((cat) => {
    byCat[cat].sort((a, b) => (LANE_ORDER[a.pos] ?? 1) - (LANE_ORDER[b.pos] ?? 1));
  });

  const slots = [];
  ['GK', 'DF', 'MF', 'FW'].forEach((cat) => {
    const positions = layout[cat];
    byCat[cat].forEach((p, idx) => {
      if (positions[idx]) {
        slots.push({ player: p, category: cat, x: positions[idx].x, y: positions[idx].y });
      }
    });
  });

  return slots;
}

// ============================================================
// TO'LIQ TARKIBDAN (asosiy+zahira birlashtirilgan) ENG KUCHLI 11 NAFARNI
// TANLASH — reytinglarga tegilmaydi, faqat mavjud pool'dan tanlanadi.
// ============================================================
// Berilgan to'liq futbolchilar poolidan (masalan 20-30 nafar) tanlangan
// taktikaga eng mos, OVR bo'yicha eng kuchli 11 nafarni tanlaydi. Qolganlar
// avtomatik "zahira" hisoblanadi. AltPos (qo'shimcha pozitsiya) bo'lgan
// versatile o'yinchilar yetishmayotgan toifalarni to'ldirishda ishlatiladi.
const LANE_MAP = {
  LW: 'L', LM: 'L', LB: 'L',
  RW: 'R', RM: 'R', RB: 'R',
  CB: 'C', CM: 'C', CDM: 'C', CAM: 'C', ST: 'C', CF: 'C', SS: 'C',
};

// Bitta toifa (DF/MF/FW) ichida kerakli sondagi o'yinchini tanlaydi — lekin
// KO'R-KO'RONA faqat OVR bo'yicha emas, avval (agar 2+ joy bo'lsa) kamida
// bitta CHAP va bitta O'NG tomon o'yinchisini kafolatlaydi (masalan LB doim
// tanlanadi, hattoki undan kuchliroq 3-CB zahirada bo'lsa ham) — shunda
// haqiqiy LB/RW kabi o'yinchilar bekorga zahirada qolib ketmaydi.
function pickCategoryPlayers(candidates, count) {
  if (count <= 0) return [];
  const byLane = { L: [], C: [], R: [] };
  candidates.forEach((p) => { byLane[LANE_MAP[p.pos] || 'C'].push(p); });
  Object.values(byLane).forEach((arr) => arr.sort((a, b) => (b.ovr || 0) - (a.ovr || 0)));

  const picks = [];
  const used = new Set();
  if (count >= 2) {
    if (byLane.L[0]) { picks.push(byLane.L[0]); used.add(byLane.L[0].id); }
    if (byLane.R[0] && picks.length < count) { picks.push(byLane.R[0]); used.add(byLane.R[0].id); }
  }
  const rest = candidates.filter((p) => !used.has(p.id)).sort((a, b) => (b.ovr || 0) - (a.ovr || 0));
  for (const p of rest) {
    if (picks.length >= count) break;
    picks.push(p);
  }
  return picks.slice(0, count);
}

export function selectBestXI(fullSquad, formation) {
  const pool = (fullSquad || []).filter(Boolean);
  const byCat = { GK: [], DF: [], MF: [], FW: [] };
  pool.forEach((p) => {
    const cat = getPosCategory(p.pos);
    if (byCat[cat]) byCat[cat].push(p);
  });
  ['GK', 'DF', 'MF', 'FW'].forEach((cat) => byCat[cat].sort((a, b) => (b.ovr || 0) - (a.ovr || 0)));

  const selected = [];
  const usedIds = new Set();

  // 1. Eng kuchli darvozabon
  if (byCat.GK[0]) { selected.push(byCat.GK[0]); usedIds.add(byCat.GK[0].id); }

  const need = { DF: formation.df, MF: formation.mf, FW: formation.fw };

  // 2. Har toifadan (chap/o'ng balansini saqlagan holda) eng kuchlilarini tanlash
  ['DF', 'MF', 'FW'].forEach((cat) => {
    const candidates = byCat[cat].filter((p) => !usedIds.has(p.id));
    const picks = pickCategoryPlayers(candidates, need[cat]);
    picks.forEach((p) => { selected.push(p); usedIds.add(p.id); });
  });

  // 3. Agar biror toifada yetarli o'yinchi bo'lmasa — avval ALTPOS orqali mos
  // keladigan versatile o'yinchilardan, keyin istalgan qolgan o'yinchidan to'ldiramiz
  ['DF', 'MF', 'FW'].forEach((cat) => {
    let stillNeed = need[cat] - selected.filter((p) => getPosCategory(p.pos) === cat).length;
    if (stillNeed <= 0) return;

    const altCandidates = pool
      .filter((p) => !usedIds.has(p.id) && (p.altPos || []).some((ap) => getPosCategory(ap) === cat))
      .sort((a, b) => (b.ovr || 0) - (a.ovr || 0));
    for (const p of altCandidates) {
      if (stillNeed <= 0) break;
      selected.push(p); usedIds.add(p.id); stillNeed--;
    }

    if (stillNeed > 0) {
      const rest = pool.filter((p) => !usedIds.has(p.id) && p.pos !== 'GK').sort((a, b) => (b.ovr || 0) - (a.ovr || 0));
      for (const p of rest) {
        if (stillNeed <= 0) break;
        selected.push(p); usedIds.add(p.id); stillNeed--;
      }
    }
  });

  const bench = pool.filter((p) => !usedIds.has(p.id));
  return { startingXI: selected, bench };
}
