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

// ---------------------------------------------------------------------------
// PHASE 7 - high-precision ratings
// ---------------------------------------------------------------------------
// Player sub-stats / main stats / OVR may now be stored as 2-decimal floats
// (e.g. 72.12). Legacy saves (plain integers) keep working untouched.
//   * Training page  -> shows the exact value: formatPrecise(72.12) = "72.12"
//   * Everywhere else -> displayRating(72.50) = 73, displayRating(72.49) = 72
// Because stored values are always rounded to 2 decimals first, the 72.50
// boundary is exact (no 72.4999999 float surprises).
export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export const clampPrecise = (n, min = 0, max = 99) => Math.max(min, Math.min(max, round2(n)));

// Natural rounding for every non-training UI surface. null/undefined pass
// through so callers can keep their `?? '--'` fallbacks.
export const displayRating = (n) => (n == null || Number.isNaN(Number(n)) ? null : Math.round(round2(n)));

// Exact value for the Training page ("72.12"). Always `decimals` places.
export const formatPrecise = (n, decimals = 2) => (n == null || Number.isNaN(Number(n)) ? '--' : Number(n).toFixed(decimals));

// "+0.12" / "-0.03" / "+0.00"
export const formatDelta = (n, decimals = 2) => `${n < 0 ? '-' : '+'}${Math.abs(Number(n) || 0).toFixed(decimals)}`;

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
export function calcMainStats(subStats, { precise = false } = {}) {
  const fix = precise ? clampPrecise : clamp;
  const mains = {};
  Object.entries(SUB_STAT_WEIGHTS).forEach(([mainKey, weights]) => {
    mains[mainKey] = fix(weightedAverage(subStats, weights));
  });
  return mains;
}

// Goalkeeper overall is simply its own weighted sub-stat block.
export function calcGoalkeeperOVR(gkSubStats, { precise = false } = {}) {
  return (precise ? clampPrecise : clamp)(weightedAverage(gkSubStats, GK_SUB_STAT_WEIGHTS));
}

// Outfield overall rating for a given position, from the 6 main stats.
export function calcOVR(position, mainStats, { precise = false } = {}) {
  if (position === 'GK') return mainStats.ovr || 0;
  const weights = POSITION_WEIGHTS[position] || POSITION_WEIGHTS.CM;
  return (precise ? clampPrecise : clamp)(weightedAverage(mainStats, weights));
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
// A player's OVR can't just race up to their Potential in a few weeks of
// training - real development takes years. This caps how much total OVR a
// player can gain in a single in-game year, tuned so a typical prospect
// (gap of ~20-30 OVR between starting rating and Potential) doesn't actually
// reach their ceiling until somewhere around age 27-30 (a rare, very high
// potential wonderkid might still be closing the gap into their early 30s),
// matching how development actually tails off with age in real football.
export function yearlyOvrCap(age) {
  if (age <= 20) return 3.4;
  if (age <= 23) return 2.2;
  if (age <= 27) return 1.1;
  if (age <= 30) return 0.5;
  return 0.15;
}

export const TRAINING_FOCUS = {
  HIGH_RISK: { id: 'HIGH_RISK', label: 'High Risk / High Reward', statGain: 1.7, staminaCost: 20, injuryRisk: 0.12 },
  BALANCED: { id: 'BALANCED', label: 'Balanced', statGain: 0.7, staminaCost: 10, injuryRisk: 0.04 },
  LIGHT: { id: 'LIGHT', label: 'Light', statGain: 0.35, staminaCost: 5, injuryRisk: 0.01 }
};

// Training gain isn't a flat "+1/+2/+3" - it scales with training intensity,
// age (growth years train faster), and how much headroom is left before the
// player's potential ceiling. That last part now falls off MUCH more sharply
// than a simple straight line: with 15+ OVR of headroom you train at close
// to full speed, but the last handful of points before your Potential ceiling
// are noticeably slow to earn (e.g. only 2 OVR of room left trains at
// roughly a tenth of full speed) - climbing all the way to your ceiling
// should feel like a season-long grind, not a couple of weeks.
export function computeTrainingGain(focusId, age, potential, currentOvr, rng = Math.random) {
  const focus = TRAINING_FOCUS[focusId];
  if (!focus) return 0;
  const ageMult = age <= 29 ? (getAgeMultiplier(age) || 0.3) : 0.3;
  const room = Math.max(0, potential - currentOvr);
  const roomFactor = Math.pow(Math.min(1, room / 15), 1.7) * 0.9 + 0.05;
  const variance = 0.55 + rng() * 0.7;
  return Math.round(focus.statGain * ageMult * roomFactor * variance * 100) / 100;
}

// ---------------------------------------------------------------------------
// PHASE 7 - one full training session, as a pure function.
// ---------------------------------------------------------------------------
// Takes the current player + the 3 chosen main stats + a focus, and returns
//   patch  - the fields to merge into the player (overall/subStats/mainStats/career)
//   report - an exact, per-attribute breakdown for the UI (also saved on
//            career.lastTraining so the Training page can show it again later)
// Each chosen main stat gets its own random roll (0.6-1.4x, mean 1.0) and so
// does every sub-attribute inside it (0.75-1.25x), so a session reads like
// "PAC +0.12, SHO +0.08, PHY +0.25" instead of the same number three times.
// The yearly OVR cap (yearlyOvrCap) still applies to the whole session.
export function simulateTrainingSession({ player, selected, focusId, rng = Math.random }) {
  const isGk = player.position === 'GK';
  const focusDef = TRAINING_FOCUS[focusId];
  const career = player.career;

  const baseGain = computeTrainingGain(focusId, player.age, player.potential, player.overall, rng);
  const fullGain = baseGain * (career.perks?.fitnessTrainer ? 1.25 : 1);

  // Roll every multiplier ONCE so scaling a session down to the yearly cap
  // keeps the relative proportions between attributes.
  const rolls = {};
  selected.forEach((key) => {
    const subKeys = isGk ? [key] : Object.keys(SUB_STAT_WEIGHTS[key] || {});
    const subs = {};
    subKeys.forEach((sk) => { subs[sk] = 0.75 + rng() * 0.5; });
    rolls[key] = { mult: 0.6 + rng() * 0.8, subs };
  });

  const applyGain = (scale) => {
    const stats = { ...player.subStats };
    selected.forEach((key) => {
      Object.entries(rolls[key].subs).forEach(([sk, m]) => {
        stats[sk] = clampPrecise((stats[sk] || 0) + fullGain * scale * rolls[key].mult * m);
      });
    });
    const mainStats = isGk ? stats : calcMainStats(stats, { precise: true });
    const ovr = isGk ? calcGoalkeeperOVR(stats, { precise: true }) : calcOVR(player.position, mainStats, { precise: true });
    return { stats, mainStats, ovr };
  };

  const preview = applyGain(1);
  const rawDelta = Math.max(0, preview.ovr - player.overall);
  const cap = yearlyOvrCap(player.age);
  const used = career.growthUsedThisYear || 0;
  const remaining = Math.max(0, cap - used);
  const scale = rawDelta > 0 ? Math.min(1, remaining / rawDelta) : 1;

  const result = scale >= 1 ? preview : applyGain(scale);
  const newOvr = round2(Math.min(result.ovr, player.potential));
  const actualDelta = Math.max(0, round2(newOvr - player.overall));

  let injury = career.injury;
  let newInjury = null;
  if (!injury && rng() < focusDef.injuryRisk) {
    injury = { daysLeft: Math.floor(rng() * 8) + 3, description: 'Training injury' };
    newInjury = injury;
  }

  const stats = {};
  selected.forEach((key) => {
    const before = player.mainStats[key] ?? 0;
    const after = result.mainStats[key] ?? before;
    stats[key] = {
      before, after, delta: round2(after - before),
      subs: Object.keys(rolls[key].subs).map((sk) => {
        const sb = player.subStats[sk] ?? 0;
        const sa = result.stats[sk] ?? sb;
        return { key: sk, before: sb, after: sa, delta: round2(sa - sb) };
      })
    };
  });

  const report = {
    date: career.gameDate,
    focus: focusId,
    ovrBefore: round2(player.overall),
    ovrAfter: newOvr,
    ovrDelta: actualDelta,
    capped: scale < 1,
    capReached: remaining <= 0,
    injury: newInjury,
    stats
  };

  return {
    patch: {
      overall: newOvr,
      subStats: result.stats,
      mainStats: result.mainStats,
      career: {
        ...career,
        trainingDate: career.gameDate,
        stamina: clampStat(career.stamina - focusDef.staminaCost, 0, 100),
        growthUsedThisYear: round2(used + actualDelta),
        injury,
        lastTraining: report
      }
    },
    report
  };
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

// 8-BAND: majburiy pensiya. Har tug'ilgan kunda (35 yoshdan boshlab) shu
// yildagi pensiyaga chiqish EHTIMOLI - foydalanuvchi bergan aniq
// foizlar bo'yicha. 45 yosh va undan katta - 100% (SHART, kafolatlangan).
const RETIREMENT_CHANCE_BY_AGE = {
  35: 0.70, 36: 0.65, 37: 0.45, 38: 0.50,
  39: 0.70, 40: 0.70, 41: 0.70,
  42: 0.80, 43: 0.80,
  44: 0.90,
};
export function getRetirementChance(age) {
  if (age < 35) return 0;
  if (age >= 45) return 1.0;
  return RETIREMENT_CHANCE_BY_AGE[age] ?? 1.0;
}

// A rating of 8.3+ in a played match is treated as a Man of the Match
// performance - shown on the post-match summary and counted on All Stats.
export const MVP_RATING_THRESHOLD = 8.3;
export function isMvpPerformance(pStats) {
  return !!pStats && pStats.played && pStats.rating >= MVP_RATING_THRESHOLD;
}
