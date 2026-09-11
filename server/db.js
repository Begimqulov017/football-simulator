// ============================================================
// ODDIY FAYLGA ASOSLANGAN "DATABASE" (server/data/db.json)
// ============================================================
// Bu haqiqiy SQL/NoSQL DB emas, lekin serverda (bitta joyda, MARKAZLASHGAN
// holda) saqlanadi — shuning uchun har qanday qurilma/brauzerdan shu
// serverga ulanib login/register qilinsa, HAMMASI BIR XIL akkauntlar
// ro'yxatini ko'radi. Bu aynan localStorage'dan farqi: localStorage har bir
// brauzerda ALOHIDA, bu esa BITTA umumiy joyda.
//
// Kelajakda haqiqiy DB (Postgres/MongoDB/va h.k.)ga o'tish kerak bo'lsa —
// faqat shu faylning ichini (readDB/writeDB) almashtirish kifoya, qolgan
// serverni (index.js) o'zgartirish shart emas.
// ============================================================
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readDB() {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    return { users: [], sessions: {} };
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return { users: parsed.users || [], sessions: parsed.sessions || {} };
  } catch (err) {
    console.error("db.json o'qishda xato, bo'sh baza bilan davom etilmoqda:", err.message);
    return { users: [], sessions: {} };
  }
}

function writeDB(db) {
  ensureDataDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

module.exports = { readDB, writeDB, DB_FILE };
