// ---------------------------------------------------------------------------
// 7-BAND TESTI: server-side domestic kubok.
// Haqiqiy http server (mock MongoDB bilan) orqali:
//   A) Katta liga (20 klub - la_liga): inson o'yinchining kubok fiksturasi
//      "pending" bo'lib qoladi (xuddi league kabi), /api/world-match-detail
//      orqali competition:'cup' bilan ochiladi, /api/career/submit-match-
//      result orqali yozilib, agar bu FINAL bo'lsa - chempion, trophy va
//      xabar to'g'ri qo'yiladi.
//   B) Kichik liga (3 klub - iraqi_premier_league): hech kim o'ynamasa ham,
//      admin "Next Day" bosib borishi bilan kubok TO'LIQ avtomatik
//      (bye + 1 haqiqiy o'yin -> final -> chempion) tugaydi.
//
// MUHIM TARTIB: A avval, B keyin. `advance-world-day` BARCHA 21 liganing
// hammasini BIRGA suradi (2-band) - shuning uchun B'ning uzoq (kuzatuvsiz)
// sikli avval ishga tushsa, la_liga HAM shuncha kun kuzatuvsiz surilib
// ketardi, va real_madridning o'z pending o'yinlari (kimdir yubormagani
// uchun) 15-kunlik xavfsizlik zanjiri (6-band) tomonidan foydalanuvchisiz,
// tasodifiy hal qilinib, ular hatto kubokdan chiqarib yuborilgan bo'lardi -
// bu ANIQ shunday sodir bo'lganini birinchi versiyada aniqladim.
//
// Ishga tushirish:
//   node -r ./tests/_mock_mongodb_hook.js tests/test_domestic_cup.js
// ---------------------------------------------------------------------------
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PORT = 7321 + Math.floor(Math.random() * 500);
const BASE = `http://localhost:${PORT}`;

let failures = 0;
function check(label, cond, detail) {
  console.log(`${cond ? 'OK  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
  if (!cond) failures += 1;
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function waitForServer(child) {
  for (let i = 0; i < 50; i += 1) {
    try { const r = await fetch(`${BASE}/api/meta`); if (r.ok) return; } catch (e) { /* not up */ }
    if (child.exitCode !== null) throw new Error('Server erta yopildi');
    await sleep(200);
  }
  throw new Error("Server ko'tarilmadi");
}

function minimalPlayer({ username, clubId, leagueId, overall = 80 }) {
  return {
    id: `career_${username}`, name: 'Test', surname: username, number: 9,
    position: 'ST', nationality: 'Spain', age: 22, overall, potential: 88,
    mainStats: { pace: overall, shooting: overall, passing: overall, dribbling: overall, defending: 40, physical: overall },
    club: { id: clubId, name: clubId, leagueId, leagueName: leagueId, tier: 'starter' },
    career: { appearances: 0, goals: 0, assists: 0, injury: null, messages: [], trophies: [] },
  };
}

async function registerAndLogin(username) {
  await fetch(`${BASE}/api/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: 'testpass123' }),
  });
  const login = await fetch(`${BASE}/api/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: 'testpass123' }),
  }).then((r) => r.json());
  return { Authorization: `Bearer ${login.token}` };
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

    const adminLogin = await fetch(`${BASE}/api/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Begimqulov017', password: 'beg1mqulov.011' }),
    }).then((r) => r.json());
    const admin = { Authorization: `Bearer ${adminLogin.token}` };

    // ============================================================
    // TEST A: katta liga (20 klub, la_liga) - inson o'yinchi kubokda
    // pending bo'lib qoladi, /world-match-detail + submit-match-result
    // orqali o'ynatiladi va oxir-oqibat chempion bo'ladi.
    // ============================================================
    console.log("--- TEST A: la_liga'da inson o'yinchining kubok fiksturasi ---");
    const userAuth = await registerAndLogin('cupuser1');
    const player = minimalPlayer({ username: 'cupuser1', clubId: 'real_madrid', leagueId: 'la_liga' });
    await fetch(`${BASE}/api/career/save`, {
      method: 'POST', headers: { ...userAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ player }),
    });

    // real_madridning HAR turdagi (liga YOKI kubok) pending o'yinini ketma-ket
    // g'olib sifatida yuborib boramiz - liga o'yinlari kubok bilan ARALASH
    // kelishi mumkin (`findPendingMatchForUser` liga pendingini birinchi
    // qaytaradi), shuning uchun kubok chempionatigacha yetish uchun
    // ikkalasini ham "tozalab" borish kerak.
    let championed = false;
    let sawCupPending = false;
    let cupDetailForCheck = null;
    for (let hop = 0; hop < 150 && !championed; hop += 1) {
      await fetch(`${BASE}/api/admin/advance-world-day`, { method: 'POST', headers: admin }).then((r) => r.json());
      const w = await fetch(`${BASE}/api/world/la_liga`, { headers: userAuth }).then((r) => r.json());
      if (w.world.cup.championId) { championed = true; break; }

      const mine = await fetch(`${BASE}/api/career/mine`, { headers: userAuth }).then((r) => r.json());
      if (!mine.pendingWorldMatch) continue;

      const detail = await fetch(`${BASE}/api/world-match-detail`, { headers: userAuth }).then((r) => r.json());
      if (detail.competition === 'cup' && !sawCupPending) {
        sawCupPending = true;
        cupDetailForCheck = detail;
      }
      const scoreA = detail.isHome ? 3 : 0;
      const scoreB = detail.isHome ? 0 : 3;
      await fetch(`${BASE}/api/career/submit-match-result`, {
        method: 'POST', headers: { ...userAuth, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leagueId: 'la_liga', round: mine.pendingWorldMatch.round, scoreA, scoreB,
          myGoals: 2, myAssists: 0, myRating: 8.5, myMinutes: 90, myInjured: false,
        }),
      }).then((r) => r.json());
    }

    check("real_madrid uchun kubok pending kamida bir marta ko'rindi", sawCupPending);
    check("detail.competition === 'cup' (kubok fiksturasi to'g'ri belgilandi)", cupDetailForCheck?.competition === 'cup');
    check("ikkala klub squadi bor (kubok fiksturasida ham)",
      cupDetailForCheck?.home.squad?.length > 10 && cupDetailForCheck?.away.squad?.length > 10);
    check("real_madrid oxir-oqibat kubok chempioni bo'ldi (har turda yutib borgach)", championed);

    if (championed) {
      const mineFinal = await fetch(`${BASE}/api/career/mine`, { headers: userAuth }).then((r) => r.json());
      check('trophy career.trophies ga qo\'shildi', (mineFinal.player.career.trophies || []).length > 0,
        JSON.stringify(mineFinal.player.career.trophies));
      check('"Champions" xabari qoldirilgan', (mineFinal.player.career.messages || []).some((msg) => msg.subject?.includes('Champions')));
    }

    // ============================================================
    // TEST B: kichik liga (3 klub), hech kim o'ynamaydi - kubok o'zi
    // to'liq (bye + final) tugashi kerak. TEST A allaqachon la_ligani
    // ko'p kun surgani uchun BU liganing kubogi ham allaqachon tugagan
    // yoki tugashga yaqin bo'lishi mumkin - shunchaki tasdiqlaymiz.
    // ============================================================
    console.log("\n--- TEST B: NPC-only kichik liga kubogi to'liq avtomatik tugaydi ---");
    let championFound = false;
    let lastWorld = await fetch(`${BASE}/api/world/iraqi_premier_league`, { headers: admin }).then((r) => r.json());
    if (lastWorld.world.cup?.championId) championFound = true;
    for (let i = 0; i < 60 && !championFound; i += 1) {
      await fetch(`${BASE}/api/admin/advance-world-day`, { method: 'POST', headers: admin }).then((r) => r.json());
      lastWorld = await fetch(`${BASE}/api/world/iraqi_premier_league`, { headers: admin }).then((r) => r.json());
      if (lastWorld.world.cup?.championId) championFound = true;
    }
    check("kubok chempioni aniqlandi", championFound, JSON.stringify(lastWorld?.world?.cup?.championId));
    check('kubokda kamida 2 tur bo\'lgan (3 klub: bye+1 -> final)', (lastWorld?.world?.cup?.rounds?.length || 0) >= 2,
      `rounds=${lastWorld?.world?.cup?.rounds?.length}`);
    const allMatchesResolved = lastWorld.world.cup.rounds.every((r) => r.matches.every((m) => m.played));
    check('barcha kubok o\'yinlari played=true', allMatchesResolved);

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
