// ---------------------------------------------------------------------------
// Phase 3 — o'yinchi yaratish, klub g'ildiragi va shartnoma muzokarasi mantig'i.
// (UI'dan ajratilgan toza funksiyalar: test qilish va qayta ishlatish oson.)
// ---------------------------------------------------------------------------
import { INITIAL_TEAMS } from '../../data/teamsData';
import { LEAGUES, HOME_COUNTRY_CLUB_BOOST } from '../../data/leaguesData';
import { rollClub, buildStartingStats } from '../utils/playerGen';
import { joinClubRoster, updatePlayerInClubRoster } from '../data/clubRosterStore';
import {
  buildSeasonSchedule, initStandings, computeStartingWage, setupSeasonCups,
} from '../utils/season';

export const BIRTH_YEAR = 2009; // avtomatik — foydalanuvchi faqat oy va kunni tanlaydi
export const MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
];
export const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST'];
export const MAX_LEAGUE_DECLINES = 2; // ligani 2 marta rad etish mumkin
export const MAX_CLUB_DECLINES = 3; // klubni 3 marta rad etish mumkin
export const MAX_DECLINES = MAX_CLUB_DECLINES; // eski nom (moslik uchun)
export const WHEEL_SEGMENTS = 12;
export const CONTRACT_YEARS = [2, 3, 4, 5, 6];
export const START_DATE = '2026-07-31'; // 1-avgustdagi 1-turdan bir kun oldin (season.js talabi)

// 2009 kabisa yili emas: fevral 28 kun.
export const daysInMonth = (month) => new Date(BIRTH_YEAR, month, 0).getDate();

// O'yin boshlanish sanasidagi yosh (2026-07-31): tug'ilgan kun 31-iyuldan oldin bo'lsa 17, aks holda 16.
export function ageAtStart(month, day) {
  return month < 7 || (month === 7 && day <= 31) ? 17 : 16;
}

// season.js har 365 kunda yoshni oshiradi. Haqiqiy tug'ilgan kunga to'g'ri kelishi uchun
// oxirgi tug'ilgan kundan beri o'tgan kunlarni hisoblab, lastAgeUpDay'ni siljitamiz.
export function lastAgeUpDayFor(month, day) {
  const lastBirthdayYear = ageAtStart(month, day) === 17 ? 2026 : 2025;
  const since = Math.round((Date.UTC(2026, 6, 31) - Date.UTC(lastBirthdayYear, month - 1, day)) / 86400000);
  return 1 - since;
}

export const pad2 = (n) => String(n).padStart(2, '0');
export const birthDateISO = (month, day) => `${BIRTH_YEAR}-${pad2(month)}-${pad2(day)}`;

// ---------------- KLUB G'ILDIRAGI ----------------
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Avval rad etilgan klub qayta taklif qilinmaydi.
export function rollUniqueClub(nationality, excludeIds = []) {
  for (let i = 0; i < 30; i += 1) {
    const r = rollClub(nationality);
    if (!excludeIds.includes(r.team.id)) return r;
  }
  return rollClub(nationality);
}

// G'ildirak bo'laklari: natija klub tasodifiy joyga qo'yiladi, qolganlari — chalg'ituvchilar.
export function buildWheel(result, count = WHEEL_SEGMENTS) {
  const others = shuffle(INITIAL_TEAMS.filter((t) => t.id !== result.team.id)).slice(0, count - 1);
  const targetIndex = Math.floor(Math.random() * count);
  const segments = [...others];
  segments.splice(targetIndex, 0, result.team);
  return { segments, targetIndex };
}

// ---- Yangi oqim: 1) liga g'ildiragi  2) tanlangan liganing klublari g'ildiragi ----
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Liga tanlash: o'yinchining davlati ligasi ko'proq chiqadi, avval rad etilgan liga qayta chiqmaydi.
export function rollLeague(nationality, excludeIds = []) {
  const pool = LEAGUES.filter((l) => !excludeIds.includes(l.id));
  const list = pool.length ? pool : LEAGUES;
  const weighted = [];
  list.forEach((l) => {
    const w = nationality && l.country === nationality ? HOME_COUNTRY_CLUB_BOOST : 1;
    for (let i = 0; i < w; i += 1) weighted.push(l);
  });
  return pickRandom(weighted);
}

// Ligadagi klublar (teamsData'da topilganlari).
export const leagueTeams = (league) => league.teamIds
  .map((id) => INITIAL_TEAMS.find((t) => t.id === id)).filter(Boolean);

// Tanlangan ligadan klub: avval rad etilgan klub qayta chiqmaydi.
export function rollClubInLeague(league, excludeIds = []) {
  const all = leagueTeams(league);
  const pool = all.filter((t) => !excludeIds.includes(t.id));
  return { league, team: pickRandom(pool.length ? pool : all) };
}

// Klub rad etishlar soni ligadagi klublar sonidan oshib ketmasligi kerak (kamida bittasi qoladi).
export const maxClubDeclinesFor = (league) => Math.max(0, Math.min(MAX_CLUB_DECLINES, leagueTeams(league).length - 1));

// Umumiy g'ildirak: `result` — natija element, `pool` — chalg'ituvchilar manbai. Bo'laklar soni <= count.
export function buildItemsWheel(result, pool, count = WHEEL_SEGMENTS) {
  const others = shuffle(pool.filter((x) => x.id !== result.id)).slice(0, Math.max(0, count - 1));
  const targetIndex = Math.floor(Math.random() * (others.length + 1));
  const segments = [...others];
  segments.splice(targetIndex, 0, result);
  return { segments, targetIndex };
}

export const leagueSeg = (l) => ({ id: l.id, icon: l.flag, name: l.name });
export const teamSeg = (t) => ({ id: t.id, icon: t.logo, name: t.name });

// Ko'rsatkich bo'lakning markazi tepada to'xtashi uchun yangi burilish burchagi (gradus).
export function computeSpinRotation(currentRotation, targetIndex, count = WHEEL_SEGMENTS, turns = 5) {
  const slice = 360 / count;
  const jitter = (Math.random() - 0.5) * slice * 0.6; // bo'lak ichida tasodifiy joy
  const targetMod = (360 - (targetIndex * slice + slice / 2) + jitter + 720) % 360;
  const currentMod = ((currentRotation % 360) + 360) % 360;
  const delta = (targetMod - currentMod + 360) % 360;
  return currentRotation + turns * 360 + delta;
}

// ---------------- SHARTNOMA MUZOKARASI ----------------
export const ROLES = {
  key: {
    id: 'key', label: 'Key Player', icon: '⭐',
    desc: "Asosiy tarkib va ko'p o'ynash vaqti. Maosh yuqoriroq, lekin klub ishonchini oqlash kerak.",
  },
  rotation: {
    id: 'rotation', label: 'Rotation', icon: '🔄',
    desc: "Almashinuvchi o'yinchi. Maosh pastroq, o'ynash vaqti kamroq — klub rozi bo'lishi osonroq.",
  },
};

export const roundTo = (n, step = 10) => Math.round(n / step) * step;

export function clubBaseWage({ ovr, leagueId, role }) {
  return computeStartingWage(ovr, role === 'key' ? 'starter' : 'bench', leagueId);
}

export function wageBounds(base) {
  return { min: Math.max(100, roundTo(base * 0.5)), max: roundTo(base * 1.8) };
}

// Klub taklifni qabul qilish ehtimoli. Barcha omillar ochiq ko'rsatiladi (foydalanuvchi ko'rib turadi).
export function evaluateProposal({ ovr, potential, naturalTier, leagueId, wage, years, role }) {
  const base = clubBaseWage({ ovr, leagueId, role });
  const ratio = wage / base;
  // Potensiali yuqori yosh o'yinchiga klub ko'proq to'lashga tayyor
  const leniency = 0.1 + Math.max(0, potential - 78) * 0.012;
  const pWage = ratio <= 1 ? 1 : Math.max(0, 1 - (ratio - 1) / (leniency * 2.2));
  const keyMismatch = role === 'key' && naturalTier !== 'starter';
  const pRole = keyMismatch ? Math.min(0.75, 0.3 + Math.max(0, potential - 80) * 0.03) : 1;
  const yearsMod = Math.min(1.05, 0.9 + 0.05 * (years - 1)); // uzoqroq shartnoma — klub uchun xavfsizroq
  const probability = Math.max(0.03, Math.min(0.97, pWage * pRole * yearsMod));

  const notes = [];
  if (ratio > 1 + leniency) notes.push("Maosh talabi klubning byudjetidan ancha yuqori");
  else if (ratio > 1) notes.push("Maosh talabi biroz yuqori");
  else notes.push("Maosh klub taklifiga mos");
  if (keyMismatch) notes.push("Klub hozircha sizni asosiy tarkib o'yinchisi deb ko'rmayapti");
  if (years <= 2) notes.push("Qisqa shartnoma klub uchun xavfliroq");
  if (years >= 5) notes.push("Uzoq muddatli shartnoma klubga yoqadi");

  return { probability, baseWage: base, ratio, leniency, keyMismatch, notes };
}

// Klub rad etganda beradigan qarshi taklif.
export function buildCounterOffer(ctx) {
  const ev = evaluateProposal(ctx);
  const role = ev.keyMismatch ? 'rotation' : ctx.role;
  const base = clubBaseWage({ ovr: ctx.ovr, leagueId: ctx.leagueId, role });
  const over = Math.max(0, Math.min(ev.ratio - 1, ev.leniency));
  return { wage: roundTo(base * (1 + over * 0.5)), years: Math.max(3, ctx.years), role };
}

// 3 ta muvaffaqiyatsiz urinishdan keyin — klubning oxirgi (o'zgarmas) taklifi.
export function buildFinalOffer({ ovr, leagueId, naturalTier }) {
  const role = naturalTier === 'starter' ? 'key' : 'rotation';
  return { wage: clubBaseWage({ ovr, leagueId, role }), years: 3, role };
}

// ---------------- O'YINCHINI YIG'ISH ----------------
// Eski StartPage.handleStart mantig'i + yangi maydonlar (nickname, tug'ilgan kun, rol, kelishilgan shartnoma).
export function buildNewPlayer({ form, clubResult, rating, potential, contract, legacy, stats }) {
  const { name, surname, nickname, number, position, nationality, birthMonth, birthDay } = form;
  const { subStats, mainStats, ovr } = stats || buildStartingStats(position, rating);
  const playerId = `player_${Date.now()}`;

  const fullName = `${name.trim()} ${surname.trim()}`;
  const naturalTier = joinClubRoster(clubResult.team, {
    id: playerId, name: fullName, pos: position, ovr, stats: mainStats, nationality,
  });
  // Key Player roli kelishilgan bo'lsa, o'yinchi asosiy tarkibdan boshlaydi
  const tier = contract.role === 'key' ? 'starter' : naturalTier;
  // umumiy klub ro'yxatidagi yozuvni ham yangilaymiz
  if (tier !== naturalTier) updatePlayerInClubRoster(clubResult.team.id, playerId, { tier });

  const schedule = buildSeasonSchedule(clubResult.league, '2026-08-01');
  const standings = initStandings(clubResult.league.teamIds);
  const { domesticCup } = setupSeasonCups(
    { id: playerId, club: { id: clubResult.team.id, leagueId: clubResult.league.id }, career: {} },
    clubResult.league, '2026-08-01', schedule,
  );

  return {
    id: playerId,
    name: name.trim(),
    surname: surname.trim(),
    nickname: (nickname || surname).trim().toUpperCase(),
    number: Number(number),
    position,
    nationality,
    birthDate: birthDateISO(birthMonth, birthDay),
    age: ageAtStart(birthMonth, birthDay),
    createdAt: new Date().toISOString(),
    firstRating: rating,
    potential,
    overall: ovr,
    mainStats,
    subStats,
    club: {
      id: clubResult.team.id,
      name: clubResult.team.name,
      logo: clubResult.team.logo,
      leagueId: clubResult.league.id,
      leagueName: clubResult.league.name,
      country: clubResult.league.country,
      flag: clubResult.league.flag,
      tier,
      role: contract.role,
    },
    career: {
      gameDate: START_DATE,
      day: 1,
      lastAgeUpDay: lastAgeUpDayFor(birthMonth, birthDay),
      growthUsedThisYear: 0,
      money: legacy ? legacy.money : 1000,
      weeklyWage: contract.wage,
      contract: { yearsTotal: contract.years, signedDay: 1, role: contract.role },
      transferHistory: [{ type: 'signing', date: START_DATE, from: null, fromLogo: null, to: clubResult.team.name, toLogo: clubResult.team.logo, wage: contract.wage, years: contract.years }],
      contractTalksOpened: false,
      contractFailedNegotiations: 0,
      freeAgent: false,
      form: 'Average',
      stamina: 100,
      trophies: [],
      domesticCup,
      continentalCup: null,
      qualifiedContinentalNextSeason: null,
      goals: 0,
      assists: 0,
      appearances: 0,
      matchRatings: [],
      trainingDate: null,
      injury: null,
      perks: { fitnessTrainer: false, physio: false, agent: false, boots: 'none' },
      messages: [{
        id: `msg_${Date.now()}`,
        type: 'club',
        date: '2026-08-01',
        from: clubResult.team.name,
        subject: `${clubResult.team.name} ga xush kelibsiz!`,
        body: `${clubResult.team.name} bilan shartnoma imzolaganingiz bilan tabriklaymiz. Siz ${contract.role === 'key' ? "asosiy o'yinchi" : "almashinuvchi o'yinchi"} sifatida ${contract.years} yillik shartnoma bilan, haftasiga $${contract.wage.toLocaleString()} maosh evaziga qo'shilasiz. Mavsum 2026-yil 1-avgustda boshlanadi — mashg'ulotga chiqing va tayyorlaning.`,
        read: false,
        resolved: true,
      }],
      schedule,
      standings,
      topScorers: {},
    },
  };
}
