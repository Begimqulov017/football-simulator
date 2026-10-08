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
  await new Promise((r) => setTimeout(r, 120));
  const admin = memDb.users.find((u) => u.isAdmin);
  const fsx = require('fs'); const pathx = require('path');
  const root = pathx.join(__dirname, '..');
  const mod = (f, k) => { const m = { exports: {} }; new Function('module', 'exports', fsx.readFileSync(pathx.join(root, f), 'utf8'))(m, m.exports); return m.exports[k]; };
  const T = mod('server/gamedata/teamsData.js', 'INITIAL_TEAMS'); const L = mod('server/gamedata/leaguesData.js', 'LEAGUES');
  const N = require(pathx.join(root, 'server/gamedata/nationsData.js'));
  const byId = Object.fromEntries(T.map((t) => [t.id, t]));
  const call = async (key, { params = {}, body = {}, user = admin } = {}) => { const ch = routes[key]; const req = { params, body, query: {}, db: memDb, user, headers: {} }; let out; const res = { json: (x) => { out = x; }, status() { return res; } }; for (let i = 1; i < ch.length; i++) { let nx = false; await ch[i](req, res, () => { nx = true; }); if (!nx) break; } return out; };

  // ---------- ma'lumot butunligi (top-5 haqiqiy FC reytinglari + nat) ----------
  const ids = T.flatMap((t) => t.squad.map((p) => p.id));
  eq('D1: futbolchi id lari global unikal', new Set(ids).size === ids.length);
  eq('D2: har bir futbolchida nat bor va u ma\'lum mamlakat', T.every((t) => t.squad.every((p) => p.nat && N.NATION_BY_NAME[p.nat])), [...new Set(T.flatMap((t) => t.squad.map((p) => p.nat)).filter((n) => !N.NATION_BY_NAME[n]))].join(','));
  eq('D3: top-5 liga o\'lchamlari 20/20/18/20/18', ['la_liga', 'premier_league', 'bundesliga', 'serie_a', 'ligue_1'].map((id) => L.find((l) => l.id === id).teamIds.length).join('/') === '20/20/18/20/18');
  eq('D4: ligadagi har bir jamoa teamsData da bor, hech biri ikki ligada emas', L.every((l) => l.teamIds.every((id) => byId[id])) && new Set(L.flatMap((l) => l.teamIds)).size === L.flatMap((l) => l.teamIds).length);
  eq('D5: yangi jamoalar bor, eski id lar yo\'q', !!byId.inter && !!byId.milan && !!byId.como && !!byId.elche && !!byId.hamburger_sv && !byId.inter_milan && !byId.ac_milan && !byId.las_palmas && !byId.holstein_kiel);
  eq('D6: har bir ligadagi klubda darvozabon bor va tarkib >= 12', T.filter((t) => L.some((l) => l.teamIds.includes(t.id))).every((t) => t.squad.some((p) => p.pos === 'GK') && t.squad.length >= 12));
  const rm = byId.real_madrid.squad;
  eq('D7: Real Madrid: haqiqiy reyting va nat (Mbappé 91 France, Courtois Belgium)', rm.some((p) => /Mbapp/.test(p.name) && p.ovr === 91 && p.nat === 'France') && rm.some((p) => /Courtois/.test(p.name) && p.nat === 'Belgium'));
  eq('D8: client va server ma\'lumotlari bir xil', ['teamsData.js', 'leaguesData.js', 'nationsData.js'].every((f) => fsx.readFileSync(pathx.join(root, 'src/data', f), 'utf8') === fsx.readFileSync(pathx.join(root, 'server/gamedata', f), 'utf8')));
  // tasodifiy NPC millati extra mamlakatlarga tushmaydi (avvalgi nationalityFor natijalari o'zgarmaydi)
  const extra = new Set(['Kosovo', 'New Zealand', 'Estonia', 'Haiti']); let leak = 0; for (let i = 0; i < 4000; i++) if (extra.has(N.nationalityFor('x' + i, 'Spain'))) leak++;
  eq('D9: tasodifiy NPC millati yangi (extra) mamlakatlarga tushmaydi', leak === 0, String(leak));

  // ---------- terma jamoalar haqiqiy nat dan tuziladi ----------
  const leagues = await call('GET /api/leagues'); for (const l of leagues.leagues) await call('GET /api/world/:leagueId', { params: { leagueId: l.id } });
  eq('D10: yangi world lar dataVersion bilan yaratiladi', Object.values(memDb.leagueWorlds).every((w) => w.dataVersion === require(pathx.join(root, 'server/engine.js')).DATA_VERSION));
  let r = await call('POST /api/admin/advance-world-day', { body: { days: 2 } }); eq('D11: yangi ma\'lumotda dunyo siljiydi', r.ok === true, JSON.stringify(r).slice(0, 140));
  const fr = await call('GET /api/international/nation/:country', { params: { country: 'France' } });
  eq('D12: Fransiya terma jamoasi: Mbappé, Olise, Dembélé', fr.ok && ['Mbapp', 'Olise', 'Dembél'].every((n) => fr.team.squad.some((p) => p.name.includes(n))), JSON.stringify(fr).slice(0, 120));
  const nor = await call('GET /api/international/nation/:country', { params: { country: 'Norway' } }); eq('D13: Norvegiya: Haaland va Ødegaard', nor.ok && nor.team.squad.some((p) => /Haaland/.test(p.name)) && nor.team.squad.some((p) => /degaard/.test(p.name)));
  const bos = await call('GET /api/international/nation/:country', { params: { country: 'Bosnia and Herzegovina' } }); eq('D14: Bosniya (yangi mamlakat) jamoasi tuziladi', bos.ok && bos.team.squad.length >= 11, JSON.stringify(bos).slice(0, 100));
  const kos = await call('GET /api/international/nation/:country', { params: { country: 'Kosovo' } }); eq('D15: <11 futbolchili mamlakat (Kosovo) jamoa tuzmaydi', !kos.ok);
  const spPool = await call('GET /api/international/nation/:country', { params: { country: 'Spain' } }); eq('D16: Ispaniya jamoasi 23 kishi, haqiqiy yulduzlar', spPool.ok && spPool.team.squad.length === 23 && spPool.team.squad.some((p) => /Rodri|Pedri|Yamal/.test(p.name)));

  // ---------- eski ma'lumotli world ni siljitib bo'lmaydi; Wipe Data dan keyin yangisi yaratiladi ----------
  memDb.leagueWorlds.la_liga.dataVersion = 1; // eski ma'lumot bilan yaratilgan world'ni taqlid qilamiz
  r = await call('POST /api/admin/advance-world-day', { body: { days: 1 } });
  eq('D17: eski dataVersion bo\'lsa dunyo siljimaydi va aniq xabar beradi (Wipe Data)', r.ok === false && /Wipe Data/.test(r.error || ''), JSON.stringify(r).slice(0, 200));
  await call('POST /api/admin/wipe-data', { body: {} });
  eq('D18: Wipe Data eski world larni o\'chirdi', Object.keys(memDb.leagueWorlds).length === 0);
  const a2 = memDb.users.find((u) => u.isAdmin);
  await call('GET /api/world/:leagueId', { params: { leagueId: 'la_liga' }, user: a2 });
  r = await call('POST /api/admin/advance-world-day', { body: { days: 1 }, user: a2 });
  eq('D19: Wipe Data dan keyin yangi world bilan dunyo siljiydi', r.ok === true, JSON.stringify(r).slice(0, 160));
})().catch((e) => { console.error('CRASH', e.stack.split('\n').slice(0, 5).join('\n')); process.exit(1); });
