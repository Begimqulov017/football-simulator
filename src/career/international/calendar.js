// ---------------------------------------------------------------------------
// Phase 5 — Xalqaro kalendar (server/international.js qoidalarining nusxasi).
//   • Xalqaro tanaffus: 2026-08-01 dan har 70 kunda (yoz oynasida yo'q: 1-iyun … 20-iyul)
//   • Tanaffus HAFTALIGI: tanaffus kunidan ±3 kun (jami 7 kun)
//   • Turnirlar: har yili 10-iyunda. Yil%4==2 → Jahon Chempionati,
//     yil%4==0 → Yevro, Copa América, Osiyo Kubogi, Afrika Kubogi
//   • Bosqichlar: guruh (0, +4, +8 kun), pley-off (+13 dan har 4 kunda)
// Bu faqat KO'RSATISH uchun: haqiqiy natijalar serverdan keladi.
// ---------------------------------------------------------------------------
import { addDays } from '../utils/season';
import { NATIONALITIES } from '../../data/leaguesData';

const EPOCH = '2026-08-01';
const INTERVAL = 70;
export const BREAK_HALF_WINDOW = 3;
const DAY_MS = 86400000;
const daysBetween = (a, b) => Math.round((new Date(`${b}T00:00:00Z`) - new Date(`${a}T00:00:00Z`)) / DAY_MS);
const yearOf = (iso) => Number(iso.slice(0, 4));

export const flagOfNation = (name) => (NATIONALITIES.find((n) => n.name === name) || {}).flag || '🏳️';

export function isSummerWindow(iso) {
  const y = yearOf(iso);
  return iso >= `${y}-06-01` && iso <= `${y}-07-20`;
}

export function isBreakDay(iso) {
  if (isSummerWindow(iso)) return false;
  const diff = daysBetween(EPOCH, iso);
  return diff > 0 && diff % INTERVAL === 0;
}

// `iso` ga eng yaqin tanaffus kuni (±3 kun ichida bo'lsa), aks holda null
export function breakDayNear(iso) {
  const diff = daysBetween(EPOCH, iso);
  const k = Math.round(diff / INTERVAL);
  for (const kk of [k, k - 1, k + 1]) {
    if (kk < 1) continue;
    const day = addDays(EPOCH, kk * INTERVAL);
    if (Math.abs(daysBetween(day, iso)) <= BREAK_HALF_WINDOW && isBreakDay(day)) return day;
  }
  return null;
}

export function nextBreakDay(iso) {
  let d = iso;
  for (let i = 0; i < 400; i += 1) { if (isBreakDay(d)) return d; d = addDays(d, 1); }
  return null;
}

export function tournamentsForYear(year) {
  if (year % 4 === 2) return [{ key: 'world_cup', name: 'Jahon Chempionati', size: 32 }];
  if (year % 4 === 0) {
    return [
      { key: 'euro', name: 'Yevro', size: 16 },
      { key: 'copa_america', name: 'Copa América', size: 8 },
      { key: 'asian_cup', name: 'Osiyo Kubogi', size: 16 },
      { key: 'africa_cup', name: 'Afrika Kubogi', size: 8 },
    ];
  }
  // Toq yillarda - UEFA Millatlar Ligasi (server/international.js bilan bir xil)
  if (year % 2 === 1) return [{ key: 'nations_league', name: 'Millatlar Ligasi', size: 16 }];
  return [];
}

// { start, end, matchDates:Set, names:[] } — shu yildagi turnirlar oynasi
function tournamentWindow(year) {
  const defs = tournamentsForYear(year);
  if (!defs.length) return null;
  const start = `${year}-06-10`;
  const dates = new Set([0, 4, 8].map((d) => addDays(start, d)));
  let end = addDays(start, 8);
  defs.forEach((d) => {
    const rounds = Math.log2(d.size / 2);
    for (let i = 0; i < rounds; i += 1) { const x = addDays(start, 13 + i * 4); dates.add(x); if (x > end) end = x; }
  });
  return { start, end, matchDates: dates, names: defs.map((d) => d.name) };
}

// Berilgan kun xalqaro davrga tushadimi? → { kind, label, matchDay, breakDay? } yoki null
export function getInternationalContext(iso) {
  const tw = tournamentWindow(yearOf(iso));
  if (tw && iso >= tw.start && iso <= tw.end) {
    return { kind: 'tournament', label: tw.names.length > 1 ? 'Kontinental turnirlar' : tw.names[0], names: tw.names, matchDay: tw.matchDates.has(iso) };
  }
  const b = breakDayNear(iso);
  if (b) return { kind: 'break', label: 'Xalqaro tanaffus', matchDay: iso === b, breakDay: b };
  return null;
}
