// ---------------------------------------------------------------------------
// 3-BAND TESTI (davomi): ko'rinadigan penalti seriyasi.
// tournamentEngine.js + rng.js ni BIRGA (bitta entry orqali) esbuild bilan
// bundle qiladi - shunda ikkalasi bitta rng modul nusxasini bo'lishadi
// (xuddi haqiqiy ilovadagi kabi).
//
// Ishga tushirish:  node tests/test_penalty_shootout.js
// ---------------------------------------------------------------------------
const path = require('path');
const os = require('os');
const fs = require('fs');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ENTRY = path.join(os.tmpdir(), 'pen_test_entry.js');
const OUT = path.join(os.tmpdir(), 'pen_test_bundle.cjs');

fs.writeFileSync(ENTRY, [
  `export * as tournamentEngine from ${JSON.stringify(path.join(ROOT, 'src/utils/tournamentEngine.js'))};`,
  `export * as rng from ${JSON.stringify(path.join(ROOT, 'src/utils/rng.js'))};`,
].join('\n'));
execFileSync(path.join(ROOT, 'node_modules/.bin/esbuild'), [
  ENTRY, '--bundle', '--format=cjs', '--platform=node', `--outfile=${OUT}`,
], { stdio: 'pipe' });

const { tournamentEngine: te, rng } = require(OUT);

let failures = 0;
function check(label, cond, detail) {
  console.log(`${cond ? 'OK  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
  if (!cond) failures += 1;
}

function makeSquad(prefix, ovr) {
  const positions = ['GK', 'CB', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
  return positions.map((pos, i) => ({
    id: `${prefix}_${i}`, name: `${prefix} P${i}`, pos, ovr,
    mainStats: { pace: ovr, shooting: ovr, passing: ovr, dribbling: ovr, defending: ovr, physical: ovr },
  }));
}
const teamA = { name: 'Team A', squad: makeSquad('A', 78) };
const teamB = { name: 'Team B', squad: makeSquad('B', 74) };

console.log('--- Determinizm ---');
rng.setSeed('shootout-1');
const r1 = te.simulatePenaltyShootoutDetailed(teamA, teamB);
rng.setSeed('shootout-1');
const r2 = te.simulatePenaltyShootoutDetailed(teamA, teamB);
check('bir xil seed - AYNAN bir xil zarbalar ketma-ketligi', JSON.stringify(r1) === JSON.stringify(r2));
check('darvozabon hech qachon zarba qilmaydi', !r1.kicks.some((k) => k.kicker.id.endsWith('_0')));
check("seriya oxirida durang qolmaydi (g'olib aniq)", r1.penA !== r1.penB, `${r1.penA}-${r1.penB}`);

console.log('\n--- Eski interfeys bilan moslik ---');
rng.setSeed('shootout-1');
const old = te.simulatePenaltyShootout(teamA, teamB);
check('simulatePenaltyShootout tafsilotli versiya bilan bir xil yakuniy hisob beradi',
  old.penA === r1.penA && old.penB === r1.penB && old.winner === r1.winner);
rng.clearSeed();

console.log('\n--- resolveTie: ko\'rsatilgan animatsiya bilan yozilgan natija bir xil ---');
const fixture = { home: 'A', away: 'B', leg1: { scoreHome: 1, scoreAway: 1 } };
const teamsById = { A: teamA, B: teamB };
const precomputed = { penA: 5, penB: 3, winner: 'a' };
const tie = te.resolveTie(fixture, teamsById, precomputed);
check('precomputedShootout berilsa, resolveTie AYNAN shuni yozadi (qayta hisoblamaydi)',
  tie.penA === 5 && tie.penB === 3 && tie.winnerId === 'A');
const tie2 = te.resolveTie(fixture, teamsById);
check('precomputed berilmasa - eski xatti-harakat (o\'zi hisoblab oladi) saqlanadi',
  typeof tie2.penA === 'number' && ['A', 'B'].includes(tie2.winnerId));

console.log('\n--- 500 marta: har doim g\'olib aniqlanadi, real qoidalar ---');
let allDecided = true;
let minKicks = Infinity;
for (let i = 0; i < 500; i += 1) {
  const res = te.simulatePenaltyShootoutDetailed(teamA, teamB);
  if (res.penA === res.penB) allDecided = false;
  minKicks = Math.min(minKicks, res.kicks.length);
}
check('500/500 seriya durangsiz tugadi', allDecided);
check('har bir seriyada kamida 10 zarba (5+5, oltin penaltisiz)', minKicks >= 10, `min=${minKicks}`);

console.log(`\n${failures === 0 ? '✅ HAMMASI O\'TDI' : `❌ ${failures} ta test yiqildi`}`);
process.exit(failures === 0 ? 0 : 1);
