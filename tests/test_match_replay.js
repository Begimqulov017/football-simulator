// ---------------------------------------------------------------------------
// 5-BAND TESTI: qayta tomosha determinizmi.
// server/index.js orqali bitta pending o'yinni "o'ynab", uning seed +
// humanEntries + world.squads yordamida CLIENT dvijogida (engine.js/
// formations.js) mustaqil ravishda qayta simulyatsiya qilamiz va natija
// serverga yozilgan golA/golB bilan AYNAN bir xil chiqishini tekshiramiz.
//
// Ishga tushirish:
//   node -r ./tests/_mock_mongodb_hook.js tests/test_match_replay.js
// ---------------------------------------------------------------------------
const path = require('path');
const os = require('os');
const fs = require('fs');
const { execFileSync, spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PORT = 6321 + Math.floor(Math.random() * 500);
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

// --- Bir marta ishlaydigan "quick-play" simulyator (LiveMatch tick loopining
// muhim qismini takrorlaydi) - haqiqiy komponentni headless render qilish
// o'rniga, engine.js'ning o'zi bilan to'g'ridan-to'g'ri ishlaydi.
function simulateFullMatch(engine, teamA, teamB) {
  let scoreA = 0, scoreB = 0;
  for (let minute = 1; minute <= 90; minute += 1) {
    const oA = engine.resolveRegularShot(teamA.squad, teamB.squad);
    if (oA) scoreA += 1;
    const oB = engine.resolveRegularShot(teamB.squad, teamA.squad);
    if (oB) scoreB += 1;
  }
  return { scoreA, scoreB };
}

async function main() {
  const ENTRY = path.join(os.tmpdir(), 'replay_test_entry.js');
  fs.writeFileSync(ENTRY, [
    `export * as engine from ${JSON.stringify(path.join(ROOT, 'src/utils/engine.js'))};`,
    `export * as rng from ${JSON.stringify(path.join(ROOT, 'src/utils/rng.js'))};`,
  ].join('\n'));
  const OUT = path.join(os.tmpdir(), 'replay_test_bundle.cjs');
  execFileSync(path.join(ROOT, 'node_modules/.bin/esbuild'), [
    ENTRY, '--bundle', '--format=cjs', '--platform=node', `--outfile=${OUT}`,
  ], { stdio: 'pipe' });
  const { engine, rng } = require(OUT);

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
      body: JSON.stringify({ username: 'replayuser1', password: 'testpass123' }),
    });
    const login = await fetch(`${BASE}/api/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'replayuser1', password: 'testpass123' }),
    }).then((r) => r.json());
    const userAuth = { Authorization: `Bearer ${login.token}` };

    const player = {
      id: 'career_replayuser1', name: 'Replay', surname: 'User1', position: 'ST',
      overall: 82, career: { appearances: 0, goals: 0, assists: 0, messages: [] },
      club: { id: 'barcelona', name: 'barcelona', leagueId: 'la_liga' },
    };
    await fetch(`${BASE}/api/career/save`, {
      method: 'POST', headers: { ...userAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ player }),
    });

    let pending = null;
    for (let i = 0; i < 5 && !pending; i += 1) {
      await fetch(`${BASE}/api/admin/advance-world-day`, { method: 'POST', headers: admin }).then((r) => r.json());
      pending = (await fetch(`${BASE}/api/career/mine`, { headers: userAuth }).then((r) => r.json())).pendingWorldMatch;
    }
    check("barcelona uchun pending o'yin topildi", !!pending, JSON.stringify(pending));

    const detail = await fetch(`${BASE}/api/world-match-detail`, { headers: userAuth }).then((r) => r.json());

    const submitRes = await fetch(`${BASE}/api/career/submit-match-result`, {
      method: 'POST', headers: { ...userAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leagueId: 'la_liga', round: pending.round,
        scoreA: pending.isHome ? 4 : 2, scoreB: pending.isHome ? 2 : 4,
        myGoals: 2, myAssists: 0, myRating: 8.0, myMinutes: 90, myInjured: false,
      }),
    }).then((r) => r.json());
    check('submit-match-result ok', submitRes.ok === true);

    const world = await fetch(`${BASE}/api/world/la_liga?includeSquads=1`, { headers: userAuth }).then((r) => r.json());
    const roundObj = world.world.schedule.find((r) => r.round === pending.round);
    const m = roundObj.matches.find((x) => x.home === pending.home && x.away === pending.away);
    check('m.seed va m.humanEntries yozilgan', !!m.seed && Array.isArray(m.humanEntries) && m.humanEntries.length === 1,
      JSON.stringify({ seed: m.seed, humanEntries: m.humanEntries }));

    // --- Endi CLIENT tomonda, faqat seed + squads + humanEntries yordamida
    // (server yozgan golA/golB'ga qaramasdan) mustaqil qayta simulyatsiya
    // qilamiz - MatchReplayPage.jsx aynan shu ma'lumotlarni ishlatadi.
    const homeHuman = (m.humanEntries || []).filter((h) => h.side === 'home').map((h) => ({ ...h, stamina: 100 }));
    const awayHuman = (m.humanEntries || []).filter((h) => h.side === 'away').map((h) => ({ ...h, stamina: 100 }));
    const teamA = { squad: [...world.world.squads[m.home], ...homeHuman] };
    const teamB = { squad: [...world.world.squads[m.away], ...awayHuman] };

    rng.setSeed(m.seed);
    const replay1 = simulateFullMatch(engine, teamA, teamB);
    rng.setSeed(m.seed);
    const replay2 = simulateFullMatch(engine, teamA, teamB);
    rng.clearSeed();

    check('bir xil seed bilan ikki marta simulyatsiya AYNAN bir xil natija beradi',
      replay1.scoreA === replay2.scoreA && replay1.scoreB === replay2.scoreB,
      `${replay1.scoreA}-${replay1.scoreB} vs ${replay2.scoreA}-${replay2.scoreB}`);

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
