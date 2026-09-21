// ---------------------------------------------------------------------------
// 8-BAND TESTI: inson o'yinchisi uchun 30+ yoshdagi pasayish.
//
// MUHIM: har bir tug'ilgan kun tekshiruvini `schedule: []` bilan
// ISOLYATSIYA qilamiz (shu kunda hech qanday o'yin yo'q), aks holda
// tug'ilgan kun ANIQ shu kunga to'g'ri kelib qolsa, processRound seedlangan
// `matchRatings`ni haqiqiy (tasodifiy) o'yin natijasi bilan ustidan
// yozib, testni beqaror (flaky) qilib qo'yardi - buni amalda tasdiqladim
// (bir marta 99 OVR o'yinchi tasodifan past reyting olib pasaygan edi).
// Bitta izolyatsiya qilingan tick - bitta tug'ilgan kun, hech qanday
// tasodifiy o'yin aralashmaydi.
//
// Ishga tushirish:  node tests/test_veteran_decline.js
// ---------------------------------------------------------------------------
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(require('os').tmpdir(), 'season_decline.bundle.js');

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

function makeVeteran({ age, matchRatings, subStatsBase = 75 }) {
  const league = LEAGUES.find((l) => l.id === 'la_liga');
  const team = INITIAL_TEAMS.find((t) => t.id === league.teamIds[0]);
  const subStats = {
    pace: subStatsBase, acceleration: subStatsBase, shotPower: subStatsBase, finishing: subStatsBase,
    shortPassing: subStatsBase, longPassing: subStatsBase, dribbling: subStatsBase, ballControl: subStatsBase,
    marking: subStatsBase, tackling: subStatsBase, strength: subStatsBase, stamina: subStatsBase,
  };
  return {
    id: 'test_vet', name: 'Vet', surname: 'Player', number: 9,
    position: 'ST', nationality: 'Spain', age,
    firstRating: subStatsBase, potential: 90, overall: subStatsBase,
    mainStats: { pace: subStatsBase, shooting: subStatsBase, passing: subStatsBase, dribbling: subStatsBase, defending: 40, physical: subStatsBase },
    subStats,
    club: {
      id: team.id, name: team.name, logo: team.logo, leagueId: league.id,
      leagueName: league.name, country: league.country, flag: league.flag, tier: 'starter',
    },
    career: {
      // day - lastAgeUpDay = 364, shuning uchun KEYINGI (bitta) tick aynan
      // 365 chegarasidan o'tadi - tug'ilgan kun. schedule=[] bo'lgani uchun
      // bu kunda hech qanday o'yin yo'q, matchRatings o'zgarishsiz qoladi.
      gameDate: '2027-07-30', day: 365, lastAgeUpDay: 1, growthUsedThisYear: 0,
      money: 1000, weeklyWage: 500,
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

console.log("--- TEST 1: 29 -> 30 yosh, PAST forma (avg 6.48 <= 7.5) - PASAYISHI kerak ---");
let vetPoor = makeVeteran({ age: 29, matchRatings: [6.2, 6.5, 6.8, 6.3, 6.6] });
const beforeOvr = vetPoor.overall;
vetPoor = season.advanceOneDay(vetPoor);
check('yosh 30 ga oshdi', vetPoor.age === 30, `age=${vetPoor.age}`);
check('OVR pasaydi', vetPoor.overall < beforeOvr, `${beforeOvr} -> ${vetPoor.overall}`);
check('subStats ham pasaydi', Object.values(vetPoor.subStats).every((v) => v < 75));
check('"Age is catching up" xabari qoldirilgan',
  vetPoor.career.messages.some((m) => m.subject === 'Age is catching up'));

console.log("\n--- TEST 2: 29 -> 30 yosh, YAXSHI forma (avg 8.0 > 7.5) - PASAYMASLIGI kerak ---");
let vetGood = makeVeteran({ age: 29, matchRatings: [7.8, 8.1, 8.0, 7.9, 8.2] });
const beforeOvrGood = vetGood.overall;
vetGood = season.advanceOneDay(vetGood);
check('yosh 30 ga oshdi', vetGood.age === 30);
check("OVR o'zgarmadi (yaxshi forma pasaytirmaydi)", vetGood.overall === beforeOvrGood, `${beforeOvrGood} -> ${vetGood.overall}`);
check('"Age is catching up" xabari YO\'Q', !vetGood.career.messages.some((m) => m.subject === 'Age is catching up'));

console.log("\n--- TEST 3: 24 -> 25 yosh, PAST forma - 30dan yosh bo'lgani uchun PASAYMASLIGI kerak ---");
let young = makeVeteran({ age: 24, matchRatings: [5.5, 5.8, 6.0, 5.6, 5.9] });
const beforeOvrYoung = young.overall;
young = season.advanceOneDay(young);
check('yosh 25 ga oshdi', young.age === 25);
check("30dan yosh - OVR pasaymaydi (past formaga qaramay)", young.overall === beforeOvrYoung, `${beforeOvrYoung} -> ${young.overall}`);
check('hech qanday pasayish xabari yo\'q', !young.career.messages.some((m) => m.subject === 'Age is catching up'));

console.log("\n--- TEST 4: 31 yosh, past forma - 3 yil KETMA-KET har birida pasayadi ---");
let vetMulti = makeVeteran({ age: 31, matchRatings: [6.0, 6.1, 6.2, 6.0, 6.1] });
const startOvr = vetMulti.overall;
const ovrByYear = [];
for (let y = 0; y < 3; y += 1) {
  vetMulti = season.advanceOneDay(vetMulti);
  ovrByYear.push(vetMulti.overall);
  // Keyingi yilga tayyorlaymiz: yana bitta tug'ilgan kungacha 364 kun,
  // va yana past forma (aks holda matchRatings bo'sh schedule tufayli
  // o'zgarmagani uchun avvalgi qiymat qolib, baribir past bo'lardi - lekin
  // aniqlik uchun qayta belgilaymiz).
  vetMulti = {
    ...vetMulti,
    career: {
      ...vetMulti.career,
      day: vetMulti.career.lastAgeUpDay + 364,
      matchRatings: [6.0, 6.1, 6.2, 6.0, 6.1],
    },
  };
}
check('3 yilda yosh 34 ga yetdi', vetMulti.age === 34, `age=${vetMulti.age}`);
check('OVR har yili PASAYIB bordi (monoton kamayish)',
  ovrByYear[0] > ovrByYear[1] && ovrByYear[1] > ovrByYear[2],
  JSON.stringify(ovrByYear));
check('3 yil jamida sezilarli pasaygan', vetMulti.overall < startOvr - 2, `${startOvr} -> ${vetMulti.overall}`);

console.log(`\n${failures === 0 ? '✅ HAMMASI O\'TDI' : `❌ ${failures} ta test yiqildi`}`);
process.exit(failures === 0 ? 0 : 1);
