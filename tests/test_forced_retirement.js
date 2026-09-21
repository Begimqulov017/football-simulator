// ---------------------------------------------------------------------------
// 8-BAND TESTI (davomi): majburiy pensiya.
// season.js'ni CJS'ga bundle qilib, `resolveVeteranProgression` testidagi
// bilan bir xil izolyatsiya usulini (schedule: [], bitta tug'ilgan kun
// tikligi) ishlatadi - tasodifiy o'yin natijalari aralashmasligi uchun.
//
// Ishga tushirish:  node tests/test_forced_retirement.js
// ---------------------------------------------------------------------------
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(require('os').tmpdir(), 'season_retire.bundle.js');

const store = new Map();
global.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

execFileSync(path.join(ROOT, 'node_modules/.bin/esbuild'), [
  path.join(ROOT, 'src/career/utils/season.js'),
  '--bundle', '--format=cjs', '--platform=node', `--outfile=${OUT}`,
], { stdio: 'pipe' });

const season = require(OUT);
const { INITIAL_TEAMS } = require(path.join(ROOT, 'server/gamedata/teamsData'));
const { LEAGUES } = require(path.join(ROOT, 'server/gamedata/leaguesData'));

let failures = 0;
function check(label, cond, detail) {
  console.log(`${cond ? 'OK  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
  if (!cond) failures += 1;
}

function makeVeteran({ age, money = 50000, matchRatings = [8.0, 8.0, 8.0, 8.0, 8.0] }) {
  const league = LEAGUES.find((l) => l.id === 'la_liga');
  const team = INITIAL_TEAMS.find((t) => t.id === league.teamIds[0]);
  const base = 80;
  const subStats = {
    pace: base, acceleration: base, shotPower: base, finishing: base,
    shortPassing: base, longPassing: base, dribbling: base, ballControl: base,
    marking: base, tackling: base, strength: base, stamina: base,
  };
  return {
    id: 'test_vet', name: 'Vet', surname: 'Retiree', number: 9,
    position: 'ST', nationality: 'Spain', age,
    firstRating: base, potential: 90, overall: base,
    mainStats: { pace: base, shooting: base, passing: base, dribbling: base, defending: 40, physical: base },
    subStats,
    club: {
      id: team.id, name: team.name, logo: team.logo, leagueId: league.id,
      leagueName: league.name, country: league.country, flag: league.flag, tier: 'starter',
    },
    career: {
      gameDate: '2027-07-30', day: 365, lastAgeUpDay: 1, growthUsedThisYear: 0,
      money, weeklyWage: 500,
      contract: { yearsTotal: 8, signedDay: 1 },
      contractTalksOpened: false, contractFailedNegotiations: 0, freeAgent: false,
      form: 'Average', stamina: 100, trophies: [],
      domesticCup: null, continentalCup: null, qualifiedContinentalNextSeason: null,
      goals: 0, assists: 0, appearances: 0, matchRatings,
      trainingDate: null, injury: null,
      perks: { fitnessTrainer: false, physio: false, agent: false, boots: 'none' },
      messages: [], schedule: [], standings: {}, topScorers: {},
    },
  };
}

console.log('--- TEST 1: 44 -> 45 yosh - 100% MAJBURIY (har doim, tasodifga qaramay) ---');
for (let i = 0; i < 10; i += 1) {
  let p = makeVeteran({ age: 44, money: 75000 });
  p = season.advanceOneDay(p);
  check(`urinish ${i + 1}: 45 yoshda albatta pensiyaga chiqadi`, p.age === 45 && p.career.retired === true,
    `age=${p.age} retired=${p.career.retired}`);
}

console.log("\n--- TEST 2: 34 -> 35 yosh - hali chegaradan pastroq (34 da 0%) ---");
let p34 = makeVeteran({ age: 34 });
p34 = season.advanceOneDay(p34);
check('34 yosh 35ga oshganda pensiya bo\'lishi MUMKIN (35da 70% ehtimol) - lekin 34ning o\'zida yo\'q edi',
  p34.age === 35);

console.log('\n--- TEST 3: pensiyaga chiqgach, meros (pul/familiya/yosh) to\'g\'ri saqlanadi ---');
let p45 = makeVeteran({ age: 44, money: 123456 });
p45 = season.advanceOneDay(p45);
check('retirementLegacy.money to\'g\'ri', p45.career.retirementLegacy?.money === 123456,
  JSON.stringify(p45.career.retirementLegacy));
check('retirementLegacy.surname to\'g\'ri', p45.career.retirementLegacy?.surname === 'Retiree');
check('retirementLegacy.retiredAge to\'g\'ri', p45.career.retirementLegacy?.retiredAge === 45);
check('"Retirement" xabari qoldirilgan', p45.career.messages.some((m) => m.subject === 'Retirement'));
check('overall/subStats saqlangan (nol emas)', p45.overall > 0 && Object.values(p45.subStats).every((v) => v > 0));

console.log('\n--- TEST 4: pensiyaga chiqgan karyera "muzlatilgan" - boshqa kun o\'tmaydi ---');
let frozen = p45;
const beforeDay = frozen.career.day;
const beforeDate = frozen.career.gameDate;
frozen = season.advanceOneDay(frozen);
frozen = season.advanceOneDay(frozen);
frozen = season.advanceOneDay(frozen);
check('kun O\'ZGARMAYDI (muzlatilgan)', frozen.career.day === beforeDay && frozen.career.gameDate === beforeDate,
  `day: ${beforeDay} -> ${frozen.career.day}`);
check('hali retired=true', frozen.career.retired === true);

console.log('\n--- TEST 5: 35 yoshda statistik ehtimol taxminan 70% ga to\'g\'ri keladi (500 urinish) ---');
let retiredCount = 0;
const TRIALS = 500;
for (let i = 0; i < TRIALS; i += 1) {
  let p = makeVeteran({ age: 34 });
  p = season.advanceOneDay(p); // -> 35 yosh, 70% ehtimol
  if (p.career.retired) retiredCount += 1;
}
const rate = retiredCount / TRIALS;
check(`~70% chiqdi (kuzatilgan: ${(rate * 100).toFixed(1)}%, 60-80% oralig'ida)`, rate >= 0.60 && rate <= 0.80,
  `${retiredCount}/${TRIALS}`);

console.log(`\n${failures === 0 ? '✅ HAMMASI O\'TDI' : `❌ ${failures} ta test yiqildi`}`);
process.exit(failures === 0 ? 0 : 1);
