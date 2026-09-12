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
export async function loadCareerFromServer() {
  const data = await apiFetch('/api/career/mine');
  return data.ok ? data.player : null;
}

// Faqat premium/admin foydalanuvchilar uchun — barcha o'yinchilarning klub
// statistikasi (parol/token kabi maxfiy ma'lumotlarsiz).
export async function fetchAllCareerUsers() {
  const data = await apiFetch('/api/career/users');
  if (!data.ok) return { ok: false, error: data.error, users: [] };
  return { ok: true, users: data.users };
}
