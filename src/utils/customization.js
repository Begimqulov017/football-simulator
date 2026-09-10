const CUSTOM_TEAMS_KEY = 'match_simulator_custom_teams';
const OVERRIDES_KEY = 'match_simulator_team_overrides'; // transfer o'zgarishlari (built-in jamoalar uchun)
const ENABLED_KEY = 'match_simulator_customization_enabled'; // global ON/OFF

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // saqlanmasa ham o'yin davom etadi
  }
}

// ============================================================
// MOSLASHTIRILGAN (custom) KLUBLAR
// ============================================================
export function loadCustomTeams() {
  return load(CUSTOM_TEAMS_KEY, []);
}

export function saveCustomTeam(team) {
  const list = loadCustomTeams();
  const next = [...list, team];
  save(CUSTOM_TEAMS_KEY, next);
  return next;
}

export function deleteCustomTeam(teamId) {
  const list = loadCustomTeams().filter((t) => t.id !== teamId);
  save(CUSTOM_TEAMS_KEY, list);
  return list;
}

// ============================================================
// TRANSFERLAR — mavjud (built-in yoki custom) jamoalar tarkibiga
// qo'shimcha/o'chirish o'zgarishlari. Bu ORIGINAL teamsData.js faylini
// o'zgartirmaydi — faqat brauzerda "ustma-ust qatlam" sifatida saqlanadi.
// ============================================================
export function loadOverrides() {
  return load(OVERRIDES_KEY, {}); // { [teamId]: { added: [...player], removedIds: [...id] } }
}

function saveOverrides(overrides) {
  save(OVERRIDES_KEY, overrides);
}

// O'yinchini bir jamoadan ikkinchisiga o'tkazadi (transfer)
export function transferPlayer(playerId, fromTeamId, toTeamId, allTeamsById) {
  const overrides = loadOverrides();
  const fromTeam = allTeamsById[fromTeamId];
  const player = fromTeam?.squad.find((p) => p.id === playerId);
  if (!player) return overrides;

  // "fromTeamId"dan olib tashlash
  overrides[fromTeamId] = overrides[fromTeamId] || { added: [], removedIds: [] };
  if (!overrides[fromTeamId].removedIds.includes(playerId)) {
    overrides[fromTeamId].removedIds.push(playerId);
  }
  // agar bu o'yinchi avval fromTeamId ga "added" sifatida qo'shilgan bo'lsa, uni olib tashlaymiz
  overrides[fromTeamId].added = overrides[fromTeamId].added.filter((p) => p.id !== playerId);

  // "toTeamId"ga qo'shish
  overrides[toTeamId] = overrides[toTeamId] || { added: [], removedIds: [] };
  overrides[toTeamId].added.push(player);
  overrides[toTeamId].removedIds = overrides[toTeamId].removedIds.filter((id) => id !== playerId);

  saveOverrides(overrides);
  return overrides;
}

// Yangi yaratilgan o'yinchini bevosita bir jamoaga qo'shadi
export function addPlayerToTeam(teamId, player) {
  const overrides = loadOverrides();
  overrides[teamId] = overrides[teamId] || { added: [], removedIds: [] };
  overrides[teamId].added.push(player);
  saveOverrides(overrides);
  return overrides;
}

// ============================================================
// GLOBAL ON/OFF — customization ta'sirini butunlay yoqish/o'chirish.
// OFF bo'lganda ma'lumotlar (custom klublar, transferlar) O'CHIRILMAYDI,
// faqat getEffectiveTeams() ularni e'tiborsiz qoldirib, faqat original
// (built-in) tarkiblarni qaytaradi.
// ============================================================
export function isCustomizationEnabled() {
  return load(ENABLED_KEY, true) !== false;
}

export function setCustomizationEnabled(enabled) {
  save(ENABLED_KEY, !!enabled);
}

function computeEffectiveTeams(builtInTeams) {
  const overrides = loadOverrides();
  const customTeams = loadCustomTeams();
  const allBase = [...builtInTeams, ...customTeams];

  return allBase.map((t) => {
    const ov = overrides[t.id];
    if (!ov) return t;
    const filtered = t.squad.filter((p) => !ov.removedIds.includes(p.id));
    const squad = [...filtered, ...ov.added];
    return { ...t, squad };
  });
}

// Customization sahifasining o'zi (Transfer/O'yinchi/Klub tab'lari) HAR DOIM
// to'liq tahrirlangan holatni ko'rsatishi kerak — global toggle faqat
// SIMULYATSIYAGA ta'sir qiladi, tahrirlash ekraniga emas.
export function getAllCustomizedTeams(builtInTeams) {
  return computeEffectiveTeams(builtInTeams);
}

// ============================================================
// YAKUNIY (effektiv) JAMOALAR RO'YXATI — o'yin/turnir SIMULYATSIYASI shu
// funksiyadan foydalanadi. Global toggle OFF bo'lsa — hech qanday
// customization qo'llanmaydi, faqat original (built-in) jamoalar qaytadi.
// ============================================================
export function getEffectiveTeams(builtInTeams) {
  if (!isCustomizationEnabled()) {
    return builtInTeams;
  }
  return computeEffectiveTeams(builtInTeams);
}

export function resetAllCustomizations() {
  try {
    localStorage.removeItem(CUSTOM_TEAMS_KEY);
    localStorage.removeItem(OVERRIDES_KEY);
  } catch {
    // e'tiborsiz
  }
}
