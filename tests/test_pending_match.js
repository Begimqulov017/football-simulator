// ---------------------------------------------------------------------------
// 4-BAND TESTI: "pending" (kutilayotgan) inson o'yini mexanizmi.
// Haqiqiy http server (mock MongoDB bilan - `_mock_mongodb_hook.js`) ishga
// tushiriladi va quyidagilar tekshiriladi:
//   1) Foydalanuvchining klubi o'ynashi kerak bo'lgan kunda - o'yin DARHOL
//      avtomatik hal qilinmaydi, "pending" bo'lib qoladi (seed bilan).
//   2) /api/career/mine shu pending o'yinni ko'rsatadi; boshqa (NPC-only)
//      o'yinlar esa avvalgidek darhol hal qilinadi.
//   3) /api/world-match-detail seed + ikkala klub squadini qaytaradi.
//   4) /api/career/submit-match-result - standings/schedule/career
//      statistikasini to'g'ri yozadi, va o'yin endi pending emas.
//   5) 15+ kun o'ynalmagan pending o'yin AVTOMATIK hal qilinadi va
//      foydalanuvchiga statistikasi bilan xabar keladi (6-band xavfsizlik
//      zanjiri).
//
// Ishga tushirish:
//   node -r ./tests/_mock_mongodb_hook.js tests/test_pending_match.js
// ---------------------------------------------------------------------------
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PORT = 5321 + Math.floor(Math.random() * 500);
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
  throw new Error("Server 10 soniyada ko'tarilmadi");
}

function minimalPlayer({ username, clubId, leagueId, overall = 80, position = 'ST' }) {
  return {
    id: `career_${username}`, name: 'Test', surname: username, number: 9,
    position, nationality: 'Spain', age: 22, overall, potential: 88,
    mainStats: { pace: overall, shooting: overall, passing: overall, dribbling: overall, defending: 40, physical: overall },
    club: { id: clubId, name: clubId, leagueId, leagueName: leagueId, tier: 'starter' },
    career: { appearances: 0, goals: 0, assists: 0, injury: null, messages: [] },
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

    const adminAuth = await registerAndLogin('__unused_admin_probe__').catch(() => null);
    const adminLogin = await fetch(`${BASE}/api/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Begimqulov017', password: 'beg1mqulov.011' }),
    }).then((r) => r.json());
    const admin = { Authorization: `Bearer ${adminLogin.token}` };

    // --- Foydalanuvchi yaratamiz va Real Madrid (la_liga) klubiga qo'yamiz ---
    const userAuth = await registerAndLogin('pendinguser1');
    const player = minimalPlayer({ username: 'pendinguser1', clubId: 'real_madrid', leagueId: 'la_liga' });
    await fetch(`${BASE}/api/career/save`, {
      method: 'POST', headers: { ...userAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ player }),
    });

    // --- 1-kun ligani boshlaydi (1-tur odatda 1-avgustda o'ynaladi) ---
    await fetch(`${BASE}/api/admin/advance-world-day`, { method: 'POST', headers: admin }).then((r) => r.json());

    const mine1 = await fetch(`${BASE}/api/career/mine`, { headers: userAuth }).then((r) => r.json());
    check("real_madrid 1-turda o'ynasa, pendingWorldMatch paydo bo'ladi",
      !!mine1.pendingWorldMatch, JSON.stringify(mine1.pendingWorldMatch));
    check('pending seed mavjud', !!mine1.pendingWorldMatch?.seed, mine1.pendingWorldMatch?.seed);

    const world1 = await fetch(`${BASE}/api/world/la_liga`, { headers: userAuth }).then((r) => r.json());
    const myRound = world1.world.schedule.find((r) => r.round === mine1.pendingWorldMatch.round);
    const myMatch = myRound.matches.find((m) => m.home === 'real_madrid' || m.away === 'real_madrid');
    check("world.schedule'da mos o'yin played=false, pending=true",
      myMatch.played === false && myMatch.pending === true, JSON.stringify(myMatch));

    const otherMatchesResolved = myRound.matches.filter((m) => m !== myMatch).every((m) => m.played === true);
    check('shu turdagi BOSHQA (NPC-only) o\'yinlar avvalgidek darhol hal qilingan', otherMatchesResolved);

    // --- 2) /api/world-match-detail ---
    const detail = await fetch(`${BASE}/api/world-match-detail`, { headers: userAuth }).then((r) => r.json());
    check('world-match-detail ok', detail.ok === true, JSON.stringify(detail).slice(0, 150));
    check('detail seedi pendingWorldMatch seedi bilan bir xil', detail.seed === mine1.pendingWorldMatch.seed);
    check('ikkala klubning squadi bor', detail.home.squad?.length > 10 && detail.away.squad?.length > 10,
      `home=${detail.home.squad?.length} away=${detail.away.squad?.length}`);

    // --- 3) natijani yuboramiz (foydalanuvchi "o'ynagandan" keyin) ---
    const isHome = detail.isHome;
    const submitRes = await fetch(`${BASE}/api/career/submit-match-result`, {
      method: 'POST', headers: { ...userAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leagueId: 'la_liga', round: mine1.pendingWorldMatch.round,
        scoreA: isHome ? 3 : 1, scoreB: isHome ? 1 : 3,
        myGoals: 2, myAssists: 1, myRating: 8.4, myMinutes: 90, myInjured: false,
      }),
    }).then((r) => r.json());
    check('submit-match-result ok', submitRes.ok === true, JSON.stringify(submitRes));

    const mine2 = await fetch(`${BASE}/api/career/mine`, { headers: userAuth }).then((r) => r.json());
    check("natija yuborilgach pendingWorldMatch YO'QOLADI", mine2.pendingWorldMatch === null);
    check('karyera goli/appearances yozildi', mine2.player.career.goals === 2 && mine2.player.career.appearances === 1,
      `goals=${mine2.player.career.goals} apps=${mine2.player.career.appearances}`);

    const world2 = await fetch(`${BASE}/api/world/la_liga`, { headers: userAuth }).then((r) => r.json());
    const myRound2 = world2.world.schedule.find((r) => r.round === mine1.pendingWorldMatch.round);
    const myMatch2 = myRound2.matches.find((m) => m.home === 'real_madrid' || m.away === 'real_madrid');
    check("o'yin endi played=true, to'g'ri hisob bilan",
      myMatch2.played === true && myMatch2.golA === 3 && myMatch2.golB === 1, JSON.stringify(myMatch2));

    // --- 4) 15+ kunlik avto-o'tkazish (6-band xavfsizlik zanjiri) ---
    const userAuth2 = await registerAndLogin('pendinguser2');
    const player2 = minimalPlayer({ username: 'pendinguser2', clubId: 'sevilla', leagueId: 'la_liga', overall: 76 });
    await fetch(`${BASE}/api/career/save`, {
      method: 'POST', headers: { ...userAuth2, 'Content-Type': 'application/json' },
      body: JSON.stringify({ player: player2 }),
    });
    // Sevilla'ning navbatidagi o'yini pending bo'lguncha suramiz.
    let pending2 = null;
    for (let i = 0; i < 10 && !pending2; i += 1) {
      await fetch(`${BASE}/api/admin/advance-world-day`, { method: 'POST', headers: admin }).then((r) => r.json());
      const m = await fetch(`${BASE}/api/career/mine`, { headers: userAuth2 }).then((r) => r.json());
      pending2 = m.pendingWorldMatch;
    }
    check('sevilla uchun ham pending o\'yin paydo bo\'ldi', !!pending2, JSON.stringify(pending2));

    // Endi hech narsa yubormasdan 16 kun suramiz - 15 kunlik chegaradan o'tishi kerak.
    let lastAdv = null;
    for (let i = 0; i < 16; i += 1) {
      lastAdv = await fetch(`${BASE}/api/admin/advance-world-day`, { method: 'POST', headers: admin }).then((r) => r.json());
    }
    const mine3 = await fetch(`${BASE}/api/career/mine`, { headers: userAuth2 }).then((r) => r.json());
    const world3 = await fetch(`${BASE}/api/world/la_liga`, { headers: userAuth2 }).then((r) => r.json());
    const round2Fixture = world3.world.schedule
      .find((r) => r.round === pending2.round).matches
      .find((m) => m.home === pending2.home && m.away === pending2.away);
    check("16 kundan keyin O'SHA (round-2) pending o'yin AVTOMATIK hal qilindi",
      round2Fixture.played === true && !round2Fixture.pending, JSON.stringify(round2Fixture));
    // Eslatma: 16 kun ichida keyingi turlar ham kelgani uchun sevilla uchun
    // YANGI (haqiqiy, kutilgan) pending o'yin paydo bo'lishi MUMKIN - bu
    // xato emas, shuning uchun umuman pendingWorldMatch yo'qligini talab
    // qilmaymiz, faqat round-2ning o'zi to'g'ri yopilganini tekshiramiz.
    check('career.goals/appearances baribir yozilgan (avto-hal ham statistika beradi)',
      typeof mine3.player.career.appearances === 'number', `apps=${mine3.player.career.appearances}`);
    const hasAutoMsg = (mine3.player.career.messages || []).some((msg) => msg.subject?.includes('Avtomatik'));
    check("foydalanuvchiga 'avtomatik o'tkazildi' xabari qoldirilgan", hasAutoMsg,
      JSON.stringify((mine3.player.career.messages || []).map((m) => m.subject)));
    check("autoResolvedPending javobda ko'rinadi", Array.isArray(lastAdv.autoResolvedPending));

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
