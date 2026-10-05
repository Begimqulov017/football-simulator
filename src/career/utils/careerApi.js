// ============================================================
// FOOTBALL CAREER ONLINE — server bilan sinxronizatsiya
// ============================================================
// Bu fayl asosiy ilova bilan BIR XIL backend (server/) va BIR XIL sessiya
// tokenidan (localStorage'dagi "ms_token") foydalanadi — chunki Football
// Career Online endi alohida ilova emas, balki login qilingandan keyin
// ochiladigan bitta bo'lim. Shu tufayli karyera saqlanmasi ham markazlashgan
// serverda turadi: qaysi qurilmadan kirilmasin bir xil karyera davom etadi,
// va premium foydalanuvchilar "Users" bo'limida bir-birlarining klub
// statistikasini ko'ra oladi.
// ============================================================

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';
const TOKEN_KEY = 'ms_token';

// Bump this alongside server/index.js's SERVER_VERSION whenever the backend
// gains endpoints/fields the frontend depends on (career save/sync, admin
// passwords, delete-user, etc). Lets us show a precise "backend hali
// yangilanmagan" message instead of a confusing generic error.
export const REQUIRED_SERVER_VERSION = 14;

export async function checkBackendVersion() {
  try {
    const res = await fetch(`${API_BASE}/api/meta`);
    const data = await res.json();
    const serverVersion = data?.serverVersion || 0;
    return { ok: true, upToDate: serverVersion >= REQUIRED_SERVER_VERSION, serverVersion };
  } catch (err) {
    return { ok: false, upToDate: false, serverVersion: 0 };
  }
}

function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch (err) {
    // The request itself never reached the server (offline, CORS block, or
    // the backend is unreachable/asleep) - as opposed to the server
    // responding with an error, which is handled below.
    return { ok: false, error: "Serverga ulanib bo'lmadi. Internetni tekshiring yoki birozdan so'ng qayta urinib ko'ring.", networkError: true };
  }
  try {
    return await res.json();
  } catch (err) {
    // The server responded, but not with JSON - almost always means this
    // route doesn't exist yet on the deployed backend (e.g. server/ hasn't
    // been redeployed with the latest code) rather than a real network fault.
    return { ok: false, error: "Server bu so'rovni tanimadi — backend hali yangilanmagan bo'lishi mumkin.", networkError: true };
  }
}

// O'z karyera saqlanmasini serverga yozadi (best-effort — muvaffaqiyatsiz
// bo'lsa ham UI bloklanmaydi, chunki localStorage baribir asosiy manba).
// ackRev: mijoz ko'rgan oxirgi admin-tahrir versiyasi. Server eskirgan bo'lsa
// { ok:false, conflict:true, adminEdit } qaytaradi (GameContext buni hal qiladi).
export async function saveCareerToServer(player, ackRev = 0) {
  return apiFetch('/api/career/save', { method: 'POST', body: JSON.stringify({ player, ackRev }) });
}

// Boshqa qurilmadan kirilganda serverdagi saqlanmani tortib olish uchun.
// Endi umumiy dunyoning joriy sanasini ham qaytaradi.
export async function loadCareerFromServer() {
  const data = await apiFetch('/api/career/mine');
  if (!data.ok) {
    // Couldn't reach the server or the session is invalid - we genuinely
    // don't know whether a career exists, so the caller should fall back to
    // whatever it has cached locally rather than treating this as a
    // confirmed "no career".
    return { player: null, worldDate: null, confirmed: false, pendingWorldMatch: null, adminEdit: null, forcedNews: [] };
  }
  // The server answered authoritatively: data.player is exactly what exists
  // for this account right now, including null (no career at all - e.g.
  // right after an admin "Wipe Data"). confirmed: true tells the caller to
  // trust this value even when it's null, instead of resurrecting a stale
  // local save.
  return {
    player: data.player, worldDate: data.worldDate, confirmed: true, pendingWorldMatch: data.pendingWorldMatch || null,
    adminEdit: data.adminEdit || null, forcedNews: data.forcedNews || [],
  };
}

// 4-BAND: foydalanuvchining klubi navbatdagi o'yinini KUTMOQDA (hali
// avtomatik hal qilinmagan) bo'lsa, uni LiveMatch orqali o'ynash uchun kerakli
// hamma narsani (ikkala klub + world squadlari + seed) qaytaradi.
export async function fetchPendingMatchDetail() {
  const data = await apiFetch('/api/world-match-detail');
  if (!data.ok) return null;
  return data;
}

// Foydalanuvchi LiveMatch orqali O'ZI o'ynagan pending o'yinning yakuniy
// natijasini serverga yozib qo'yadi (standings/schedule/karyera statistikasi
// shu yerda yangilanadi).
export async function submitMatchResult(payload) {
  return apiFetch('/api/career/submit-match-result', { method: 'POST', body: JSON.stringify(payload) });
}

// Umumiy dunyodagi so'nggi o'yin natijasi "ko'rildi" deb belgilanadi - shu
// orqali Live Match ekrani takror-takror chiqavermaydi.
export async function ackMatchResult() {
  return apiFetch('/api/career/ack-result', { method: 'POST' });
}

// ADMIN ONLY: advances the shared world (every active league's calendar) by
// one day, resolving that day's fixtures for everyone at once.
export async function advanceWorldDay(days = 1) {
  return apiFetch('/api/admin/advance-world-day', { method: 'POST', body: JSON.stringify({ days }) });
}

// ---- Phase 4: Admin Dashboard ----
export const fetchAdminPlayers = () => apiFetch('/api/admin/players');
export const fetchAdminPending = () => apiFetch('/api/admin/pending');
export const fetchSimLog = () => apiFetch('/api/admin/sim-log');
export const fetchAdminLeague = (leagueId) => apiFetch(`/api/admin/league/${encodeURIComponent(leagueId)}`);
export const adminSetPassword = (username, password) =>
  apiFetch(`/api/admin/users/${encodeURIComponent(username)}/password`, { method: 'POST', body: JSON.stringify({ password }) });
export const adminWipeUser = (username) =>
  apiFetch(`/api/admin/users/${encodeURIComponent(username)}/wipe`, { method: 'POST' });

// ---- Phase 10: Admin Panel & Unified Engine ----
// Master Calendar
export const fetchCalendar = () => apiFetch('/api/admin/calendar');
export const setAutoSim = (cfg) => apiFetch('/api/admin/auto-sim', { method: 'POST', body: JSON.stringify(cfg) });
export const runAutoSimNow = () => apiFetch('/api/admin/auto-sim/run-now', { method: 'POST' });
// Fixture
export const fetchFixtures = (leagueId) => apiFetch(`/api/admin/fixtures/${encodeURIComponent(leagueId)}`);
export const createFixture = (body) => apiFetch('/api/admin/fixtures', { method: 'POST', body: JSON.stringify(body) });
export const deleteFixture = (leagueId, round) => apiFetch(`/api/admin/fixtures/${encodeURIComponent(leagueId)}/${encodeURIComponent(round)}`, { method: 'DELETE' });
// Tarkib / statistika tahriri
export const fetchSquad = (leagueId, teamId) => apiFetch(`/api/admin/squad/${encodeURIComponent(leagueId)}/${encodeURIComponent(teamId)}`);
export const editSquadPlayer = (leagueId, teamId, playerId, body) =>
  apiFetch(`/api/admin/squad/${encodeURIComponent(leagueId)}/${encodeURIComponent(teamId)}/${encodeURIComponent(playerId)}`, { method: 'POST', body: JSON.stringify(body) });
export const editUserCareer = (username, body) =>
  apiFetch(`/api/admin/users/${encodeURIComponent(username)}/career-edit`, { method: 'POST', body: JSON.stringify(body) });
// Yangilikni majburlash
export const fetchAdminNews = () => apiFetch('/api/admin/news');
export const forceNews = (body) => apiFetch('/api/admin/news', { method: 'POST', body: JSON.stringify(body) });
export const deleteAdminNews = (id) => apiFetch(`/api/admin/news/${encodeURIComponent(id)}`, { method: 'DELETE' });
// Foydalanuvchilarni boshqarish
export const fetchUsersTable = () => apiFetch('/api/admin/users-table');
export const fetchUserStats = (username) => apiFetch(`/api/admin/users/${encodeURIComponent(username)}/stats`);
export const setUserRole = (username, role) =>
  apiFetch(`/api/admin/users/${encodeURIComponent(username)}/role`, { method: 'POST', body: JSON.stringify({ role }) });
export const setUserSuspended = (username, suspended, reason = '') =>
  apiFetch(`/api/admin/users/${encodeURIComponent(username)}/suspend`, { method: 'POST', body: JSON.stringify({ suspended, reason }) });
export const muteUser = (username, body) =>
  apiFetch(`/api/mod/users/${encodeURIComponent(username)}/mute`, { method: 'POST', body: JSON.stringify(body) });
// Chat + moderatsiya
export const fetchChatAudit = () => apiFetch('/api/mod/chat-audit');
// Sessiya tekshiruvi (suspend / rol o'zgarishini ilova ochiq turganda ham sezish uchun)
export const pingSession = () => apiFetch('/api/me');

// Chempionlar Ligasi / Yevropa Ligasi (umumiy dunyo)
export async function fetchContinental() {
  const data = await apiFetch('/api/continental');
  if (!data.ok) return { ok: false, active: [], history: [], news: [] };
  return data;
}

// TO'LIQ TOZALASH — faqat admin uchun. Barcha userlar, karyeralar, liga
// world'lari, xalqaro turnirlar tarixi o'chadi. Admin akkauntning o'zi
// (parol bilan) qoladi, lekin uning ham karyerasi tozalanadi. Server yangi
// sessiya tokeni qaytaradi, chunki eski tokenlar (shu jumladan chaqiruvchi
// adminning o'zinikidan tashqari hech biri emas — buning o'zinikisi ham)
// wipe paytida bekor qilinadi; shu YANGI tokenni localStorage'ga darhol
// yozib qo'yamiz, aks holda keyingi so'rov "Sessiya topilmadi" bilan
// muvaffaqiyatsiz tugaydi.
export async function wipeAllData() {
  const data = await apiFetch('/api/admin/wipe-data', { method: 'POST' });
  if (data.ok && data.token) {
    try { localStorage.setItem(TOKEN_KEY, data.token); } catch { /* e'tiborsiz */ }
  }
  return data;
}

// Every league in the game (not just the player's own), with a light
// summary of its shared world - powers the "browse any league" screen.
export async function fetchLeagues() {
  const data = await apiFetch('/api/leagues');
  if (!data.ok) return { ok: false, leagues: [], worldDate: null };
  return { ok: true, leagues: data.leagues, worldDate: data.worldDate };
}

// Current shared schedule/standings for a league - anyone logged in can view.
export async function fetchWorld(leagueId, { includeSquads } = {}) {
  const qs = includeSquads ? '?includeSquads=1' : '';
  const data = await apiFetch(`/api/world/${encodeURIComponent(leagueId)}${qs}`);
  if (!data.ok) return { ok: false, world: null };
  return { ok: true, world: data.world };
}

// Faqat premium/admin foydalanuvchilar uchun — barcha o'yinchilarning klub
// statistikasi (parol/token kabi maxfiy ma'lumotlarsiz).
export async function fetchAllCareerUsers() {
  const data = await apiFetch('/api/career/users');
  if (!data.ok) return { ok: false, error: data.error, users: [] };
  return { ok: true, users: data.users };
}

// Real (server-shared) teammates at this club - if a friend logged in on
// another device/browser picked the same club, they show up here too,
// alongside the built-in squad. Requires login, not premium.
export async function fetchClubRoster(clubId) {
  const data = await apiFetch(`/api/career/club-roster/${encodeURIComponent(clubId)}`);
  if (!data.ok) return { ok: false, players: [] };
  return { ok: true, players: data.players };
}

// ------------------------------------------------------------
// NATIONAL TEAMS / INTERNATIONAL TOURNAMENTS
// ------------------------------------------------------------

// Everything happening internationally right now: live tournaments (group
// tables, brackets, top scorers), past winners and the international news log.
export async function fetchInternational() {
  const data = await apiFetch('/api/international');
  if (!data.ok) return { ok: false, tournaments: [], history: [], news: [] };
  return data;
}

// The current call-up list for one nation. The squad is re-picked by the
// server every time, so this always reflects who would be selected today.
export async function fetchNationSquad(country) {
  const data = await apiFetch(`/api/international/nation/${encodeURIComponent(country)}`);
  if (!data.ok) return { ok: false, error: data.error, team: null };
  return { ok: true, team: data.team };
}

// ---- Phase 5: individual mukofotlar ----
export async function fetchAwards(leagueId) {
  const data = await apiFetch(`/api/awards/${encodeURIComponent(leagueId)}`);
  return data.ok ? data : { ok: false, awards: [] };
}
export const fetchAwardsPreview = (leagueId) => apiFetch(`/api/admin/awards-preview/${encodeURIComponent(leagueId)}`);

// ---- Phase 5: Leagues & Tournaments Dashboard ----
// Bitta liga: statistika peshqadamlari (gol/assist/kartochka/reyting), chempionlar
// tarixi va ichki kubok g'oliblari. Hamma login qilgan foydalanuvchi uchun ochiq.
export const fetchHubLeague = (leagueId) => apiFetch(`/api/hub/league/${encodeURIComponent(leagueId)}`);

// Barcha ligalarning ichki kuboklari: joriy bosqich, g'olib va g'oliblar tarixi.
export const fetchHubCups = () => apiFetch('/api/hub/cups');
// ---- Phase 9: National Team Hub, Global Chat, Global Awards ----
// Terma jamoa: boshlang'ich 11 + zaxira, fixtures va (o'zim uchun) chaqiruv shartlari
export const fetchNationHub = (country) => apiFetch(`/api/international/hub/${encodeURIComponent(country)}`);

export const fetchChat = () => apiFetch('/api/chat');
export const fetchChatUnread = (afterSeq = 0) => apiFetch(`/api/chat/unread?afterSeq=${Number(afterSeq) || 0}`);
export const sendChatMessage = (text) => apiFetch('/api/chat', { method: 'POST', body: JSON.stringify({ text }) });
// Moderatsiya (admin + moderator): pin / o'chirish -> /api/mod/chat/...
export const pinChatMessage = (id) => apiFetch(`/api/mod/chat/${encodeURIComponent(id)}/pin`, { method: 'POST', body: JSON.stringify({}) });
export const deleteChatMessage = (id) => apiFetch(`/api/mod/chat/${encodeURIComponent(id)}`, { method: 'DELETE' });

export const fetchGlobalAwards = () => apiFetch('/api/awards-global');
export const fetchGlobalAwardsLive = () => apiFetch('/api/awards-global/live');
export const finalizeGlobalAwards = (season) =>
  apiFetch('/api/admin/awards-global/finalize', { method: 'POST', body: JSON.stringify({ season }) });

// PHASE 11
export const skipPendingMatch = (leagueId, round, competition) => apiFetch('/api/admin/pending/skip', { method: 'POST', body: JSON.stringify({ leagueId, round, competition }) });
export const fetchLeagueState = () => apiFetch('/api/career/league-state');
