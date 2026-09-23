// ============================================================
// NATIONS + CONFEDERATIONS (server-side)
// ============================================================
// The national-team module needs two things the game did not have before:
//   1) a confederation for every nationality, so Euro / Copa America /
//      Asian Cup / Africa Cup know who is eligible for which trophy;
//   2) a nationality for EVERY player in the game, including the ~3400 NPCs
//      in clubs whose league nobody has started a career in yet.
//
// (2) is solved without storing anything: a player's nationality is derived
// deterministically from a hash of their id. The same player therefore always
// has the same nationality, whether they are read out of an evolving league
// world or straight out of the static shipped data - and no migration is
// needed when a league gets its first human player.
// ============================================================

const NATIONS = [
  // --- UEFA ---
  { name: 'Spain', flag: '🇪🇸', confederation: 'UEFA' },
  { name: 'England', flag: '🏴', confederation: 'UEFA' },
  { name: 'Germany', flag: '🇩🇪', confederation: 'UEFA' },
  { name: 'France', flag: '🇫🇷', confederation: 'UEFA' },
  { name: 'Italy', flag: '🇮🇹', confederation: 'UEFA' },
  { name: 'Portugal', flag: '🇵🇹', confederation: 'UEFA' },
  { name: 'Netherlands', flag: '🇳🇱', confederation: 'UEFA' },
  { name: 'Belgium', flag: '🇧🇪', confederation: 'UEFA' },
  { name: 'Turkey', flag: '🇹🇷', confederation: 'UEFA' },
  { name: 'Switzerland', flag: '🇨🇭', confederation: 'UEFA' },
  { name: 'Croatia', flag: '🇭🇷', confederation: 'UEFA' },
  { name: 'Serbia', flag: '🇷🇸', confederation: 'UEFA' },
  { name: 'Poland', flag: '🇵🇱', confederation: 'UEFA' },
  { name: 'Ukraine', flag: '🇺🇦', confederation: 'UEFA' },
  { name: 'Kazakhstan', flag: '🇰🇿', confederation: 'UEFA' },
  { name: 'Denmark', flag: '🇩🇰', confederation: 'UEFA' },
  { name: 'Sweden', flag: '🇸🇪', confederation: 'UEFA' },
  { name: 'Norway', flag: '🇳🇴', confederation: 'UEFA' },
  { name: 'Austria', flag: '🇦🇹', confederation: 'UEFA' },
  { name: 'Czechia', flag: '🇨🇿', confederation: 'UEFA' },
  { name: 'Scotland', flag: '🏴', confederation: 'UEFA' },
  { name: 'Wales', flag: '🏴', confederation: 'UEFA' },
  { name: 'Greece', flag: '🇬🇷', confederation: 'UEFA' },
  { name: 'Romania', flag: '🇷🇴', confederation: 'UEFA' },
  { name: 'Hungary', flag: '🇭🇺', confederation: 'UEFA' },
  { name: 'Ireland', flag: '🇮🇪', confederation: 'UEFA' },
  { name: 'Slovakia', flag: '🇸🇰', confederation: 'UEFA' },
  { name: 'Slovenia', flag: '🇸🇮', confederation: 'UEFA' },

  // --- AFC ---
  { name: 'Uzbekistan', flag: '🇺🇿', confederation: 'AFC' },
  { name: 'Saudi Arabia', flag: '🇸🇦', confederation: 'AFC' },
  { name: 'United Arab Emirates', flag: '🇦🇪', confederation: 'AFC' },
  { name: 'Qatar', flag: '🇶🇦', confederation: 'AFC' },
  { name: 'Iran', flag: '🇮🇷', confederation: 'AFC' },
  { name: 'Iraq', flag: '🇮🇶', confederation: 'AFC' },
  { name: 'Japan', flag: '🇯🇵', confederation: 'AFC' },
  { name: 'South Korea', flag: '🇰🇷', confederation: 'AFC' },
  { name: 'China', flag: '🇨🇳', confederation: 'AFC' },
  { name: 'Australia', flag: '🇦🇺', confederation: 'AFC' },
  { name: 'Tajikistan', flag: '🇹🇯', confederation: 'AFC' },
  { name: 'Kyrgyzstan', flag: '🇰🇬', confederation: 'AFC' },
  { name: 'Jordan', flag: '🇯🇴', confederation: 'AFC' },
  { name: 'Oman', flag: '🇴🇲', confederation: 'AFC' },
  { name: 'Bahrain', flag: '🇧🇭', confederation: 'AFC' },
  { name: 'Syria', flag: '🇸🇾', confederation: 'AFC' },
  { name: 'Turkmenistan', flag: '🇹🇲', confederation: 'AFC' },
  { name: 'Vietnam', flag: '🇻🇳', confederation: 'AFC' },
  { name: 'Thailand', flag: '🇹🇭', confederation: 'AFC' },
  { name: 'India', flag: '🇮🇳', confederation: 'AFC' },

  // --- CONMEBOL ---
  { name: 'Brazil', flag: '🇧🇷', confederation: 'CONMEBOL' },
  { name: 'Argentina', flag: '🇦🇷', confederation: 'CONMEBOL' },
  { name: 'Uruguay', flag: '🇺🇾', confederation: 'CONMEBOL' },
  { name: 'Colombia', flag: '🇨🇴', confederation: 'CONMEBOL' },
  { name: 'Chile', flag: '🇨🇱', confederation: 'CONMEBOL' },
  { name: 'Peru', flag: '🇵🇪', confederation: 'CONMEBOL' },
  { name: 'Ecuador', flag: '🇪🇨', confederation: 'CONMEBOL' },
  { name: 'Paraguay', flag: '🇵🇾', confederation: 'CONMEBOL' },
  { name: 'Venezuela', flag: '🇻🇪', confederation: 'CONMEBOL' },
  { name: 'Bolivia', flag: '🇧🇴', confederation: 'CONMEBOL' },

  // --- CAF ---
  { name: 'Nigeria', flag: '🇳🇬', confederation: 'CAF' },
  { name: 'Senegal', flag: '🇸🇳', confederation: 'CAF' },
  { name: 'Morocco', flag: '🇲🇦', confederation: 'CAF' },
  { name: 'Egypt', flag: '🇪🇬', confederation: 'CAF' },
  { name: 'Ghana', flag: '🇬🇭', confederation: 'CAF' },
  { name: 'Ivory Coast', flag: '🇨🇮', confederation: 'CAF' },
  { name: 'Cameroon', flag: '🇨🇲', confederation: 'CAF' },
  { name: 'Algeria', flag: '🇩🇿', confederation: 'CAF' },
  { name: 'Tunisia', flag: '🇹🇳', confederation: 'CAF' },
  { name: 'Mali', flag: '🇲🇱', confederation: 'CAF' },
  { name: 'South Africa', flag: '🇿🇦', confederation: 'CAF' },
  { name: 'DR Congo', flag: '🇨🇩', confederation: 'CAF' },

  // --- CONCACAF ---
  { name: 'USA', flag: '🇺🇸', confederation: 'CONCACAF' },
  { name: 'Mexico', flag: '🇲🇽', confederation: 'CONCACAF' },
  { name: 'Canada', flag: '🇨🇦', confederation: 'CONCACAF' },
  { name: 'Costa Rica', flag: '🇨🇷', confederation: 'CONCACAF' },
  { name: 'Jamaica', flag: '🇯🇲', confederation: 'CONCACAF' },
  { name: 'Panama', flag: '🇵🇦', confederation: 'CONCACAF' },
  { name: 'Honduras', flag: '🇭🇳', confederation: 'CONCACAF' }
];

// How many players the world assigns to each nation, relative to each other.
// Without this every nation gets an equal slice of the ~2600 NPCs, which made
// national-team strength pure noise - a 4-year test run put Bolivia in a World
// Cup final ahead of Brazil. Weights are a rough football-pyramid shape, not a
// ranking: they only decide squad DEPTH, and any nation can still get lucky
// with who it draws.
const NATION_WEIGHT = {
  Brazil: 10, France: 10, Spain: 10, England: 10, Argentina: 9, Germany: 9,
  Italy: 8, Portugal: 8, Netherlands: 7, Belgium: 6, Uruguay: 5, Croatia: 5,
  Colombia: 5, Mexico: 5, Morocco: 5, Japan: 5, 'South Korea': 4, Senegal: 4,
  Nigeria: 4, Denmark: 4, Switzerland: 4, Turkey: 4, Serbia: 4, Poland: 4,
  Ukraine: 4, Austria: 3, Sweden: 3, Norway: 3, Czechia: 3, Scotland: 3,
  Greece: 3, Romania: 3, Hungary: 3, Ireland: 3, Wales: 2, Slovakia: 2,
  Slovenia: 2, Chile: 4, Peru: 3, Ecuador: 3, Paraguay: 3, Venezuela: 2,
  Bolivia: 2, 'Ivory Coast': 4, Cameroon: 4, Algeria: 4, Tunisia: 3, Mali: 3,
  'South Africa': 3, 'DR Congo': 3, Ghana: 4, Egypt: 4, USA: 4, Canada: 3,
  'Costa Rica': 2, Jamaica: 2, Panama: 2, Honduras: 2, Uzbekistan: 3,
  'Saudi Arabia': 3, 'United Arab Emirates': 2, Qatar: 2, Iran: 4, Iraq: 3,
  China: 3, Australia: 3, Kazakhstan: 2, Tajikistan: 2, Kyrgyzstan: 2,
  Jordan: 2, Oman: 2, Bahrain: 2, Syria: 2, Turkmenistan: 2, Vietnam: 2,
  Thailand: 2, India: 2
};

// Flattened weighted pool, so a hash can index straight into it.
const WEIGHTED_POOL = [];
NATIONS.forEach((n) => {
  const w = NATION_WEIGHT[n.name] || 2;
  for (let i = 0; i < w; i += 1) WEIGHTED_POOL.push(n.name);
});

const NATION_BY_NAME = {};
NATIONS.forEach((n) => { NATION_BY_NAME[n.name] = n; });

function nationsOf(confederation) {
  return NATIONS.filter((n) => n.confederation === confederation);
}

// FNV-1a. Small, fast, and stable across runs/machines - which is the whole
// point: the same player id must always map to the same nationality.
function hashString(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// Roughly half of a club's squad is homegrown (when the club's league country
// is itself a footballing nation we know), the rest are drawn from the full
// pool. Deterministic, so it never changes for a given player.
// 4-BOSQICH: eski qiymat (0.45) va "butun dunyo bo'yicha tekis" xorijiy
// havza birgalikda ABSURD holatlarga olib kelardi - masalan Real Madrid'da
// o'ynaydigan (demak UEFA/Yevropa) futbolchi hech qanday cheklovsiz
// O'zbekistonga (AFC) "chaqirilishi" mumkin edi. Endi: (1) o'z klubi
// mamlakati ehtimoli oshirildi, (2) "xorijiy" holatda ham asosan O'ZI
// O'YNAYDIGAN KONFEDERATSIYAGA yaqin/mos millatlar orasidan tanlanadi -
// haqiqiy futbolda ham legionerlar ko'pincha yaqin mintaqalardan keladi.
const HOME_NATION_SHARE = 0.6;

// Klub o'ynaydigan konfederatsiyaga qarab, "xorijiy" futbolchi qaysi
// konfederatsiyalardan bo'lishi REALISTIK - masalan Yevropa klubida
// o'ynovchi xorijiy o'zi Yevropadan yoki Janubiy Amerika/Afrikadan bo'lishi
// odatiy, lekin bir zumda AFC (Markaziy Osiyo)ga "sakrab" ketmaydi.
const PLAUSIBLE_FOREIGN_CONFEDS = {
  UEFA: ['UEFA', 'CONMEBOL', 'CAF'],
  CONMEBOL: ['CONMEBOL', 'UEFA'],
  CAF: ['CAF', 'UEFA', 'CONMEBOL'],
  AFC: ['AFC', 'CONMEBOL', 'UEFA'],
  CONCACAF: ['CONCACAF', 'CONMEBOL', 'UEFA'],
  OFC: ['OFC', 'AFC']
};

const WEIGHTED_POOL_BY_CONFED = {};
Object.keys(PLAUSIBLE_FOREIGN_CONFEDS).forEach((confed) => {
  const allowed = new Set(PLAUSIBLE_FOREIGN_CONFEDS[confed]);
  const list = [];
  NATIONS.filter((n) => allowed.has(n.confederation)).forEach((n) => {
    const w = NATION_WEIGHT[n.name] || 2;
    for (let i = 0; i < w; i += 1) list.push(n.name);
  });
  WEIGHTED_POOL_BY_CONFED[confed] = list.length ? list : WEIGHTED_POOL;
});

function nationalityFor(playerId, homeCountry) {
  const h = hashString(String(playerId));
  const homeEligible = homeCountry && NATION_BY_NAME[homeCountry];
  if (homeEligible && (h % 1000) / 1000 < HOME_NATION_SHARE) return homeCountry;
  const homeConfed = homeEligible ? NATION_BY_NAME[homeCountry].confederation : null;
  const pool = (homeConfed && WEIGHTED_POOL_BY_CONFED[homeConfed]) || WEIGHTED_POOL;
  return pool[(h >>> 10) % pool.length];
}

function flagFor(country) {
  return NATION_BY_NAME[country]?.flag || '🏳️';
}

function confederationOf(country) {
  return NATION_BY_NAME[country]?.confederation || null;
}

module.exports = { NATIONS, NATION_BY_NAME, NATION_WEIGHT, nationsOf, nationalityFor, flagFor, confederationOf, hashString };
