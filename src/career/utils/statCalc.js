// ---------------------------------------------------------------------------
// Stat & OVR calculation engine
// ---------------------------------------------------------------------------
// Every outfield player has 6 main stats (PAC, SHO, PAS, DRI, DEF, PHY).
// Each main stat is itself a weighted average of "sub-stats" (the individual
// attributes a real career-mode game would track). Training, gear, coaches
// etc. will eventually push sub-stats up; the main stat is always *derived*,
// never edited directly, so it can never get out of sync.
// ---------------------------------------------------------------------------

// Sub-stat weights per main stat. Keys are sub-stat ids, values are their
// share (0-1) of the main stat. Every group sums to 1.
export const SUB_STAT_WEIGHTS = {
  pac: {
    acceleration: 0.45,
    sprintSpeed: 0.55
  },
  sho: {
    finishing: 0.45,
    shotPower: 0.20,
    positioning: 0.20,
    longShots: 0.10,
    volleys: 0.05
  },
  pas: {
    shortPassing: 0.35,
    longPassing: 0.30,
    vision: 0.20,
    crossing: 0.10,
    curve: 0.05
  },
  dri: {
    dribbling: 0.50,
    ballControl: 0.35,
    agility: 0.10,
    balance: 0.05
  },
  def: {
    defensiveAwareness: 0.30,
    standingTackle: 0.30,
    slidingTackle: 0.20,
    interceptions: 0.20
  },
  phy: {
    strength: 0.50,
    stamina: 0.25,
    aggression: 0.20,
    jumping: 0.05
  }
};

// Position weight tables for OVR. Each main stat's share (0-1) of the final
// overall rating for that position. Keeping them summed to 1 makes OVR land
// on the same 0-100 scale as the main stats themselves.
export const POSITION_WEIGHTS = {
  GK: { pac: 0.00, sho: 0.00, pas: 0.10, dri: 0.05, def: 0.05, phy: 0.05 }, // GK uses its own sub-stat block, see calcGoalkeeperOVR
  CB: { pac: 0.10, sho: 0.00, pas: 0.10, dri: 0.05, def: 0.55, phy: 0.20 },
  LB: { pac: 0.20, sho: 0.05, pas: 0.15, dri: 0.15, def: 0.35, phy: 0.10 },
  RB: { pac: 0.20, sho: 0.05, pas: 0.15, dri: 0.15, def: 0.35, phy: 0.10 },
  CDM: { pac: 0.10, sho: 0.05, pas: 0.20, dri: 0.10, def: 0.40, phy: 0.15 },
  CM: { pac: 0.10, sho: 0.10, pas: 0.30, dri: 0.20, def: 0.15, phy: 0.15 },
  CAM: { pac: 0.10, sho: 0.20, pas: 0.30, dri: 0.30, def: 0.02, phy: 0.08 },
  LM: { pac: 0.20, sho: 0.15, pas: 0.25, dri: 0.25, def: 0.07, phy: 0.08 },
  RM: { pac: 0.20, sho: 0.15, pas: 0.25, dri: 0.25, def: 0.07, phy: 0.08 },
  LW: { pac: 0.25, sho: 0.20, pas: 0.15, dri: 0.30, def: 0.02, phy: 0.08 },
  RW: { pac: 0.25, sho: 0.20, pas: 0.15, dri: 0.30, def: 0.02, phy: 0.08 },
  ST: { pac: 0.20, sho: 0.40, pas: 0.10, dri: 0.20, def: 0.00, phy: 0.10 }
};

export const GK_SUB_STAT_WEIGHTS = {
  diving: 0.22,
  handling: 0.20,
  kicking: 0.13,
  reflexes: 0.25,
  speed: 0.05,
  positioning: 0.15
};

const clamp = (n, min = 0, max = 99) => Math.max(min, Math.min(max, Math.round(n)));

// Weighted average of an object of { key: value } against a { key: weight } map.
function weightedAverage(values, weights) {
  let total = 0;
  let weightSum = 0;
  Object.entries(weights).forEach(([key, weight]) => {
    if (values[key] === undefined || values[key] === null) return;
    total += values[key] * weight;
    weightSum += weight;
  });
  if (weightSum === 0) return 0;
  return total / weightSum;
}

// Turn a set of sub-stats into the 6 main stats (PAC/SHO/PAS/DRI/DEF/PHY).
export function calcMainStats(subStats) {
  const mains = {};
  Object.entries(SUB_STAT_WEIGHTS).forEach(([mainKey, weights]) => {
    mains[mainKey] = clamp(weightedAverage(subStats, weights));
  });
  return mains;
}

// Goalkeeper overall is simply its own weighted sub-stat block.
export function calcGoalkeeperOVR(gkSubStats) {
  return clamp(weightedAverage(gkSubStats, GK_SUB_STAT_WEIGHTS));
}

// Outfield overall rating for a given position, from the 6 main stats.
export function calcOVR(position, mainStats) {
  if (position === 'GK') return mainStats.ovr || 0;
  const weights = POSITION_WEIGHTS[position] || POSITION_WEIGHTS.CM;
  return clamp(weightedAverage(mainStats, weights));
}

// Generate a plausible sub-stat spread for a target main-stat value, so a
// freshly-created player's radar chart doesn't look perfectly flat.
export function generateSubStatsForMain(mainKey, targetValue, rng = Math.random) {
  const weights = SUB_STAT_WEIGHTS[mainKey];
  const subStats = {};
  Object.keys(weights).forEach((key) => {
    const variance = (rng() - 0.5) * 10; // +/-5
    subStats[key] = clamp(targetValue + variance);
  });
  return subStats;
}

export function generateGkSubStats(targetValue, rng = Math.random) {
  const subStats = {};
  Object.keys(GK_SUB_STAT_WEIGHTS).forEach((key) => {
    const variance = (rng() - 0.5) * 10;
    subStats[key] = clamp(targetValue + variance);
  });
  return subStats;
}

// Human labels, used by the Profile page stat breakdown.
export const SUB_STAT_LABELS = {
  acceleration: 'Acceleration', sprintSpeed: 'Sprint Speed',
  finishing: 'Finishing', shotPower: 'Shot Power', positioning: 'Positioning',
  longShots: 'Long Shots', volleys: 'Volleys',
  shortPassing: 'Short Passing', longPassing: 'Long Passing', vision: 'Vision',
  crossing: 'Crossing', curve: 'Curve',
  dribbling: 'Dribbling', ballControl: 'Ball Control', agility: 'Agility', balance: 'Balance',
  defensiveAwareness: 'Def. Awareness', standingTackle: 'Standing Tackle',
  slidingTackle: 'Sliding Tackle', interceptions: 'Interceptions',
  strength: 'Strength', stamina: 'Stamina', aggression: 'Aggression', jumping: 'Jumping',
  diving: 'Diving', handling: 'Handling', kicking: 'Kicking', reflexes: 'Reflexes', speed: 'Speed'
};

export const MAIN_STAT_LABELS = {
  pac: 'PAC', sho: 'SHO', pas: 'PAS', dri: 'DRI', def: 'DEF', phy: 'PHY',
  // Goalkeepers show their own stat block instead of the outfield 6.
  diving: 'DIVING', handling: 'HANDLING', kicking: 'KICKING',
  reflexes: 'REFLEXES', speed: 'SPEED', positioning: 'POSITIONING'
};

// ---------------------------------------------------------------------------
// Training system (not wired up to the UI yet — Training page is "not
// started" per current scope — but the mechanics are specified here ready
// for when it's built).
// ---------------------------------------------------------------------------
export const TRAINING_FOCUS = {
  HIGH_RISK: { id: 'HIGH_RISK', label: 'High Risk / High Reward', statGain: 2.5, staminaCost: 20, injuryRisk: 0.12 },
  BALANCED: { id: 'BALANCED', label: 'Balanced', statGain: 1, staminaCost: 10, injuryRisk: 0.04 },
  LIGHT: { id: 'LIGHT', label: 'Light', statGain: 0.5, staminaCost: 5, injuryRisk: 0.01 }
};

// Training gain isn't a flat "+1/+2/+3" - it scales with training intensity,
// age (growth years train faster), and how much headroom is left before the
// player's potential ceiling (gains slow down the closer you get to it), with
// some randomness on top so no two sessions feel identical.
export function computeTrainingGain(focusId, age, potential, currentOvr) {
  const focus = TRAINING_FOCUS[focusId];
  if (!focus) return 0;
  const ageMult = age <= 29 ? (getAgeMultiplier(age) || 0.3) : 0.3;
  const room = Math.max(0, potential - currentOvr);
  const roomFactor = 0.25 + Math.min(1, room / 20) * 0.75;
  const variance = 0.6 + Math.random() * 0.8;
  return Math.round(focus.statGain * ageMult * roomFactor * variance * 100) / 100;
}

export function clampStat(n, min = 0, max = 99) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function getAgeMultiplier(age) {
  if (age >= 17 && age <= 23) return 1.5; // growth years
  if (age >= 24 && age <= 29) return 1.0; // prime
  return 0.0; // 30+, handled by regression/prime-retention logic instead
}

// 30+ players keep growing only while they keep performing (avg match rating
// over their recent games > 7.5); otherwise their stats regress slightly.
export function resolveVeteranProgression(age, recentAvgRating) {
  if (age < 30) return { multiplier: getAgeMultiplier(age), regressing: false };
  if (recentAvgRating > 7.5) return { multiplier: 1.0, regressing: false };
  return { multiplier: -0.5, regressing: true };
}
