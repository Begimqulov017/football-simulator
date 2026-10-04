// ============================================================
// GLOBAL MAVSUM MUKOFOTLARI (Phase 9) — BARCHA ligalar bo'yicha
//   • Ballon d'Or          — vaznli formula (pastda WEIGHTS)
//   • Golden Boot          — liga koeffitsiyenti bilan vaznlangan gollar:
//                            Top-5 liga (PL, La Liga, Bundesliga, Serie A, Ligue 1) = 2.0x,
//                            qolgan barcha ligalar = 1.5x
//   • Team of the Season   — butun dunyo bo'yicha eng yaxshi 4-3-3
//
// Har liga mavsumini ALOHIDA tugatadi (rolloverSeason). Shuning uchun har liga
// tugaganda uning nomzodlari snapshot qilinadi, va barcha jonli ligalar o'sha
// mavsumni tugatgach global mukofotlar bir marta yakunlanadi.
// Bu modul awards.js (liga ichidagi mukofotlar)ni O'ZGARTIRMAYDI.
// ============================================================
const { LEAGUES } = require('./gamedata/leaguesData');
const { INITIAL_TEAMS } = require('./gamedata/teamsData');

const TOP5_LEAGUES = ['premier_league', 'la_liga', 'bundesliga', 'serie_a', 'ligue_1'];
const COEF_TOP5 = 2.0;
const COEF_OTHER = 1.5;
const leagueCoef = (leagueId) => (TOP5_LEAGUES.includes(leagueId) ? COEF_TOP5 : COEF_OTHER);

// Ballon d'Or formulasi (yig'indisi = 1.0). Har komponent 0..100 shkalada.
const WEIGHTS = {
  impact: 0.35,      // gollar (poziyaga qarab) / himoyachi va darvozabon uchun mudofaa ko'rsatkichi
  ability: 0.20,     // reyting (haqiqiy o'yinchi: o'rtacha match reytingi) + OVR
  team: 0.20,        // liga jadvalidagi ulush + chempionlik
  silverware: 0.15,  // kubok + Champions League / Europa League natijasi
  prestige: 0.10,    // liga koeffitsiyenti
};

// Himoyachi/darvozabon "ta'sir" komponenti ancha past: haqiqiy Ballon d'Or ham asosan hujumchi/yarim himoyachilarga beriladi
const IMPACT_POS_FACTOR = { GK: 0.45, DEF: 0.75 };

const ATT = ['ST', 'LW', 'RW', 'CF', 'SS'];
const MID = ['CM', 'CDM', 'CAM', 'LM', 'RM'];
const DEF = ['CB', 'LB', 'RB'];

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const round1 = (n) => Math.round(n * 10) / 10;
const round2 = (n) => Math.round(n * 100) / 100;
const avg = (arr) => (arr && arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

function slotOf(pos) {
  if (pos === 'GK') return 'GK';
  if (pos === 'LB') return 'LB';
  if (pos === 'RB') return 'RB';
  if (pos === 'CB') return 'CB';
  if (MID.includes(pos)) return 'MID';
  return 'FW';
}

// ------------------------------------------------------------
// Kontinental natija (CL / EL) — klub uchun 0..1
// ------------------------------------------------------------
function continentalSeasonOf(dateIso) {
  const y = Number(String(dateIso || '').slice(0, 4)) || 0;
  const m = Number(String(dateIso || '').slice(5, 7)) || 1;
  return m >= 8 ? y : y - 1; // mavsum avgustda boshlanadi
}

function continentalScores(db, dateIso) {
  const season = continentalSeasonOf(dateIso);
  const map = new Map();
  const add = (clubId, v) => { if (clubId) map.set(clubId, Math.min(1, (map.get(clubId) || 0) + v)); };
  ((db.continental && db.continental.history) || []).filter((h) => h.season === season).forEach((h) => {
    const isCL = h.short === 'CL';
    add(h.winner && h.winner.id, isCL ? 0.6 : 0.35);
    add(h.runnerUp && h.runnerUp.id, isCL ? 0.3 : 0.15);
  });
  return map;
}

// ------------------------------------------------------------
// Bitta liga nomzodlarini yig'ish
// ------------------------------------------------------------
function candidateScore(c) {
  const slot = slotOf(c.pos);
  let impact;
  if (slot === 'FW') impact = c.goals / 25;
  else if (slot === 'MID') impact = c.goals / 14;
  else if (slot === 'GK') impact = c.defShare * IMPACT_POS_FACTOR.GK;
  else impact = (0.5 * Math.min(1, c.goals / 5) + 0.5 * c.defShare) * IMPACT_POS_FACTOR.DEF;

  const ovrNorm = clamp01(((c.ovr || 60) - 60) / 35);
  const ratingNorm = c.rating ? clamp01((c.rating - 5.5) / 3.5) : null;
  const ability = ratingNorm == null ? ovrNorm : 0.6 * ratingNorm + 0.4 * ovrNorm;

  const team = clamp01(c.teamShare * 0.75 + (c.champion ? 0.25 : 0));
  const silverware = clamp01((c.cupWinner ? 0.4 : 0) + (c.contScore || 0) + (c.champion ? 0.25 : 0));
  const prestige = c.coef / COEF_TOP5;

  const parts = {
    impact: clamp01(impact) * 100,
    ability: ability * 100,
    team: team * 100,
    silverware: silverware * 100,
    prestige: prestige * 100,
  };
  const score = Object.keys(WEIGHTS).reduce((s, k) => s + parts[k] * WEIGHTS[k], 0);
  return {
    score: round1(score),
    breakdown: Object.keys(WEIGHTS).reduce((o, k) => ({ ...o, [k]: round1(parts[k]) }), {}),
  };
}

function collectLeagueCandidates(world, league, db, contMap) {
  const engine = require('./engine');
  const table = engine.sortedTable(world.standings || {});
  if (!table.length) return [];
  const maxPts = Math.max(1, table[0] ? table[0].pts : 1);
  const n = Math.max(1, table.length - 1);
  const defRank = new Map([...table].sort((a, b) => a.ga - b.ga).map((r, i) => [r.teamId, i]));
  const champion = table[0] && table[0].teamId;
  const scorers = world.topScorers || {};
  const coef = leagueCoef(league.id);

  const humanInfo = new Map();
  (db.users || []).forEach((u) => {
    const cs = u.careerSave;
    if (!cs) return;
    humanInfo.set(cs.id, { rating: avg(cs.career && cs.career.matchRatings), username: u.username });
  });

  const all = [];
  league.teamIds.forEach((clubId) => {
    const team = INITIAL_TEAMS.find((t) => t.id === clubId);
    const squad = (world.squads && world.squads[clubId]) || (team && team.squad) || [];
    const row = table.find((r) => r.teamId === clubId);
    const base = {
      clubId, clubName: team ? team.name : clubId, logo: team ? team.logo : '⚽',
      leagueId: league.id, leagueName: league.name, leagueFlag: league.flag, coef,
      teamShare: row ? row.pts / maxPts : 0.5,
      champion: clubId === champion,
      cupWinner: !!(world.cup && world.cup.championId === clubId),
      defShare: 1 - ((defRank.has(clubId) ? defRank.get(clubId) : n) / n),
      contScore: (contMap && contMap.get(clubId)) || 0,
    };
    squad.forEach((p) => {
      const hi = humanInfo.get(p.id);
      const c = {
        ...base,
        id: p.id, name: p.name, pos: p.pos, ovr: p.ovr || 60,
        goals: (scorers[p.id] && scorers[p.id].goals) || 0,
        isHuman: !!hi, username: hi ? hi.username : null, rating: hi ? hi.rating : null,
      };
      Object.assign(c, candidateScore(c));
      c.weightedGoals = round1(c.goals * coef);
      all.push(c);
    });
  });

  // Hajmni kichraytirish: har ligadan eng muhim nomzodlarni qoldiramiz
  const keep = new Map();
  const keepTop = (arr, k) => arr.slice(0, k).forEach((c) => keep.set(c.id, c));
  keepTop([...all].sort((a, b) => b.score - a.score), 40);
  keepTop([...all].filter((c) => c.goals > 0).sort((a, b) => b.goals - a.goals), 15);
  const SLOT_KEEP = { GK: 3, LB: 3, RB: 3, CB: 6, MID: 9, FW: 9 };
  Object.keys(SLOT_KEEP).forEach((s) => keepTop(all.filter((c) => slotOf(c.pos) === s).sort((a, b) => b.score - a.score), SLOT_KEEP[s]));
  all.filter((c) => c.isHuman).forEach((c) => keep.set(c.id, c));
  return [...keep.values()];
}

// ------------------------------------------------------------
// Global natijani hisoblash
// ------------------------------------------------------------
function compact(c) {
  return {
    id: c.id, name: c.name, pos: c.pos, ovr: c.ovr, goals: c.goals,
    clubId: c.clubId, clubName: c.clubName, logo: c.logo,
    leagueId: c.leagueId, leagueName: c.leagueName, leagueFlag: c.leagueFlag,
    isHuman: c.isHuman, username: c.username || null,
    score: c.score, breakdown: c.breakdown, coef: c.coef,
  };
}

function computeGlobalAwards(candidates) {
  // Ballon d'Or
  const bd = [...candidates].sort((a, b) => b.score - a.score || b.goals - a.goals);
  const ballonDor = {
    winner: bd[0] ? compact(bd[0]) : null,
    nominees: bd.slice(1, 5).map(compact),
    weights: WEIGHTS,
  };

  // Golden Boot: gol x liga koeffitsiyenti
  const goalsList = candidates.filter((c) => c.goals > 0)
    .map((c) => ({ ...c, weighted: round1(c.goals * c.coef) }))
    .sort((a, b) => b.weighted - a.weighted || b.goals - a.goals || b.score - a.score);
  const goldenBoot = goalsList.slice(0, 10).map((c, i) => ({
    rank: i + 1, id: c.id, name: c.name, pos: c.pos, goals: c.goals, coef: c.coef, weighted: c.weighted,
    clubId: c.clubId, clubName: c.clubName, logo: c.logo,
    leagueId: c.leagueId, leagueName: c.leagueName, leagueFlag: c.leagueFlag,
    isHuman: c.isHuman, username: c.username || null,
  }));

  // Team of the Season 4-3-3
  const ranked = [...candidates].sort((a, b) => b.score - a.score);
  const used = new Set();
  const take = (slot, count) => {
    const picked = ranked.filter((c) => slotOf(c.pos) === slot && !used.has(c.id)).slice(0, count);
    picked.forEach((c) => used.add(c.id));
    return picked.map((c) => ({ ...compact(c), slot }));
  };
  const teamOfSeason = [
    ...take('GK', 1), ...take('LB', 1), ...take('CB', 2), ...take('RB', 1), ...take('MID', 3), ...take('FW', 3),
  ];
  return { ballonDor, goldenBoot, teamOfSeason, formation: '4-3-3', coefficients: { top5: COEF_TOP5, other: COEF_OTHER, top5Leagues: TOP5_LEAGUES } };
}

// ------------------------------------------------------------
// Snapshot + yakunlash
// ------------------------------------------------------------
function ensureStore(db) {
  db.globalAwards = db.globalAwards || { history: [], snapshots: {} };
  db.globalAwards.history = db.globalAwards.history || [];
  db.globalAwards.snapshots = db.globalAwards.snapshots || {};
  return db.globalAwards;
}

// rolloverSeason ichida chaqiriladi (yosh oshirilishidan OLDIN)
function recordLeagueSnapshot(db, world, league, season) {
  const store = ensureStore(db);
  const contMap = continentalScores(db, world.gameDate);
  const cands = collectLeagueCandidates(world, league, db, contMap);
  store.snapshots[season] = store.snapshots[season] || {};
  store.snapshots[season][league.id] = { date: world.gameDate, candidates: cands };
  // 3 mavsumdan eski yarim-tayyor snapshotlar tozalanadi
  Object.keys(store.snapshots).forEach((s) => { if (Number(s) < season - 2) delete store.snapshots[s]; });
}

function grantGlobalHumanAwards(db, awards, season, date) {
  const inTeam = new Set(awards.teamOfSeason.map((p) => p.id));
  (db.users || []).forEach((u) => {
    const cs = u.careerSave;
    if (!cs) return;
    const won = [];
    if (awards.ballonDor.winner && awards.ballonDor.winner.id === cs.id) won.push({ type: 'global_ballon_dor', title: "Global Ballon d'Or" });
    if (awards.goldenBoot[0] && awards.goldenBoot[0].id === cs.id) won.push({ type: 'global_golden_boot', title: 'Global Golden Boot' });
    if (inTeam.has(cs.id)) won.push({ type: 'global_team_of_season', title: 'Global Team of the Season' });
    if (!won.length) return;
    cs.career = cs.career || {};
    cs.career.awards = [...(cs.career.awards || []), ...won.map((w) => ({ ...w, season, league: 'Global', date }))];
    cs.career.trophies = [...(cs.career.trophies || []), ...won.map((w) => `${w.title} · ${season}-mavsum`)];
    u.careerSavedAt = new Date().toISOString();
  });
}

// Barcha jonli ligalar `season`ni tugatgan bo'lsa (yoki force=true) yakunlaydi.
function tryFinalizeGlobal(db, season, { force = false } = {}) {
  const store = ensureStore(db);
  const snaps = store.snapshots[season];
  if (!snaps) return { finalized: false, reason: 'no_snapshots' };
  if (store.history.some((h) => h.season === season)) return { finalized: false, reason: 'already_done' };
  const liveLeagueIds = LEAGUES.filter((l) => db.leagueWorlds && db.leagueWorlds[l.id]).map((l) => l.id);
  const missing = liveLeagueIds.filter((id) => !snaps[id]);
  if (missing.length && !force) return { finalized: false, reason: 'waiting', missing };

  const candidates = Object.values(snaps).flatMap((s) => s.candidates);
  const awards = computeGlobalAwards(candidates);
  const date = Object.values(snaps).map((s) => s.date).filter(Boolean).sort().pop() || null;
  store.history = [{
    season, date, leaguesCounted: Object.keys(snaps).length, leaguesTotal: liveLeagueIds.length, forced: !!(force && missing.length), ...awards,
  }, ...store.history].slice(0, 8);
  grantGlobalHumanAwards(db, awards, season, date);
  delete store.snapshots[season];
  return { finalized: true, season, missing };
}

const GRACE_DAYS = 60; // qolgan ligalar shuncha kun kutiladi, keyin mavjudlar bilan yakunlanadi
const DAY_MS = 86400000;
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / DAY_MS);

// Har kuni chaqiriladi: tayyor yoki grace muddati o'tgan mavsumlarni yakunlaydi.
function finalizeDue(db, today) {
  const store = ensureStore(db);
  const out = [];
  Object.keys(store.snapshots).map(Number).sort((a, b) => a - b).forEach((season) => {
    const snaps = store.snapshots[season];
    if (!snaps) return;
    const latest = Object.values(snaps).map((x) => x.date).filter(Boolean).sort().pop();
    const overdue = latest && today && daysBetween(latest, today) > GRACE_DAYS;
    const r = tryFinalizeGlobal(db, season, { force: !!overdue });
    if (r.finalized) out.push(r);
  });
  return out;
}

// Jonli poyga: hozirgi holat bo'yicha (saqlanmaydi)
function computeLive(db) {
  const candidates = [];
  let leagues = 0;
  LEAGUES.forEach((league) => {
    const world = db.leagueWorlds && db.leagueWorlds[league.id];
    if (!world || !world.standings) return;
    leagues += 1;
    candidates.push(...collectLeagueCandidates(world, league, db, continentalScores(db, world.gameDate)));
  });
  return { leagues, ...computeGlobalAwards(candidates) };
}

function publicState(db) {
  const store = ensureStore(db);
  const pending = Object.keys(store.snapshots).map((s) => ({ season: Number(s), leaguesDone: Object.keys(store.snapshots[s]).length }));
  return { history: store.history, pending };
}

module.exports = {
  TOP5_LEAGUES, COEF_TOP5, COEF_OTHER, WEIGHTS, leagueCoef,
  collectLeagueCandidates, computeGlobalAwards, recordLeagueSnapshot, tryFinalizeGlobal,
  computeLive, publicState, finalizeDue, GRACE_DAYS, candidateScore, slotOf, continentalScores,
};
