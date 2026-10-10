// ============================================================
// PHASE 10 — ADMIN PANEL & UNIFIED ENGINE ENDPOINTLARI
// ============================================================
// Bu modul index.js'ga `registerAdminTools(app, ctx)` orqali ulanadi.
//
//  1. Master Calendar    — qo'lda (+1 / +X kun) va AVTOMATIK rejim. Uchala yo'l
//                          ham BITTA funksiyadan (ctx.advanceDays -> advanceWorldOnce)
//                          o'tadi, shuning uchun mantiq hech qayerda takrorlanmaydi.
//  2. Admin Dashboard    — qo'lda fixture, jamoa tarkibi / o'yinchi statistikasi
//                          tahrirlash, majburiy yangilik (news forcing), chat moderatsiyasi.
//  3. User Management    — rol, suspend, mute, batafsil statistika.
//
// MUHIM (state consistency): admin o'yinchi karyerasini tahrirlaganda server
// `adminEdit = { rev, patch }` yozadi. Mijoz saqlash (/api/career/save) paytida
// oxirgi ko'rgan `rev`ini (ackRev) yuboradi; eskirgan bo'lsa server saqlashni
// RAD ETADI (conflict) va patch'ni qaytaradi — shu tariqa mijozning eski nusxasi
// adminning o'zgarishini hech qachon ustidan yozib yubormaydi.
// Barcha handlerlar SINXRON — authMiddleware'ning withLock() zanjiri ichida
// ishlaydi, shuning uchun read-modify-write poygasi bo'lmaydi.
// ============================================================
const crypto = require('crypto');
const { ROLES, FOREVER, roleOf, setRole, isMuted, moderationView } = require('./roles');
const chatEngine = require('./chat');

const MOD_MAX_MUTE_MIN = 24 * 60;     // moderator ko'pi bilan 24 soatga mute qila oladi
const ADMIN_NEWS_MAX = 60;
const AUTO_MIN_INTERVAL = 1;          // daqiqa
const AUTO_MAX_INTERVAL = 24 * 60;
const AUTO_MAX_DAYS_PER_TICK = 7;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const clampInt = (v, lo, hi, fallback) => {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return fallback;
  return Math.max(lo, Math.min(hi, n));
};
const newId = (p) => `${p}_${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`;

function registerAdminTools(app, ctx) {
  const {
    authMiddleware, adminMiddleware, readDB, writeDB, engine,
    advanceDays, countPending, ensureWorldForLeague, runLocked,
  } = ctx;

  const modMiddleware = (req, res, next) => {
    if (roleOf(req.user) === 'user') return res.status(403).json({ ok: false, error: 'Bu amal faqat admin yoki moderator uchun' });
    next();
  };

  const findUser = (db, username) => db.users.find((u) => u.username === username);

  // ----------------------------------------------------------
  // 1) MASTER CALENDAR
  // ----------------------------------------------------------
  const defaultAuto = () => ({ enabled: false, intervalMinutes: 60, daysPerTick: 1, lastRunAt: null, nextRunAt: null, runs: 0, lastSummary: null, lastBy: null });
  const autoOf = (db) => { db.autoSim = { ...defaultAuto(), ...(db.autoSim || {}) }; return db.autoSim; };

  // Master Calendar holati: sana, kutayotgan o'yinlar, avtomatik rejim
  app.get('/api/admin/calendar', authMiddleware, adminMiddleware, (req, res) => {
    const db = req.db;
    res.json({ ok: true, worldDate: db.worldDate || null, pending: countPending(db), auto: autoOf(db), serverTime: new Date().toISOString() });
  });

  // Avtomatik simulyatsiya: yoqish/o'chirish va sozlash
  app.post('/api/admin/auto-sim', authMiddleware, adminMiddleware, (req, res) => {
    const db = req.db;
    const auto = autoOf(db);
    const b = req.body || {};
    if (b.intervalMinutes !== undefined) auto.intervalMinutes = clampInt(b.intervalMinutes, AUTO_MIN_INTERVAL, AUTO_MAX_INTERVAL, auto.intervalMinutes);
    if (b.daysPerTick !== undefined) auto.daysPerTick = clampInt(b.daysPerTick, 1, AUTO_MAX_DAYS_PER_TICK, auto.daysPerTick);
    if (b.enabled !== undefined) {
      const was = auto.enabled;
      auto.enabled = !!b.enabled;
      if (auto.enabled && !was) auto.lastBy = req.user.username;
    }
    // Sozlama o'zgarsa yoki yoqilsa — keyingi ishga tushish vaqti qayta hisoblanadi
    auto.nextRunAt = auto.enabled ? new Date(Date.now() + auto.intervalMinutes * 60000).toISOString() : null;
    writeDB(db);
    res.json({ ok: true, auto });
  });

  // Avtomatik rejimni "hozir" bir marta ishga tushirish (sinash uchun)
  app.post('/api/admin/auto-sim/run-now', authMiddleware, adminMiddleware, (req, res) => {
    const db = req.db;
    const out = tickAuto(db, 'qo\'lda sinov', true);
    res.json({ ok: true, auto: autoOf(db), result: out });
  });

  // Bitta tick: ctx.advanceDays — qo'lda +X kun bilan AYNAN bir xil funksiya
  function tickAuto(db, by, force = false) {
    const auto = autoOf(db);
    if (!force && !auto.enabled) return null;
    const agg = advanceDays(db, auto.daysPerTick, `auto (${by})`);
    const now = new Date();
    auto.lastRunAt = now.toISOString();
    auto.runs += 1;
    auto.lastSummary = `${agg.days} kun · ${agg.resolvedMatches} o'yin · ${agg.pendingNow} kutmoqda`;
    if (auto.enabled) auto.nextRunAt = new Date(now.getTime() + auto.intervalMinutes * 60000).toISOString();
    writeDB(db);
    return { worldDate: agg.worldDate, days: agg.days, resolvedMatches: agg.resolvedMatches, pendingNow: agg.pendingNow };
  }

  // Server ichidagi rejalashtiruvchi: har 10 soniyada tekshiradi. Server uxlab
  // qolgan bo'lsa orqada qolgan tick'lar to'planmaydi — faqat BITTA tick bajariladi.
  const schedulerHandle = setInterval(() => {
    runLocked(() => {
      let db;
      try { db = readDB(); } catch { return; }
      const auto = db && db.autoSim;
      if (!auto?.enabled || !auto.nextRunAt) return;
      if (Date.now() < new Date(auto.nextRunAt).getTime()) return;
      try { tickAuto(db, 'taymer'); } catch (e) { console.error('Auto-sim xatosi:', e); auto.enabled = false; auto.lastSummary = `Xato: ${e.message} — avto-rejim o'chirildi`; writeDB(db); }
    });
  }, 10000);
  if (schedulerHandle.unref) schedulerHandle.unref();

  // ----------------------------------------------------------
  // 2a) QO'LDA FIXTURE
  // ----------------------------------------------------------
  const teamMini = (id) => { const t = engine.INITIAL_TEAMS.find((x) => x.id === id); return t ? { id: t.id, name: t.name, logo: t.logo } : { id, name: id, logo: '' }; };

  app.get('/api/admin/fixtures/:leagueId', authMiddleware, adminMiddleware, (req, res) => {
    const db = req.db;
    const league = engine.LEAGUES.find((l) => l.id === req.params.leagueId);
    if (!league) return res.status(404).json({ ok: false, error: 'Liga topilmadi' });
    const world = ensureWorldForLeague(db, league.id);
    const dates = (world.schedule || []).map((r) => r.date).sort();
    const upcoming = (world.schedule || [])
      .filter((r) => !r.matches.every((m) => m.played))
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .slice(0, 20)
      .map((r) => ({
        round: r.round, date: r.date, custom: !!r.custom,
        matches: r.matches.map((m) => ({ home: teamMini(m.home), away: teamMini(m.away), pending: !!m.pending })),
      }));
    res.json({
      ok: true, leagueId: league.id, leagueName: league.name, worldDate: db.worldDate || null,
      firstDate: dates[0] || null, lastDate: dates[dates.length - 1] || null,
      teams: league.teamIds.map(teamMini), upcoming,
    });
  });

  app.post('/api/admin/fixtures', authMiddleware, adminMiddleware, (req, res) => {
    const db = req.db;
    const { leagueId, homeId, awayId, date } = req.body || {};
    const league = engine.LEAGUES.find((l) => l.id === leagueId);
    if (!league) return res.json({ ok: false, error: 'Liga topilmadi' });
    if (!league.teamIds.includes(homeId) || !league.teamIds.includes(awayId)) return res.json({ ok: false, error: "Ikkala jamoa ham shu ligadan bo'lishi kerak" });
    if (homeId === awayId) return res.json({ ok: false, error: 'Jamoa o\'zi bilan o\'ynay olmaydi' });
    if (!ISO_DATE.test(String(date || ''))) return res.json({ ok: false, error: "Sana YYYY-MM-DD ko'rinishida bo'lishi kerak" });

    const world = ensureWorldForLeague(db, leagueId);
    const worldDate = db.worldDate || world.gameDate;
    if (worldDate && date <= worldDate) return res.json({ ok: false, error: `Sana dunyo sanasidan (${worldDate}) keyin bo'lishi kerak` });
    const lastDate = (world.schedule || []).map((r) => r.date).sort().slice(-1)[0];
    if (lastDate && date > lastDate) return res.json({ ok: false, error: `Sana mavsum oxiridan (${lastDate}) oshmasligi kerak — mavsum almashinuvi buziladi` });
    if ((world.schedule || []).some((r) => r.date === date)) return res.json({ ok: false, error: "Bu sanada shu ligada allaqachon tur bor — boshqa sana tanlang (kun boshiga bitta tur)" });
    if ((world.cup?.rounds || []).some((r) => r.date === date)) return res.json({ ok: false, error: 'Bu sanada kubok turi bor — boshqa sana tanlang' });

    const nextRound = Math.max(0, ...(world.schedule || []).map((r) => Number(r.round) || 0)) + 1;
    world.schedule.push({
      round: nextRound, date, custom: true, createdBy: req.user.username,
      matches: [{ home: homeId, away: awayId, played: false, golA: null, golB: null, custom: true }],
    });
    writeDB(db);
    res.json({ ok: true, round: nextRound, date });
  });

  // Faqat admin yaratgan va hali o'ynalmagan fixture'ni o'chirish mumkin
  app.delete('/api/admin/fixtures/:leagueId/:round', authMiddleware, adminMiddleware, (req, res) => {
    const db = req.db;
    const world = db.leagueWorlds?.[req.params.leagueId];
    if (!world) return res.status(404).json({ ok: false, error: 'Liga dunyosi topilmadi' });
    const idx = world.schedule.findIndex((r) => String(r.round) === String(req.params.round));
    if (idx === -1) return res.status(404).json({ ok: false, error: 'Tur topilmadi' });
    const r = world.schedule[idx];
    if (!r.custom) return res.json({ ok: false, error: "Faqat qo'lda yaratilgan fixture'ni o'chirish mumkin" });
    if (r.matches.some((m) => m.played || m.pending)) return res.json({ ok: false, error: "O'ynalgan yoki kutilayotgan o'yinni o'chirib bo'lmaydi" });
    world.schedule.splice(idx, 1);
    writeDB(db);
    res.json({ ok: true });
  });

  // ----------------------------------------------------------
  // 2b) JAMOA TARKIBI VA O'YINCHI STATISTIKASINI TAHRIRLASH
  // ----------------------------------------------------------
  app.get('/api/admin/squad/:leagueId/:teamId', authMiddleware, adminMiddleware, (req, res) => {
    const db = req.db;
    const league = engine.LEAGUES.find((l) => l.id === req.params.leagueId);
    if (!league || !league.teamIds.includes(req.params.teamId)) return res.status(404).json({ ok: false, error: 'Liga yoki jamoa topilmadi' });
    const world = ensureWorldForLeague(db, league.id);
    const squad = (world.squads?.[req.params.teamId] || []).map((p) => ({ id: p.id, name: p.name, pos: p.pos, ovr: p.ovr, age: p.age ?? null, edited: !!p.adminBase }));
    squad.sort((a, b) => (b.ovr || 0) - (a.ovr || 0));
    res.json({ ok: true, team: teamMini(req.params.teamId), squad });
  });

  app.post('/api/admin/squad/:leagueId/:teamId/:playerId', authMiddleware, adminMiddleware, (req, res) => {
    const db = req.db;
    const world = db.leagueWorlds?.[req.params.leagueId];
    const squad = world?.squads?.[req.params.teamId];
    const p = squad?.find((x) => String(x.id) === String(req.params.playerId));
    if (!p) return res.status(404).json({ ok: false, error: "O'yinchi topilmadi" });
    const b = req.body || {};
    if (b.ovr !== undefined) {
      const newOvr = clampInt(b.ovr, 40, 99, p.ovr);
      if (newOvr !== p.ovr) {
        // Asl qiymat birinchi tahrirda saqlanadi (keyin admin "asl holatga qaytarish" qila oladi).
        if (!p.adminBase) p.adminBase = { ovr: p.ovr, stats: p.stats ? { ...p.stats } : null };
        const delta = newOvr - p.ovr;
        // Pace/shot/pas... ham reytingga qarab suriladi, aks holda o'yin eski statlarga qarayverardi.
        if (p.stats) Object.keys(p.stats).forEach((k) => { p.stats[k] = Math.max(1, Math.min(99, Math.round(p.stats[k] + delta))); });
        p.ovr = newOvr;
      }
    }
    if (b.age !== undefined) p.age = clampInt(b.age, 15, 45, p.age);
    if (b.pos !== undefined) {
      const pos = String(b.pos).toUpperCase().slice(0, 4);
      if (!/^[A-Z]{2,3}$/.test(pos)) return res.json({ ok: false, error: "Pozitsiya noto'g'ri" });
      p.pos = pos;
    }
    if (b.name !== undefined) {
      const name = String(b.name).trim().slice(0, 40);
      if (name.length < 2) return res.json({ ok: false, error: "Ism juda qisqa" });
      p.name = name;
    }
    p.adminEdited = true;
    writeDB(db);
    res.json({ ok: true, player: { id: p.id, name: p.name, pos: p.pos, ovr: p.ovr, age: p.age } });
  });

  // NPC futbolchini asl reyting/statlariga qaytarish
  app.post('/api/admin/squad/:leagueId/:teamId/:playerId/reset', authMiddleware, adminMiddleware, (req, res) => {
    const db = req.db;
    const squad = db.leagueWorlds?.[req.params.leagueId]?.squads?.[req.params.teamId];
    const p = squad?.find((x) => String(x.id) === String(req.params.playerId));
    if (!p) return res.status(404).json({ ok: false, error: "O'yinchi topilmadi" });
    if (!p.adminBase) return res.json({ ok: false, error: "Bu o'yinchi admin tomonidan o'zgartirilmagan" });
    p.ovr = p.adminBase.ovr;
    if (p.adminBase.stats) p.stats = { ...p.adminBase.stats };
    delete p.adminBase;
    p.adminEdited = false;
    writeDB(db);
    res.json({ ok: true, player: { id: p.id, name: p.name, pos: p.pos, ovr: p.ovr, age: p.age } });
  });

  // Haqiqiy o'yinchining reyting/statlarini admin o'zgartirishidan oldingi holatga qaytarish
  app.post('/api/admin/users/:username/career-reset-rating', authMiddleware, adminMiddleware, (req, res) => {
    const db = req.db;
    const target = findUser(db, req.params.username);
    if (!target) return res.status(404).json({ ok: false, error: 'Foydalanuvchi topilmadi' });
    const base = target.careerSave && target.careerSave.adminBase;
    if (!base) return res.json({ ok: false, error: "Asl qiymat topilmadi: reyting admin tomonidan o'zgartirilmagan (yoki foydalanuvchi hali qayta saqlamagan)" });
    const patch = { player: { overall: base.overall, potential: base.potential, subStats: base.subStats, mainStats: base.mainStats, adminBase: null }, career: {} };
    Object.assign(target.careerSave, patch.player);
    delete target.careerSave.adminBase;
    const rev = ((target.adminEdit && target.adminEdit.rev) || 0) + 1;
    target.adminEdit = { rev, patch, at: new Date().toISOString(), by: req.user.username };
    target.careerSavedAt = new Date().toISOString();
    writeDB(db);
    res.json({ ok: true, rev, overall: base.overall });
  });

  // Haqiqiy (login qilgan) o'yinchi karyerasini tahrirlash
  const CAREER_FIELDS = {
    player: { overall: [40, 99], potential: [40, 99], age: [15, 45], number: [1, 99] },
    career: { goals: [0, 5000], assists: [0, 5000], appearances: [0, 5000], money: [0, 1e12], weeklyWage: [0, 5e7] },
  };
  const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];

  app.post('/api/admin/users/:username/career-edit', authMiddleware, adminMiddleware, (req, res) => {
    const db = req.db;
    const target = findUser(db, req.params.username);
    if (!target) return res.status(404).json({ ok: false, error: 'Foydalanuvchi topilmadi' });
    if (!target.careerSave) return res.json({ ok: false, error: "Bu foydalanuvchida hali karyera yo'q" });
    const b = req.body || {};
    const patch = { player: {}, career: {} };

    Object.entries(CAREER_FIELDS.player).forEach(([k, [lo, hi]]) => {
      if (b[k] !== undefined && b[k] !== '') patch.player[k] = clampInt(b[k], lo, hi, target.careerSave[k]);
    });
    Object.entries(CAREER_FIELDS.career).forEach(([k, [lo, hi]]) => {
      if (b[k] !== undefined && b[k] !== '') patch.career[k] = clampInt(b[k], lo, hi, target.careerSave.career?.[k] || 0);
    });
    if (b.position !== undefined && b.position !== '') {
      const pos = String(b.position).toUpperCase();
      if (!POSITIONS.includes(pos)) return res.json({ ok: false, error: `Pozitsiya: ${POSITIONS.join(', ')}` });
      patch.player.position = pos;
    }
    if (b.injuryDays !== undefined && b.injuryDays !== '') {
      const d = clampInt(b.injuryDays, 0, 365, 0);
      patch.career.injury = d > 0 ? { daysLeft: d, description: 'Admin tomonidan belgilangan' } : null;
    }
    if (!Object.keys(patch.player).length && !Object.keys(patch.career).length) return res.json({ ok: false, error: "O'zgartirish uchun maydon kiritilmadi" });

    Object.assign(target.careerSave, patch.player);
    target.careerSave.career = { ...(target.careerSave.career || {}), ...patch.career };
    const rev = ((target.adminEdit && target.adminEdit.rev) || 0) + 1;
    target.adminEdit = { rev, patch, at: new Date().toISOString(), by: req.user.username };
    target.careerSavedAt = new Date().toISOString();
    writeDB(db);
    res.json({ ok: true, rev, applied: patch });
  });

  // ----------------------------------------------------------
  // 2c) YANGILIKNI MAJBURLASH (news forcing)
  // ----------------------------------------------------------
  const NEWS_ICONS = { info: '📢', breaking: '🚨', transfer: '💸', award: '🏆' };

  app.get('/api/admin/news', authMiddleware, adminMiddleware, (req, res) => {
    res.json({ ok: true, items: req.db.adminNews || [] });
  });

  app.post('/api/admin/news', authMiddleware, adminMiddleware, (req, res) => {
    const db = req.db;
    const b = req.body || {};
    const headline = String(b.headline || '').trim().slice(0, 140);
    const summary = String(b.summary || '').trim().slice(0, 400);
    if (headline.length < 4) return res.json({ ok: false, error: 'Sarlavha kamida 4 belgi bo\'lsin' });
    let target = null;
    if (b.username) {
      if (!findUser(db, String(b.username))) return res.json({ ok: false, error: 'Foydalanuvchi topilmadi' });
      target = String(b.username);
    }
    const kind = NEWS_ICONS[b.kind] ? b.kind : 'info';
    const item = {
      id: newId('adm'), headline, summary: summary || headline, kind, icon: NEWS_ICONS[kind],
      target, pinned: !!b.pinned, by: req.user.username, createdAt: new Date().toISOString(),
    };
    db.adminNews = [item, ...(db.adminNews || [])].slice(0, ADMIN_NEWS_MAX);
    writeDB(db);
    res.json({ ok: true, item });
  });

  app.delete('/api/admin/news/:id', authMiddleware, adminMiddleware, (req, res) => {
    const db = req.db;
    const before = (db.adminNews || []).length;
    db.adminNews = (db.adminNews || []).filter((n) => n.id !== req.params.id);
    if (db.adminNews.length === before) return res.status(404).json({ ok: false, error: 'Yangilik topilmadi' });
    writeDB(db);
    res.json({ ok: true });
  });

  // ----------------------------------------------------------
  // 3) FOYDALANUVCHILARNI BOSHQARISH
  // ----------------------------------------------------------
  // Jadval uchun: rol, jazo holati va qisqa statistika
  app.get('/api/admin/users-table', authMiddleware, adminMiddleware, (req, res) => {
    const rows = req.db.users.map((u) => {
      const p = u.careerSave;
      const c = p?.career || {};
      return {
        username: u.username, createdAt: u.createdAt || null, canAccessPro: !!u.canAccessPro,
        ...moderationView(u),
        hasCareer: !!p, name: p ? `${p.name} ${p.surname}` : null, position: p?.position || null,
        overall: p?.overall ?? null, club: p?.club ? { name: p.club.name, logo: p.club.logo } : null,
        goals: c.goals || 0, assists: c.assists || 0, appearances: c.appearances || 0,
        lastSavedAt: u.careerSavedAt || null,
      };
    });
    res.json({ ok: true, users: rows });
  });

  // Bitta foydalanuvchining batafsil statistikasi
  app.get('/api/admin/users/:username/stats', authMiddleware, adminMiddleware, (req, res) => {
    const u = findUser(req.db, req.params.username);
    if (!u) return res.status(404).json({ ok: false, error: 'Foydalanuvchi topilmadi' });
    const p = u.careerSave;
    if (!p) return res.json({ ok: true, username: u.username, ...moderationView(u), hasCareer: false });
    const c = p.career || {};
    const ratings = c.matchRatings || [];
    res.json({
      ok: true, username: u.username, ...moderationView(u), hasCareer: true,
      player: {
        name: `${p.name} ${p.surname}`, position: p.position, age: p.age, number: p.number ?? null,
        overall: p.overall, potential: p.potential, nationality: p.nationality || null,
        club: p.club ? { name: p.club.name, logo: p.club.logo, leagueName: p.club.leagueName, role: p.club.role || null } : null,
      },
      career: {
        appearances: c.appearances || 0, goals: c.goals || 0, assists: c.assists || 0,
        avgRating: ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 100) / 100 : null,
        lastRatings: ratings.slice(-8), money: c.money ?? 0, weeklyWage: c.weeklyWage ?? 0,
        injuryDays: c.injury?.daysLeft || 0, gameDate: c.gameDate || null,
        trophies: (c.trophies || []).map((t) => (typeof t === 'string' ? t : t.name)),
        transfers: (c.transferHistory || []).slice(-5).reverse(),
        messages: (c.messages || []).length,
      },
      lastSavedAt: u.careerSavedAt || null,
    });
  });

  // Rolni o'zgartirish (faqat admin). Asosiy admin va o'zingizni o'zgartirib bo'lmaydi.
  app.post('/api/admin/users/:username/role', authMiddleware, adminMiddleware, (req, res) => {
    const db = req.db;
    const role = String((req.body || {}).role || '');
    if (!ROLES.includes(role)) return res.json({ ok: false, error: `Rol: ${ROLES.join(', ')}` });
    const target = findUser(db, req.params.username);
    if (!target) return res.status(404).json({ ok: false, error: 'Foydalanuvchi topilmadi' });
    if (target.username === ctx.ADMIN_USERNAME) return res.json({ ok: false, error: "Asosiy adminning rolini o'zgartirib bo'lmaydi" });
    if (target.username === req.user.username) return res.json({ ok: false, error: "O'z rolingizni o'zgartira olmaysiz" });
    setRole(target, role);
    if (role !== 'user') { target.suspended = null; }
    // Rol o'zgarsa, sessiyalar bekor qilinadi — yangi huquqlar qayta kirgach to'liq kuchga kiradi
    Object.keys(db.sessions || {}).forEach((tok) => { if (db.sessions[tok] === target.username) delete db.sessions[tok]; });
    writeDB(db);
    res.json({ ok: true, role: roleOf(target) });
  });

  // Akkauntni to'xtatish / tiklash (faqat admin)
  app.post('/api/admin/users/:username/suspend', authMiddleware, adminMiddleware, (req, res) => {
    const db = req.db;
    const target = findUser(db, req.params.username);
    if (!target) return res.status(404).json({ ok: false, error: 'Foydalanuvchi topilmadi' });
    if (target.isAdmin) return res.json({ ok: false, error: "Adminni to'xtatib bo'lmaydi" });
    const on = !!(req.body || {}).suspended;
    if (on) {
      target.suspended = { at: new Date().toISOString(), by: req.user.username, reason: String((req.body || {}).reason || '').trim().slice(0, 140) };
      Object.keys(db.sessions || {}).forEach((tok) => { if (db.sessions[tok] === target.username) delete db.sessions[tok]; });
    } else {
      target.suspended = null;
    }
    writeDB(db);
    res.json({ ok: true, ...moderationView(target) });
  });

  // Mute (admin: cheklovsiz / moderator: faqat oddiy userlar, ko'pi bilan 24 soat)
  app.post('/api/mod/users/:username/mute', authMiddleware, modMiddleware, (req, res) => {
    const db = req.db;
    const target = findUser(db, req.params.username);
    if (!target) return res.status(404).json({ ok: false, error: 'Foydalanuvchi topilmadi' });
    const actorRole = roleOf(req.user);
    if (roleOf(target) !== 'user' && actorRole !== 'admin') return res.json({ ok: false, error: "Moderator faqat oddiy foydalanuvchilarni mute qila oladi" });
    if (target.isAdmin) return res.json({ ok: false, error: "Adminni mute qilib bo'lmaydi" });
    const b = req.body || {};
    if (b.unmute || Number(b.minutes) === 0) {
      target.mutedUntil = null; target.muteReason = '';
    } else if (b.forever) {
      if (actorRole !== 'admin') return res.json({ ok: false, error: 'Doimiy mute faqat admin uchun' });
      target.mutedUntil = FOREVER; target.muteReason = String(b.reason || '').slice(0, 140);
    } else {
      let min = clampInt(b.minutes, 1, 60 * 24 * 365, 10);
      if (actorRole !== 'admin') min = Math.min(min, MOD_MAX_MUTE_MIN);
      target.mutedUntil = new Date(Date.now() + min * 60000).toISOString();
      target.muteReason = String(b.reason || '').slice(0, 140);
    }
    logModeration(db, req.user.username, target.mutedUntil ? 'mute' : 'unmute', target.username, target.muteReason);
    writeDB(db);
    res.json({ ok: true, ...moderationView(target) });
  });

  // ----------------------------------------------------------
  // CHAT MODERATSIYASI: pin / delete / audit / mute
  // Chat ENGINE (xabarlar, @teglar, spam limiti, unread) Phase 9'dagi server/chat.js —
  // bu yerda faqat rollar (admin + moderator) uchun boshqaruv va audit log.
  // ----------------------------------------------------------
  function logModeration(db, by, action, target, detail) {
    db.chatAudit = [{ at: new Date().toISOString(), by, action, target, detail: detail || '' }, ...(db.chatAudit || [])].slice(0, 100);
  }

  // Pin: bitta xabar pin qilinadi; xuddi shu xabarga qayta bosilsa pin olinadi
  app.post('/api/mod/chat/:id/pin', authMiddleware, modMiddleware, (req, res) => {
    const db = req.db;
    const msg = chatEngine.ensureChat(db).messages.find((x) => x.id === req.params.id);
    if (!msg) return res.status(404).json({ ok: false, error: 'Xabar topilmadi' });
    const r = chatEngine.togglePin(db, req.params.id);
    if (!r.ok) return res.json(r);
    logModeration(db, req.user.username, r.pinnedId ? 'pin' : 'unpin', msg.username, msg.text.slice(0, 60));
    writeDB(db);
    res.json({ ok: true, pinnedId: r.pinnedId });
  });

  app.delete('/api/mod/chat/:id', authMiddleware, modMiddleware, (req, res) => {
    const db = req.db;
    const msg = chatEngine.ensureChat(db).messages.find((x) => x.id === req.params.id);
    if (!msg) return res.status(404).json({ ok: false, error: 'Xabar topilmadi' });
    if ((msg.role === 'admin' || msg.isAdmin) && roleOf(req.user) !== 'admin') return res.json({ ok: false, error: "Admin xabarini faqat admin o'chira oladi" });
    chatEngine.deleteMessage(db, req.params.id);
    logModeration(db, req.user.username, 'delete', msg.username, msg.text.slice(0, 60));
    writeDB(db);
    res.json({ ok: true });
  });

  app.get('/api/mod/chat-audit', authMiddleware, modMiddleware, (req, res) => {
    res.json({ ok: true, audit: req.db.chatAudit || [] });
  });

  // Majburiy yangiliklar + admin tahrirlari — mijoz /api/career/mine orqali oladi
  return {
    forcedNewsFor(db, username) {
      return (db.adminNews || []).filter((n) => !n.target || n.target === username).slice(0, 20);
    },
  };
}

module.exports = registerAdminTools;
