// ---------------------------------------------------------------------------
// 3-BAND TESTI: rng.js + engine.js. engine.js ESM modul bo'lgani uchun
// esbuild bilan CJS'ga bundle qilinadi (season.js testidagi kabi).
//
// Tekshiradi:
//   1) Bir xil seed bilan simulyatsiya AYNAN bir xil natija beradi
//      (2000 marta chaqirilgan rand() ketma-ketligi bayt-baytiga teng).
//   2) Turli seedlar TURLI natija beradi (aks holda seed hech narsaga
//      ta'sir qilmayotgan bo'lardi).
//   3) Seed berilmasa (Tezkor O'yin/eski Turnir rejimi) - avvalgidek
//      HAQIQIY tasodifiy: ikki marta chaqirilgan ketma-ketlik boshqa-boshqa,
//      va statistik jihatdan bir tekis (o'rtacha ~0.5) taqsimlangan.
//   4) To'liq bir "o'yin"ni (bir nechta engine.js funksiyasi ketma-ket
//      chaqirilishi - xuddi LiveMatch'ning tick loop qilgani kabi)
//      simulyatsiya qilib, bir xil seed bilan ikki marta ishga tushirib,
//      chiqqan gollar/asistlar/foullar SONI bayt-baytiga teng ekanini
//      tasdiqlaydi - bu aynan "qayta tomosha" funksiyasi tayanadigan asos.
//
// Ishga tushirish:  node tests/test_seeded_rng.js
// ---------------------------------------------------------------------------
const path = require('path');
const { execFileSync } = require('child_process');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const OUT_ENGINE = path.join(os.tmpdir(), 'engine.bundle.js');
const OUT_RNG = path.join(os.tmpdir(), 'rng.bundle.js');

const OUT_BUNDLE = path.join(os.tmpdir(), 'engine_rng.bundle.js');
const ENTRY = path.join(os.tmpdir(), 'rng_test_entry.js');
require('fs').writeFileSync(ENTRY, [
  `export * as engine from ${JSON.stringify(path.join(ROOT, 'src/utils/engine.js'))};`,
  `export * as rng from ${JSON.stringify(path.join(ROOT, 'src/utils/rng.js'))};`,
].join('\n'));
execFileSync(path.join(ROOT, 'node_modules/.bin/esbuild'), [
  ENTRY, '--bundle', '--format=cjs', '--platform=node', `--outfile=${OUT_BUNDLE}`,
], { stdio: 'pipe' });

const { engine, rng } = require(OUT_BUNDLE);

let failures = 0;
function check(label, cond, detail) {
  console.log(`${cond ? 'OK  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
  if (!cond) failures += 1;
}

// --- Test o'yinchilari (mainStats/subStats ni engine funksiyalari kutgan
// shaklda) -------------------------------------------------------------
function makeSquad(prefix, baseOvr) {
  const positions = ['GK', 'CB', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
  return positions.map((pos, i) => ({
    id: `${prefix}_${i}`, name: `${prefix} Player ${i}`, pos,
    mainStats: { pace: baseOvr, shooting: baseOvr, passing: baseOvr, dribbling: baseOvr, defending: baseOvr, physical: baseOvr },
    ovr: baseOvr, stamina: 100,
  }));
}
const squadA = makeSquad('A', 78);
const squadB = makeSquad('B', 74);

// LiveMatch'ning tick loop'iga o'xshab, bir "raund" davomida chaqiriladigan
// funksiyalarning ketma-ketligini simulyatsiya qiladi va natijalarni
// (gol/assist/injury/foul) yig'ib qaytaradi - determinizmni tekshirish uchun.
function simulateRound(seed) {
  rng.setSeed(seed);
  const events = [];
  for (let minute = 1; minute <= 90; minute += 1) {
    const outcomeA = engine.resolveRegularShot(squadA, squadB);
    if (outcomeA) events.push(`A:${outcomeA.result}:${outcomeA.scorer?.id || ''}`);
    const outcomeB = engine.resolveRegularShot(squadB, squadA);
    if (outcomeB) events.push(`B:${outcomeB.result}:${outcomeB.scorer?.id || ''}`);
    const foulA = engine.checkPlainFoul(squadA);
    if (foulA) events.push(`foulA:${foulA.id}`);
    const injuredB = engine.checkInjuryEvent(squadB);
    if (injuredB) events.push(`injB:${injuredB.id}`);
    if (engine.rollOffside(squadA)) events.push('offsideA');
  }
  rng.clearSeed();
  return events;
}

console.log('--- TEST 1: bir xil seed = bir xil natija ---');
const run1 = simulateRound('test-seed-42');
const run2 = simulateRound('test-seed-42');
check('ikki marta bir xil seed bilan ishga tushirilgan raund AYNAN bir xil',
  JSON.stringify(run1) === JSON.stringify(run2), `${run1.length} hodisa, ${run1.length === run2.length ? 'uzunlik teng' : 'uzunlik FARQLI'}`);
check('kamida bitta hodisa yuz berdi (bo\'sh simulyatsiya emas)', run1.length > 0, `${run1.length} hodisa`);

console.log('\n--- TEST 2: turli seed = turli natija ---');
const run3 = simulateRound('test-seed-99');
check('boshqa seed boshqa natija beradi', JSON.stringify(run1) !== JSON.stringify(run3));

console.log('\n--- TEST 3: seedsiz holat haqiqiy tasodifiy qoladi ---');
rng.clearSeed();
const unseeded1 = Array.from({ length: 2000 }, () => rng.rand());
const unseeded2 = Array.from({ length: 2000 }, () => rng.rand());
check('ikki marta chaqirilgan seedsiz ketma-ketlik BOSHQA-BOSHQA',
  JSON.stringify(unseeded1) !== JSON.stringify(unseeded2));
const mean = unseeded1.reduce((a, b) => a + b, 0) / unseeded1.length;
check('seedsiz o\'rtacha ~0.5 (bir tekis taqsimot)', Math.abs(mean - 0.5) < 0.03, `o'rtacha = ${mean.toFixed(4)}`);
const allInRange = unseeded1.every((v) => v >= 0 && v < 1);
check('barcha qiymatlar [0,1) oralig\'ida', allInRange);

console.log('\n--- TEST 4: seedlangan holat ham bir tekis taqsimlangan (faqat takrorlanuvchan) ---');
rng.setSeed('distribution-check');
const seededSample = Array.from({ length: 5000 }, () => rng.rand());
rng.clearSeed();
const seededMean = seededSample.reduce((a, b) => a + b, 0) / seededSample.length;
check('seedlangan generator ham bir tekis taqsimlangan', Math.abs(seededMean - 0.5) < 0.03, `o'rtacha = ${seededMean.toFixed(4)}`);

console.log(`\n${failures === 0 ? '✅ HAMMASI O\'TDI' : `❌ ${failures} ta test yiqildi`}`);
process.exit(failures === 0 ? 0 : 1);
