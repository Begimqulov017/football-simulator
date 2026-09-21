// ---------------------------------------------------------------------------
// 1-BAND TESTI: jarohatlangan foydalanuvchi kunni o'tkaza oladimi, va
// mavsum/yil o'tishi bilan yoshi oshadimi.
//
// season.js — brauzer uchun yozilgan ESM modul (localStorage'ga bog'liq
// clubRosterStore'ni import qiladi), shuning uchun avval esbuild bilan CJS
// bundle qilinadi va localStorage uchun oddiy xotiradagi stub qo'yiladi.
//
// Ishga tushirish:  node tests/test_injury_and_aging.js
// ---------------------------------------------------------------------------
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(require('os').tmpdir(), 'season.bundle.js');

// --- localStorage stub (clubRosterStore uchun) -----------------------------
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

// --- Test uchun o'yinchi quramiz -------------------------------------------
function makePlayer() {
  const league = LEAGUES.find((l) => l.id === 'la_liga');
  const team = INITIAL_TEAMS.find((t) => t.id === league.teamIds[0]);
  const schedule = season.buildSeasonSchedule(league, '2026-08-01');
  return {
    id: 'test_player', name: 'Test', surname: 'Player', number: 9,
    position: 'ST', nationality: 'Spain', age: 17,
    firstRating: 70, potential: 88, overall: 70,
    mainStats: { pace: 70, shooting: 70, passing: 70, dribbling: 70, defending: 40, physical: 70 },
    subStats: {},
    club: {
      id: team.id, name: team.name, logo: team.logo, leagueId: league.id,
      leagueName: league.name, country: league.country, flag: league.flag, tier: 'starter',
    },
    career: {
      gameDate: '2026-07-31', day: 1, lastAgeUpDay: 1, growthUsedThisYear: 0,
      money: 1000, weeklyWage: 500,
      contract: { yearsTotal: 8, signedDay: 1 },
      contractTalksOpened: false, contractFailedNegotiations: 0, freeAgent: false,
      form: 'Average', stamina: 100, trophies: [],
      domesticCup: null, continentalCup: null, qualifiedContinentalNextSeason: null,
      goals: 0, assists: 0, appearances: 0, matchRatings: [],
      trainingDate: null, injury: null,
      perks: { fitnessTrainer: false, physio: false, agent: false, boots: 'none' },
      messages: [], schedule, standings: season.initStandings(league.teamIds), topScorers: {},
    },
  };
}

// ===========================================================================
// TEST 1 — Jarohatlangan holatda kun o'tadimi?
// Eng yomon holat: aynan MATCHDAY kuni jarohatlangan bo'lish.
// ===========================================================================
console.log('\n--- TEST 1: jarohatda kun o\'tishi ---');
let p = makePlayer();

// Birinchi tur qaysi kunda ekanini topib, o'sha kunning BIR KUN OLDINIGA
// turib olamiz — ya'ni keyingi "Next Day" aniq matchday bo'ladi.
const firstRound = p.career.schedule[0];
const dayBefore = new Date(firstRound.date);
dayBefore.setUTCDate(dayBefore.getUTCDate() - 1);
p.career.gameDate = dayBefore.toISOString().slice(0, 10);

check('matchdayNext aniqlandi', season.isMatchdayNext(p) === true, `keyingi kun = ${firstRound.date}`);

p.career.injury = { daysLeft: 10, description: 'Test injury' };
const beforeDate = p.career.gameDate;
const beforeDay = p.career.day;
const afterInjuredTick = season.advanceOneDay(p);

check('sana bir kunga surildi', afterInjuredTick.career.gameDate === firstRound.date,
  `${beforeDate} -> ${afterInjuredTick.career.gameDate}`);
check('day hisoblagichi oshdi', afterInjuredTick.career.day === beforeDay + 1,
  `${beforeDay} -> ${afterInjuredTick.career.day}`);
check('jarohat bir kunga kamaydi', afterInjuredTick.career.injury?.daysLeft === 9,
  `10 -> ${afterInjuredTick.career.injury?.daysLeft}`);
check("o'yin foydalanuvchisiz o'tkazildi (appearances oshmadi)",
  afterInjuredTick.career.appearances === 0, `appearances = ${afterInjuredTick.career.appearances}`);
check("o'sha turdagi o'yinlar baribir hal qilindi",
  afterInjuredTick.career.schedule[0].matches.every((m) => m.played),
  `${afterInjuredTick.career.schedule[0].matches.length} ta o'yin`);

// 10 kun ketma-ket: jarohat tuzalib, o'yinchi yana o'ynay boshlashi kerak.
let q = afterInjuredTick;
for (let i = 0; i < 10; i += 1) q = season.advanceOneDay(q);
check('10 kundan keyin jarohat tuzaldi', q.career.injury === null, `injury = ${JSON.stringify(q.career.injury)}`);

// ===========================================================================
// TEST 2 — Yosh yillar davomida oshadimi? (365 kunlik tug'ilgan kun)
// ===========================================================================
console.log('\n--- TEST 2: yosh oshishi (5 yil = 1825 kun) ---');
let r = makePlayer();
const startAge = r.age;
const ageLog = [];
for (let d = 0; d < 1825; d += 1) {
  r = season.advanceOneDay(r);
  if (r.age !== (ageLog.length ? ageLog[ageLog.length - 1].age : startAge)) {
    ageLog.push({ day: r.career.day, age: r.age, date: r.career.gameDate });
  }
}
ageLog.forEach((e) => console.log(`      day ${e.day} (${e.date}) -> ${e.age} yosh`));
check('5 yilda 5 marta yoshi oshdi', ageLog.length === 5, `${ageLog.length} marta`);
check('yakuniy yosh = 22', r.age === startAge + 5, `${startAge} -> ${r.age}`);
check('tug\'ilgan kunlar aniq 365 kunda', ageLog.every((e, i) => e.day === 366 + i * 365),
  ageLog.map((e) => e.day).join(', '));
check('mavsumlar almashdi', (r.career.seasonHistory || []).length >= 4,
  `${(r.career.seasonHistory || []).length} ta mavsum tarixi`);
check('appearances to\'plandi', r.career.appearances > 100, `${r.career.appearances} o'yin`);

console.log(`\n${failures === 0 ? '✅ HAMMASI O\'TDI' : `❌ ${failures} ta test yiqildi`}`);
process.exit(failures === 0 ? 0 : 1);
