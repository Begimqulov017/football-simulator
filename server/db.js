// ============================================================
// MONGODB'GA ASOSLANGAN "DATABASE"
// ============================================================
// Avval bu fayl server/data/db.json'ga yozardi. Render (va ko'pchilik bepul
// hosting) fayl tizimi EFEMER — har bir deploy/restart'da butunlay noldan
// boshlanadi, Persistent Disk esa faqat pullik planlarda bor. Shuning uchun
// endi ma'lumot MongoDB Atlas'ning BEPUL, DOIMIY klasteriga yoziladi — bu
// Render'dan mustaqil, alohida xizmat, deploy qilinganda hech narsaga
// tegilmaydi.
//
// index.js hech narsani bilmaydi bu haqda: readDB()/writeDB() interfeysi
// AYNAN oldingidek — sinxron, butun db obyektini qaytaradi/qabul qiladi.
// Buning siri: butun baza xotirada (`cache`) saqlanadi va MongoDB bilan
// faqat fonda sinxronlanadi. Bu index.js'dagi 19 ta chaqiruv joyining
// birortasini ham o'zgartirishga hojat qoldirmaydi — faqat initDB() serverni
// app.listen()dan OLDIN bitta marta kutish kerak (index.js oxirida).
// ============================================================
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'football_career';
const COLLECTION_NAME = 'appstate';
const DOC_ID = 'main';

const DEFAULT_DB = { users: [], sessions: {}, leagueWorlds: {} };

let collection = null;
let cache = null;
// Yozishlarni KETMA-KET (serialized) qiladi — bir nechta writeDB() chaqiruvi
// tez-tez kelsa (masalan admin/advance-world-day + parallel career/save),
// ular Mongo'ga tasodifiy tartibda emas, chaqirilgan tartibda yetib boradi.
// Bu server/index.js'dagi withLock() bilan bir xil muammoni (race condition)
// Mongo tomonida ham oldini oladi.
let writeQueue = Promise.resolve();
let lastWriteError = null;

function stripId(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return rest;
}

// Serverni app.listen()dan OLDIN chaqiriladi. Ulanib bo'lmasa server umuman
// ishga tushmaydi — noto'g'ri MONGODB_URI bilan "ishlab turgandek" ko'rinib,
// aslida hech narsa saqlamaydigan serverdan ko'ra, ochiq xato yaxshiroq.
async function initDB() {
  if (!MONGO_URI) {
    throw new Error(
      "MONGODB_URI muhit o'zgaruvchisi topilmadi. Render → Environment'da " +
      'MongoDB Atlas connection string\'ini qo\'shing.'
    );
  }
  const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  collection = client.db(DB_NAME).collection(COLLECTION_NAME);

  const existing = await collection.findOne({ _id: DOC_ID });
  cache = { ...DEFAULT_DB, ...stripId(existing) };

  if (!existing) {
    // Birinchi marta ishga tushish — bo'sh bazani darhol yozib qo'yamiz,
    // shunda keyingi o'qishlar (masalan boshqa instance parallel ishga
    // tushsa) bo'sh document emas, haqiqiy bo'sh-lekin-mavjud bazani topadi.
    await collection.insertOne({ _id: DOC_ID, ...DEFAULT_DB });
  }

  console.log(`✅ MongoDB ulandi (${DB_NAME}.${COLLECTION_NAME}) — ${cache.users.length} user, ${Object.keys(cache.leagueWorlds || {}).length} liga world topildi`);
  return cache;
}

// Sinxron — chaqiruvchi kod (index.js) buni oldingidek darhol qaytadigan deb
// kutadi. Xotiradagi `cache` har doim eng so'nggi writeDB() qiymatini
// aks ettiradi, Mongo'ga yozish fonda ketadi.
function readDB() {
  if (!cache) throw new Error('readDB() initDB() tugashidan OLDIN chaqirildi');
  return cache;
}

function writeDB(db) {
  cache = db;
  // JSON orqali chuqur nusxa: Mongo driver'ga yuborilayotgan snapshot
  // keyinroq index.js tomonidan `db` ustida davom ettiriladigan
  // o'zgarishlardan (masalan navbatdagi so'rovda) ta'sirlanmasin.
  const snapshot = JSON.parse(JSON.stringify(db));
  writeQueue = writeQueue
    .then(() => collection.replaceOne({ _id: DOC_ID }, { _id: DOC_ID, ...snapshot }, { upsert: true }))
    .then(() => { lastWriteError = null; })
    .catch((err) => {
      lastWriteError = err.message;
      console.error('MongoDB yozishda xato (keyingi urinishda davom etadi):', err.message);
    });
}

// Diagnostika uchun: so'nggi yozish muvaffaqiyatli o'tganmi. /api/meta yoki
// monitoring uchun foydali — hozircha ixtiyoriy.
function getLastWriteError() {
  return lastWriteError;
}

module.exports = { initDB, readDB, writeDB, getLastWriteError };
