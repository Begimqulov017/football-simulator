// ============================================================
// API AUTH ADAPTER — MARKAZLASHGAN (server/) BACKENDGA ULANADI
// ============================================================
// Bu adapter endi localStorage'da EMAS, balki `server/`dagi Express
// serveriga fetch() orqali ulanadi. Shu tufayli akkauntlar (login/parol,
// Pro Simulator ruxsati) BARCHA qurilma/brauzerlar uchun BIR XIL —
// birontasida ro'yxatdan o'tsangiz, boshqa telefon/kompyuterdan ham xuddi
// o'sha login/parol bilan kirish mumkin.
//
// Faqat "sessiya tokeni" (hozir kim shu brauzerda kirgan) shu qurilmaning
// o'zida (localStorage'da) saqlanadi — bu normal holat, chunki har bir
// qurilmada alohida login qilinadi (xuddi istalgan sayt kabi).
//
// Serverning manzili REACT_APP_API_BASE_URL orqali sozlanadi (.env fayliga
// qarang). Standart holatda [https://football-simulator-server.onrender.com](https://football-simulator-server.onrender.com) ga ulanadi.
// ============================================================

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://football-simulator-server.onrender.com';
const TOKEN_KEY = 'ms_token';
const CACHED_USER_KEY = 'ms_cached_user'; // faqat UI-ni tezroq ko'rsatish uchun, manba emas

function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
function setToken(token) {
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* e'tiborsiz */ }
}
function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CACHED_USER_KEY);
  } catch { /* e'tiborsiz */ }
}
function cacheUser(user) {
  try { localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user)); } catch { /* e'tiborsiz */ }
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch (err) {
    // Server ishlamayapti yoki tarmoq muammosi
    return { ok: false, error: "Serverga ulanib bo'lmadi. `server/` papkasida `npm start` ishlatilganini tekshiring.", networkError: true };
  }

  let data;
  try {
    data = await res.json();
  } catch {
    data = { ok: false, error: "Serverdan noto'g'ri javob keldi" };
  }
  if (res.status === 401) {
    clearToken();
  }
  return data;
}

const apiAdapter = {
  MAX_USERS: 10,

  async getMeta() {
    const data = await apiFetch('/api/meta');
    return data.ok ? data : { userCount: 0, maxUsers: 10, registrationOpen: true };
  },

  async getUserCount() {
    const meta = await this.getMeta();
    return meta.userCount;
  },

  async isRegistrationOpen() {
    const meta = await this.getMeta();
    return meta.registrationOpen;
  },

  async registerUser(username, password) {
    const data = await apiFetch('/api/register', { method: 'POST', body: JSON.stringify({ username, password }) });
    if (data.ok) { setToken(data.token); cacheUser(data.user); }
    return data.ok ? { ok: true, username: data.user.username } : { ok: false, error: data.error };
  },

  async loginUser(username, password) {
    const data = await apiFetch('/api/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    if (data.ok) { setToken(data.token); cacheUser(data.user); }
    return data.ok ? { ok: true, username: data.user.username } : { ok: false, error: data.error };
  },

  async logout() {
    await apiFetch('/api/logout', { method: 'POST' });
    clearToken();
  },

  // Joriy foydalanuvchini serverdan tasdiqlaydi (token asosida). Token
  // bo'lmasa yoki server rad qilsa — null qaytaradi (chiqarilgan hisoblanadi).
  async getCurrentUser() {
    const token = getToken();
    if (!token) return null;
    const data = await apiFetch('/api/me');
    if (!data.ok) return null;
    cacheUser(data.user);
    return data.user;
  },

  async canAccessPro(username) {
    const user = await this.getCurrentUser();
    return !!(user && user.username === username && user.canAccessPro);
  },

  async isAdmin(username) {
    const user = await this.getCurrentUser();
    return !!(user && user.username === username && user.isAdmin);
  },

  // Faqat admin sessiyasi bilan ishlaydi (server tekshiradi)
  async getAllUsers() {
    const data = await apiFetch('/api/users');
    return data.ok ? data.users : [];
  },

  async setProAccess(targetUsername, allowed) {
    const data = await apiFetch(`/api/users/${encodeURIComponent(targetUsername)}/pro`, {
      method: 'POST',
      body: JSON.stringify({ allowed }),
    });
    return !!data.ok;
  },

  // Faqat admin sessiyasi bilan ishlaydi (server tekshiradi) — akkauntni butunlay o'chiradi
  async deleteUser(targetUsername) {
    const data = await apiFetch(`/api/users/${encodeURIComponent(targetUsername)}`, { method: 'DELETE' });
    return data.ok ? { ok: true } : { ok: false, error: data.error };
  },
};

export default apiAdapter;
