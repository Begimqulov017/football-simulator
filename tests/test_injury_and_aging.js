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
// PHASE 11: natijalarni FAQAT server hisoblaydi - klient lokal simulyatsiya qilmaydi, jadval nusxasi tegilmaydi.
check("lokal simulyatsiya yo'q (natijani server beradi)",
  afterInjuredTick.career.schedule[0].matches.every((m) => !m.played),
  `${afterInjuredTick.career.schedule[0].matches.length} ta o'yin o'zgarmadi`);

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

// ===========================================================================
// TEST 3 (PHASE 11) — Yagona simulatsiya: server holati -> karyera
// ===========================================================================
console.log('\n--- TEST 3: server dunyosi karyeraga ko\'chadi, mavsum yopiladi ---');
{
  const league = LEAGUES.find((l) => l.id === 'la_liga');
  const base = makePlayer();
  const clubId = base.club.id;
  const mkStandings = (champId) => {
    const st = season.initStandings(league.teamIds);
    league.teamIds.forEach((id, i) => { st[id] = { ...st[id], played: 38, win: id === champId ? 30 : 10 - (i % 5), draw: 4, loss: 4, gf: 70, ga: 30, pts: id === champId ? 94 : 40 - i }; });
    return st;
  };
  const sched1 = season.buildSeasonSchedule(league, '2026-08-01');
  const state1 = { leagueId: league.id, season: 1, schedule: sched1, standings: season.initStandings(league.teamIds), topScorers: {}, leaders: null, cupRun: null, history: [] };
  let w = season.applyWorldState(base, state1);
  check('birinchi sinxronlash: jadval serverdan', w.career.schedule === sched1 && w.career.worldSeason === 1);
  check('o\'zgarmagan holat -> aynan o\'sha obyekt qaytadi', season.applyWorldState(w, state1) === w);

  // Natija serverda o'ynaldi -> standings/schedule yangilanadi
  const sched1b = sched1.map((r, i) => (i === 0 ? { ...r, matches: r.matches.map((m) => ({ ...m, played: true, golA: 2, golB: 1 })) } : r));
  const st1b = { ...state1, schedule: sched1b, standings: mkStandings(clubId) };
  w = season.applyWorldState(w, st1b);
  check('server natijasi karyerada ko\'rinadi', w.career.schedule[0].matches.every((m) => m.played) && w.career.standings[clubId].pts === 94);

  // O'yinchi o'z o'yinini LiveMatch'da o'ynadi
  const opp = INITIAL_TEAMS.find((t) => t.id === league.teamIds[1]);
  w = season.recordPlayedMatch(w, { competition: 'league', round: 1, date: '2026-08-01', opponentName: opp.name, opponentLogo: opp.logo, isHome: true, golFor: 2, golAgainst: 1, rating: 9.2, goals: 2, assists: 1 });
  check('recordPlayedMatch: o\'yin/gol/assist', w.career.appearances === 1 && w.career.goals === 2 && w.career.assists === 1 && w.career.seasonGoals === 2);
  check('recordPlayedMatch: tarix + xabar + forma', w.career.matchHistory.length === 1 && w.career.messages.length >= 1 && typeof w.career.form === 'string');
  check('recordPlayedMatch: 9+ reyting yangiligi', (w.career.newsFeed || []).some((n) => n.type === 'rating'));

  // Server mavsumni yakunladi (rollover) -> klient o'z mavsumini yopadi
  const entry = { season: 1, endDate: '2027-05-20', finalStandings: mkStandings(clubId), finalTopScorers: [{ id: w.id, name: 'Test Player', teamId: clubId, teamName: base.club.name, goals: 31 }], championId: clubId };
  const state2 = { leagueId: league.id, season: 2, schedule: season.buildSeasonSchedule(league, '2027-08-01'), standings: season.initStandings(league.teamIds), topScorers: {}, leaders: null, cupRun: null, history: [entry] };
  const closed = season.applyWorldState(w, state2);
  check('mavsum yopildi: seasonHistory', (closed.career.seasonHistory || []).length === 1 && closed.career.seasonHistory[0].wonLeague === true);
  check('chempion kubogi qo\'shildi', (closed.career.trophies || []).some((t) => /Champion/.test(t.name)));
  check('Oltin batinka (31 gol)', (closed.career.seasonHistory[0] || {}).wonGoldenBoot === true);
  check('yangi mavsum jadvali serverdan', closed.career.worldSeason === 2 && closed.career.schedule === state2.schedule);
  check('mavsum hisoblagichlari nolga tushdi', closed.career.seasonAppearances === 0 && closed.career.seasonGoals === 0);
  check('sana lokal sakramadi (kalendarni admin boshqaradi)', closed.career.gameDate === w.career.gameDate);
  check('ikki marta yopilmaydi', season.applyWorldState(closed, state2) === closed);
}


// ===========================================================================
// TEST 4 (PHASE 11) — yangi karyera dunyo sanasiga tekislanadi ("bo'sh kunlar" yo'q)
// ===========================================================================
console.log('\n--- TEST 4: karyera dunyo sanasiga tekislanadi ---');
{
  const fresh = makePlayer();
  const a = season.alignToWorld(fresh, '2026-08-12');
  check('yangi karyera dunyo sanasiga ko\'chdi', a.career.gameDate === '2026-08-12' && a.career.worldAligned === true);
  check('kun hisoblagichi sanaga mos (12 kun)', a.career.day === fresh.career.day + 12, `${fresh.career.day} -> ${a.career.day}`);
  check('shartnoma muddati to\'liq qoldi (signedDay yangilandi)', a.career.contract.signedDay === a.career.day);
  check('ikkinchi marta siljimaydi', season.alignToWorld(a, '2026-09-30') === a);
  const played = { ...fresh, career: { ...fresh.career, appearances: 3 } };
  const b = season.alignToWorld(played, '2026-08-12');
  check('o\'yin o\'ynagan karyera SILJIMAYDI', b.career.gameDate === played.career.gameDate && b.career.worldAligned === true);
  check('dunyo sanasi noma\'lum bo\'lsa tegilmaydi', season.alignToWorld(fresh, null) === fresh);
  check('dunyo orqada bo\'lsa siljimaydi', season.alignToWorld(fresh, '2026-07-01').career.gameDate === fresh.career.gameDate);
}

console.log(`\n${failures === 0 ? '✅ HAMMASI O\'TDI' : `❌ ${failures} ta test yiqildi`}`);
process.exit(failures === 0 ? 0 : 1);
