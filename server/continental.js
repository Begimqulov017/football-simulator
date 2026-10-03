// ============================================================
// KONTINENTAL KLUB TURNIRLARI: Chempionlar Ligasi + Yevropa Ligasi
// ============================================================
// Umumiy dunyo kalendari (admin "kunni o'tkazish") bilan bir xil soatda
// ishlaydi, `international.js` bilan bir xil tuzilishda: guruh bosqichi
// (8 guruh x 4 jamoa, bitta doira) + pley-off (1/8, 1/4, 1/2, final).
//
// Ishtirokchilar: UEFA ligalaridagi klublar jamoa kuchi (engine.teamStrength)
// bo'yicha saralanadi. Chempionlar Ligasi — eng kuchli 32 klub (bir ligadan
// ko'pi bilan 5 ta), Yevropa Ligasi — keyingi 32 klub (ko'pi bilan 4 ta).
//
// Eslatma: bu turnirlar dunyoning o'zida o'tadi (admin kuzatadi). Foydalanuvchi
// karyerasidagi (client-local) kubok tizimi (season.js) alohida qoladi.
// ============================================================
const engine = require('./engine');
const { LEAGUES } = require('./gamedata/leaguesData');
const { INITIAL_TEAMS } = require('./gamedata/teamsData');

const UEFA_LEAGUE_IDS = [
  'la_liga', 'premier_league', 'bundesliga', 'ligue_1', 'serie_a',
  'primeira_liga', 'eredivisie', 'belgian_pro_league', 'super_lig', 'swiss_super_league',
];

// AFC Champions League (Phase 5): Osiyo ligalaridagi klublar. O'yindagi AFC
// klublari soni oz (52 ta), shuning uchun 16 jamoali format (4 guruh).
const AFC_LEAGUE_IDS = [
  'uzbekistan_super_league', 'saudi_pro_league', 'j1_league', 'k_league', 'qatar_stars_league',
  'uae_pro_league', 'iran_pro_league', 'iraqi_premier_league', 'chinese_super_league', 'a_league',
];

// `pool` - qaysi klublar to'plamidan tanlanadi; bir pool ichidagi turnirlar
// (UCL/UEL) bir klubni ikki marta olmaydi.
const COMPETITIONS = [
  { key: 'ucl', name: 'UEFA Champions League', short: 'CL', size: 32, perLeagueCap: 5, offset: 0, pool: 'uefa' },
  { key: 'uel', name: 'UEFA Europa League', short: 'EL', size: 32, perLeagueCap: 4, offset: 1, pool: 'uefa' },
  { key: 'acl', name: 'AFC Champions League', short: 'ACL', size: 16, perLeagueCap: 3, offset: 2, pool: 'afc' },
];
const POOL_LEAGUES = { uefa: UEFA_LEAGUE_IDS, afc: AFC_LEAGUE_IDS };

// Mavsum yili Y uchun sanalar (offset — EL bir kun keyin o'ynaydi)
const GROUP_MMDD = ['-09-15', '-10-27', '-12-01'];
const KO_MMDD = ['-02-16', '-03-16', '-04-13', '-05-18']; // Y+1
const SEASON_START_MMDD = '-09-01';

const addDays = engine.addDays;
const ROUND_LABEL = { 16: 'Round of 16', 8: 'Quarter-final', 4: 'Semi-final', 2: 'Final' };
const GROUP_PAIRINGS = [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]]];

const teamById = new Map(INITIAL_TEAMS.map((t) => [t.id, t]));
const leagueOfClub = new Map();
LEAGUES.forEach((l) => l.teamIds.forEach((id) => leagueOfClub.set(id, l)));

const seasonYearOf = (date) => {
  const y = Number(date.slice(0, 4));
  return Number(date.slice(5, 7)) >= 8 ? y : y - 1;
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function squadOf(db, clubId) {
  const leagueId = leagueOfClub.get(clubId)?.id;
  return db.leagueWorlds?.[leagueId]?.squads?.[clubId] || teamById.get(clubId)?.squad || [];
}

function ensureContinental(db) {
  db.continental = db.continental || { active: [], history: [], newsLog: [] };
  db.continental.active = db.continental.active || [];
  db.continental.history = db.continental.history || [];
  db.continental.newsLog = db.continental.newsLog || [];
  return db.continental;
}

const pushNews = (c, entry) => { c.newsLog = [entry, ...c.newsLog].slice(0, 120); };

// ------------------------------------------------------------
// Ishtirokchilarni tanlash va guruhlarga bo'lish
// ------------------------------------------------------------
function rankedClubs(db, leagueIds) {
  const list = [];
  leagueIds.forEach((lid) => {
    const league = LEAGUES.find((l) => l.id === lid);
    if (!league) return;
    league.teamIds.forEach((id) => {
      const team = teamById.get(id);
      if (!team) return;
      list.push({ id, leagueId: lid, strength: engine.teamStrength(squadOf(db, id)) });
    });
  });
  return list.sort((a, b) => b.strength - a.strength);
}

function pickField(ranked, size, cap, taken) {
  const perLeague = {};
  const out = [];
  for (const c of ranked) {
    if (out.length >= size) break;
    if (taken.has(c.id)) continue;
    if ((perLeague[c.leagueId] || 0) >= cap) continue;
    perLeague[c.leagueId] = (perLeague[c.leagueId] || 0) + 1;
    out.push(c);
    taken.add(c.id);
  }
  // 32 dan kam bo'lsa — eng katta mos formatgacha qisqartiramiz (16)
  if (out.length >= 32) return out.slice(0, 32);
  return out.length >= 16 ? out.slice(0, 16) : null;
}

function createCompetition(def, seasonYear, field) {
  const size = field.length;
  const groupCount = size / 4;
  const groups = Array.from({ length: groupCount }, (_, i) => ({ name: String.fromCharCode(65 + i), teams: [], table: {} }));
  for (let pot = 0; pot < 4; pot += 1) {
    const potTeams = shuffle(field.slice(pot * groupCount, (pot + 1) * groupCount));
    potTeams.forEach((t, i) => groups[i].teams.push(t.id));
  }
  const clubs = {};
  field.forEach((c) => {
    const t = teamById.get(c.id);
    const l = leagueOfClub.get(c.id);
    clubs[c.id] = { id: c.id, name: t.name, logo: t.logo, leagueId: l?.id, flag: l?.flag, strength: c.strength };
  });
  groups.forEach((g) => g.teams.forEach((id) => {
    g.table[id] = { id, played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, pts: 0 };
  }));
  const koRounds = Math.log2(groupCount * 2); // 8 guruh -> 16 jamoa -> 4 tur; 4 guruh -> 8 -> 3 tur
  return {
    id: `${def.key}_${seasonYear}`,
    key: def.key,
    name: def.name,
    short: def.short,
    season: seasonYear,
    size,
    groupDates: GROUP_MMDD.map((m) => addDays(`${seasonYear}${m}`, def.offset)),
    knockoutDates: KO_MMDD.slice(KO_MMDD.length - koRounds).map((m) => addDays(`${seasonYear + 1}${m}`, def.offset)),
    clubs,
    groups,
    knockout: [],
    results: [],
    topScorers: {},
    winner: null,
    runnerUp: null,
    finished: false,
  };
}

// ------------------------------------------------------------
// O'yinlarni hal qilish
// ------------------------------------------------------------
function playMatch(db, comp, aId, bId, allowDraw) {
  const sa = squadOf(db, aId);
  const sb = squadOf(db, bId);
  const { golA, golB } = engine.simulateTeamMatch(sa, sb);
  const nameA = comp.clubs[aId].name;
  const nameB = comp.clubs[bId].name;
  engine.distributeMatch(sa, aId, nameA, golA, golB, comp.topScorers, []);
  engine.distributeMatch(sb, bId, nameB, golB, golA, comp.topScorers, []);
  let penalties = null;
  if (!allowDraw && golA === golB) {
    const edge = (comp.clubs[aId].strength - comp.clubs[bId].strength) / 40;
    const aWins = Math.random() < 0.5 + Math.max(-0.2, Math.min(0.2, edge));
    penalties = aWins ? { a: 5, b: 4 } : { a: 4, b: 5 };
  }
  return { golA, golB, penalties };
}

function playGroupMatchday(db, comp, idx, date) {
  const played = [];
  comp.groups.forEach((g) => {
    GROUP_PAIRINGS[idx].forEach(([i, j]) => {
      const a = g.teams[i];
      const b = g.teams[j];
      const r = playMatch(db, comp, a, b, true);
      const ta = g.table[a];
      const tb = g.table[b];
      ta.played += 1; tb.played += 1;
      ta.gf += r.golA; ta.ga += r.golB; tb.gf += r.golB; tb.ga += r.golA;
      if (r.golA > r.golB) { ta.win += 1; ta.pts += 3; tb.loss += 1; }
      else if (r.golA < r.golB) { tb.win += 1; tb.pts += 3; ta.loss += 1; }
      else { ta.draw += 1; tb.draw += 1; ta.pts += 1; tb.pts += 1; }
      const m = {
        date, stage: `Group ${g.name}`, home: a, away: b,
        homeName: comp.clubs[a].name, awayName: comp.clubs[b].name,
        homeLogo: comp.clubs[a].logo, awayLogo: comp.clubs[b].logo, golA: r.golA, golB: r.golB,
      };
      played.push(m);
      comp.results.push(m);
    });
  });
  return played;
}

function groupQualifiers(comp) {
  const firsts = [];
  const seconds = [];
  comp.groups.forEach((g) => {
    const t = Object.values(g.table).sort((x, y) => (y.pts - x.pts) || ((y.gf - y.ga) - (x.gf - x.ga)) || (y.gf - x.gf));
    firsts.push(t[0].id);
    seconds.push(t[1].id);
  });
  const order = [];
  for (let i = 0; i < firsts.length; i += 1) {
    order.push(firsts[i]);
    order.push(seconds[(i + 1) % seconds.length]);
  }
  return order;
}

function playKnockoutRound(db, comp, idx, date) {
  const lineup = idx === 0 ? groupQualifiers(comp) : comp.knockout[idx - 1].ties.map((t) => t.winner);
  const label = ROUND_LABEL[lineup.length] || `Round of ${lineup.length}`;
  const ties = [];
  const played = [];
  for (let i = 0; i < lineup.length; i += 2) {
    const a = lineup[i];
    const b = lineup[i + 1];
    const r = playMatch(db, comp, a, b, false);
    const winner = r.penalties ? (r.penalties.a > r.penalties.b ? a : b) : (r.golA > r.golB ? a : b);
    const tie = {
      home: a, away: b, homeName: comp.clubs[a].name, awayName: comp.clubs[b].name,
      homeLogo: comp.clubs[a].logo, awayLogo: comp.clubs[b].logo,
      golA: r.golA, golB: r.golB, penalties: r.penalties, winner,
    };
    ties.push(tie);
    const m = { date, stage: label, ...tie };
    played.push(m);
    comp.results.push(m);
  }
  comp.knockout[idx] = { label, ties };
  if (ties.length === 1) {
    comp.winner = ties[0].winner;
    comp.runnerUp = ties[0].winner === ties[0].home ? ties[0].away : ties[0].home;
    comp.finished = true;
  }
  return { label, played };
}

// ------------------------------------------------------------
// Kirish nuqtasi — har bir o'tkazilgan kun uchun bir marta chaqiriladi
// ------------------------------------------------------------
function advanceContinental(db, date) {
  const c = ensureContinental(db);
  const events = [];

  // Yangi mavsum turnirlarini yaratish
  const season = seasonYearOf(date);
  if (date >= `${season}${SEASON_START_MMDD}`) {
    const exists = (key) => [...c.active, ...c.history].some((x) => x.id === `${key}_${season}`);
    // Turnir birinchi guruh kunidan KEYIN yaratilsa, guruh o'yinlari hech qachon
    // o'ynalmay qolardi - shuning uchun bunday mavsum o'tkazib yuboriladi.
    const canStart = (def) => date <= addDays(`${season}${GROUP_MMDD[0]}`, def.offset);
    const pending = COMPETITIONS.filter((d) => !exists(d.key) && canStart(d));
    if (pending.length) {
      const ranked = {};
      const taken = {};
      pending.forEach((def) => {
        ranked[def.pool] = ranked[def.pool] || rankedClubs(db, POOL_LEAGUES[def.pool]);
        taken[def.pool] = taken[def.pool] || new Set();
        const field = pickField(ranked[def.pool], def.size, def.perLeagueCap, taken[def.pool]);
        if (!field) return;
        const comp = createCompetition(def, season, field);
        c.active.push(comp);
        pushNews(c, { type: 'start', date, title: `${def.name} ${season}/${String(season + 1).slice(2)} boshlandi`, detail: `${comp.size} klub · ${comp.groups.length} guruh` });
        events.push({ type: 'start', competition: def.name, clubs: comp.size });
      });
    }
  }

  c.active.filter((x) => !x.finished).forEach((comp) => {
    const g = comp.groupDates.indexOf(date);
    if (g >= 0) {
      const matches = playGroupMatchday(db, comp, g, date);
      events.push({ type: 'group', competition: comp.name, matchday: g + 1, matches });
      return;
    }
    const k = comp.knockoutDates.indexOf(date);
    if (k >= 0) {
      const { label, played } = playKnockoutRound(db, comp, k, date);
      events.push({ type: 'knockout', competition: comp.name, round: label, matches: played });
      if (comp.finished) {
        const scorers = Object.values(comp.topScorers).sort((a, b) => b.goals - a.goals);
        const w = comp.clubs[comp.winner];
        pushNews(c, {
          type: 'won', date,
          title: `${w.logo} ${w.name} — ${comp.name} ${comp.season}/${String(comp.season + 1).slice(2)} chempioni!`,
          detail: `Finalda ${comp.clubs[comp.runnerUp].name} mag'lub bo'ldi${scorers[0] ? ` · eng ko'p gol: ${scorers[0].name} (${scorers[0].goals})` : ''}`,
        });
        c.history = [{
          id: comp.id, key: comp.key, name: comp.name, short: comp.short, season: comp.season,
          winner: { id: comp.winner, name: w.name, logo: w.logo },
          runnerUp: { id: comp.runnerUp, name: comp.clubs[comp.runnerUp].name, logo: comp.clubs[comp.runnerUp].logo },
          topScorer: scorers[0] || null, topAssist: engine.buildLeaders(comp.topScorers, { limit: 1 }).assists[0] || null, final: comp.knockout[comp.knockout.length - 1].ties[0],
        }, ...c.history].slice(0, 60);
      }
    }
  });

  // Tugagan turnir 30 kundan keyin "to'liq" saqlanmaydi (faqat history'da qoladi)
  c.active = c.active.filter((x) => !x.finished || x.knockoutDates[x.knockoutDates.length - 1] >= addDays(date, -30));
  return events;
}

module.exports = { advanceContinental, ensureContinental, COMPETITIONS, UEFA_LEAGUE_IDS, AFC_LEAGUE_IDS };
