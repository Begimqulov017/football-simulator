// ============================================================
// SOFASCORE USLUBIDAGI REYTING TIZIMI (Phase 2)
// ============================================================
// G'oya: har bir o'yinchi "performance points" (pts) to'playdi. Ijobiy
// harakatlar (gol, assist, aniq pas, seyv, tackle) pts qo'shadi, salbiylari
// (xato pas, o'tkazib yuborilgan imkoniyat, kartochka) ayiradi.
//
//   rating = 6.0 + 4 * (1 - e^(-pts / K))     (pts >= 0)
//   rating = 6.0 + 2 * (1 - e^( pts / K2))    (pts <  0, pastga tomon yumshoq)
//
// Yuqoriga qarab egri chiziq 10.0 ga ASIMPTOTIK yaqinlashadi:
//   ~7.0  -> yaxshi o'yin, ~8.0 -> gol + assist darajasi,
//   9.0   -> juda kam (multi-gol + assist + xatosiz paslar + xavfli vaziyatlar),
//   10.0  -> amalda erishib bo'lmaydi (ko'rsatish uchun pts >= ~13 kerak).
import { rand } from './rng';

export const RATING_BASE = 6.0;
export const RATING_MIN = 3.0;
export const RATING_MAX = 10.0;
const K_UP = 4.0;
const K_DOWN = 4.0;

export const ptsToRating = (pts) => {
  const r = pts >= 0
    ? RATING_BASE + 4 * (1 - Math.exp(-pts / K_UP))
    : RATING_BASE - 3 * (1 - Math.exp(pts / K_DOWN));
  return Math.round(Math.max(RATING_MIN, Math.min(RATING_MAX, r)) * 100) / 100;
};

// Ko'rsatish uchun: 1 xona. 9.95+ bo'lmaguncha "10.0" chiqmaydi (yumaloqlash tuzog'iga
// tushmaslik uchun floor'ga yaqin yumaloqlaymiz).
export const formatRating = (r) => (r >= 9.95 ? '10.0' : Math.min(9.9, Math.round(r * 10) / 10).toFixed(1));

// Sofascore rang tizimi (badge fon rangi)
export const ratingColor = (r) => {
  if (r >= 9.0) return '#0284C7'; // ko'k — a'lo
  if (r >= 8.0) return '#10B981'; // yashil
  if (r >= 7.0) return '#65A30D'; // och yashil
  if (r >= 6.0) return '#F59E0B'; // to'q sariq
  return '#EF4444'; // qizil
};

const isDef = (pos) => ['CB', 'LB', 'RB'].includes(pos);
const isMid = (pos) => ['CM', 'CDM', 'CAM', 'LM', 'RM'].includes(pos);

// ---- HODISALAR JADVALI (pts) ----
export const RATING_EVENTS = {
  GOAL: (p) => (isDef(p.pos) ? 1.7 : isMid(p.pos) ? 1.5 : 1.3),
  PENALTY_GOAL: () => 0.8,
  PENALTY_MISSED: () => -1.0,
  ASSIST: () => 0.9,
  KEY_PASS: () => 0.25, // xavfli vaziyat yaratdi (zarbaga olib kelgan pas)
  SHOT_ON_TARGET: () => 0.18,
  SHOT_OFF_TARGET: () => -0.06,
  BIG_CHANCE_MISSED: () => -0.45,
  SAVE: (p, big) => (big ? 0.45 : 0.18),
  GOAL_CONCEDED_GK: () => -0.35,
  GOAL_CONCEDED_DEF: (p) => (isDef(p.pos) ? -0.3 : p.pos === 'CDM' ? -0.15 : 0),
  OWN_GOAL: () => -1.3,
  TACKLE_WON: () => 0.15,
  FOUL: () => -0.1,
  OFFSIDE: () => -0.06,
  YELLOW: () => -0.5,
  RED: () => -2.2,
  TEAM_GOAL_FOR: () => 0.06, // butun jamoaga: o'z jamoasi gol urganda
  TEAM_GOAL_AGAINST: () => -0.06,
  MINUTE_PRESENCE: () => 0.005,
};

// Toza varaq (clean sheet) bonusi — faqat 60+ daqiqa o'ynaganlarga
export const cleanSheetBonus = (player, minutes) => {
  if (minutes < 60) return 0;
  if (player.pos === 'GK') return 0.9;
  if (isDef(player.pos)) return 0.6;
  if (player.pos === 'CDM') return 0.25;
  return 0;
};

// ---- PASSLAR SIMULYATSIYASI ----
// Daqiqasiga urinishlar (~90 daqiqada: DF ~45, MF ~55, FW ~30, GK ~28)
const PASS_RATE = { GK: 0.3, DF: 0.5, MF: 0.62, FW: 0.34 };
const cat = (pos) => {
  if (pos === 'GK') return 'GK';
  if (['CB', 'LB', 'RB'].includes(pos)) return 'DF';
  if (['ST', 'CF', 'SS', 'LW', 'RW'].includes(pos)) return 'FW';
  return 'MF';
};

// possShare — jamoaning ball egaligi ulushi (0..1), pressure — raqib himoya/o'rta bosimi (0.9..1.1)
export const rollPasses = (player, possShare = 0.5, pressure = 1) => {
  const stats = player.stats || {};
  const pas = stats.pas || 60;
  const stamina = player.stamina !== undefined ? player.stamina : 100;
  const lambda = (PASS_RATE[cat(player.pos)] || 0.5) * (0.6 + possShare * 0.8);
  // Puasson'ga yaqin: 0..3 urinish
  let att = 0;
  let l = lambda;
  while (l > 0) { if (rand() < Math.min(1, l)) att += 1; l -= 1; }
  if (rand() < lambda * 0.35) att += 1;
  if (att === 0) return { att: 0, ok: 0 };

  const base = 0.5 + (pas / 100) * 0.42; // pas=60 -> 0.75, pas=90 -> 0.88
  const fatigue = 1 - ((100 - stamina) / 100) * 0.12;
  const accuracy = Math.max(0.5, Math.min(0.96, (base * fatigue) / pressure));
  let ok = 0;
  for (let i = 0; i < att; i += 1) if (rand() < accuracy) ok += 1;
  return { att, ok };
};

export const PASS_OK_PTS = 0.012;
export const PASS_FAIL_PTS = -0.035;

// Sof performance bo'yicha yakuniy pts (bitta o'yinchi uchun)
export const performanceToPts = (perf, player = {}) => {
  if (!perf) return 0;
  let pts = perf.pts || 0;
  pts += (perf.minutes || 0) * RATING_EVENTS.MINUTE_PRESENCE();
  pts += (perf.passOk || 0) * PASS_OK_PTS + ((perf.passAtt || 0) - (perf.passOk || 0)) * PASS_FAIL_PTS;
  pts += perf.cleanSheetBonus || 0;
  return pts;
};

export const performanceToRating = (perf, player) => ptsToRating(performanceToPts(perf, player));

// Boshlang'ich (bo'sh) performance yozuvi
export const emptyPerf = () => ({
  pts: 0, minutes: 0, passAtt: 0, passOk: 0, cleanSheetBonus: 0,
});
