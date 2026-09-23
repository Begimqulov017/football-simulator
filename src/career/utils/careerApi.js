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

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://football-simulator-server.onrender.com';
const TOKEN_KEY = 'ms_token';

// Bump this alongside server/index.js's SERVER_VERSION whenever the backend
// gains endpoints/fields the frontend depends on (career save/sync, admin
// passwords, delete-user, etc). Lets us show a precise "backend hali
// yangilanmagan" message instead of a confusing generic error.
export const REQUIRED_SERVER_VERSION = 11;

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
export async function saveCareerToServer(player) {
  return apiFetch('/api/career/save', { method: 'POST', body: JSON.stringify({ player }) });
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
    return { player: null, worldDate: null, confirmed: false, pendingWorldMatch: null };
  }
  // The server answered authoritatively: data.player is exactly what exists
  // for this account right now, including null (no career at all - e.g.
  // right after an admin "Wipe Data"). confirmed: true tells the caller to
  // trust this value even when it's null, instead of resurrecting a stale
  // local save.
  return { player: data.player, worldDate: data.worldDate, confirmed: true, pendingWorldMatch: data.pendingWorldMatch || null };
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
export async function advanceWorldDay() {
  return apiFetch('/api/admin/advance-world-day', { method: 'POST' });
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
