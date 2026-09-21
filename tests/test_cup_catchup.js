// ---------------------------------------------------------------------------
// 7-BAND TESTI (davomi): kubokdagi pending o'yin 15+ kun o'ynalmasa,
// AVTOMATIK hal qilinishi va butun turni abadiy to'xtatib qo'ymasligi kerak.
//
// Ishga tushirish:
//   node -r ./tests/_mock_mongodb_hook.js tests/test_cup_catchup.js
// ---------------------------------------------------------------------------
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PORT = 8321 + Math.floor(Math.random() * 500);
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

    await fetch(`${BASE}/api/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'lazyuser1', password: 'testpass123' }),
    });
    const login = await fetch(`${BASE}/api/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'lazyuser1', password: 'testpass123' }),
    }).then((r) => r.json());
    const userAuth = { Authorization: `Bearer ${login.token}` };

    const player = {
      id: 'career_lazyuser1', name: 'Lazy', surname: 'User1', position: 'ST',
      overall: 78, career: { appearances: 0, goals: 0, assists: 0, messages: [], trophies: [] },
      club: { id: 'atletico_madrid', name: 'atletico_madrid', leagueId: 'la_liga' },
    };
    await fetch(`${BASE}/api/career/save`, {
      method: 'POST', headers: { ...userAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ player }),
    });

    // Kubok pending bo'lguncha suramiz. Liga pendinglari (agar chiqsa)
    // DARHOL yuborib yuboriladi - aks holda ular findPendingMatchForUser'da
    // ustuvor bo'lib, kubok hech qachon ko'rinmay qoladi. Kubok pending
    // ko'rinishi bilan esa ATAYLAB hech narsa yubormaymiz - aynan shu
    // "unutilgan" holatni sinamoqchimiz.
    let cupPendingSeen = false;
    let cupPendingRound = null;
    for (let i = 0; i < 40 && !cupPendingSeen; i += 1) {
      await fetch(`${BASE}/api/admin/advance-world-day`, { method: 'POST', headers: admin }).then((r) => r.json());
      const mine = await fetch(`${BASE}/api/career/mine`, { headers: userAuth }).then((r) => r.json());
      if (mine.pendingWorldMatch?.competition === 'cup') {
        cupPendingSeen = true;
        cupPendingRound = mine.pendingWorldMatch.round;
      } else if (mine.pendingWorldMatch?.competition === 'league') {
        const detail = await fetch(`${BASE}/api/world-match-detail`, { headers: userAuth }).then((r) => r.json());
        const scoreA = detail.isHome ? 2 : 0;
        const scoreB = detail.isHome ? 0 : 2;
        await fetch(`${BASE}/api/career/submit-match-result`, {
          method: 'POST', headers: { ...userAuth, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leagueId: 'la_liga', round: mine.pendingWorldMatch.round, scoreA, scoreB,
            myGoals: 1, myAssists: 0, myRating: 7.5, myMinutes: 90, myInjured: false,
          }),
        }).then((r) => r.json());
      }
    }
    check("atletico_madrid uchun kubok pending ko'rindi", cupPendingSeen, `round=${cupPendingRound}`);

    if (cupPendingSeen) {
      // Endi 20+ kun hech narsa yubormasdan suramiz - 15 kunlik chegaradan
      // o'tishi kerak.
      for (let i = 0; i < 20; i += 1) {
        await fetch(`${BASE}/api/admin/advance-world-day`, { method: 'POST', headers: admin }).then((r) => r.json());
      }
      const w = await fetch(`${BASE}/api/world/la_liga`, { headers: userAuth }).then((r) => r.json());
      const round = w.world.cup.rounds.find((r) => r.round === cupPendingRound);
      const myMatch = round?.matches.find((m) => m.home === 'atletico_madrid' || m.away === 'atletico_madrid');
      check("20 kundan keyin kubok fiksturasi AVTOMATIK hal qilindi (played=true, pending emas)",
        myMatch?.played === true && !myMatch?.pending, JSON.stringify(myMatch));
      check('g\'olib (winnerId) belgilangan', !!myMatch?.winnerId);

      const mine = await fetch(`${BASE}/api/career/mine`, { headers: userAuth }).then((r) => r.json());
      const hasCatchupMsg = (mine.player.career.messages || []).some((m) => m.subject?.includes('Kubokda avtomatik'));
      check("foydalanuvchiga kubok avto-o'tkazish xabari qoldirilgan", hasCatchupMsg,
        JSON.stringify((mine.player.career.messages || []).map((m) => m.subject)));

      // ENG MUHIMI: bu tur endi to'liq bo'lgani uchun BUTUN bracket davom
      // etishi kerak - keyingi tur yaratilgan (yoki chempion aniqlangan),
      // ABADIY "muzlab" qolmagan bo'lishi kerak.
      const stuckForever = w.world.cup.rounds.length === (cupPendingRound) && !w.world.cup.championId
        && !round.matches.every((m) => m.played);
      check('bracket abadiy to\'xtab qolmadi (keyingi tur yaratildi yoki chempion aniqlandi)',
        w.world.cup.championId || w.world.cup.rounds.length > cupPendingRound,
        `rounds=${w.world.cup.rounds.length} championId=${w.world.cup.championId}`);
    }

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
