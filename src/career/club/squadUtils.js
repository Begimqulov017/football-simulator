import { FORMATIONS, selectBestXI, buildPitchSlots, getFormationLayout } from '../../utils/formations';
import { getPosCategory } from '../../utils/engine';

// ---------------------------------------------------------------------------
// Names
// ---------------------------------------------------------------------------
const PARTICLES = new Set(['de', 'da', 'do', 'dos', 'das', 'di', 'van', 'von', 'der', 'den', 'le', 'la', 'el', 'al', 'bin', 'ten', 'ter']);
const SUFFIXES = new Set(['jr', 'jr.', 'junior', 'júnior', 'filho', 'neto', 'sr', 'sr.']);

// Remote teammates arrive as "Name (username)" - the pitch only wants the name.
export function cleanName(name = '') {
  return String(name).replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
}

// "Trent Alexander-Arnold" -> "Alexander-Arnold", "Kevin De Bruyne" -> "De Bruyne",
// "Vinícius Júnior" -> "Vinícius Júnior", "Rodrygo" -> "Rodrygo".
export function getSurname(name) {
  const parts = cleanName(name).split(' ').filter(Boolean);
  if (parts.length <= 1) return parts[0] || '?';
  let end = parts.length - 1;
  if (SUFFIXES.has(parts[end].toLowerCase()) && parts.length > 1) {
    return parts.slice(-2).join(' ');
  }
  let start = end;
  while (start > 1 && PARTICLES.has(parts[start - 1].toLowerCase())) start -= 1;
  return parts.slice(start).join(' ');
}

export function initials(name) {
  return cleanName(name).split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?';
}

// ---------------------------------------------------------------------------
// Position groups
// ---------------------------------------------------------------------------
export const CAT_LABEL = { GK: 'Goalkeepers', DF: 'Defenders', MF: 'Midfielders', FW: 'Forwards' };
export const CAT_SHORT = { GK: 'GK', DF: 'DEF', MF: 'MID', FW: 'ATT' };
// Static hex values (Tailwind JIT can't see dynamically-built class names).
export const CAT_COLOR = { GK: '#D97706', DF: '#0284C7', MF: '#059669', FW: '#E11D48' };

export const catOf = (pos) => getPosCategory(pos);

// ---------------------------------------------------------------------------
// Lineup
// ---------------------------------------------------------------------------
// How well a player suits the slot they were given:
//   natural position -> 100, covering through a listed alt position -> 75,
//   anything else -> 45 ("out of position").
function slotFit(player, category) {
  if (catOf(player.pos) === category) return { fit: 100, kind: 'natural' };
  if ((player.altPos || []).some((ap) => catOf(ap) === category)) return { fit: 75, kind: 'cover' };
  return { fit: 45, kind: 'out' };
}

export function buildLineup(squad, formation) {
  const { startingXI, bench: rawBench } = selectBestXI(squad, formation);
  const rawSlots = buildPitchSlots(startingXI, formation);
  const slots = rawSlots.map((s) => ({ ...s, ...slotFit(s.player, s.category) }));

  // buildPitchSlots silently drops anyone it has no coordinates for - make
  // sure those players land on the bench instead of vanishing.
  const placed = new Set(slots.map((s) => s.player.id));
  const overflow = startingXI.filter((p) => !placed.has(p.id));
  const bench = [...rawBench, ...overflow].sort((a, b) => (b.ovr || 0) - (a.ovr || 0));

  // Pins for positions nobody could fill (squad too thin) so the pitch still
  // shows the whole shape of the formation.
  const layout = getFormationLayout(formation);
  const filled = { GK: 0, DF: 0, MF: 0, FW: 0 };
  slots.forEach((s) => { filled[s.category] += 1; });
  const emptySlots = [];
  Object.keys(layout).forEach((cat) => {
    layout[cat].slice(filled[cat]).forEach((pos) => emptySlots.push({ category: cat, x: pos.x, y: pos.y }));
  });

  return { slots, emptySlots, bench };
}

// Matchday bench: 9 substitutes, always carrying a backup keeper if one exists.
export const MATCHDAY_BENCH = 9;
export function splitBench(bench) {
  const ordered = [...bench];
  const gkIdx = ordered.findIndex((p) => catOf(p.pos) === 'GK');
  const matchday = [];
  if (gkIdx !== -1) matchday.push(ordered.splice(gkIdx, 1)[0]);
  while (matchday.length < MATCHDAY_BENCH && ordered.length) matchday.push(ordered.shift());
  matchday.sort((a, b) => (b.ovr || 0) - (a.ovr || 0));
  return { matchday, reserves: ordered };
}

// ---------------------------------------------------------------------------
// Chemistry
// ---------------------------------------------------------------------------
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const stdev = (arr) => {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(mean(arr.map((v) => (v - m) ** 2)));
};

// Chemistry = 70% "does everyone play where they belong" + 30% "is the XI
// even in quality" (a huge OVR gap inside a line hurts cohesion). Missing
// starters cost 6 points each.
export function computeChemistry(slots) {
  if (!slots.length) return { overall: 0, lines: [], issues: [], avgOvr: 0 };

  const lines = ['GK', 'DF', 'MF', 'FW'].map((cat) => {
    const inLine = slots.filter((s) => s.category === cat);
    if (!inLine.length) return null;
    const fitAvg = mean(inLine.map((s) => s.fit));
    const cohesion = clamp(100 - stdev(inLine.map((s) => s.player.ovr || 0)) * 5, 40, 100);
    return { cat, score: Math.round(fitAvg * 0.7 + cohesion * 0.3), count: inLine.length, avgOvr: Math.round(mean(inLine.map((s) => s.player.ovr || 0))) };
  }).filter(Boolean);

  const fitAvg = mean(slots.map((s) => s.fit));
  const cohesion = clamp(100 - stdev(slots.map((s) => s.player.ovr || 0)) * 4, 40, 100);
  const missing = Math.max(0, 11 - slots.length);
  const overall = clamp(Math.round(fitAvg * 0.7 + cohesion * 0.3 - missing * 6), 0, 100);

  const issues = slots
    .filter((s) => s.kind !== 'natural')
    .map((s) => ({ id: s.player.id, name: s.player.name, pos: s.player.pos, category: s.category, kind: s.kind }));

  return { overall, lines, issues, avgOvr: Math.round(mean(slots.map((s) => s.player.ovr || 0))) };
}

export function chemistryLabel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Poor';
}

// ---------------------------------------------------------------------------
// Tactics
// ---------------------------------------------------------------------------
export const DEFAULT_TACTICS = {
  formation: '4-3-3',
  auto: true,      // let the mindset slider pick the best-fitting formation
  mindset: 55,     // 0 = very defensive, 100 = very attacking
  pressing: 50,    // 0 = low block,      100 = high press
  width: 50,       // 0 = narrow,         100 = wide
  tempo: 50,       // 0 = patient build-up, 100 = direct
};

const KEY = (playerId) => `fs_club_tactics_v1:${playerId}`;

export function loadTactics(playerId) {
  try {
    const raw = localStorage.getItem(KEY(playerId));
    return raw ? { ...DEFAULT_TACTICS, ...JSON.parse(raw) } : { ...DEFAULT_TACTICS };
  } catch (err) {
    return { ...DEFAULT_TACTICS };
  }
}

export function saveTactics(playerId, tactics) {
  try {
    localStorage.setItem(KEY(playerId), JSON.stringify(tactics));
  } catch (err) {
    /* storage full / blocked - tactics just won't persist */
  }
}

export const formationByName = (name) => FORMATIONS.find((f) => f.name === name) || FORMATIONS[0];

// Best formation for this squad at a given mindset: close to the wanted
// attack/defence balance, with good chemistry and no empty positions.
export function suggestFormation(squad, mindset) {
  const target = ((mindset - 50) / 50) * 0.5;
  let best = FORMATIONS[0];
  let bestScore = -Infinity;
  FORMATIONS.forEach((f) => {
    const { slots, emptySlots } = buildLineup(squad, f);
    const chem = computeChemistry(slots).overall;
    const balance = f.attack - f.defense;
    const score = chem - Math.abs(balance - target) * 120 - emptySlots.length * 30;
    if (score > bestScore) { bestScore = score; best = f; }
  });
  return best;
}

// What the sliders add up to, as multipliers around 1.00.
export function tacticalOutput(formation, tactics) {
  const shift = (tactics.mindset - 50) / 50; // -1..1
  return {
    attack: formation.attack * (1 + shift * 0.10),
    defence: formation.defense * (1 - shift * 0.10),
  };
}
