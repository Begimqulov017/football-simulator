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
const engine = require('./engine');
const international = require('./international');

const PORT = process.env.PORT || 4000;

// Bumped every time server/index.js gets new endpoints/fields the frontend
// depends on, so the frontend can detect "siz eski backend'ni ishlatyapsiz,
// qayta deploy qiling" instead of showing a confusing generic network error.
const SERVER_VERSION = 8;
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
  res.json({ ok: true, player: cs || null, savedAt: req.user.careerSavedAt || null, worldDate });
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

// ============================================================
// SHARED WORLD — one calendar/schedule/standings PER LEAGUE, shared by
// every human player in it. The admin (and only the admin) advances it;
// everyone else just watches/plays whatever the admin has resolved so far.
// This is what lets two real players end up as teammates or opponents.
// ============================================================

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
    seasonHistory: []
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

  return {
    season: finishedSeason, championName,
    retirements: retirementLog.length, famousRetirements: famous.length,
    released: releaseLog.length, newAcademy, nextSeasonStart: nextStart
  };
}

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
app.post('/api/admin/advance-world-day', authMiddleware, adminMiddleware, (req, res) => {
  const db = req.db;
  db.leagueWorlds = db.leagueWorlds || {};

  // Make sure every league with at least one active human player has a world.
  const leagueIdsInUse = new Set(
    db.users.filter((u) => u.careerSave?.club?.leagueId).map((u) => u.careerSave.club.leagueId)
  );
  leagueIdsInUse.forEach((leagueId) => ensureWorldForLeague(db, leagueId));

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
    internationalEvents
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

app.listen(PORT, () => {
  console.log(`🚀 Match Simulator auth server: http://localhost:${PORT}`);
});
