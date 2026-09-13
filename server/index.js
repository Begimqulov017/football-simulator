// ============================================================
// MATCH SIMULATOR — MARKAZLASHGAN AUTH SERVERI
// ============================================================
// Bu server ILOVANING BARCHA FOYDALANUVCHILARI (turli qurilma/brauzerlardan
// kirganlarning barchasi) uchun BITTA umumiy manba: login/parollar,
// ro'yxatdan o'tish, va Pro Simulator (premium) ruxsatlari shu yerda
// saqlanadi (server/data/db.json).
//
// Ishga tushirish:
//   cd server
//   npm install
//   npm start
// Standart port: 4000 (PORT muhit o'zgaruvchisi bilan almashtirish mumkin).
//
// ADMIN AKKAUNT (birinchi marta ishga tushganda avtomatik yaratiladi):
//   login:  Begimqulov017
//   parol:  beg1mqulov.011
// Faqat shu akkaunt admin huquqiga ega — u boshqa foydalanuvchilarga
// Pro Simulator (premium) ruxsatini berishi/olib qo'yishi mumkin.
// ============================================================
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { readDB, writeDB } = require('./db');

const PORT = process.env.PORT || 4000;

// Bumped every time server/index.js gets new endpoints/fields the frontend
// depends on, so the frontend can detect "siz eski backend'ni ishlatyapsiz,
// qayta deploy qiling" instead of showing a confusing generic network error.
const SERVER_VERSION = 4;
const MAX_USERS = 10; // admin ham shu songa kiradi

const ADMIN_USERNAME = 'Begimqulov017';
const ADMIN_PASSWORD = 'beg1mqulov.011';

const app = express();
app.use(cors());
app.use(express.json());

// ------------------------------------------------------------
// Admin akkauntni birinchi ishga tushirishda (yoki agar negadir
// o'chib qolgan bo'lsa) avtomatik yaratib/tiklab qo'yamiz.
// ------------------------------------------------------------
function ensureAdminSeeded() {
  const db = readDB();
  const existing = db.users.find((u) => u.username === ADMIN_USERNAME);
  if (existing) {
    // Ruxsatlar negadir o'zgartirilgan bo'lsa ham — admin doim admin va pro bo'lib qolsin
    if (!existing.isAdmin || !existing.canAccessPro) {
      existing.isAdmin = true;
      existing.canAccessPro = true;
      writeDB(db);
    }
    // Eski bazalarda "password" (ochiq matn) maydoni bo'lmasligi mumkin — admin panelida
    // ko'rsatish uchun to'ldirib qo'yamiz.
    if (!existing.password) {
      existing.password = ADMIN_PASSWORD;
      writeDB(db);
    }
    return;
  }
  db.users.unshift({
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
    passwordHash: bcrypt.hashSync(ADMIN_PASSWORD, 10),
    canAccessPro: true,
    isAdmin: true,
    createdAt: new Date().toISOString(),
    careerSave: null,
    careerSavedAt: null,
  });
  writeDB(db);
  console.log(`✅ Admin akkaunt tayyorlandi: ${ADMIN_USERNAME}`);
}
ensureAdminSeeded();

// ------------------------------------------------------------
// Yordamchi funksiyalar
// ------------------------------------------------------------
function publicUser(u) {
  return { username: u.username, canAccessPro: !!u.canAccessPro, isAdmin: !!u.isAdmin };
}

// Faqat ADMIN paneli uchun — parolni ham (ochiq matn) qo'shib qaytaradi.
// MUHIM: bu faqat adminMiddleware bilan himoyalangan yo'nalishlarda ishlatiladi.
function adminUserView(u) {
  return {
    username: u.username,
    password: u.password || '(noma\'lum — eski akkaunt)',
    canAccessPro: !!u.canAccessPro,
    isAdmin: !!u.isAdmin,
    createdAt: u.createdAt || null,
    hasCareerSave: !!u.careerSave,
  };
}

// "Football Career Online" bo'limi uchun bitta foydalanuvchining saqlangan
// futbolchisidan boshqalar ko'rishi mumkin bo'lgan XAVFSIZ (parol/token'siz)
// qisqacha statistikasini chiqarib beradi.
function careerSummary(u) {
  const p = u.careerSave;
  if (!p) return null;
  return {
    username: u.username,
    name: p.name,
    surname: p.surname,
    position: p.position,
    overall: p.overall,
    potential: p.potential,
    age: p.age,
    club: p.club ? {
      name: p.club.name,
      logo: p.club.logo,
      leagueName: p.club.leagueName,
      country: p.club.country,
      flag: p.club.flag,
      tier: p.club.tier,
    } : null,
    career: p.career ? {
      goals: p.career.goals || 0,
      assists: p.career.assists || 0,
      appearances: p.career.appearances || 0,
      money: p.career.money || 0,
      weeklyWage: p.career.weeklyWage || 0,
      form: p.career.form || null,
      trophies: p.career.trophies || [],
      gameDate: p.career.gameDate || null,
    } : null,
    savedAt: u.careerSavedAt || null,
  };
}

function issueSession(db, username) {
  const token = crypto.randomBytes(24).toString('hex');
  db.sessions[token] = username;
  writeDB(db);
  return token;
}

function getUserFromToken(db, token) {
  if (!token) return null;
  const username = db.sessions[token];
  if (!username) return null;
  return db.users.find((u) => u.username === username) || null;
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const db = readDB();
  const user = getUserFromToken(db, token);
  if (!user) return res.status(401).json({ ok: false, error: 'Sessiya topilmadi — qaytadan kiring' });
  req.user = user;
  req.db = db;
  req.token = token;
  next();
}

function adminMiddleware(req, res, next) {
  if (!req.user?.isAdmin) return res.status(403).json({ ok: false, error: "Bu amal faqat admin uchun" });
  next();
}

// ------------------------------------------------------------
// PUBLIK ENDPOINTLAR
// ------------------------------------------------------------

// Ro'yxatdan o'tish oyna(sini) ko'rsatish uchun (login shart emas)
app.get('/api/meta', (req, res) => {
  const db = readDB();
  res.json({
    ok: true,
    serverVersion: SERVER_VERSION,
    userCount: db.users.length,
    maxUsers: MAX_USERS,
    registrationOpen: db.users.length < MAX_USERS,
  });
});

app.post('/api/register', (req, res) => {
  const { username, password } = req.body || {};
  const uname = (username || '').trim();

  if (!uname || !password) return res.json({ ok: false, error: "Login va parolni to'liq kiriting" });
  if (uname.length < 3) return res.json({ ok: false, error: "Login kamida 3 belgidan iborat bo'lishi kerak" });
  if (password.length < 4) return res.json({ ok: false, error: "Parol kamida 4 belgidan iborat bo'lishi kerak" });
  if (uname.toLowerCase() === ADMIN_USERNAME.toLowerCase()) {
    return res.json({ ok: false, error: 'Bu login band — boshqasini tanlang' });
  }

  const db = readDB();
  if (db.users.length >= MAX_USERS) {
    return res.json({ ok: false, error: `Maksimal ${MAX_USERS} nafar foydalanuvchi ro'yxatdan o'tishi mumkin — joy qolmadi` });
  }
  if (db.users.some((u) => u.username.toLowerCase() === uname.toLowerCase())) {
    return res.json({ ok: false, error: 'Bu login band — boshqasini tanlang' });
  }

  const newUser = {
    username: uname,
    password, // ochiq matnda ham saqlanadi — FAQAT admin panelida ko'rsatish uchun
    passwordHash: bcrypt.hashSync(password, 10),
    canAccessPro: false,
    isAdmin: false,
    createdAt: new Date().toISOString(),
    careerSave: null,
    careerSavedAt: null,
  };
  db.users.push(newUser);
  const token = issueSession(db, uname);
  res.json({ ok: true, token, user: publicUser(newUser) });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const uname = (username || '').trim();
  const db = readDB();
  const user = db.users.find((u) => u.username.toLowerCase() === uname.toLowerCase());
  if (!user) return res.json({ ok: false, error: 'Bunday login topilmadi' });
  if (!bcrypt.compareSync(password || '', user.passwordHash)) {
    return res.json({ ok: false, error: "Parol noto'g'ri" });
  }
  const token = issueSession(db, user.username);
  res.json({ ok: true, token, user: publicUser(user) });
});

app.post('/api/logout', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : (req.body && req.body.token);
  if (token) {
    const db = readDB();
    delete db.sessions[token];
    writeDB(db);
  }
  res.json({ ok: true });
});

// ------------------------------------------------------------
// HIMOYALANGAN ENDPOINTLAR (Authorization: Bearer <token> talab qilinadi)
// ------------------------------------------------------------

app.get('/api/me', authMiddleware, (req, res) => {
  res.json({ ok: true, user: publicUser(req.user) });
});

// Faqat ADMIN: barcha foydalanuvchilar ro'yxati (parollari bilan birga)
app.get('/api/users', authMiddleware, adminMiddleware, (req, res) => {
  res.json({ ok: true, users: req.db.users.map(adminUserView) });
});

// Faqat ADMIN: boshqa foydalanuvchiga Pro Simulator ruxsatini berish/olib qo'yish
app.post('/api/users/:username/pro', authMiddleware, adminMiddleware, (req, res) => {
  const { username } = req.params;
  const { allowed } = req.body || {};
  const db = req.db;
  const target = db.users.find((u) => u.username === username);
  if (!target) return res.status(404).json({ ok: false, error: 'Foydalanuvchi topilmadi' });
  if (target.isAdmin) return res.json({ ok: false, error: "Adminning ruxsatini o'zgartirib bo'lmaydi" });
  target.canAccessPro = !!allowed;
  writeDB(db);
  res.json({ ok: true, user: adminUserView(target) });
});

// Faqat ADMIN: foydalanuvchini butunlay o'chirish (akkaunt + sessiyalari +
// Football Career Online saqlanmasi). Frontend'da bu amaldan oldin "Ha/Yo'q"
// tasdiqlash oynasi chiqadi — server tomonida ham admin akkauntni himoya qiladi.
app.delete('/api/users/:username', authMiddleware, adminMiddleware, (req, res) => {
  const { username } = req.params;
  const db = req.db;
  const target = db.users.find((u) => u.username === username);
  if (!target) return res.status(404).json({ ok: false, error: 'Foydalanuvchi topilmadi' });
  if (target.isAdmin) return res.json({ ok: false, error: "Admin akkauntni o'chirib bo'lmaydi" });

  db.users = db.users.filter((u) => u.username !== username);
  Object.keys(db.sessions).forEach((token) => {
    if (db.sessions[token] === username) delete db.sessions[token];
  });
  writeDB(db);
  res.json({ ok: true });
});

// ------------------------------------------------------------
// FOOTBALL CAREER ONLINE — har bir foydalanuvchining karyera saqlanmasi
// markazlashgan serverda turadi, shu tufayli qaysi qurilmadan kirilmasin
// bir xil karyera davom etadi, va premium foydalanuvchilar "Users" bo'limida
// bir-birlarining klub statistikasini ko'ra oladi.
// ------------------------------------------------------------

// O'z karyera saqlanmasini yozish (har bir muhim o'zgarishdan keyin frontend chaqiradi)
app.post('/api/career/save', authMiddleware, (req, res) => {
  const { player } = req.body || {};
  const db = req.db;
  const target = db.users.find((u) => u.username === req.user.username);
  target.careerSave = player || null;
  target.careerSavedAt = new Date().toISOString();
  writeDB(db);
  res.json({ ok: true });
});

// O'z karyera saqlanmasini o'qish (boshqa qurilmadan kirganda davom ettirish uchun)
app.get('/api/career/mine', authMiddleware, (req, res) => {
  res.json({ ok: true, player: req.user.careerSave || null, savedAt: req.user.careerSavedAt || null });
});

// Faqat PREMIUM (canAccessPro) yoki ADMIN: barcha foydalanuvchilarning
// Football Career Online klub statistikasi (parol/token kabi maxfiy
// ma'lumotlarsiz — faqat klub, reyting, gol/assist/money kabi ochiq statistika).
app.get('/api/career/users', authMiddleware, (req, res) => {
  if (!req.user.canAccessPro && !req.user.isAdmin) {
    return res.status(403).json({ ok: false, error: "Bu bo'lim uchun Premium talab qilinadi" });
  }
  const list = req.db.users.map(careerSummary).filter(Boolean);
  res.json({ ok: true, users: list });
});

// Har bir real (login qilgan) foydalanuvchi qaysi klubda ekanini serverning
// o'zi biladi — shu tufayli ikkita do'st bir xil klubni tanlasa, ular
// haqiqatan HAM (har xil qurilma/brauzerdan bo'lsa ham) bir-birlarining
// jonli statistikasini shu klub tarkibida ko'ra oladi. Login talab qilinadi,
// lekin premium shart emas — klub tarkibini ko'rish uchun premium kerak emas.
app.get('/api/career/club-roster/:clubId', authMiddleware, (req, res) => {
  const { clubId } = req.params;
  const list = req.db.users
    .filter((u) => u.careerSave && u.careerSave.club?.id === clubId)
    .map((u) => ({
      username: u.username,
      name: `${u.careerSave.name} ${u.careerSave.surname}`,
      position: u.careerSave.position,
      overall: u.careerSave.overall,
      tier: u.careerSave.club?.tier || 'bench',
      isYou: u.username === req.user.username
    }));
  res.json({ ok: true, players: list });
});

app.listen(PORT, () => {
  console.log(`🚀 Match Simulator auth server: http://localhost:${PORT}`);
});
