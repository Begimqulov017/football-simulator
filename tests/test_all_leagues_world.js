// ---------------------------------------------------------------------------
// 2-BAND TESTI: server/index.js'ni HAQIQIY http server sifatida ishga
// tushirib (MongoDB o'rniga xotiradagi mock bilan - `_mock_mongodb_hook.js`),
// quyidagilarni tekshiradi:
//   1) Hech kim hali o'ynamagan holatda /api/leagues 21 ta liganing
//      HAMMASINI qaytaradi.
//   2) Bitta "advance-world-day" barcha 21 liganing worldini yaratadi va
//      suradi - faqat kimdir tanlagan liga emas.
//   3) Hech qanday inson o'ynamaydigan liga (masalan Iraq) ham avtomatik
//      natijalar bilan yuradi va istalgan (hatto o'sha ligada o'ynamaydigan)
//      user uni /api/world/:leagueId orqali ko'ra oladi.
//   4) Javob og'irligini pasaytirish uchun `squads` maydoni yashiringan.
//
// Ishga tushirish:
//   node -r ./tests/_mock_mongodb_hook.js tests/test_all_leagues_world.js
// ---------------------------------------------------------------------------
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PORT = 4321 + Math.floor(Math.random() * 500);
const BASE = `http://localhost:${PORT}`;

let failures = 0;
function check(label, cond, detail) {
  console.log(`${cond ? 'OK  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
  if (!cond) failures += 1;
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function waitForServer(child) {
  for (let i = 0; i < 50; i += 1) {
    try {
      const res = await fetch(`${BASE}/api/meta`);
      if (res.ok) return true;
    } catch (err) { /* not up yet */ }
    if (child.exitCode !== null) throw new Error('Server erta yopildi (exit code ' + child.exitCode + ')');
    await sleep(200);
  }
  throw new Error('Server 10 soniyada ko\'tarilmadi');
}

async function main() {
  const child = spawn(process.execPath, [
    '-r', path.join(__dirname, '_mock_mongodb_hook.js'),
    path.join(ROOT, 'server/index.js'),
  ], {
    cwd: path.join(ROOT, 'server'),
    env: { ...process.env, PORT: String(PORT), MONGODB_URI: 'mock://test' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let serverLog = '';
  child.stdout.on('data', (d) => { serverLog += d.toString(); });
  child.stderr.on('data', (d) => { serverLog += d.toString(); });

  try {
    await waitForServer(child);

    const login = await fetch(`${BASE}/api/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Begimqulov017', password: 'beg1mqulov.011' }),
    }).then((r) => r.json());
    check('admin login ishladi', !!login.token, JSON.stringify(login).slice(0, 100));
    const auth = { Authorization: `Bearer ${login.token}` };

    // --- 1) Hech narsa boshlanmagan holatda 21 liganing hammasi ko'rinadi ---
    const before = await fetch(`${BASE}/api/leagues`, { headers: auth }).then((r) => r.json());
    check('leagues endpointi 21 ta ligani qaytardi', before.leagues?.length === 21, `${before.leagues?.length}`);
    check('hech biri hali boshlanmagan', before.leagues.every((l) => !l.season), 'kutilgan: hammasi season=null');

    // --- 2) Bitta advance-world-day BARCHA 21 ligani boshlaydi ---
    const adv = await fetch(`${BASE}/api/admin/advance-world-day`, { method: 'POST', headers: auth }).then((r) => r.json());
    check('advance-world-day muvaffaqiyatli', adv.ok === true, JSON.stringify(adv).slice(0, 150));
    check('worldDate 1 kunga surildi', adv.worldDate === '2026-08-01', adv.worldDate);

    const after = await fetch(`${BASE}/api/leagues`, { headers: auth }).then((r) => r.json());
    const started = after.leagues.filter((l) => l.season);
    check('BARCHA 21 liga bitta bosishda world oldi', started.length === 21, `${started.length}/21`);
    check('har biri kun=2 da (1 kun surildi)', after.leagues.every((l) => l.day === 2), JSON.stringify(after.leagues.map((l) => l.day)));

    // --- 3) Hech kim o'ynamaydigan liga (Iraq) ham avtomatik yuradi ---
    // Yana bir necha kun suramiz - shu ligada 1-tur o'ynaladigan kunga yetguncha.
    let lastAdv = adv;
    for (let i = 0; i < 6; i += 1) {
      lastAdv = await fetch(`${BASE}/api/admin/advance-world-day`, { method: 'POST', headers: auth }).then((r) => r.json());
    }
    const iraq = await fetch(`${BASE}/api/world/iraqi_premier_league`, { headers: auth }).then((r) => r.json());
    check('Iraq world topildi', iraq.ok === true);
    const playedRounds = (iraq.world.schedule || []).filter((r) => r.matches.every((m) => m.played));
    check('Iraq ligasida hech kim o\'ynamasa ham natijalar bor', playedRounds.length >= 1, `${playedRounds.length} tur o'ynaldi`);
    if (playedRounds.length) {
      const m = playedRounds[0].matches[0];
      check('har bir o\'yinda haqiqiy hisob bor', typeof m.golA === 'number' && typeof m.golB === 'number', `${m.golA}-${m.golB}`);
    }
    check('squads maydoni yashiringan (og\'irlikni tejash)', !('squads' in iraq.world), 'squads mavjud emasligi kerak');

    // --- 4) Bir kunda faqat 1 kun suriladi (avtomatik sakrash yo'q) ---
    const d1 = await fetch(`${BASE}/api/admin/advance-world-day`, { method: 'POST', headers: auth }).then((r) => r.json());
    const d2 = await fetch(`${BASE}/api/admin/advance-world-day`, { method: 'POST', headers: auth }).then((r) => r.json());
    const dayDiff = (new Date(d2.worldDate) - new Date(d1.worldDate)) / 86400000;
    check('har bosishda ANIQ 1 kun suriladi', dayDiff === 1, `${d1.worldDate} -> ${d2.worldDate} (${dayDiff} kun)`);

    console.log(`\n${failures === 0 ? '✅ HAMMASI O\'TDI' : `❌ ${failures} ta test yiqildi`}`);
  } catch (err) {
    console.error('TEST XATOSI:', err.message);
    console.error('--- server log ---\n' + serverLog);
    failures += 1;
  } finally {
    child.kill();
  }
  process.exit(failures === 0 ? 0 : 1);
}

main();
