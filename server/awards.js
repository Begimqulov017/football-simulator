// ============================================================
// MAVSUM YAKUNIDAGI INDIVIDUAL MUKOFOTLAR (Phase 5)
//   • Oltin batinka (Golden Boot)  — liga top butsi
//   • Oltin to'p (Ballon d'Or)     — mavsumning eng yaxshi o'yinchisi
//   • Mavsumning eng yaxshi tarkibi (Team of the Season, 4-3-3)
// rolloverSeason() ichida, o'yinchilar YOSHI oshirilishidan OLDIN chaqiriladi.
// Mukofotlar shu liga doirasida hisoblanadi (har liga mavsumi alohida tugaydi).
// ============================================================
const engine = require('./engine');

const ATT = ['ST', 'LW', 'RW', 'CF', 'SS'];
const MID = ['CM', 'CDM', 'CAM', 'LM', 'RM'];
const DEF = ['CB', 'LB', 'RB'];

const round1 = (n) => Math.round(n * 10) / 10;
const avg = (arr) => (arr && arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

function computeSeasonAwards(world, league, db) {
  const table = engine.sortedTable(world.standings);
  const maxPts = Math.max(1, table[0]?.pts || 1);
  const rankOf = new Map(table.map((r, i) => [r.teamId, i]));
  const defRank = new Map([...table].sort((a, b) => a.ga - b.ga).map((r, i) => [r.teamId, i]));
  const n = Math.max(1, table.length - 1);
  const champion = table[0]?.teamId;
  const scorers = world.topScorers || {};

  // Real o'yinchilar: so'nggi o'yin reytinglari mukofot ballariga ta'sir qiladi
  const humanRating = new Map();
  (db?.users || []).forEach((u) => {
    const cs = u.careerSave;
    if (!cs) return;
    const r = avg(cs.career?.matchRatings);
    if (r) humanRating.set(cs.id, r);
  });

  const candidates = [];
  league.teamIds.forEach((clubId) => {
    const team = engine.INITIAL_TEAMS.find((t) => t.id === clubId);
    const squad = world.squads?.[clubId] || team?.squad || [];
    const row = table.find((r) => r.teamId === clubId);
    const teamShare = row ? row.pts / maxPts : 0.5;
    squad.forEach((p) => {
      const goals = scorers[p.id]?.goals || 0;
      const hr = humanRating.get(p.id);
      const base = (p.ovr || 60) - 60;
      let score = base * 0.55 + goals * 2.6 + teamShare * 9 + (clubId === champion ? 4 : 0);
      if (DEF.includes(p.pos) || p.pos === 'GK') {
        score = base * 0.7 + goals * 3 + (1 - (defRank.get(clubId) ?? n) / n) * 8 + teamShare * 5;
      }
      if (hr) score += (hr - 6) * 4;
      candidates.push({
        id: p.id, name: p.name, pos: p.pos, ovr: p.ovr, goals, clubId,
        clubName: team?.name || clubId, logo: team?.logo || '⚽',
        isHuman: humanRating.has(p.id), score: round1(score),
      });
    });
  });

  const goldenBoot = Object.values(scorers).sort((a, b) => b.goals - a.goals).slice(0, 3).map((s) => {
    const team = engine.INITIAL_TEAMS.find((t) => t.id === s.teamId);
    return { id: s.id, name: s.name, goals: s.goals, clubName: s.teamName || team?.name, logo: team?.logo || '⚽', isHuman: humanRating.has(s.id) };
  });

  // Ballon d'Or: hujumchi va yarim himoyachilar orasidan (himoyachi/darvozabon ham nomzod bo'la oladi, lekin ballari past)
  const ranked = [...candidates].sort((a, b) => b.score - a.score);
  // Ballon d'Or amalda hujumchi/yarim himoyachilarga beriladi: darvozabon va himoyachilar
  // faqat ustun ko'rsatkich bilan (gol, chempionlik) g'olib bo'la oladi.
  const bdRank = candidates
    .map((c) => ({ ...c, score: round1(c.score - (c.pos === 'GK' ? 8 : DEF.includes(c.pos) ? 6 : 0)) }))
    .sort((a, b) => b.score - a.score);
  const ballonDor = { winner: bdRank[0] || null, nominees: bdRank.slice(1, 5) };

  // Mavsumning eng yaxshi tarkibi 4-3-3
  const pick = (positions, count, used) => ranked.filter((c) => positions.includes(c.pos) && !used.has(c.id)).slice(0, count);
  const used = new Set();
  const take = (arr) => { arr.forEach((c) => used.add(c.id)); return arr; };
  const gk = take(pick(['GK'], 1, used));
  const cb = take(pick(['CB'], 2, used));
  const lb = take(pick(['LB'], 1, used));
  const rb = take(pick(['RB'], 1, used));
  const mid = take(pick(MID, 3, used));
  const fw = take(pick(ATT, 3, used));
  const line = (arr, slot) => arr.map((c) => ({ ...c, slot }));
  const teamOfSeason = [...line(gk, 'GK'), ...line(lb, 'LB'), ...line(cb, 'CB'), ...line(rb, 'RB'), ...line(mid, 'MID'), ...line(fw, 'FW')];

  return { goldenBoot, ballonDor, teamOfSeason };
}

// Real o'yinchilarga mukofotni karyerasiga yozadi
function grantHumanAwards(db, awards, season, leagueName, date) {
  const inTeam = new Set(awards.teamOfSeason.map((p) => p.id));
  const label = `${season}-mavsum`;
  (db.users || []).forEach((u) => {
    const cs = u.careerSave;
    if (!cs) return;
    const won = [];
    if (awards.ballonDor.winner?.id === cs.id) won.push({ type: 'ballon_dor', title: "Oltin to'p (Ballon d'Or)" });
    if (awards.goldenBoot[0]?.id === cs.id) won.push({ type: 'golden_boot', title: 'Oltin batinka (Golden Boot)' });
    if (inTeam.has(cs.id)) won.push({ type: 'team_of_season', title: 'Mavsumning eng yaxshi tarkibi' });
    if (!won.length) return;
    cs.career = cs.career || {};
    cs.career.awards = [...(cs.career.awards || []), ...won.map((w) => ({ ...w, season, league: leagueName, date }))];
    cs.career.trophies = [...(cs.career.trophies || []), ...won.map((w) => `${w.title} · ${label}`)];
    u.careerSavedAt = new Date().toISOString();
  });
}

module.exports = { computeSeasonAwards, grantHumanAwards };
