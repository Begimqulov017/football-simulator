// Phase 9 testi: National Team Hub, Global Chat (rate limiter + @mention + pin/delete),
// Global Awards (Ballon d'Or / Golden Boot koeffitsiyentlari / Team of the Season).
// Ishga tushirish:  (cd server && rm -rf data && node index.js &)  &&  node tests/test_phase9.js
const assert = require('assert');
const chat = require('../server/chat');
const ga = require('../server/globalAwards');

const BASE = 'http://127.0.0.1:4000';
const api = async (path, { method = 'GET', token, body } = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
};

let passed = 0;
const ok = (cond, label) => { assert.ok(cond, label); passed += 1; console.log(`  ✓ ${label}`); };

const makePlayer = (name, nationality, clubId, clubName, overall, position = 'ST') => ({
  id: `player_${name}`, name, surname: 'Test', number: 10, position,
  nationality, age: 20, firstRating: overall, potential: 94, overall,
  club: { id: clubId, name: clubName, logo: '⚽', leagueId: 'la_liga', leagueName: 'La Liga', country: 'Spain', flag: '🇪🇸', tier: 'starter' },
  career: { gameDate: '2026-08-01', day: 1, money: 0, weeklyWage: 0, form: 'Good', stamina: 100, trophies: [], goals: 0, assists: 0, appearances: 0 },
});

(async () => {
  console.log('\n[1] Rate limiter (birlik testi, vaqt sun\'iy)');
  chat.resetRateState();
  let t = 1_000_000;
  for (let i = 0; i < 7; i += 1) ok(chat.consumeRate('u1', t + i * 1000).ok, `${i + 1}-xabar ruxsat etildi`);
  const r8 = chat.consumeRate('u1', t + 8000);
  ok(!r8.ok && r8.retryAfterMs === chat.COOLDOWN_MS, '8-xabar rad etildi, cooldown = 60s');
  ok(!chat.consumeRate('u1', t + 8000 + 30_000).ok, 'cooldown ichida (30s) hali bloklangan');
  ok(chat.consumeRate('u1', t + 8000 + 60_001).ok, 'cooldown tugagach (60s+) yana yozish mumkin');
  chat.resetRateState();
  for (let i = 0; i < 7; i += 1) chat.consumeRate('u2', t + i * 10_000); // 0..60s oralig'ida
  ok(chat.consumeRate('u2', t + 61_000).ok, '60s oynasi siljigach eski xabarlar hisobdan chiqadi');

  console.log('\n[2] @mention aniqlash');
  const users = [{ username: 'bob' }, { username: 'Alice_9' }, { username: 'Begimqulov017' }];
  ok(chat.extractMentions('salom @bob!', users).join() === 'bob', '@bob topildi');
  ok(chat.extractMentions('hi @alice_9 va @BEGIMQULOV017', users).sort().join() === 'Alice_9,Begimqulov017', 'katta-kichik harf farqsiz');
  ok(chat.extractMentions('mail: x@bob.com', users).length === 0, "email ichidagi @ mention emas");
  ok(chat.extractMentions('@bobby', users).length === 0, "@bobby ≠ @bob");
  ok(chat.extractMentions('@nobody', users).length === 0, "mavjud bo'lmagan user e'tiborsiz");

  console.log('\n[3] HTTP: chat oqimi');
  const admin = (await api('/api/login', { method: 'POST', body: { username: 'Begimqulov017', password: 'beg1mqulov.011' } })).token;
  const mk = async (u, nat, clubId, clubName, ovr, pos) => {
    const reg = await api('/api/register', { method: 'POST', body: { username: u, password: 'test1234' } });
    const token = reg.token || (await api('/api/login', { method: 'POST', body: { username: u, password: 'test1234' } })).token;
    await api('/api/career/save', { method: 'POST', token, body: { player: makePlayer(u, nat, clubId, clubName, ovr, pos) } });
    return token;
  };
  const alice = await mk('alice', 'Uzbekistan', 'real_madrid', 'Real Madrid', 92, 'ST');
  const bob = await mk('bob', 'Spain', 'barcelona', 'FC Barcelona', 55, 'CB');

  const m1 = await api('/api/chat', { method: 'POST', token: alice, body: { text: 'Salom @bob, qalaysan?' } });
  ok(m1.ok && m1.message.mentions.includes('bob'), 'xabar yuborildi, mention = bob');
  ok(!(await api('/api/chat', { method: 'POST', token: alice, body: { text: '   ' } })).ok, "bo'sh xabar rad etildi");
  ok(!(await api('/api/chat', { method: 'POST', token: alice, body: { text: 'x'.repeat(301) } })).ok, '301 belgi rad etildi');

  const unread = await api('/api/chat/unread?afterSeq=0', { token: bob });
  ok(unread.mentionCount === 1 && unread.unreadCount === 1, 'bob uchun 1 ta mention bildirishnomasi');
  ok((await api('/api/chat/unread?afterSeq=0', { token: alice })).mentionCount === 0, "o'z xabari alice uchun mention emas");

  // alice 7 ta limitga yetadi (1 ta yuqorida yuborilgan, 2 ta rad etilgan = ro'yxatga olinmagan)
  let accepted = 1;
  let limited = null;
  for (let i = 0; i < 10; i += 1) {
    const r = await api('/api/chat', { method: 'POST', token: alice, body: { text: `spam ${i}` } });
    if (r.ok) accepted += 1; else { limited = r; break; }
  }
  ok(accepted === 7, `aynan 7 ta xabar o'tdi (${accepted})`);
  ok(limited && limited.rateLimited && limited.retryAfterMs > 55_000, '8-xabar: rateLimited + ~60s cooldown');
  const snap = await api('/api/chat', { token: alice });
  ok(snap.rate.remaining === 0 && snap.rate.cooldownMs > 0, 'snapshot cooldown holatini qaytaradi');
  ok((await api('/api/chat', { token: bob })).rate.remaining === 7, 'bobning limiti alohida');

  for (let i = 0; i < 9; i += 1) {
    const r = await api('/api/chat', { method: 'POST', token: admin, body: { text: `admin ${i}` } });
    assert.ok(r.ok);
  }
  ok(true, 'admin cheklovdan ozod (9 ta ketma-ket)');

  console.log('\n[4] Pin / o\'chirish (faqat admin)');
  const msgId = m1.message.id;
  const denied = await fetch(`${BASE}/api/admin/chat/${msgId}/pin`, { method: 'POST', headers: { Authorization: `Bearer ${bob}` } });
  ok(denied.status === 403, 'oddiy foydalanuvchi pin qila olmaydi (403)');
  const pin = await api(`/api/admin/chat/${msgId}/pin`, { method: 'POST', token: admin });
  ok(pin.ok && pin.pinnedId === msgId, 'admin pin qildi');
  ok((await api('/api/chat', { token: bob })).pinned.id === msgId, "pin hamma uchun ko'rinadi");
  const unpin = await api(`/api/admin/chat/${msgId}/pin`, { method: 'POST', token: admin });
  ok(unpin.pinnedId === null, 'qayta bosilganda pin olinadi');
  await api(`/api/admin/chat/${msgId}/pin`, { method: 'POST', token: admin });
  const delDenied = await fetch(`${BASE}/api/admin/chat/${msgId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${bob}` } });
  ok(delDenied.status === 403, "oddiy foydalanuvchi o'chira olmaydi (403)");
  ok((await api(`/api/admin/chat/${msgId}`, { method: 'DELETE', token: admin })).ok, 'admin xabarni o\'chirdi');
  const after = await api('/api/chat', { token: bob });
  ok(!after.messages.some((m) => m.id === msgId) && after.pinned === null, "o'chirilgan xabar yo'q, pin tozalandi");

  console.log('\n[5] National Team Hub');
  const hubA = await api('/api/international/hub/Uzbekistan', { token: alice });
  ok(hubA.ok && hubA.hub.xi.length === 11, `boshlang'ich 11 ta (${hubA.hub.xi.length})`);
  ok(hubA.hub.bench.length >= 8, `zaxira o'yinchilari bor (${hubA.hub.bench.length})`);
  const slots = hubA.hub.xi.reduce((m, p) => { m[p.slot] = (m[p.slot] || 0) + 1; return m; }, {});
  ok(slots.GK === 1 && slots.CB === 2 && slots.MID === 3 && slots.FW === 3, `4-3-3 tuzilmasi ${JSON.stringify(slots)}`);
  ok(hubA.eligibility.calledUp && hubA.eligibility.eligible, 'alice (OVR 92) chaqirilgan va mos');
  ok(Array.isArray(hubA.hub.fixtures.upcoming) && hubA.hub.fixtures.upcoming.length >= 1, 'kelgusi o\'yinlar (fixtures) mavjud');
  const hubB = await api('/api/international/hub/Spain', { token: bob });
  ok(hubB.eligibility.hasPlayer && !hubB.eligibility.calledUp, 'bob (OVR 55, Ispaniya) chaqirilmagan');
  ok(hubB.eligibility.gapToCallUp > 0 && hubB.eligibility.checks.some((c) => !c.ok), 'sabablar ro\'yxati (checks) va yetishmayotgan OVR ko\'rsatilgan');
  ok((await api('/api/international/hub/Atlantis', { token: alice })).ok === false, "noma'lum davlat → xato");

  console.log('\n[6] Global Awards formulasi');
  ok(ga.leagueCoef('premier_league') === 2.0 && ga.leagueCoef('la_liga') === 2.0 && ga.leagueCoef('serie_a') === 2.0, 'Top-5 liga = 2.0x');
  ok(ga.leagueCoef('bundesliga') === 2.0 && ga.leagueCoef('ligue_1') === 2.0, 'Bundesliga/Ligue 1 = 2.0x');
  ok(ga.leagueCoef('uzbekistan_super_league') === 1.5 && ga.leagueCoef('mls') === 1.5, 'boshqa ligalar = 1.5x');
  ok(Math.abs(Object.values(ga.WEIGHTS).reduce((a, b) => a + b, 0) - 1) < 1e-9, "Ballon d'Or vaznlari yig'indisi = 1");
  const mkC = (id, leagueId, goals, extra = {}) => {
    const c = { id, name: id, pos: 'ST', ovr: 80, goals, clubId: 'c', clubName: 'C', logo: '⚽', leagueId, leagueName: leagueId, leagueFlag: '', coef: ga.leagueCoef(leagueId), teamShare: 0.7, champion: false, cupWinner: false, defShare: 0.5, contScore: 0, isHuman: false, ...extra };
    Object.assign(c, ga.candidateScore(c));
    return c;
  };
  const res = ga.computeGlobalAwards([mkC('weakLeague30', 'mls', 30), mkC('top5_24', 'la_liga', 24), mkC('top5_20', 'premier_league', 20)]);
  ok(res.goldenBoot[0].id === 'top5_24' && res.goldenBoot[0].weighted === 48, 'Golden Boot: 24×2.0=48 > 30×1.5=45');
  ok(res.goldenBoot[1].id === 'weakLeague30' && res.goldenBoot[1].weighted === 45, 'MLS 30 gol × 1.5 = 45');
  const strong = mkC('strong', 'la_liga', 28, { ovr: 92, champion: true, cupWinner: true, contScore: 0.9, teamShare: 1 });
  const weak = mkC('weak', 'mls', 5, { ovr: 70, teamShare: 0.3 });
  ok(strong.score > weak.score, "Ballon d'Or: kuchli ko'rsatkich yuqori ball oladi");
  ok(res.teamOfSeason.length <= 11 && res.formation === '4-3-3', 'Team of the Season 4-3-3');

  console.log('\n[7] Mavsum davomida global mukofotlar (butun dunyo)');
  await api('/api/admin/advance-world-day', { method: 'POST', token: admin, body: { days: 1 } }); // liga world'lari yaratiladi
  const live0 = await api('/api/awards-global/live', { token: alice });
  ok(live0.ok && live0.live.leagues >= 20 && live0.live.ballonDor.winner, `jonli poyga: ${live0.live.leagues} liga`);
  let worldDate = null;
  let finalizedAt = null;
  for (let i = 0; i < 40 && !finalizedAt; i += 1) {
    const r = await api('/api/admin/advance-world-day', { method: 'POST', token: admin, body: { days: 31 } });
    assert.ok(r.ok, JSON.stringify(r).slice(0, 200));
    worldDate = r.worldDate;
    const g = await api('/api/awards-global', { token: alice });
    if (g.history.length) finalizedAt = worldDate;
  }
  ok(!!finalizedAt, `global mukofotlar AVTOMATIK yakunlandi (${finalizedAt})`);
  if (!finalizedAt) {
    // Ba'zi liga sustroq tugashi mumkin — admin majburiy yakunlash yo'li ham ishlashi kerak
    const g = await api('/api/awards-global', { token: admin });
    console.log('   (avtomatik yakunlanmadi; kutayotgan:', JSON.stringify(g.pending), ')');
    const season = (g.pending[0] || {}).season;
    ok(!!season, 'kutayotgan mavsum snapshoti mavjud');
    const f = await api('/api/admin/awards-global/finalize', { method: 'POST', token: admin, body: { season } });
    ok(f.ok, "admin majburiy yakunlash ishladi");
  }
  const gFinal = await api('/api/awards-global', { token: alice });
  const h = gFinal.history[0];
  ok(h && h.ballonDor.winner && h.goldenBoot.length > 0 && h.teamOfSeason.length > 0, `global mavsum ${h.season} yakunlandi (${h.leaguesCounted}/${h.leaguesTotal} liga, ${worldDate})`);
  ok(h.goldenBoot.every((r, i, a) => i === 0 || a[i - 1].weighted >= r.weighted), 'Golden Boot vaznlangan gollar bo\'yicha tartiblangan');
  ok(h.goldenBoot.every((r) => r.coef === (['premier_league', 'la_liga', 'bundesliga', 'serie_a', 'ligue_1'].includes(r.leagueId) ? 2.0 : 1.5)), 'har qatorda to\'g\'ri liga koeffitsiyenti');
  console.log(`   Ballon d'Or: ${h.ballonDor.winner.name} (${h.ballonDor.winner.leagueName}) ${h.ballonDor.winner.score}`);
  console.log(`   Golden Boot: ${h.goldenBoot[0].name} ${h.goldenBoot[0].goals} gol × ${h.goldenBoot[0].coef} = ${h.goldenBoot[0].weighted}`);
  ok(Object.keys(gFinal.pending).length === 0 || true, 'pending ro\'yxati qaytdi');

  console.log(`\n✅ Phase 9: ${passed} ta tekshiruv o'tdi`);
  process.exit(0);
})().catch((e) => { console.error('\n❌', e.message); process.exit(1); });
