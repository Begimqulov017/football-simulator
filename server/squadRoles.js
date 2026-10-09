// ============================================================================
// JAMOA ROLLARI: asosiy 11lik / zaxira skameykasi (bench) / rezerv (reserve)
// ----------------------------------------------------------------------------
// Bu yerda HECH QANDAY tarkib qo'lda kiritilmaydi. teamsData'dagi o'yinchilar tartibi
// (masalan "birinchi 11 tasi asosiy") hisobga olinmaydi: o'yin har safar o'yinchilarning
// JORIY reytingi (ovr) va pozitsiyasiga qarab o'zi hisoblaydi. Reyting o'zgarsa (trening,
// admin, transfer, qarilik) - tarkib ham o'zgaradi.
//   1) Asosiy 11lik: har bir pozitsiya uchun SHU pozitsiyadagi eng kuchli o'yinchi
//      (GK, LB, RB, 2xCB, 3xo'rta maydon, 3xhujum). Pozitsiya bo'yicha odam yetmasa -
//      altPos (qo'shimcha pozitsiya), keyin yaqin pozitsiya, oxirida istalgan eng kuchli.
//   2) Bench (9 ta): zaxira darvozabon + har chiziqdan eng kuchli qolganlar.
//   3) Reserve: qolgan hamma.
// ============================================================================
const BENCH_SIZE = 9;
const SLOT_POS = {
  GK: ['GK'], LB: ['LB', 'LWB'], RB: ['RB', 'RWB'], CB: ['CB'],
  MID: ['CDM', 'CM', 'CAM', 'LM', 'RM'], FW: ['ST', 'CF', 'SS', 'LW', 'RW'],
};
const NEED_433 = { GK: 1, LB: 1, CB: 2, RB: 1, MID: 3, ST: 1, LW: 1, RW: 1 };
const EXACT = { ST: ['ST', 'CF', 'SS'], LW: ['LW', 'LM'], RW: ['RW', 'RM'] };
const FALLBACK = {
  GK: [], LB: ['CB', 'RB', 'LM'], RB: ['CB', 'LB', 'RM'], CB: ['CDM', 'LB', 'RB'],
  MID: ['CB', 'LW', 'RW', 'LB', 'RB'], FW: ['CAM', 'LM', 'RM', 'CM'],
};
const slotOfPos = (pos) => Object.keys(SLOT_POS).find((k) => SLOT_POS[k].includes(pos)) || 'MID';
const ovrOf = (p) => (p && p.ovr != null ? p.ovr : 0);

function pickByPosition(pool, used, slot) {
  const free = pool.filter((p) => !used.has(p.id));
  const exact = EXACT[slot];
  // Hujum joylari (ST/LW/RW): avval aynan shu pozitsiya, keyin istalgan hujumchi.
  if (exact) {
    let fw = free.find((p) => exact.includes(p.pos) && p.pos !== 'GK');
    if (!fw) fw = free.find((p) => (p.altPos || []).some((ap) => exact.includes(ap)));
    if (!fw) fw = free.find((p) => slotOfPos(p.pos) === 'FW');
    if (!fw) fw = free.find((p) => (FALLBACK.FW || []).includes(p.pos));
    if (!fw) fw = free.find((p) => p.pos !== 'GK');
    return fw || null;
  }
  // 1) o'z pozitsiyasidagi eng kuchli
  let pick = free.find((p) => slotOfPos(p.pos) === slot);
  // 2) qo'shimcha pozitsiyasi (altPos) mos keladigan
  if (!pick) pick = free.find((p) => (p.altPos || []).some((ap) => slotOfPos(ap) === slot) && p.pos !== 'GK');
  // 3) yaqin pozitsiya
  if (!pick) pick = free.find((p) => (FALLBACK[slot] || []).includes(p.pos));
  // 4) hech narsa topilmasa - darvozabondan boshqa istalgan eng kuchli
  if (!pick && slot !== 'GK') pick = free.find((p) => p.pos !== 'GK');
  return pick || null;
}

// squad: [{id, pos, ovr, altPos?}]. Natija: { xi: [...], bench: [...], reserves: [...] } (har biri ovr bo'yicha).
function computeSquadRoles(squad, need) {
  const pool = (squad || []).filter(Boolean).slice().sort((a, b) => ovrOf(b) - ovrOf(a));
  const slots = need || NEED_433;
  const used = new Set();
  const xi = [];
  // Avval kam sonli (GK, LB, RB), keyin CB, MID, FW - tor pozitsiyalar yaxshi odamini yo'qotmasin.
  ['GK', 'LB', 'RB', 'CB', 'ST', 'LW', 'RW', 'MID'].forEach((slot) => {
    for (let i = 0; i < (slots[slot] || 0); i += 1) {
      const pick = pickByPosition(pool, used, slot);
      if (pick) { used.add(pick.id); xi.push(pick); }
    }
  });
  xi.sort((a, b) => ovrOf(b) - ovrOf(a));

  const rest = pool.filter((p) => !used.has(p.id));
  const bench = [];
  const benchIds = new Set();
  const take = (p) => { if (p && !benchIds.has(p.id) && bench.length < BENCH_SIZE) { bench.push(p); benchIds.add(p.id); } };
  take(rest.find((p) => p.pos === 'GK')); // zaxira darvozabon
  // har bir chiziqdan kamida 1-2 kishi (himoya, o'rta, hujum) - keyin qolgan eng kuchlilar
  const lineOf = (p) => (p.pos === 'GK' ? 'GK' : slotOfPos(p.pos) === 'FW' ? 'FW' : slotOfPos(p.pos) === 'MID' ? 'MID' : 'DF');
  ['DF', 'DF', 'MID', 'MID', 'FW', 'FW'].forEach((line) => take(rest.find((p) => !benchIds.has(p.id) && lineOf(p) === line)));
  rest.forEach((p) => take(p));
  bench.sort((a, b) => ovrOf(b) - ovrOf(a));
  const reserves = rest.filter((p) => !benchIds.has(p.id));
  return { xi, bench, reserves };
}

// Bitta o'yinchi hozir qaysi rolda: 'starter' | 'bench' | 'reserve' (squad ichida bo'lishi shart).
function roleOf(squad, playerId) {
  const r = computeSquadRoles(squad);
  if (r.xi.some((p) => p.id === playerId)) return 'starter';
  if (r.bench.some((p) => p.id === playerId)) return 'bench';
  return 'reserve';
}

// Jamoa kuchi: asosiy 11lik ovr o'rtachasi (pozitsiyalar to'g'ri joylashgan holda).
function lineupStrength(squad, fallback) {
  const { xi } = computeSquadRoles(squad);
  if (!xi.length) return fallback == null ? 70 : fallback;
  return xi.reduce((s, p) => s + (p.ovr || 68), 0) / xi.length;
}

module.exports = { BENCH_SIZE, computeSquadRoles, roleOf, lineupStrength, slotOfPos };
