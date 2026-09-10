// ============================================================
// LOCALSTORAGE AUTH ADAPTER
// ============================================================
// DIQQAT: bu HAQIQIY backend/server/database EMAS. Foydalanuvchi
// ma'lumotlari faqat shu brauzer/qurilmaning localStorage'ida saqlanadi.
// Amalda: boshqa qurilma yoki brauzerdan kirilsa, bu yerda ro'yxatdan
// o'tgan userlar u yerda umuman ko'rinmaydi — chunki ma'lumotlar hech
// qanday serverga yuborilmaydi.
//
// Bu fayl ataylab "adapter" shaklida yozilgan: barcha metodlar bitta
// obyekt ichida to'plangan va `../auth/index.js` orqali ilovaning
// qolgan qismidan ISHLATILADI (ular to'g'ridan-to'g'ri bu faylni
// import qilmaydi). Kelajakda haqiqiy ko'p-qurilmali backendga
// o'tish uchun:
//   1) xuddi shu metod nomlari bilan yangi adapter yozing, masalan
//      `firebaseAdapter.js` (Firebase Authentication + Firestore) yoki
//      `apiAdapter.js` (Node/Express + SQLite/Postgres uchun fetch()
//      chaqiruvlari bilan) — quyidagi metodlarning barchasi async
//      (Promise qaytaradigan) bo'lishi ham mumkin.
//   2) `../auth/index.js` faylidagi `activeAdapter`ni almashtiring.
// Ilovaning qolgan qismini (LoginPage, RegisterPage, App.jsx,
// ProSimulatorPage) O'ZGARTIRISH SHART EMAS.
// ============================================================

const USERS_KEY = 'ms_users';
const SESSION_KEY = 'ms_session';
const MAX_USERS = 10;

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
    // e'tiborsiz — saqlanmasa ham ilova ishlashda davom etadi
  }
}

// Juda oddiy (xavfsiz KRIPTOGRAFIK emas, faqat ochiq matn saqlamaslik uchun) heshlash
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `h${hash}`;
}

const localStorageAdapter = {
  MAX_USERS,

  getAllUsers() {
    return load(USERS_KEY, []);
  },

  saveUsers(users) {
    save(USERS_KEY, users);
  },

  getUserCount() {
    return this.getAllUsers().length;
  },

  isRegistrationOpen() {
    return this.getUserCount() < MAX_USERS;
  },

  // Ro'yxatdan o'tgan BIRINCHI foydalanuvchi — egasi (admin), Pro Simulator
  // ruxsatlarini boshqaradigan shaxs
  isAdmin(username) {
    const users = this.getAllUsers();
    return users.length > 0 && users[0].username === username;
  },

  registerUser(username, password) {
    const users = this.getAllUsers();
    const uname = username.trim();

    if (!uname || !password) return { ok: false, error: "Login va parolni to'liq kiriting" };
    if (uname.length < 3) return { ok: false, error: "Login kamida 3 belgidan iborat bo'lishi kerak" };
    if (password.length < 4) return { ok: false, error: "Parol kamida 4 belgidan iborat bo'lishi kerak" };
    if (users.length >= MAX_USERS) return { ok: false, error: `Maksimal ${MAX_USERS} nafar foydalanuvchi ro'yxatdan o'tishi mumkin — joy qolmadi` };
    if (users.some((u) => u.username.toLowerCase() === uname.toLowerCase())) {
      return { ok: false, error: 'Bu login band — boshqasini tanlang' };
    }

    const newUser = { username: uname, passwordHash: simpleHash(password), canAccessPro: users.length === 0 };
    users.push(newUser);
    this.saveUsers(users);
    save(SESSION_KEY, uname);
    return { ok: true, username: uname };
  },

  loginUser(username, password) {
    const users = this.getAllUsers();
    const uname = username.trim();
    const user = users.find((u) => u.username.toLowerCase() === uname.toLowerCase());
    if (!user) return { ok: false, error: 'Bunday login topilmadi' };
    if (user.passwordHash !== simpleHash(password)) return { ok: false, error: "Parol noto'g'ri" };
    save(SESSION_KEY, user.username);
    return { ok: true, username: user.username };
  },

  logout() {
    try { localStorage.removeItem(SESSION_KEY); } catch { /* e'tiborsiz */ }
  },

  getCurrentUser() {
    const uname = load(SESSION_KEY, null);
    if (!uname) return null;
    const users = this.getAllUsers();
    return users.find((u) => u.username === uname) || null;
  },

  canAccessPro(username) {
    const users = this.getAllUsers();
    const user = users.find((u) => u.username === username);
    return !!user?.canAccessPro;
  },

  // Faqat admin chaqira oladi — boshqa foydalanuvchiga Pro Simulator ruxsatini beradi/oladi
  setProAccess(targetUsername, allowed) {
    const users = this.getAllUsers();
    const idx = users.findIndex((u) => u.username === targetUsername);
    if (idx === -1) return false;
    users[idx].canAccessPro = allowed;
    this.saveUsers(users);
    return true;
  },
};

export default localStorageAdapter;
