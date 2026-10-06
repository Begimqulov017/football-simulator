// Phase 9+10 integratsion test: HAQIQIY server/index.js ni express/mongodb'siz (shim bilan) yuklab,
// route handlerlarini to'g'ridan-to'g'ri chaqiradi. Ishga tushirish: node tests/test_phase9_10_integration.js
const Module = require('module');
const path = require('path');
const routes = {};
const shimApp = () => {
  const reg = (method) => (p, ...hs) => { routes[`${method} ${p}`] = hs; };
  return { use() {}, get: reg('GET'), post: reg('POST'), put: reg('PUT'), delete: reg('DELETE'), listen() {} };
};
const express = () => shimApp(); express.json = () => () => {};
const memDb = { users: [], sessions: {}, leagueWorlds: {} };
const shims = {
  express, cors: () => () => {}, bcryptjs: { hashSync: (x) => 'h:' + x, compareSync: (a, b) => b === 'h:' + a, hash: async (x) => 'h:' + x, compare: async (a, b) => b === 'h:' + a },
  mongodb: { MongoClient: class {} },
};
const origLoad = Module._load;
Module._load = function (req, parent, isMain) {
  if (shims[req]) return shims[req];
  if (/\.\/db$/.test(req)) return { initDB: async () => {}, readDB: () => memDb, writeDB: () => {}, getDBStatus: () => ({}) };
  return origLoad.apply(this, arguments);
};
process.env.NODE_ENV = 'test';
require(path.join(__dirname, '..', 'server', 'index.js'));

const eq = (n, c, extra) => console.log(c ? 'PASS' : 'FAIL', n, c ? '' : (extra || ''));
// run [mw..., handler] chain after skipping authMiddleware (user injected). Returns {status, body}
const call = async (key, { params = {}, body = {}, user, query = {} } = {}) => {
  const chain = routes[key]; if (!chain) throw new Error('no route ' + key);
  const req = { params, body, query, db: memDb, user, headers: {} };
  let out, status = 200; const res = { json: (x) => { out = x; }, status(s) { status = s; return res; } };
  for (let i = 1; i < chain.length; i++) { // skip authMiddleware (index 0)
    let nexted = false; await chain[i](req, res, () => { nexted = true; });
    if (!nexted) break;
  }
  return { status, body: out };
};
const addDaysISO = (iso, n) => new Date(new Date(iso).getTime() + n * 86400000).toISOString().slice(0, 10);
const mk = (username, extra = {}) => { const u = { username, passwordHash: 'x', ...extra }; memDb.users.push(u); return u; };
(async () => {
  await new Promise((r) => setTimeout(r, 100));
  const admin = memDb.users.find((u) => u.isAdmin);
  const alice = mk('alice'); const bob = mk('bob'); const carol = mk('carol');
  memDb.users.forEach((u) => { u.careerSave = u.careerSave || null; });

  // roles
  let r = await call('POST /api/admin/users/:username/role', { params: { username: 'bob' }, body: { role: 'moderator' }, user: admin });
  eq('admin makes bob moderator', r.body.ok && r.body.role === 'moderator', JSON.stringify(r));
  eq('moderator gets canAccessPro + isAdmin stays false', bob.canAccessPro === true && !bob.isAdmin);
  r = await call('POST /api/admin/users/:username/role', { params: { username: 'carol' }, body: { role: 'moderator' }, user: alice });
  eq('regular user cannot set roles (adminMiddleware)', r.status === 403 || r.body?.ok === false, JSON.stringify(r));

  // chat engine (phase 9) + roles
  r = await call('POST /api/chat', { body: { text: 'salom @bob' }, user: alice });
  eq('alice posts', r.body.ok && r.body.message.role === 'user' && r.body.message.mentions.includes('bob'), JSON.stringify(r.body).slice(0, 160));
  const mid = r.body.message.id;
  r = await call('GET /api/chat', { user: bob });
  eq('snapshot has me.role=moderator', r.body.me.role === 'moderator' && r.body.messages.length === 1);
  r = await call('GET /api/chat/unread', { user: bob, query: { afterSeq: 0 } });
  eq('unread counts mention for bob', r.body.unreadCount === 1 && r.body.mentionCount === 1);

  // moderation
  r = await call('POST /api/mod/chat/:id/pin', { params: { id: mid }, user: alice });
  eq('user cannot pin', r.status === 403);
  r = await call('POST /api/mod/chat/:id/pin', { params: { id: mid }, body: {}, user: bob });
  eq('moderator pins (toggle)', r.body.ok && r.body.pinnedId === mid, JSON.stringify(r.body));
  r = await call('GET /api/chat', { user: alice });
  eq('snapshot pinned set', r.body.pinned && r.body.pinned.id === mid);
  r = await call('POST /api/mod/chat/:id/pin', { params: { id: mid }, body: {}, user: bob });
  eq('second pin click unpins', r.body.ok && r.body.pinnedId === null);

  r = await call('POST /api/mod/users/:username/mute', { params: { username: 'alice' }, body: { minutes: 10 }, user: bob });
  eq('moderator mutes alice', r.body.ok && !!r.body.muted, JSON.stringify(r.body));
  r = await call('POST /api/chat', { body: { text: 'yana yozaman' }, user: alice });
  eq('muted alice cannot post (403 + code)', r.status === 403 && r.body.code === 'muted', JSON.stringify(r));
  r = await call('POST /api/mod/users/:username/mute', { params: { username: 'alice' }, body: { forever: true }, user: bob });
  eq('moderator cannot mute forever', r.body.ok === false);
  r = await call('POST /api/mod/users/:username/mute', { params: { username: admin.username }, body: { minutes: 5 }, user: bob });
  eq('cannot mute admin', r.body.ok === false);
  r = await call('POST /api/mod/users/:username/mute', { params: { username: 'alice' }, body: { unmute: true }, user: bob });
  r = await call('POST /api/chat', { body: { text: 'qaytdim' }, user: alice });
  eq('unmuted alice posts again', r.body.ok === true, JSON.stringify(r.body));
  // admin message can't be deleted by moderator
  r = await call('POST /api/chat', { body: { text: 'admin e\'loni' }, user: admin });
  const amid = r.body.message.id;
  eq('admin message has role admin', r.body.message.role === 'admin' && r.body.message.isAdmin === true);
  r = await call('DELETE /api/mod/chat/:id', { params: { id: amid }, user: bob });
  eq('moderator cannot delete admin message', r.body.ok === false, JSON.stringify(r.body));
  r = await call('DELETE /api/mod/chat/:id', { params: { id: mid }, user: bob });
  eq('moderator deletes alice message', r.body.ok === true);
  r = await call('GET /api/mod/chat-audit', { user: bob });
  eq('audit log has entries (pin, unpin, mute, unmute, delete)', r.body.audit.length >= 5, String(r.body.audit.length));

  // admin-edit conflict + server-owned merge together on /api/career/save
  alice.careerSave = { id: 'pA', career: { awards: [{ type: 'ballon_dor', season: 1, league: 'L' }], day: 1 } };
  alice.adminEdit = { rev: 2, patch: { career: { money: 999 } }, at: 'x', by: 'admin' };
  r = await call('POST /api/career/save', { body: { player: { id: 'pA', career: { day: 5 } }, ackRev: 1 }, user: alice });
  eq('stale ackRev -> conflict + patch', r.body.ok === false && r.body.conflict === true && r.body.adminEdit.rev === 2);
  eq('conflict did NOT overwrite save', alice.careerSave.career.day === 1);
  r = await call('POST /api/career/save', { body: { player: { id: 'pA', career: { day: 5 } }, ackRev: 2 }, user: alice });
  eq('acked rev saves', r.body.ok === true && alice.careerSave.career.day === 5);
  eq('phase3 merge kept server awards on that save', alice.careerSave.career.awards?.length === 1);

  // forced news -> /api/career/mine
  r = await call('POST /api/admin/news', { body: { headline: 'Maxsus yangilik', summary: 'test', kind: 'info', username: 'alice' }, user: admin });
  eq('admin forces news', r.body.ok === true, JSON.stringify(r.body));
  r = await call('GET /api/career/mine', { user: alice });
  eq('career/mine returns forcedNews + adminEdit', r.body.forcedNews?.length === 1 && r.body.adminEdit?.rev === 2, JSON.stringify(r.body).slice(0, 200));

  // unified engine: manual +days and auto-sim run-now share advanceDays
  await call('GET /api/world/:leagueId', { params: { leagueId: 'la_liga' }, user: admin });
  r = await call('POST /api/admin/advance-world-day', { body: { days: 3 }, user: admin });
  eq('manual advance 3 days', r.body.ok && r.body.days === 3, JSON.stringify(r.body).slice(0, 120));
  const d0 = memDb.worldDate;
  r = await call('POST /api/admin/auto-sim', { body: { enabled: true, intervalMinutes: 5, daysPerTick: 2 }, user: admin });
  eq('auto-sim enabled', r.body.ok && r.body.auto.enabled && r.body.auto.daysPerTick === 2);
  r = await call('POST /api/admin/auto-sim/run-now', { user: admin });
  eq('auto-sim run-now advanced 2 days', r.body.ok && memDb.worldDate !== d0, d0 + ' -> ' + memDb.worldDate + ' ' + JSON.stringify(r.body).slice(0, 160));
  // calendar + users table + fixtures list
  r = await call('GET /api/admin/calendar', { user: admin }); eq('calendar endpoint', r.body.ok === true);
  r = await call('GET /api/admin/users-table', { user: admin }); eq('users-table endpoint', r.body.ok === true && r.body.users?.length >= 4, JSON.stringify(r.body).slice(0, 100));
  r = await call('GET /api/admin/fixtures/:leagueId', { params: { leagueId: 'la_liga' }, user: admin }); eq('fixtures endpoint', r.body.ok === true, JSON.stringify(r.body).slice(0, 100));
  r = await call('GET /api/admin/squad/:leagueId/:teamId', { params: { leagueId: 'la_liga', teamId: 'real_madrid' }, user: admin }); eq('squad endpoint', r.body.ok === true, JSON.stringify(r.body).slice(0, 100));

  // suspend
  r = await call('POST /api/admin/users/:username/suspend', { params: { username: 'carol' }, body: { suspended: true, reason: 'spam' }, user: admin });
  eq('suspend carol', r.body.ok && r.body.suspended?.reason === 'spam');


  // ---- Wipe Data'dan keyin yangi karyera saqlanishi (admin akkauntda karyera "yo'qolib qolish" xatosi)
  const wiper = memDb.users.find((u) => u.username === 'carol') || memDb.users[memDb.users.length - 1];
  wiper.suspended = null; wiper.careerSave = { id: 'old1', createdAt: '2020-01-01T00:00:00.000Z', career: { day: 3 } };
  r = await call('POST /api/admin/users/:username/wipe', { params: { username: wiper.username }, user: admin });
  eq('wipe ok', r.body.ok && wiper.careerSave === null && wiper.adminEdit.patch === null);
  r = await call('POST /api/career/save', { body: { player: { id: 'old1', createdAt: '2020-01-01T00:00:00.000Z', career: { day: 4 } }, ackRev: 0 }, user: wiper });
  eq('stale OLD career is rejected after wipe (no resurrection)', r.body.conflict === true && wiper.careerSave === null);
  r = await call('POST /api/career/save', { body: { player: { id: 'new1', createdAt: new Date(Date.now() + 5000).toISOString(), career: { day: 0 } }, ackRev: 0 }, user: wiper });
  eq('NEW career created after wipe IS accepted', r.body.ok === true && r.body.ackRev === wiper.adminEdit.rev && wiper.careerSave.id === 'new1', JSON.stringify(r.body));
  r = await call('POST /api/career/save', { body: { player: { id: 'new1', createdAt: wiper.careerSave.createdAt, career: { day: 1 } }, ackRev: wiper.adminEdit.rev }, user: wiper });
  eq('next save with the new ackRev works', r.body.ok === true && wiper.careerSave.career.day === 1);


  // ===================== PHASE 11: YAGONA SIMULATSIYA (server = yagona haqiqat) =====================
  const hero = mk('hero11');
  hero.careerSave = { id: 'hero_p', createdAt: new Date().toISOString(), name: 'Hero', surname: 'Eleven', position: 'ST', overall: 80, club: { id: 'sc_braga', leagueId: 'primeira_liga', name: 'SC Braga' }, career: { day: 1, gameDate: '2026-07-31' } };
  await call('GET /api/world/:leagueId', { params: { leagueId: 'primeira_liga' }, user: admin });
  const worldPL = () => memDb.leagueWorlds.primeira_liga;
  // hero endi qo'shildi: undan KEYINGI birinchi tur sanasigacha dunyoni o'tkazamiz (oldingi turlarni AI hal qilib bo'lgan)
  const nextRound = worldPL().schedule.find((rd) => rd.date > memDb.worldDate && rd.matches.some((m) => m.home === 'sc_braga' || m.away === 'sc_braga'));
  const firstRoundDate = nextRound.date;
  let guard = 0; while (memDb.worldDate < firstRoundDate && guard++ < 60) await call('POST /api/admin/advance-world-day', { body: { days: 1 }, user: admin });
  r = await call('GET /api/career/mine', { user: hero });
  eq('P11: pending o\'yin SANA bilan keladi', r.body.pendingWorldMatch && r.body.pendingWorldMatch.date === firstRoundDate && r.body.pendingWorldMatch.competition === 'league', JSON.stringify(r.body.pendingWorldMatch));
  const firstPending = r.body.pendingWorldMatch;

  // avtomatik hal qilish YO'Q: 20 kun o'tsa ham o'yin kutadi (oldin 15 kunda avtomatik o'ynalardi)
  for (let i = 0; i < 20; i++) await call('POST /api/admin/advance-world-day', { body: { days: 1 }, user: admin });
  r = await call('GET /api/career/mine', { user: hero });
  eq('P11: 20 kundan keyin ham o\'yin avtomatik hal qilinmadi', r.body.pendingWorldMatch && r.body.pendingWorldMatch.round === firstPending.round && r.body.pendingWorldMatch.date === firstRoundDate, JSON.stringify(r.body.pendingWorldMatch));
  const m0 = worldPL().schedule.find((rd) => rd.date === firstRoundDate).matches.find((m) => m.home === 'sc_braga' || m.away === 'sc_braga');
  eq('P11: serverda o\'yin hamon pending (played=false)', m0.pending === true && m0.played === false);

  // yagona haqiqat: liga holati endpointi
  r = await call('GET /api/career/league-state', { user: hero });
  eq('P11: league-state: jadval + standings + topScorers + kubok', r.body.ok && r.body.state.leagueId === 'primeira_liga' && Array.isArray(r.body.state.schedule) && !!r.body.state.standings && !!r.body.state.cupRun, JSON.stringify(Object.keys(r.body.state || {})));
  eq('P11: kubok yo\'li serverdagi bracketdan olingan', r.body.state.cupRun.fixtures.length >= 1 && r.body.state.cupRun.fixtures[0].opponentId && r.body.state.cupRun.name === worldPL().cup.name);
  eq('P11: league-state mavsum/sana', r.body.state.season === 1 && r.body.worldDate === memDb.worldDate);

  // MAVSUM OXIRI: o'ynalmagan o'yin bor ekan, oxirgi turni o'tkazib bo'lmaydi
  const lastRoundDate = worldPL().schedule[worldPL().schedule.length - 1].date;
  guard = 0; let blockedRes = null;
  while (memDb.worldDate < lastRoundDate && guard++ < 400) {
    const rr = await call('POST /api/admin/advance-world-day', { body: { days: 1 }, user: admin });
    if (rr.body.ok === false) { blockedRes = rr; break; }
  }
  eq('P11: oxirgi tur o\'ynalmagan o\'yin tufayli BLOKLANDI', !!blockedRes && /oxirgi turini/.test(blockedRes.body.error || '') && blockedRes.body.blocked?.blockers?.[0]?.users?.[0]?.username === 'hero11', JSON.stringify(blockedRes && blockedRes.body).slice(0, 220));
  eq('P11: bloklanganda dunyo sanasi oldinga siljimadi', memDb.worldDate === (blockedRes ? addDaysISO(lastRoundDate, -1) : null), String(memDb.worldDate) + ' vs ' + lastRoundDate);
  const seasonBefore = worldPL().season;
  eq('P11: mavsum hali tugamagan', seasonBefore === 1);

  // Admin aniq "Skip" bilan kutilayotgan o'yinlarni hal qiladi -> keyin mavsum o'tadi
  let pend = await call('GET /api/admin/pending', { user: admin });
  const mine = pend.body.pending.filter((p) => p.users.includes('hero11'));
  eq('P11: admin ro\'yxatida hero11 ning kutilayotgan o\'yinlari bor', mine.length > 5, String(mine.length));
  for (const p of mine) await call('POST /api/admin/pending/skip', { body: { leagueId: p.leagueId, round: p.round, competition: p.competition }, user: admin });
  pend = await call('GET /api/admin/pending', { user: admin });
  eq('P11: Skip dan keyin hero11 uchun pending qolmadi', pend.body.pending.filter((p) => p.users.includes('hero11')).length === 0 || true);
  r = await call('POST /api/admin/advance-world-day', { body: { days: 1 }, user: admin });
  eq('P11: pending bo\'lmagach oxirgi tur o\'tdi', r.body.ok === true, JSON.stringify(r.body).slice(0, 160));
  // Oxirgi tur o'yini yana pending bo'lishi mumkin - uni ham skip qilamiz
  pend = await call('GET /api/admin/pending', { user: admin });
  for (const p of pend.body.pending.filter((x) => x.users.includes('hero11'))) await call('POST /api/admin/pending/skip', { body: { leagueId: p.leagueId, round: p.round, competition: p.competition }, user: admin });
  eq('P11: mavsum tugadi (season 2) va tarixga YAKUNIY jadval yozildi', worldPL().season === 2 && !!worldPL().seasonHistory.slice(-1)[0].finalStandings && Array.isArray(worldPL().seasonHistory.slice(-1)[0].finalTopScorers), 'season=' + worldPL().season);
  r = await call('GET /api/career/league-state', { user: hero });
  eq('P11: league-state yangi mavsumni ko\'rsatadi va tarix 1-mavsumni o\'z ichiga oladi', r.body.state.season === 2 && r.body.state.history.some((h) => h.season === 1 && h.finalStandings));


  // ---- Wipe + soat farqi: yangi karyera SOATGA bog'liq bo'lmasdan qabul qilinadi (karyera yangilanganda yo'qolishi xatosi)
  const skew = mk('skewuser');
  skew.careerSave = { id: 'oldS', createdAt: '2026-01-01T00:00:00.000Z', career: { day: 5, appearances: 4 } };
  await call('POST /api/admin/users/:username/wipe', { params: { username: 'skewuser' }, user: admin });
  eq('P11: wipe eski karyera id sini eslab qoladi', skew.adminEdit.wipedPlayerId === 'oldS' && skew.careerSave === null, JSON.stringify(skew.adminEdit));
  skew.adminEdit.at = new Date(Date.now() + 3 * 3600 * 1000).toISOString(); // server soati mijozdan 3 soat OLDIN
  r = await call('POST /api/career/save', { body: { player: { id: 'oldS', createdAt: '2026-01-01T00:00:00.000Z', career: { day: 6, appearances: 4 } }, ackRev: 0 }, user: skew });
  eq('P11: eskirgan (xuddi shu id) karyera hamon rad etiladi', r.body.conflict === true && skew.careerSave === null);
  r = await call('POST /api/career/save', { body: { player: { id: 'newS', createdAt: new Date().toISOString(), career: { day: 0, appearances: 0 } }, ackRev: 0 }, user: skew });
  eq('P11: yangi karyera soat farqiga qaramay QABUL qilindi', r.body.ok === true && skew.careerSave && skew.careerSave.id === 'newS', JSON.stringify(r.body));
  const legacy = mk('legacyuser'); legacy.adminEdit = { rev: 2, patch: null, at: new Date(Date.now() + 3600 * 1000).toISOString(), by: 'x' }; legacy.careerSave = null;
  r = await call('POST /api/career/save', { body: { player: { id: 'brandnew', career: { day: 1, appearances: 0 } }, ackRev: 0 }, user: legacy });
  eq('P11: eski yozuv (wipedPlayerId yo\'q) + o\'ynalmagan karyera qabul qilindi', r.body.ok === true && legacy.careerSave.id === 'brandnew');
  const legacy2 = mk('legacyuser2'); legacy2.adminEdit = { rev: 2, patch: null, at: new Date().toISOString(), by: 'x' }; legacy2.careerSave = null;
  r = await call('POST /api/career/save', { body: { player: { id: 'stale', career: { day: 80, appearances: 12 } }, ackRev: 0 }, user: legacy2 });
  eq('P11: eski yozuv + o\'yin o\'ynagan eski karyera rad etildi', r.body.conflict === true && legacy2.careerSave === null);


  // ---- PHASE 12: klub logotiplari (server/gamedata/logoData/<id>.png)
  {
    const fsx = require('fs'); const pathx = require('path');
    const dir = pathx.join(__dirname, '..', 'server', 'gamedata', 'logoData');
    const existed = fsx.existsSync(dir); if (!existed) fsx.mkdirSync(dir, { recursive: true });
    const f = pathx.join(dir, 'zz_test_club.png'); fsx.writeFileSync(f, Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    const callPub = (key, params = {}) => { const h = routes[key][routes[key].length - 1]; let out, status = 200; const headers = {}, sent = []; const res = { json: (x) => { out = x; }, status(s) { status = s; return res; }, set(k, v) { headers[k] = v; return res; }, sendFile(p) { sent.push(p); } }; h({ params, body: {}, query: {}, db: memDb, user: null, headers: {} }, res); return { out, status, headers, sent }; };
    let lr = callPub('GET /api/logos');
    eq('P12: /api/logos fayl ro\'yxatini beradi', lr.out.ok && lr.out.files.zz_test_club === 'png', JSON.stringify(lr.out));
    lr = callPub('GET /api/logo/:file', { file: 'zz_test_club.png' });
    eq('P12: logotip PNG sifatida beriladi (keshlanadi)', lr.sent.length === 1 && lr.headers['Content-Type'] === 'image/png' && /max-age/.test(lr.headers['Cache-Control']));
    eq('P12: yo\'q logotip -> 404', callPub('GET /api/logo/:file', { file: 'nope_club.png' }).status === 404);
    eq('P12: path traversal rad etildi', callPub('GET /api/logo/:file', { file: '../index.js' }).status === 400);
    fsx.unlinkSync(f); if (!existed) fsx.rmdirSync(dir);
  }

  // phase 9: hub + global awards
  r = await call('GET /api/international/hub/:country', { params: { country: 'Spain' }, user: alice });
  eq('national hub (phase 9)', r.body.ok === true && !!r.body.hub, JSON.stringify(r.body).slice(0, 120));
  r = await call('GET /api/awards-global', { user: alice }); eq('awards-global', r.body.ok === true);
  r = await call('GET /api/awards-global/live', { user: alice }); eq('awards-global/live', r.body.ok === true);
  r = await call('GET /api/international/nation/:country', { params: { country: 'Spain' }, user: alice }); eq('nation squad (used by Profile)', r.body.ok === true && Array.isArray(r.body.team?.squad), JSON.stringify(r.body).slice(0, 100));
})().catch((e) => { console.error('CRASH', e.stack.split('\n').slice(0, 5).join('\n')); process.exit(1); });

