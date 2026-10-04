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

  // phase 9: hub + global awards
  r = await call('GET /api/international/hub/:country', { params: { country: 'Spain' }, user: alice });
  eq('national hub (phase 9)', r.body.ok === true && !!r.body.hub, JSON.stringify(r.body).slice(0, 120));
  r = await call('GET /api/awards-global', { user: alice }); eq('awards-global', r.body.ok === true);
  r = await call('GET /api/awards-global/live', { user: alice }); eq('awards-global/live', r.body.ok === true);
  r = await call('GET /api/international/nation/:country', { params: { country: 'Spain' }, user: alice }); eq('nation squad (used by Profile)', r.body.ok === true && Array.isArray(r.body.team?.squad), JSON.stringify(r.body).slice(0, 100));
})().catch((e) => { console.error('CRASH', e.stack.split('\n').slice(0, 5).join('\n')); process.exit(1); });

