// Creator Excel orqali yuklagan klub/futbolchi ma'lumoti (serverda saqlanadi) mijozda ham qo'llanadi.
// Oxirgi olingan nusxa localStorage'da turadi: ilova ochilishi bilan (server uxlab yotgan bo'lsa ham) shu qo'llanadi,
// keyin fonda server bilan solishtiriladi (customSync.js).
const KEY = 'fpcs_custom_data_v1';

export function readCustomCache() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
    const d = raw ? JSON.parse(raw) : null;
    return d && Array.isArray(d.clubs) ? d : null;
  } catch (e) { return null; }
}

export function writeCustomCache(payload) {
  try { localStorage.setItem(KEY, JSON.stringify({ version: payload.version || 0, clubs: payload.clubs || [] })); } catch (e) { /* kvota to'lgan bo'lsa ham ilova ishlayveradi */ }
}

// teams/leagues massivlari joyida (in-place) o'zgartiriladi. Emoji-logoga ko'rinmas identifikator
// teamsData.js ning oxiridagi umumiy qadam bilan qo'shiladi (yangi klublar ham shu massivga tushgani uchun).
export function applyCustomClubs(teams, leagues, payload) {
  if (!payload || !Array.isArray(payload.clubs)) return;
  payload.clubs.forEach((c) => {
    const squad = c.squad.map((p) => ({ ...p, stats: { ...p.stats } }));
    const ex = teams.find((t) => t.id === c.id);
    if (ex) ex.squad = squad;
    else teams.push({ id: c.id, name: c.name, logo: c.logo || '\u26BD', squad });
    const league = leagues.find((l) => l.id === c.leagueId);
    if (league && !league.teamIds.includes(c.id)) league.teamIds.push(c.id);
  });
}
