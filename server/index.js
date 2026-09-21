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
const { initDB, readDB, writeDB } = require('./db');
const engine = require('./engine');
const international = require('./international');

const PORT = process.env.PORT || 4000;

// Bumped every time server/index.js gets new endpoints/fields the frontend
// depends on, so the frontend can detect "siz eski backend'ni ishlatyapsiz,
// qayta deploy qiling" instead of showing a confusing generic network error.
const SERVER_VERSION = 11;
const MAX_USERS = 10; // admin ham shu songa kiradi

// Retiring at or above this rating gets its own headline in the season
// rollover news instead of being folded into the "and N others" line.
const FAMOUS_OVR = 80;

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
// MUHIM: bu endi initDB() muvaffaqiyatli tugagandan KEYIN chaqiriladi (pastda,
// initDB().then() ichida) — MongoDB'ga o'tishdan oldin bu yerda darhol
// chaqirilardi, chunki readDB() eski db.js'da har doim sinxron tayyor edi.
// Endi readDB() faqat initDB() tugagandan keyin ishlaydi.

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

// ------------------------------------------------------------
// A simple in-process lock so concurrent requests (e.g. the admin's
// "advance world day" button firing while someone else's request is being
// processed) can never read-modify-write db.json in an interleaved way and
// silently lose each other's changes. Every authenticated request runs
// fully (auth check + route handler + any writeDB call) before the next
// one is allowed to start.
// ------------------------------------------------------------
let dbLock = Promise.resolve();
function withLock(fn) {
  return (req, res, next) => {
    dbLock = dbLock.then(() => new Promise((resolve) => {
      try {
        fn(req, res, next);
      } catch (err) {
        console.error('Request handler error:', err);
        if (!res.headersSent) res.status(500).json({ ok: false, error: 'Internal error' });
      } finally {
        resolve();
      }
    }));
  };
}

const authMiddleware = withLock(function (req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const db = readDB();
  const user = getUserFromToken(db, token);
  if (!user) return res.status(401).json({ ok: false, error: 'Sessiya topilmadi — qaytadan kiring' });
  req.user = user;
  req.db = db;
  req.token = token;
  next();
});

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

app.post('/api/register', withLock((req, res) => {
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
}));

app.post('/api/login', withLock((req, res) => {
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
}));

app.post('/api/logout', withLock((req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : (req.body && req.body.token);
  if (token) {
    const db = readDB();
    delete db.sessions[token];
    writeDB(db);
  }
  res.json({ ok: true });
}));

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
  const cs = req.user.careerSave;
  let worldDate = null;
  if (cs?.club?.leagueId) {
    const world = req.db.leagueWorlds?.[cs.club.leagueId];
    if (world) worldDate = world.gameDate;
  }
  const pendingWorldMatch = findPendingMatchForUser(req.db, req.user);
  res.json({ ok: true, player: cs || null, savedAt: req.user.careerSavedAt || null, worldDate, pendingWorldMatch });
});

// Marks the player's most recent shared-world match result as "seen" (so
// the client doesn't keep showing the same live-match replay prompt).
app.post('/api/career/ack-result', authMiddleware, (req, res) => {
  const db = req.db;
  const target = db.users.find((u) => u.username === req.user.username);
  if (target.careerSave?.career?.lastMatchResult) {
    target.careerSave.career.lastMatchResult.seenAt = new Date().toISOString();
    writeDB(db);
  }
  res.json({ ok: true });
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

// 4-BAND: foydalanuvchi "Play" bosganda - o'zining pending o'yini uchun
// LiveMatch'ni qurish uchun kerakli HAMMA narsa: ikkala klub, ularning
// world squadlari (aged/retired - frozen shipped data emas) va seed.
// Squadlar OG'IR bo'lgani uchun bu faqat foydalanuvchi haqiqatan o'ynashga
// kirganda chaqiriladi (20s polldagi /api/career/mine YENGIL holda qoladi).
app.get('/api/world-match-detail', authMiddleware, (req, res) => {
  const pending = findPendingMatchForUser(req.db, req.user);
  if (!pending) return res.status(404).json({ ok: false, error: "Sizda hozircha kutilayotgan o'yin yo'q" });
  const world = req.db.leagueWorlds[pending.leagueId];
  const homeTeam = engine.INITIAL_TEAMS.find((t) => t.id === pending.home);
  const awayTeam = engine.INITIAL_TEAMS.find((t) => t.id === pending.away);
  res.json({
    ok: true,
    leagueId: pending.leagueId, competition: pending.competition, round: pending.round, season: pending.season, seed: pending.seed, isHome: pending.isHome,
    home: { id: homeTeam.id, name: homeTeam.name, logo: homeTeam.logo, squad: world.squads[pending.home] || [] },
    away: { id: awayTeam.id, name: awayTeam.name, logo: awayTeam.logo, squad: world.squads[pending.away] || [] },
  });
});

// 4-BAND: foydalanuvchi LiveMatch orqali O'ZI o'ynagan pending o'yinning
// YAKUNIY (haqiqiy, statistikaga asoslangan) natijasini yozib qo'yadi.
// MUHIM CHEKLOV: bu yerda to'liq server-tomonlama qayta tekshirish (anti-
// cheat) yo'q - klient LiveMatch'da HAQIQATAN o'ynagan natijaga ishoniladi,
// xuddi Match Simulator/Turnir rejimlarida bo'lgani kabi. Agar shu o'yinda
// RAQIB klubida ham boshqa inson o'yinchi bo'lsa (ikki do'st bir-biriga
// qarshi) - hozircha FAQAT natijani yuborgan tomonning shaxsiy statistikasi
// yoziladi, ikkinchi insonning shaxsiy statistikasi bu safar yangilanmaydi
// (kelajakda kengaytirilishi mumkin).
app.post('/api/career/submit-match-result', authMiddleware, (req, res) => {
  const db = req.db;
  const { leagueId, round, scoreA, scoreB, myGoals, myAssists, myRating, myMinutes, myInjured, myInjuryDays, penWinnerClubId } = req.body || {};
  const pending = findPendingMatchForUser(db, req.user);
  if (!pending || pending.leagueId !== leagueId || pending.round !== round) {
    return res.status(409).json({ ok: false, error: "Bu o'yin endi kutilmoqda emas (allaqachon hal qilingan yoki topilmadi)" });
  }
  const world = db.leagueWorlds[leagueId];
  const isCup = pending.competition === 'cup';

  // 7-BAND: kubok o'yinlarida STANDINGS emas, `world.cup.rounds`ning ENG
  // OXIRGI turidan mos fikstura topiladi (league bo'lsa - avvalgidek
  // `world.schedule`dan).
  let m;
  let roundObj;
  if (isCup) {
    roundObj = world.cup?.rounds?.[world.cup.rounds.length - 1];
    m = roundObj?.round === round
      ? roundObj.matches.find((x) => x.home === pending.home && x.away === pending.away && x.pending && !x.played)
      : null;
  } else {
    roundObj = world.schedule.find((r) => r.round === round);
    m = roundObj?.matches.find((x) => x.home === pending.home && x.away === pending.away && x.pending && !x.played);
  }
  if (!m) return res.status(409).json({ ok: false, error: "Bu o'yin endi kutilmoqda emas" });

  const homeTeam = engine.INITIAL_TEAMS.find((t) => t.id === pending.home);
  const awayTeam = engine.INITIAL_TEAMS.find((t) => t.id === pending.away);
  const golA = Math.max(0, Math.min(30, Math.round(scoreA) || 0));
  const golB = Math.max(0, Math.min(30, Math.round(scoreB) || 0));

  if (isCup) {
    // Kubokda durang bo'lishi mumkin emas. Agar LiveMatch penalti
    // seriyasini JONLI ko'rsatgan bo'lsa (3-band), client `penWinnerClubId`
    // yuboradi - ANA SHU g'olib (adolatli, foydalanuvchi ko'rgan natija)
    // ishlatiladi. Faqat u yo'q bo'lsa (masalan eski client versiyasi)
    // xavfsizlik uchun oddiy taqqoslashga tushiladi.
    if (penWinnerClubId === pending.home || penWinnerClubId === pending.away) {
      m.winnerId = penWinnerClubId;
    } else {
      m.winnerId = golA === golB ? pending.home : (golA > golB ? pending.home : pending.away);
    }
  } else {
    engine.applyResultToStandings(world.standings, pending.home, pending.away, golA, golB);
  }

  // Insonning o'z goli tashqarisidagi qolgan gollarni NPC hamjamoadoshlarga
  // (topScorers) tarqatish - avvalgi avtomatik hal qilish yo'li ham xuddi
  // shunday qilardi. Kubokda topScorers'ga umuman tegilmaydi (u faqat
  // league uchun yuritiladi).
  if (!isCup) {
    const myTeamId = pending.isHome ? pending.home : pending.away;
    const myTeamGoals = pending.isHome ? golA : golB;
    const mySquad = world.squads[myTeamId] || [];
    const myPlayerId = req.user.careerSave?.id;
    const remainingGoals = Math.max(0, (myTeamGoals || 0) - (myGoals || 0));
    engine.distributeGoals(
      mySquad, myTeamId, pending.isHome ? homeTeam.name : awayTeam.name,
      remainingGoals, world.topScorers, [myPlayerId].filter(Boolean)
    );
  }

  // 5-BAND: qayta tomosha uchun - qaysi inson o'yinchi(lar) qaysi tomonda
  // o'ynagani saqlanadi. world.squads[clubId] o'zi FAQAT NPC'larni saqlaydi
  // (inson doim vaqtinchalik, faqat LiveMatch ekranida qo'shiladi), shuning
  // uchun seed bilan birga BU yozilmasa, keyinroq "qayta tomosha" boshqa
  // (insonsiz) tarkib bilan boshqa natija berardi.
  const usersInLeagueForMatch = db.users.filter((u) => u.careerSave?.club?.leagueId === leagueId);
  const humanEntries = [];
  usersInLeagueForMatch.forEach((u) => {
    const cid = u.careerSave.club.id;
    if (cid === pending.home) humanEntries.push({ side: 'home', id: u.careerSave.id, name: `${u.careerSave.name} ${u.careerSave.surname}`, pos: u.careerSave.position, ovr: u.careerSave.overall });
    if (cid === pending.away) humanEntries.push({ side: 'away', id: u.careerSave.id, name: `${u.careerSave.name} ${u.careerSave.surname}`, pos: u.careerSave.position, ovr: u.careerSave.overall });
  });
  m.played = true; m.pending = false; m.golA = golA; m.golB = golB; m.humanPlayed = true; m.humanEntries = humanEntries;

  if (!isCup) {
    world.roundResultsLog = [...(world.roundResultsLog || []), { round: roundObj.round, date: roundObj.date, matches: roundObj.matches }].slice(-20);
  }

  const target = db.users.find((u) => u.username === req.user.username);
  const cs = target.careerSave;
  cs.career = cs.career || {};
  cs.career.appearances = (cs.career.appearances || 0) + 1;
  cs.career.goals = (cs.career.goals || 0) + (myGoals || 0);
  cs.career.assists = (cs.career.assists || 0) + (myAssists || 0);
  if (typeof myRating === 'number') {
    cs.career.matchRatings = [...(cs.career.matchRatings || []), myRating].slice(-10);
  }
  if (myInjured) {
    cs.career.injury = { daysLeft: myInjuryDays || 5, description: 'Match injury' };
  }
  target.careerSavedAt = new Date().toISOString();

  if (isCup) {
    // 7-BAND: inson o'zi o'ynagan tur to'liq tugagach - keyingi tur yoki
    // chempion. Bu AYNAN `resolveCupRoundForLeague`dagi bilan bir xil
    // kaskad mantiq (NPC-only turlar uchun ham qo'llaniladigan).
    while (engine.isCupRoundComplete(world.cup.rounds[world.cup.rounds.length - 1]) && !world.cup.championId) {
      const finishedRound = world.cup.rounds[world.cup.rounds.length - 1];
      const winners = finishedRound.matches.map((mm) => mm.winnerId).filter(Boolean);
      if (winners.length <= 1) {
        world.cup.championId = winners[0] || null;
        if (world.cup.championId) {
          const champUser = usersInLeagueForMatch.find((u) => u.careerSave.club.id === world.cup.championId);
          if (champUser) {
            const ccs = champUser.careerSave;
            ccs.career.trophies = [...(ccs.career.trophies || []), { name: world.cup.name, year: world.season, icon: '🏆' }];
            ccs.career.messages = [...(ccs.career.messages || []), {
              id: `msg_cup_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              type: 'club', date: world.gameDate, from: world.cup.name,
              subject: `Champions: ${world.cup.name}!`,
              body: `Congratulations - you've won the ${world.cup.name} this season!`,
              read: false, resolved: true,
            }];
            champUser.careerSavedAt = new Date().toISOString();
          }
        }
        break;
      }
      world.cup.rounds.push(engine.buildNextCupRound(finishedRound));
    }
  } else if (engine.isSeasonComplete(world)) {
    const league = engine.LEAGUES.find((l) => l.id === leagueId);
    if (league) rolloverSeason(world, league);
  }

  writeDB(db);
  res.json({ ok: true, golA, golB });
});

// ============================================================
// SHARED WORLD — one calendar/schedule/standings PER LEAGUE, shared by
// every human player in it. The admin (and only the admin) advances it;
// everyone else just watches/plays whatever the admin has resolved so far.
// This is what lets two real players end up as teammates or opponents.
// ============================================================

// 4-BAND: userning klubi hozir "pending" (jonli o'ynash kutilayotgan)
// o'yinga ega bo'lsa, uning yengil (faqat ID/seed - squadlarsiz) tafsilotini
// qaytaradi. Squadlar og'ir bo'lgani uchun BU YERDA emas, faqat foydalanuvchi
// haqiqatan "Play" bosganda /api/world-match-detail orqali olinadi.
function findPendingMatchForUser(db, user) {
  const clubId = user?.careerSave?.club?.id;
  const leagueId = user?.careerSave?.club?.leagueId;
  if (!clubId || !leagueId) return null;
  const world = db.leagueWorlds?.[leagueId];
  if (!world?.schedule) return null;
  for (const round of world.schedule) {
    const m = round.matches.find((x) => x.pending && !x.played && (x.home === clubId || x.away === clubId));
    if (m) {
      return {
        leagueId, competition: 'league', round: round.round, season: world.season,
        home: m.home, away: m.away, seed: m.seed, isHome: m.home === clubId,
      };
    }
  }
  // 7-BAND: kubok turi ham xuddi shu tarzda "pending" bo'lib qolishi mumkin -
  // faqat OXIRGI (joriy) tur tekshiriladi, chunki oldingi turlar allaqachon
  // to'liq tugagan bo'ladi (keyingi tur faqat oldingisi tugagach yaratiladi).
  const cupRound = world.cup?.rounds?.[world.cup.rounds.length - 1];
  if (cupRound && !world.cup.championId) {
    const cm = cupRound.matches.find((x) => x.pending && !x.played && (x.home === clubId || x.away === clubId));
    if (cm) {
      return {
        leagueId, competition: 'cup', round: cupRound.round, season: world.season,
        home: cm.home, away: cm.away, seed: cm.seed, isHome: cm.home === clubId,
      };
    }
  }
  return null;
}

const FIRST_SEASON_START = '2026-08-01';

// Every club in a league gets its OWN evolving squad inside the world, deep
// copied out of the static shipped data. From here on the shared world never
// reads team.squad again - it reads world.squads[clubId], which ages, retires
// players and promotes academy graduates every season.
function buildWorldSquads(league) {
  const squads = {};
  league.teamIds.forEach((id) => {
    const team = engine.INITIAL_TEAMS.find((t) => t.id === id);
    squads[id] = engine.initWorldSquad(team, league.country);
  });
  return squads;
}

function ensureWorldForLeague(db, leagueId) {
  db.leagueWorlds = db.leagueWorlds || {};
  const league = engine.LEAGUES.find((l) => l.id === leagueId);
  if (!league) return null;

  const existing = db.leagueWorlds[leagueId];
  if (existing) {
    // Migration for worlds created before squads/seasons existed. Without
    // this an already-running db.json would keep falling back to the frozen
    // static squads and never roll a season over.
    if (!existing.squads) existing.squads = buildWorldSquads(league);
    if (!existing.season) existing.season = 1;
    if (!existing.seasonStartDate) existing.seasonStartDate = FIRST_SEASON_START;
    if (!existing.newsLog) existing.newsLog = [];
    if (!existing.seasonHistory) existing.seasonHistory = [];
    // 7-BAND: worlds yaratilgan paytda kubok yo'q edi - eski (migratsiya
    // qilinayotgan) worldlarga endi qo'shib qo'yamiz.
    if (!existing.cup) existing.cup = engine.initDomesticCup(league, existing.seasonStartDate);
    return existing;
  }

  db.leagueWorlds[leagueId] = {
    leagueId,
    leagueName: league.name,
    season: 1,
    seasonStartDate: FIRST_SEASON_START,
    day: 1,
    gameDate: engine.addDays(FIRST_SEASON_START, -1), // see season.js comment: one day before kickoff
    schedule: engine.buildSeasonSchedule(league, FIRST_SEASON_START),
    standings: engine.initStandings(league.teamIds),
    squads: buildWorldSquads(league),
    topScorers: {},
    roundResultsLog: [],
    newsLog: [],
    seasonHistory: [],
    cup: engine.initDomesticCup(league, FIRST_SEASON_START)
  };
  return db.leagueWorlds[leagueId];
}

// ------------------------------------------------------------
// Season rollover: runs the moment the last fixture of a season has been
// resolved. Ages every squad in the league by a year (retirements + academy
// intake), archives the final table and top scorers, then generates a brand
// new schedule for the following season.
//
// The calendar does NOT jump over the summer. Every league shares one global
// date (db.worldDate), and leagues finish their seasons on different days (an
// 18-team league needs a different number of rounds than a 20-team one), so
// jumping a finished league straight to the next kickoff would leave the
// leagues permanently out of sync with each other. Instead the new schedule is
// built starting at next August 1st and the world keeps ticking through the
// off-season - which is exactly when the international tournaments run.
// ------------------------------------------------------------
const PENDING_MATCH_CATCHUP_DAYS = 15;

// 6-BAND (xavfsizlik zanjiri sifatida 4-band bilan birga kerak): agar
// foydalanuvchi o'z navbatidagi o'yinni admin global kunidan
// PENDING_MATCH_CATCHUP_DAYS kun (yoki undan ko'p) ichida o'ynamasa, tizim
// buni ENDI foydalanuvchisiz avtomatik hal qiladi - aks holda bitta faol
// bo'lmagan foydalanuvchi butun liganing mavsumini abadiy "muzlatib"
// qo'yardi (chunki isSeasonComplete BARCHA o'yinlar played bo'lishini kutadi).
// Har bir ta'sirlangan foydalanuvchiga NIMA sodir bo'lgani va o'zining
// statistikasi (gol/assist/reyting) bilan xabar qoldiriladi.
function autoResolveStalePendingMatches(db, newDate) {
  const resolvedForUsers = [];
  Object.keys(db.leagueWorlds).forEach((leagueId) => {
    const world = db.leagueWorlds[leagueId];
    if (!world?.schedule) return;
    world.schedule.forEach((round) => {
      const ageDays = (new Date(newDate) - new Date(round.date)) / 86400000;
      if (ageDays < PENDING_MATCH_CATCHUP_DAYS) return;
      round.matches = round.matches.map((m) => {
        if (!m.pending || m.played) return m;
        const homeTeam = engine.INITIAL_TEAMS.find((t) => t.id === m.home);
        const awayTeam = engine.INITIAL_TEAMS.find((t) => t.id === m.away);
        if (!homeTeam || !awayTeam) return { ...m, played: true, pending: false, golA: 0, golB: 0 };

        const usersInLeague = db.users.filter((u) => u.careerSave?.club?.leagueId === leagueId);
        const humanHome = usersInLeague.filter((u) => u.careerSave.club.id === m.home).map((u) => ({ ...u.careerSave, username: u.username }));
        const humanAway = usersInLeague.filter((u) => u.careerSave.club.id === m.away).map((u) => ({ ...u.careerSave, username: u.username }));
        const homeSquad = world.squads[m.home] || [];
        const awaySquad = world.squads[m.away] || [];
        const result = engine.resolveMatch(homeTeam, awayTeam, homeSquad, awaySquad, humanHome, humanAway, world.topScorers);
        engine.applyResultToStandings(world.standings, m.home, m.away, result.golA, result.golB);

        result.humanResults.forEach((hr) => {
          const user = usersInLeague.find((u) => u.username === hr.username);
          if (!user) return;
          const cs = user.careerSave;
          const isHome = hr.side === 'home';
          const opponentTeam = hr.opponentTeam;
          cs.career = cs.career || {};
          cs.career.messages = cs.career.messages || [];
          if (hr.pStats.played) {
            cs.career.appearances = (cs.career.appearances || 0) + 1;
            cs.career.goals = (cs.career.goals || 0) + hr.pStats.goals;
            cs.career.assists = (cs.career.assists || 0) + hr.pStats.assists;
            cs.career.matchRatings = [...(cs.career.matchRatings || []), hr.pStats.rating].slice(-10);
            if (hr.pStats.injured) {
              cs.career.injury = { daysLeft: hr.pStats.injuryDays, description: 'Match injury' };
            }
          }
          const resultLine = `${isHome ? homeTeam.name : awayTeam.name} ${isHome ? result.golA : result.golB} - ${isHome ? result.golB : result.golA} ${opponentTeam.name}`;
          let body = `Siz ${PENDING_MATCH_CATCHUP_DAYS} kundan ko'proq o'ynamaganingiz uchun ushbu o'yin avtomatik o'tkazildi: ${resultLine}.`;
          if (hr.pStats.played) {
            body += ` Sizning statistikangiz: ${hr.pStats.minutes} daqiqa, reyting ${hr.pStats.rating}, ${hr.pStats.goals} gol, ${hr.pStats.assists} assist.`;
            if (hr.pStats.injured) body += ` Shu o'yinda jarohat oldingiz (${hr.pStats.injuryDays} kun).`;
          } else {
            body += ' Siz zahirada qoldingiz.';
          }
          cs.career.messages = [...cs.career.messages, {
            id: `msg_auto_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            type: 'club', date: newDate, from: (isHome ? homeTeam.name : awayTeam.name),
            subject: `Avtomatik o'tkazildi: ${resultLine}`, body, read: false, resolved: true,
          }];
          user.careerSavedAt = new Date().toISOString();
          resolvedForUsers.push({ username: hr.username, resultLine });
        });

        return { ...m, played: true, pending: false, golA: result.golA, golB: result.golB, autoResolved: true };
      });
    });

    // 7-BAND: kubok pending o'yinlari HAM shu xavfsizlik zanjiriga kirishi
    // kerak - aks holda ular `world.schedule`da emas, `world.cup.rounds`da
    // yotgani uchun yuqoridagi tekshiruv ularni umuman ko'rmaydi, va bitta
    // o'ynalmagan kubok o'yini o'sha BUTUN turni (demak, boshqa hamma
    // klublarning kubokdagi taraqqiyotini ham) abadiy to'xtatib qo'yardi.
    const cupRound = world.cup?.rounds?.[world.cup.rounds.length - 1];
    if (cupRound && !world.cup.championId) {
      const ageDays = (new Date(newDate) - new Date(cupRound.date)) / 86400000;
      if (ageDays >= PENDING_MATCH_CATCHUP_DAYS) {
        const usersInLeague = db.users.filter((u) => u.careerSave?.club?.leagueId === leagueId);
        cupRound.matches.forEach((m) => {
          if (!m.pending || m.played) return;
          const homeTeam = engine.INITIAL_TEAMS.find((t) => t.id === m.home);
          const awayTeam = engine.INITIAL_TEAMS.find((t) => t.id === m.away);
          if (!homeTeam || !awayTeam) { m.played = true; m.pending = false; m.winnerId = m.home; return; }
          const humanHome = usersInLeague.filter((u) => u.careerSave.club.id === m.home).map((u) => ({ ...u.careerSave, username: u.username }));
          const humanAway = usersInLeague.filter((u) => u.careerSave.club.id === m.away).map((u) => ({ ...u.careerSave, username: u.username }));
          const homeSquad = world.squads[m.home] || [];
          const awaySquad = world.squads[m.away] || [];
          const result = engine.resolveMatch(homeTeam, awayTeam, homeSquad, awaySquad, humanHome, humanAway, world.topScorers);
          m.played = true; m.pending = false; m.golA = result.golA; m.golB = result.golB; m.autoResolved = true;
          if (result.golA === result.golB) {
            const sA = engine.teamStrength(homeSquad);
            const sB = engine.teamStrength(awaySquad);
            m.winnerId = Math.random() < sA / ((sA + sB) || 1) ? m.home : m.away;
          } else {
            m.winnerId = result.golA > result.golB ? m.home : m.away;
          }
          result.humanResults.forEach((hr) => {
            const user = usersInLeague.find((u) => u.username === hr.username);
            if (!user) return;
            const cs = user.careerSave;
            cs.career = cs.career || {};
            cs.career.messages = cs.career.messages || [];
            if (hr.pStats.played) {
              cs.career.appearances = (cs.career.appearances || 0) + 1;
              cs.career.goals = (cs.career.goals || 0) + hr.pStats.goals;
              cs.career.assists = (cs.career.assists || 0) + hr.pStats.assists;
              cs.career.matchRatings = [...(cs.career.matchRatings || []), hr.pStats.rating].slice(-10);
              if (hr.pStats.injured) cs.career.injury = { daysLeft: hr.pStats.injuryDays, description: 'Match injury' };
            }
            const resultLine = `${homeTeam.name} ${result.golA} - ${result.golB} ${awayTeam.name}`;
            cs.career.messages = [...cs.career.messages, {
              id: `msg_auto_cup_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              type: 'club', date: newDate, from: world.cup.name,
              subject: `Kubokda avtomatik o'tkazildi: ${resultLine}`,
              body: `Siz ${PENDING_MATCH_CATCHUP_DAYS} kundan ko'proq o'ynamaganingiz uchun ${world.cup.name}dagi ushbu o'yin avtomatik hal qilindi: ${resultLine}.`,
              read: false, resolved: true,
            }];
            user.careerSavedAt = new Date().toISOString();
            resolvedForUsers.push({ username: hr.username, resultLine });
          });
        });

        // Kaskad: agar shu tur endi to'liq bo'lsa, keyingi turni yaratamiz
        // (yoki chempionni toj kiyamiz) - `resolveCupRoundForLeague`dagi
        // bilan bir xil mantiq.
        while (engine.isCupRoundComplete(world.cup.rounds[world.cup.rounds.length - 1]) && !world.cup.championId) {
          const finishedRound = world.cup.rounds[world.cup.rounds.length - 1];
          const winners = finishedRound.matches.map((mm) => mm.winnerId).filter(Boolean);
          if (winners.length <= 1) {
            world.cup.championId = winners[0] || null;
            if (world.cup.championId) {
              const champUser = usersInLeague.find((u) => u.careerSave.club.id === world.cup.championId);
              if (champUser) {
                const ccs = champUser.careerSave;
                ccs.career.trophies = [...(ccs.career.trophies || []), { name: world.cup.name, year: world.season, icon: '🏆' }];
                ccs.career.messages = [...(ccs.career.messages || []), {
                  id: `msg_cup_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                  type: 'club', date: newDate, from: world.cup.name,
                  subject: `Champions: ${world.cup.name}!`,
                  body: `Congratulations - you've won the ${world.cup.name} this season!`,
                  read: false, resolved: true,
                }];
                champUser.careerSavedAt = new Date().toISOString();
              }
            }
            break;
          }
          world.cup.rounds.push(engine.buildNextCupRound(finishedRound));
        }
      }
    }
  });
  return resolvedForUsers;
}

function rolloverSeason(world, league) {
  const finishedSeason = world.season || 1;
  const table = engine.sortedTable(world.standings);
  const championId = table[0]?.teamId;
  const championName = engine.INITIAL_TEAMS.find((t) => t.id === championId)?.name || championId || '—';
  const topScorerList = Object.values(world.topScorers || {}).sort((a, b) => b.goals - a.goals).slice(0, 10);

  // 1) Age every squad, collecting who hung up their boots, who was released,
  //    and exactly which players are brand new (counting "age <= 18" instead
  //    would also sweep up last season's intake, who are 17-19 by now).
  const retirementLog = [];
  const releaseLog = [];
  const idsBefore = new Set(Object.values(world.squads).flat().map((p) => p.id));
  league.teamIds.forEach((clubId) => {
    const team = engine.INITIAL_TEAMS.find((t) => t.id === clubId);
    const clubName = team?.name || clubId;
    if (!world.squads[clubId]) world.squads[clubId] = engine.initWorldSquad(team, league.country);
    world.squads[clubId] = engine.ageAndRefreshSquad(world.squads[clubId], retirementLog, clubName, league.country, releaseLog);
  });
  const newAcademy = Object.values(world.squads).flat().filter((p) => !idsBefore.has(p.id)).length;

  // 2) Archive the season that just ended.
  world.seasonHistory = [...(world.seasonHistory || []), {
    season: finishedSeason,
    startDate: world.seasonStartDate,
    endDate: world.gameDate,
    championId: championId || null,
    championName,
    table: table.slice(0, 5),
    topScorers: topScorerList.slice(0, 3)
  }].slice(-20);

  // 3) News: the champion, the famous retirements (OVR >= 80) called out
  //    separately from the long tail, and the academy intake headline.
  const famous = retirementLog.filter((r) => (r.finalOvr || 0) >= FAMOUS_OVR).sort((a, b) => b.finalOvr - a.finalOvr);
  const news = [];
  news.push({
    type: 'champion', season: finishedSeason, date: world.gameDate,
    title: `${championName} — ${world.leagueName} chempioni (${finishedSeason}-mavsum)`,
    detail: topScorerList[0] ? `Eng ko'p gol urgan: ${topScorerList[0].name} (${topScorerList[0].goals})` : null
  });
  famous.forEach((r) => {
    news.push({
      type: 'retirement_star', season: finishedSeason, date: world.gameDate,
      title: `${r.name} futbolni tark etdi`,
      detail: `${r.club} · ${r.age} yosh · yakuniy reyting ${r.finalOvr}`,
      ovr: r.finalOvr
    });
  });
  if (retirementLog.length > famous.length) {
    news.push({
      type: 'retirement_bulk', season: finishedSeason, date: world.gameDate,
      title: `Yana ${retirementLog.length - famous.length} futbolchi karyerasini yakunladi`,
      detail: `${world.leagueName} · ${finishedSeason}-mavsum yakuni`
    });
  }
  if (newAcademy > 0) {
    news.push({
      type: 'academy', season: finishedSeason, date: world.gameDate,
      title: `Akademiyadan ${newAcademy} yosh futbolchi asosiy tarkibga ko'tarildi`,
      detail: world.leagueName
    });
  }
  world.newsLog = [...news, ...(world.newsLog || [])].slice(0, 120);

  // 4) Fresh season.
  const nextStart = `${Number(world.seasonStartDate.slice(0, 4)) + 1}-08-01`;
  world.season = finishedSeason + 1;
  world.seasonStartDate = nextStart;
  world.day = 1;
  world.schedule = engine.buildSeasonSchedule(league, nextStart);
  world.standings = engine.initStandings(league.teamIds);
  world.topScorers = {};
  world.roundResultsLog = [];
  // 7-BAND: yangi mavsum uchun yangi kubok. Eski kubok (agar allaqachon
  // tugamagan bo'lsa - kamdan-kam, chunki uning turlari league mavsumidan
  // KAM sonli) arxivlanmasdan shunchaki almashtiriladi.
  world.cup = engine.initDomesticCup(league, nextStart);

  return {
    season: finishedSeason, championName,
    retirements: retirementLog.length, famousRetirements: famous.length,
    released: releaseLog.length, newAcademy, nextSeasonStart: nextStart
  };
}

// 7-BAND: bitta ligadagi kubok turini (agar bugun uning kuni bo'lsa) hal
// qiladi - AYNAN league bilan bir xil pending/auto-resolve mantig'i:
// insonli o'yin "pending" bo'lib qoladi (LiveMatch orqali o'ynaladi),
// NPC-only o'yin darhol hal bo'ladi. Farqi: bu yerda STANDINGS emas,
// G'OLIB kerak - durang bo'lsa, jamoa kuchi (teamStrength) bo'yicha
// tortishilgan tasodifiy tanlov bilan hal qilinadi (bu SERVERDA, ko'rinmas
// holda - inson buni LiveMatch orqali "jonli" ko'rmaydi, chunki durang
// holatidagi penalti seriyasini bu yerda animatsiya qilish imkonsiz;
// bilib qoldirilgan soddalashtirish).
function resolveCupRoundForLeague(db, leagueId, newDate) {
  const world = db.leagueWorlds[leagueId];
  if (!world?.cup?.rounds?.length || world.cup.championId) return;
  const round = world.cup.rounds[world.cup.rounds.length - 1];
  if (round.date !== newDate) return;

  const usersInLeague = db.users.filter((u) => u.careerSave?.club?.leagueId === leagueId);

  round.matches.forEach((m) => {
    if (m.played) return; // bye - already resolved when the round was built
    const homeTeam = engine.INITIAL_TEAMS.find((t) => t.id === m.home);
    const awayTeam = engine.INITIAL_TEAMS.find((t) => t.id === m.away);
    if (!homeTeam || !awayTeam) { m.played = true; m.golA = 0; m.golB = 0; m.winnerId = m.home; return; }

    const humanHome = usersInLeague.filter((u) => u.careerSave.club.id === m.home).map((u) => ({ ...u.careerSave, username: u.username }));
    const humanAway = usersInLeague.filter((u) => u.careerSave.club.id === m.away).map((u) => ({ ...u.careerSave, username: u.username }));
    const activeHumanHome = humanHome.filter((hp) => !hp.career?.injury?.daysLeft);
    const activeHumanAway = humanAway.filter((hp) => !hp.career?.injury?.daysLeft);
    if (activeHumanHome.length || activeHumanAway.length) {
      m.pending = true;
      m.seed = engine.generateMatchSeed(leagueId, world.season, `cup-r${round.round}`, m.home, m.away);
      return;
    }

    const homeSquad = world.squads[m.home] || [];
    const awaySquad = world.squads[m.away] || [];
    const result = engine.resolveMatch(homeTeam, awayTeam, homeSquad, awaySquad, humanHome, humanAway, world.topScorers);
    m.played = true; m.golA = result.golA; m.golB = result.golB;
    if (result.golA === result.golB) {
      const sA = engine.teamStrength(homeSquad);
      const sB = engine.teamStrength(awaySquad);
      m.winnerId = Math.random() < sA / ((sA + sB) || 1) ? m.home : m.away;
      m.wentToTiebreak = true;
    } else {
      m.winnerId = result.golA > result.golB ? m.home : m.away;
    }

    result.humanResults.forEach((hr) => {
      const user = usersInLeague.find((u) => u.username === hr.username);
      if (!user) return;
      const cs = user.careerSave;
      cs.career = cs.career || {};
      if (hr.pStats.played) {
        cs.career.appearances = (cs.career.appearances || 0) + 1;
        cs.career.goals = (cs.career.goals || 0) + hr.pStats.goals;
        cs.career.assists = (cs.career.assists || 0) + hr.pStats.assists;
        cs.career.matchRatings = [...(cs.career.matchRatings || []), hr.pStats.rating].slice(-10);
        if (hr.pStats.injured) cs.career.injury = { daysLeft: hr.pStats.injuryDays, description: 'Match injury' };
      }
      user.careerSavedAt = new Date().toISOString();
    });
  });

  // Bitta tur to'liq tugagach - keyingi turni yaratamiz (yoki chempionni
  // toj kiyamiz). Agar YANGI tur BUTUNLAY "bye"lardan tashkil topgan bo'lsa
  // (kichik ligalarda bo'lishi mumkin), u DARHOL to'liq bo'lib qoladi -
  // shuning uchun sikl davomida davom ettiramiz.
  while (engine.isCupRoundComplete(world.cup.rounds[world.cup.rounds.length - 1]) && !world.cup.championId) {
    const finishedRound = world.cup.rounds[world.cup.rounds.length - 1];
    const winners = finishedRound.matches.map((m) => m.winnerId).filter(Boolean);
    if (winners.length <= 1) {
      world.cup.championId = winners[0] || null;
      if (world.cup.championId) {
        const champUser = usersInLeague.find((u) => u.careerSave.club.id === world.cup.championId);
        if (champUser) {
          const cs = champUser.careerSave;
          cs.career.trophies = [...(cs.career.trophies || []), { name: world.cup.name, year: world.season, icon: '🏆' }];
          cs.career.messages = [...(cs.career.messages || []), {
            id: `msg_cup_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            type: 'club', date: newDate, from: world.cup.name,
            subject: `Champions: ${world.cup.name}!`,
            body: `Congratulations - you've won the ${world.cup.name} this season!`,
            read: false, resolved: true,
          }];
          champUser.careerSavedAt = new Date().toISOString();
        }
      }
      break;
    }
    world.cup.rounds.push(engine.buildNextCupRound(finishedRound));
  }
}


// Read-only: every league in the game, with a light summary of its shared
// world (season/day/date) if one has been created yet, plus a flag for the
// requesting user's own club/league. Any logged-in user can call this - it's
// what lets someone browse a league they've never played in.
app.get('/api/leagues', authMiddleware, (req, res) => {
  const db = req.db;
  const myLeagueId = req.user.careerSave?.club?.leagueId || null;
  const leagues = engine.LEAGUES.map((l) => {
    const world = db.leagueWorlds?.[l.id];
    return {
      id: l.id,
      name: l.name,
      country: l.country,
      flag: l.flag,
      teamCount: l.teamIds.length,
      isMine: l.id === myLeagueId,
      season: world?.season || null,
      day: world?.day || null,
      gameDate: world?.gameDate || null,
    };
  });
  res.json({ ok: true, worldDate: db.worldDate || null, leagues });
});

// Read-only: current shared schedule/standings for a league, so any client
// (not just the admin) can show "here's where things stand".
app.get('/api/world/:leagueId', authMiddleware, (req, res) => {
  const db = req.db;
  const world = ensureWorldForLeague(db, req.params.leagueId);
  if (!world) return res.status(404).json({ ok: false, error: 'League not found' });
  writeDB(db); // persist a freshly-created (or freshly-migrated) world immediately
  // world.squads is ~400 players per league and no page needs it yet, so it is
  // only sent when explicitly asked for - otherwise this response would grow
  // several hundred KB for every poll.
  const { squads, ...lean } = world;
  res.json({ ok: true, world: req.query.includeSquads ? world : lean });
});

// ADMIN ONLY: advances every active league's shared world by exactly one
// day, resolving that day's round (if any) for ALL of them at once. Any
// human player whose club is involved gets their own personal match result
// computed and written straight to their careerSave, plus a `lastMatchResult`
// they can view next time they open the app.
// ============================================================
// TO'LIQ TOZALASH — faqat admin uchun. Barcha userlar (admin bundan mustasno),
// barcha karyeralar, barcha liga world'lari, xalqaro turnirlar tarixi —
// HAMMASI o'chadi, o'yin butunlay 0'dan boshlanadi. Buni Manual Deploy yoki
// server restart bilan aralashtirmaslik kerak — bu ATayLAB, admin so'rovi
// bilan, MongoDB hujjatining o'zini bo'shatib qayta yozadi.
//
// Admin akkauntning o'zi SAQLANIB QOLADI (parol o'zgarmaydi), lekin uning
// shaxsiy careerSave'i ham tozalanadi — chunki "hammasi 0'dan" degani admin
// ham mustasno emas. Eski sessiya token'lari (shu jumladan so'rovni
// yuborayotgan admin'ning o'zinikidan tashqari barchasi) bekor bo'ladi,
// shuning uchun javobda admin uchun YANGI token qaytariladi — frontend
// qayta login qilmasdan davom eta oladi.
// ============================================================
app.post('/api/admin/wipe-data', authMiddleware, adminMiddleware, (req, res) => {
  const db = req.db;
  const adminUser = req.user;

  const freshAdmin = {
    username: adminUser.username,
    passwordHash: adminUser.passwordHash,
    canAccessPro: true,
    isAdmin: true,
    createdAt: adminUser.createdAt || new Date().toISOString(),
    careerSave: null,
    careerSavedAt: null
  };

  db.users = [freshAdmin];
  db.leagueWorlds = {};
  db.international = { activeTournaments: [], history: [], newsLog: [], lastDate: null };
  delete db.worldDate;
  db.sessions = {};

  const newToken = issueSession(db, adminUser.username); // also calls writeDB(db)

  console.log(`⚠️  TO'LIQ TOZALASH bajarildi — admin: ${adminUser.username}`);
  res.json({ ok: true, token: newToken, message: "Barcha ma'lumotlar tozalandi" });
});


app.post('/api/admin/advance-world-day', authMiddleware, adminMiddleware, (req, res) => {
  const db = req.db;
  db.leagueWorlds = db.leagueWorlds || {};

  // 2-BAND: BARCHA ligalar har kuni suriladi, faqat ichida jonli user bo'lgan
  // ligalar EMAS. Avval faqat foydalanuvchi tanlagan ligalar world olardi -
  // ya'ni hech kim o'ynamagan liga umuman "muzlab" qolardi va istalgan
  // foydalanuvchi uni ochib ko'rmoqchi bo'lsa, hali boshlanmagan (kunlar soni
  // 0) bo'sh dunyoni ko'rardi. Endi `engine.LEAGUES`ning har biri (21 ta)
  // world olib, admin bosgan sari bir xil tezlikda oldinga suriladi - hajmi
  // (barcha 21 liga uchun jami ~0.7MB, standalone test bilan o'lchandi)
  // 16MB Mongo hujjat limitidan juda uzoq, xavfsiz.
  engine.LEAGUES.forEach((l) => ensureWorldForLeague(db, l.id));

  const summary = [];
  const seasonRollovers = [];

  // One global calendar for the whole game. Leagues used to each keep their
  // own gameDate, which drifted apart as soon as seasons of different lengths
  // rolled over at different times - and the international calendar needs a
  // single date everyone agrees on.
  const knownDates = Object.values(db.leagueWorlds).map((w) => w.gameDate).filter(Boolean);
  db.worldDate = db.worldDate || (knownDates.length ? knownDates.sort().slice(-1)[0] : engine.addDays(FIRST_SEASON_START, -1));
  const newDate = engine.addDays(db.worldDate, 1);
  db.worldDate = newDate;

  Object.keys(db.leagueWorlds).forEach((leagueId) => {
    const world = ensureWorldForLeague(db, leagueId); // also migrates older worlds
    const league = engine.LEAGUES.find((l) => l.id === leagueId);
    if (!world || !league) return;
    world.gameDate = newDate;
    world.day += 1;

    // 7-BAND: kubok turi league matchdayidan MUSTAQIL - shuning uchun bu
    // pastdagi "bugun league o'yini yo'q" early-returndan OLDIN chaqiriladi,
    // aks holda league o'yini bo'lmagan kunlarda kubok hech qachon
    // surilmay qolardi.
    resolveCupRoundForLeague(db, leagueId, newDate);

    const roundIdx = world.schedule.findIndex((r) => r.date === newDate && !r.matches.every((m) => m.played));
    if (roundIdx === -1) return;

    const round = world.schedule[roundIdx];
    const usersInLeague = db.users.filter((u) => u.careerSave?.club?.leagueId === leagueId);

    const updatedMatches = round.matches.map((m) => {
      const homeTeam = engine.INITIAL_TEAMS.find((t) => t.id === m.home);
      const awayTeam = engine.INITIAL_TEAMS.find((t) => t.id === m.away);
      if (!homeTeam || !awayTeam) return { ...m, played: true, golA: 0, golB: 0 };

      const humanHome = usersInLeague.filter((u) => u.careerSave.club.id === m.home).map((u) => ({ ...u.careerSave, username: u.username }));
      const humanAway = usersInLeague.filter((u) => u.careerSave.club.id === m.away).map((u) => ({ ...u.careerSave, username: u.username }));

      // The shared world's OWN squads (aged/retired/academy-refreshed), not
      // the frozen static ones the game shipped with.
      const homeSquad = world.squads[m.home] || [];
      const awaySquad = world.squads[m.away] || [];

      // 4-BAND: agar shu o'yinda kamida bir nafar jarohatlanmagan inson
      // o'yinchi bo'lsa, MATCH AVTOMATIK hal qilinmaydi - u foydalanuvchi
      // LiveMatch orqali o'zi "o'ynaguncha" KUTILMOQDA (pending) holatida
      // qoladi. Jarohatlangan bo'lsa (o'zi o'ynay olmaydi) yoki hech qanday
      // inson yo'q bo'lsa - avvalgidek, darhol avtomatik hal qilinadi.
      const activeHumanHome = humanHome.filter((hp) => !hp.career?.injury?.daysLeft);
      const activeHumanAway = humanAway.filter((hp) => !hp.career?.injury?.daysLeft);
      if (activeHumanHome.length || activeHumanAway.length) {
        return {
          ...m,
          played: false,
          pending: true,
          seed: engine.generateMatchSeed(leagueId, world.season, round.round, m.home, m.away),
        };
      }

      const result = engine.resolveMatch(homeTeam, awayTeam, homeSquad, awaySquad, humanHome, humanAway, world.topScorers);
      engine.applyResultToStandings(world.standings, m.home, m.away, result.golA, result.golB);

      result.humanResults.forEach((hr) => {
        const user = usersInLeague.find((u) => u.username === hr.username);
        if (!user) return;
        const cs = user.careerSave;
        const isHome = hr.side === 'home';
        const opponentTeam = hr.opponentTeam;
        cs.career = cs.career || {};
        if (hr.pStats.played) {
          cs.career.appearances = (cs.career.appearances || 0) + 1;
          cs.career.goals = (cs.career.goals || 0) + hr.pStats.goals;
          cs.career.assists = (cs.career.assists || 0) + hr.pStats.assists;
          cs.career.matchRatings = [...(cs.career.matchRatings || []), hr.pStats.rating].slice(-10);
          if (hr.pStats.injured) {
            cs.career.injury = { daysLeft: hr.pStats.injuryDays, description: 'Match injury' };
          }
        }
        cs.career.lastMatchResult = {
          date: newDate, opponentName: opponentTeam.name, opponentLogo: opponentTeam.logo,
          isHome, golFor: isHome ? result.golA : result.golB, golAgainst: isHome ? result.golB : result.golA,
          pStats: hr.pStats, seenAt: null
        };
        user.careerSavedAt = new Date().toISOString();
      });

      summary.push({
        league: world.leagueName, home: homeTeam.name, away: awayTeam.name,
        score: `${result.golA}-${result.golB}`, humanPlayers: result.humanResults.length
      });

      return { ...m, played: true, golA: result.golA, golB: result.golB };
    });

    world.schedule[roundIdx] = { ...round, matches: updatedMatches };
    world.roundResultsLog = [...(world.roundResultsLog || []), { round: round.round, date: newDate, matches: updatedMatches }].slice(-20);

    // That may well have been the last fixture of the season - if so, age the
    // whole league a year and build the next season's calendar right away.
    if (engine.isSeasonComplete(world)) {
      seasonRollovers.push({ league: world.leagueName, ...rolloverSeason(world, league) });
    }
  });

  // 6-BAND: 15+ kun kutilgan (pending) o'yinlarni foydalanuvchisiz hal qiladi -
  // aks holda bitta faol bo'lmagan foydalanuvchi butun liganing mavsumini
  // abadiy to'xtatib qo'yardi.
  const autoResolvedPending = autoResolveStalePendingMatches(db, newDate);

  // Injury recovery. The shared world hands out match injuries but nothing on
  // the server ever healed them, so an injured player stayed injured forever
  // as far as the server was concerned - which quietly made them permanently
  // ineligible for national-team call-ups.
  db.users.forEach((u) => {
    const inj = u.careerSave?.career?.injury;
    if (!inj?.daysLeft) return;
    inj.daysLeft -= 1;
    if (inj.daysLeft <= 0) u.careerSave.career.injury = null;
    u.careerSavedAt = new Date().toISOString();
  });

  // International calendar rides on the same day tick as the leagues.
  const internationalEvents = international.advanceInternational(db, newDate);

  writeDB(db);
  res.json({
    ok: true,
    worldDate: newDate,
    resolvedMatches: summary.length,
    matches: summary,
    seasonRollovers,
    internationalEvents,
    autoResolvedPending
  });
});

// ============================================================
// NATIONAL TEAMS — read-only views for the Career app.
// ============================================================

// Overview: what is happening internationally right now, plus past winners.
app.get('/api/international', authMiddleware, (req, res) => {
  const db = req.db;
  const intl = international.ensureInternational(db);
  // Strip the per-tournament match log down to what a summary screen needs;
  // a finished World Cup carries 64 results nobody scrolls through here.
  const tournaments = intl.activeTournaments.map((t) => ({
    id: t.id, key: t.key, name: t.name, year: t.year, size: t.size,
    startDate: t.startDate, finished: t.finished, winner: t.winner, runnerUp: t.runnerUp,
    groups: t.groups.map((g) => ({ name: g.name, table: Object.values(g.table).sort((a, b) => (b.pts - a.pts) || ((b.gf - b.ga) - (a.gf - a.ga))) })),
    knockout: t.knockout,
    topScorers: Object.values(t.topScorers).sort((a, b) => b.goals - a.goals).slice(0, 10),
    recentResults: t.results.slice(-12)
  }));
  res.json({
    ok: true,
    worldDate: db.worldDate || null,
    tournaments,
    history: intl.history,
    news: intl.newsLog.slice(0, 30)
  });
});

// The current call-up list for one nation, with the requesting user flagged.
app.get('/api/international/nation/:country', authMiddleware, (req, res) => {
  const teams = international.buildNationalTeams(req.db);
  const team = teams[req.params.country];
  if (!team) return res.status(404).json({ ok: false, error: "Bu mamlakat uchun yetarli futbolchi yo'q" });
  res.json({
    ok: true,
    team: {
      country: team.country, flag: team.flag, confederation: team.confederation,
      strength: Math.round(team.strength * 10) / 10,
      squad: team.squad.map((p) => ({
        id: p.id, name: p.name, pos: p.pos, ovr: p.ovr, clubName: p.clubName,
        username: p.username, isYou: p.username === req.user.username
      }))
    }
  });
});

// MongoDB'ga ulanish app.listen()dan OLDIN tugashi shart — aks holda birinchi
// so'rov readDB()ni cache hali yo'q paytda chaqirib qolishi mumkin edi.
// Ulanib bo'lmasa server umuman ishga tushmaydi (process.exit) — noto'g'ri
// MONGODB_URI bilan "tirik" ko'rinib, aslida hech narsa saqlamaydigan
// serverdan ko'ra Render logida ochiq xato yaxshiroq.
initDB()
  .then(() => {
    ensureAdminSeeded();
    app.listen(PORT, () => {
      console.log(`🚀 Match Simulator auth server: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB'ga ulanib bo'lmadi, server ishga tushmaydi:", err.message);
    process.exit(1);
  });
