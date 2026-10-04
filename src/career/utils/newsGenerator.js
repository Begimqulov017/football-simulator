// ---------------------------------------------------------------------------
// NEWS GENERATOR ENGINE (Phase 2)
// ---------------------------------------------------------------------------
// Sof (pure) funksiyalar: season.js ichidagi simulyatsiya bosqichlaridan
// chaqiriladi va career.newsFeed ga yoziladigan yangilik obyektlarini qaytaradi.
//
// 8 ta asosiy voqea:
//   1. Big Transfers ($50M+)                 -> buildTransferNews
//   2. League / Cup Champions                -> buildSeasonEndNews, buildCupNews
//   3. 9-10 Player Match Ratings             -> buildRoundNews, buildCupNews
//   4. Team of the Week / Month / Season     -> buildRoundNews (week), buildMonthNews,
//                                               buildAwardsNews (season inclusion)
//   5. Best Team of the Year                 -> buildAwardsNews (type: 'toty')
//   6. Blowout Wins (5+ goal diff)           -> buildRoundNews
//   7. Big Club Upset Losses (0-3+ loss)     -> buildRoundNews
//   8. Individual Trophies (Ballon d'Or ...) -> buildAwardsNews
//
// Har bir yangilik 5 o'yin kuni davomida "featured" bo'lib turadi
// (FEATURE_DAYS, career.day asosida - qarang useNewsFeed.js).
//
// Eslatma: bu fayl season.js ni IMPORT QILMAYDI (circular import bo'lmasligi
// uchun) - kerakli kichik yordamchilar shu yerda takrorlangan.
// ---------------------------------------------------------------------------

import { INITIAL_TEAMS } from '../../data/teamsData';

// ----- Sozlanadigan chegaralar ---------------------------------------------
export const FEATURE_DAYS = 5;          // yangilik necha o'yin kuni featured turadi
export const BIG_TRANSFER_M = 50;       // $M - shundan yuqori transfer yangilik bo'ladi
export const BLOWOUT_MARGIN = 5;        // gol farqi
export const UPSET_MARGIN = 3;          // katta klub 0-3 va undan katta yutqazsa
export const UPSET_BIG_CLUB_SHARE = 0.25; // liga klublarining kuchli choragi "katta klub"
export const STAR_RATING = 9.0;         // 9-10 reyting
export const TOTW_MIN_RATING = 8.0;     // Team of the Week ga kirish (inson o'yinchi)
export const TOM_MIN_AVG = 7.3;         // Team of the Month: o'rtacha reyting
export const TOM_MIN_APPS = 3;          // ...va kamida shuncha o'yin
export const MAX_FEED = 120;            // career.newsFeed maksimal uzunligi

export const NEWS_TYPES = {
  transfer: { label: 'Big Transfer', icon: '💸', accent: 'amber' },
  champion: { label: 'Champions', icon: '🏆', accent: 'amber' },
  rating: { label: 'Star Performance', icon: '⭐', accent: 'cyan' },
  totw: { label: 'Team of the Week', icon: '📋', accent: 'emerald' },
  tom: { label: 'Team of the Month', icon: '📅', accent: 'emerald' },
  tos: { label: 'Team of the Season', icon: '🌟', accent: 'violet' },
  toty: { label: 'Best Team of the Year', icon: '👑', accent: 'violet' },
  blowout: { label: 'Blowout', icon: '💥', accent: 'rose' },
  upset: { label: 'Shock Result', icon: '😱', accent: 'fuchsia' },
  trophy: { label: 'Individual Award', icon: '🥇', accent: 'amber' },
  admin: { label: 'Official', icon: '📢', accent: 'amber' }, // Phase 10: admin majburlagan yangilik
};

// ----- Kichik yordamchilar -------------------------------------------------
const teamOf = (id) => INITIAL_TEAMS.find((t) => t.id === id);

function strengthOf(team) {
  if (!team || !team.squad?.length) return 70;
  const top = [...team.squad].sort((a, b) => (b.ovr || 0) - (a.ovr || 0)).slice(0, 11);
  return top.reduce((s, p) => s + (p.ovr || 68), 0) / top.length;
}

const hashStr = (s) => {
  let h = 0;
  const str = String(s);
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
};
// Deterministik tanlov: bir xil yangilik har safar bir xil matn bilan chiqadi
const pickBy = (seed, arr) => arr[hashStr(seed) % arr.length];

const fullName = (p) => `${p.name} ${p.surname}`.trim();
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthName = (key) => `${MONTHS[Number(key.slice(5, 7)) - 1] || ''} ${key.slice(0, 4)}`;

function make(o) {
  const meta = NEWS_TYPES[o.type] || NEWS_TYPES.blowout;
  return {
    priority: 5, stats: [], tags: [], body: [], lineup: null,
    icon: meta.icon, accent: meta.accent, category: meta.label,
    ...o,
  };
}

// ----- Feed boshqaruvi -----------------------------------------------------
export function snapshotGoals(topScorers) {
  const snap = {};
  Object.entries(topScorers || {}).forEach(([id, s]) => { snap[id] = s.goals; });
  return snap;
}

// Round'dan oldingi va keyingi topScorers farqi -> shu turda kim nechta gol urdi
export function diffGoals(before, topScorers) {
  const delta = {};
  Object.entries(topScorers || {}).forEach(([id, s]) => {
    const d = s.goals - (before?.[id] || 0);
    if (d > 0) delta[id] = { id, name: s.name, teamId: s.teamId, teamName: s.teamName, goals: d };
  });
  return delta;
}

// Phase 10: serverdagi majburiy (admin) yangiliklarni career.newsFeed formatiga o'giradi.
// id barqaror (`admin_<id>`) — appendNews takror qo'shmaydi.
export function buildAdminNews(list, player) {
  return (list || []).map((a) => make({
    id: `admin_${a.id}`, type: 'admin', day: player.career.day, date: player.career.gameDate,
    priority: a.pinned ? 10 : 8, icon: a.icon, category: a.kind === 'breaking' ? 'Breaking' : 'Official',
    headline: a.headline, summary: a.summary, body: [a.summary], tags: ['admin'],
  }));
}

export function appendNews(feed, items) {
  if (!items || !items.length) return feed || [];
  const have = new Set((feed || []).map((n) => n.id));
  const fresh = items.filter((n) => !have.has(n.id));
  if (!fresh.length) return feed || [];
  return [...(feed || []), ...fresh].slice(-MAX_FEED);
}

// ---------------------------------------------------------------------------
// 3) Inson o'yinchining 9-10 reytingi (liga ham, kubok ham shu funksiyadan)
// ---------------------------------------------------------------------------
function buildPlayerRatingItem({ player, pStats, opponent, isHome, golFor, golAgainst, date, day, competition }) {
  if (!pStats?.played || pStats.rating < STAR_RATING) return null;
  const name = fullName(player);
  const r = pStats.rating;
  const id = `rating_${player.id}_${date}_${competition ? 'cup' : 'league'}`;
  const contrib = [];
  if (pStats.goals) contrib.push(`${pStats.goals} goal${pStats.goals > 1 ? 's' : ''}`);
  if (pStats.assists) contrib.push(`${pStats.assists} assist${pStats.assists > 1 ? 's' : ''}`);
  const score = `${isHome ? player.club.name : opponent.name} ${isHome ? golFor : golAgainst}-${isHome ? golAgainst : golFor} ${isHome ? opponent.name : player.club.name}`;
  const perfect = r >= 10;
  return make({
    id, type: 'rating', day, date,
    priority: perfect ? 10 : r >= 9.5 ? 9 : 8,
    headline: perfect ? `PERFECT 10! ${name} was unplayable` : `${name} rated ${r.toFixed(1)}/10 in a masterclass`,
    summary: `${score}${competition ? ` (${competition})` : ''} - ${contrib.length ? contrib.join(' and ') : 'a complete all-round display'} from ${player.club.name}'s ${player.position}.`,
    body: [
      `${name} produced a ${perfect ? 'flawless' : 'near-perfect'} performance for ${player.club.name}, earning a ${r.toFixed(1)} rating against ${opponent.name}.`,
      `${score}. ${contrib.length ? `The ${player.position} finished with ${contrib.join(' and ')} in ${pStats.minutes} minutes on the pitch.` : `Over ${pStats.minutes} minutes the ${player.position} controlled the game.`}`,
      pickBy(id, [
        'Pundits were quick to call it one of the performances of the season.',
        'The match rating sits among the highest anyone has recorded this campaign.',
        'Scouts across the league will have taken notes.',
      ]),
    ],
    stats: [
      { label: 'Rating', value: r.toFixed(1) },
      { label: 'Minutes', value: `${pStats.minutes}'` },
      { label: 'Goals', value: pStats.goals || 0 },
      { label: 'Assists', value: pStats.assists || 0 },
    ],
    tags: [player.club.name, opponent.name, competition || player.club.leagueName].filter(Boolean),
    involvesPlayer: true,
  });
}

// ---------------------------------------------------------------------------
// 4) Team of the Week XI (4-3-3) - g'alaba/clean-sheet/gol/OVR bo'yicha ball
// ---------------------------------------------------------------------------
const DEF_POS = ['CB', 'LB', 'RB'];
const XI_GROUPS = [
  { slot: 'GK', pos: ['GK'], count: 1 },
  { slot: 'DEF', pos: DEF_POS, count: 4 },
  { slot: 'MID', pos: ['CM', 'CDM', 'CAM', 'LM', 'RM'], count: 3 },
  { slot: 'FW', pos: ['ST', 'LW', 'RW', 'CF', 'SS'], count: 3 },
];

function buildWeeklyXI(matches, scorerDelta, human) {
  const pool = [];
  matches.forEach((m) => {
    [[m.home, m.golA, m.golB], [m.away, m.golB, m.golA]].forEach(([tid, gf, ga]) => {
      if (gf < ga) return; // yutqazgan jamoa haftalik tarkibga kirmaydi
      const team = teamOf(tid);
      if (!team?.squad?.length) return;
      const win = gf > ga ? 1 : 0;
      const margin = gf - ga;
      const clean = ga === 0;
      [...team.squad].sort((a, b) => (b.ovr || 0) - (a.ovr || 0)).slice(0, 11).forEach((p) => {
        const goals = scorerDelta?.[p.id]?.goals || 0;
        let score = (p.ovr || 60) + win * 3 + margin * 1.5 + goals * 6;
        if (clean && (p.pos === 'GK' || DEF_POS.includes(p.pos))) score += 5;
        pool.push({ id: p.id, name: p.name, pos: p.pos, club: team.name, logo: team.logo, score, goals, human: false });
      });
    });
  });
  if (human) pool.push(human);

  const used = new Set();
  const lineup = [];
  XI_GROUPS.forEach((g) => {
    pool
      .filter((c) => g.pos.includes(c.pos) && !used.has(c.id))
      .sort((a, b) => b.score - a.score || String(a.name).localeCompare(String(b.name)))
      .slice(0, g.count)
      .forEach((c) => { used.add(c.id); lineup.push({ slot: g.slot, pos: c.pos, name: c.name, club: c.club, logo: c.logo, human: !!c.human, goals: c.goals || 0 }); });
  });
  return lineup;
}

// ---------------------------------------------------------------------------
// Har bir liga turi (matchday) uchun yangiliklar:
//   blowout (6), upset (7), NPC 9-10 reyting (3), inson 9-10 reyting (3),
//   Team of the Week (4)
// ---------------------------------------------------------------------------
export function buildRoundNews({ round, date, day, matches = [], scorerDelta = null, player = null, playerPatch = null }) {
  if (!matches.length) return [];
  const out = [];
  const myClub = player?.club?.id || null;
  const leagueName = player?.club?.leagueName || 'the league';

  const ids = new Set();
  matches.forEach((m) => { ids.add(m.home); ids.add(m.away); });
  const strength = {};
  ids.forEach((id) => { strength[id] = strengthOf(teamOf(id)); });
  const order = [...ids].sort((a, b) => strength[b] - strength[a]);
  const bigClubs = new Set(order.slice(0, Math.max(2, Math.round(order.length * UPSET_BIG_CLUB_SHARE))));

  matches.forEach((m) => {
    if (m.golA == null || m.golB == null) return;
    const home = teamOf(m.home);
    const away = teamOf(m.away);
    if (!home || !away) return;
    const margin = Math.abs(m.golA - m.golB);
    if (margin === 0) return;
    const homeWon = m.golA > m.golB;
    const winner = homeWon ? home : away;
    const loser = homeWon ? away : home;
    const wGoals = homeWon ? m.golA : m.golB;
    const lGoals = homeWon ? m.golB : m.golA;
    const score = `${home.name} ${m.golA}-${m.golB} ${away.name}`;
    const involvesMe = !!myClub && (m.home === myClub || m.away === myClub);
    const baseTags = [winner.name, loser.name, leagueName];

    // 6) Blowout
    if (margin >= BLOWOUT_MARGIN) {
      const id = `blowout_${date}_${m.home}_${m.away}`;
      out.push(make({
        id, type: 'blowout', day, date,
        priority: Math.min(8, 6 + (margin - BLOWOUT_MARGIN)) + (involvesMe ? 1 : 0),
        headline: pickBy(id, [
          `${winner.name} demolish ${loser.name} ${wGoals}-${lGoals}`,
          `${winner.name} run riot with a ${wGoals}-${lGoals} rout`,
          `Total domination: ${winner.name} ${wGoals}-${lGoals} ${loser.name}`,
        ]),
        summary: `${score} - a ${margin}-goal margin in Matchday ${round} of the ${leagueName}.`,
        body: [
          `${winner.name} were ruthless on Matchday ${round}, thrashing ${loser.name} by ${margin} clear goals.`,
          `Final score: ${score}. ${loser.name} never found an answer, and the manager will have plenty to fix before the next fixture.`,
          `It is one of the heaviest results of the season so far in the ${leagueName}.`,
        ],
        stats: [
          { label: 'Score', value: `${m.golA}-${m.golB}` },
          { label: 'Margin', value: `+${margin}` },
          { label: 'Matchday', value: round },
        ],
        tags: baseTags, involvesPlayer: involvesMe,
      }));
    }

    // 7) Big club upset loss (0-3+ loss against a non-big club)
    if (bigClubs.has(loser.id) && !bigClubs.has(winner.id) && lGoals === 0 && margin >= UPSET_MARGIN) {
      const id = `upset_${date}_${m.home}_${m.away}`;
      out.push(make({
        id, type: 'upset', day, date,
        priority: 7 + (margin >= 5 ? 1 : 0) + (involvesMe ? 1 : 0),
        headline: pickBy(id, [
          `Shock! ${loser.name} humbled ${wGoals}-0 by ${winner.name}`,
          `${loser.name} stunned in a ${wGoals}-0 nightmare against ${winner.name}`,
          `Giants fall: ${winner.name} blank ${loser.name} ${wGoals}-0`,
        ]),
        summary: `${score} - one of the league's biggest clubs failed to score and lost by ${margin}.`,
        body: [
          `${loser.name} are among the strongest squads in the ${leagueName}, yet they were comprehensively beaten by ${winner.name} on Matchday ${round}.`,
          `${score}. The favourites failed to register a single goal, and the result sends shockwaves through the table.`,
          `Questions will be asked about ${loser.name}'s form after this heavy defeat.`,
        ],
        stats: [
          { label: 'Score', value: `${m.golA}-${m.golB}` },
          { label: 'Margin', value: `-${margin}` },
          { label: 'Matchday', value: round },
        ],
        tags: baseTags, involvesPlayer: involvesMe,
      }));
    }
  });

  // 3) NPC hat-trick = 9-10 reyting (3 gol -> 9.0, 4 -> 9.5, 5+ -> 10)
  if (scorerDelta) {
    Object.values(scorerDelta)
      .filter((s) => s.goals >= 3 && s.id !== player?.id)
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 2)
      .forEach((s) => {
        const team = teamOf(s.teamId);
        const sq = team?.squad?.find((p) => p.id === s.id);
        const m = matches.find((mm) => mm.home === s.teamId || mm.away === s.teamId);
        const isHome = m?.home === s.teamId;
        const opp = teamOf(isHome ? m?.away : m?.home);
        const rating = Math.min(10, 9 + (s.goals - 3) * 0.5);
        const id = `rating_${s.id}_${date}`;
        const tag = s.goals >= 4 ? `${s.goals}-goal haul` : 'hat-trick';
        out.push(make({
          id, type: 'rating', day, date, priority: s.goals >= 4 ? 8 : 7,
          headline: `${s.name} scores ${s.goals} - rated ${rating.toFixed(1)}/10`,
          summary: `${s.teamName}${opp ? ` vs ${opp.name}` : ''}: a ${tag} on Matchday ${round} earns a ${rating.toFixed(1)} performance rating.`,
          body: [
            `${s.name}${sq ? ` (${sq.pos}, ${sq.ovr} OVR)` : ''} was the story of Matchday ${round}, scoring ${s.goals} goals for ${s.teamName}.`,
            m && opp ? `${isHome ? team?.name : opp.name} ${m.golA}-${m.golB} ${isHome ? opp.name : team?.name}. The ${tag} lifts the match rating to ${rating.toFixed(1)}/10.` : `The ${tag} lifts the match rating to ${rating.toFixed(1)}/10.`,
          ],
          stats: [
            { label: 'Rating', value: rating.toFixed(1) },
            { label: 'Goals', value: s.goals },
            { label: 'Matchday', value: round },
          ],
          tags: [s.teamName, leagueName].filter(Boolean),
        }));
      });
  }

  // 3) Inson o'yinchi 9-10
  if (player && playerPatch?.pStats && playerPatch.opponent) {
    const { pStats, opponent, isHome, golA, golB } = playerPatch;
    const item = buildPlayerRatingItem({
      player, pStats, opponent, isHome, golFor: isHome ? golA : golB, golAgainst: isHome ? golB : golA, date, day,
    });
    if (item) out.push(item);
  }

  // 4) Team of the Week
  const pS = playerPatch?.pStats;
  const humanIn = !!(player && pS?.played && pS.rating >= TOTW_MIN_RATING);
  const humanCand = humanIn
    ? { id: player.id, name: fullName(player), pos: player.position, club: player.club.name, logo: player.club.logo, score: 999, human: true, goals: pS.goals || 0 }
    : null;
  const lineup = buildWeeklyXI(matches, scorerDelta, humanCand);
  if (lineup.length >= 9) {
    const id = `totw_${date}_${round}`;
    const star = [...lineup].sort((a, b) => b.goals - a.goals)[0];
    const hName = player ? fullName(player) : '';
    out.push(make({
      id, type: 'totw', day, date,
      priority: humanIn ? 8 : 3,
      headline: humanIn ? `${hName} named in the Team of the Week` : `Team of the Week: Matchday ${round} XI revealed`,
      summary: humanIn
        ? `A ${pS.rating.toFixed(1)} rating on Matchday ${round} earns ${hName} a place in the ${leagueName} Team of the Week.`
        : `${star?.name ? `${star.name} (${star.club}) leads` : 'The best performers lead'} the Matchday ${round} selection for the ${leagueName}.`,
      body: [
        `The Matchday ${round} Team of the Week is in, built from the strongest displays across the ${leagueName}.`,
        humanIn ? `${hName} is included after a ${pS.rating.toFixed(1)}-rated performance${pS.goals ? ` with ${pS.goals} goal${pS.goals > 1 ? 's' : ''}` : ''}.` : `Clean sheets, winning margins and goals decided the selection.`,
      ],
      stats: [{ label: 'Matchday', value: round }, { label: 'Formation', value: '4-3-3' }, ...(humanIn ? [{ label: 'Your rating', value: pS.rating.toFixed(1) }] : [])],
      tags: [leagueName, `Matchday ${round}`],
      lineup, involvesPlayer: humanIn,
    }));
  }

  return out;
}

// ---------------------------------------------------------------------------
// Kubok: 9-10 reyting + kubok chempioni (inson o'yinchi klubi)
// ---------------------------------------------------------------------------
export function buildCupNews({ player, cupRun, outcome, opponent, date, day }) {
  const out = [];
  if (!player || !cupRun || !outcome) return out;
  const fx = outcome.nextCupRun.fixtures[cupRun.stage];
  const golFor = fx?.golFor ?? 0;
  const golAgainst = fx?.golAgainst ?? 0;
  const opp = opponent || { name: 'Cup opponent' };

  const rating = buildPlayerRatingItem({
    player, pStats: outcome.pStats, opponent: opp, isHome: true, golFor, golAgainst, date, day, competition: cupRun.name,
  });
  if (rating) out.push(rating);

  if (outcome.nextCupRun.won && !cupRun.won) {
    const year = Number(date.slice(0, 4));
    const id = `champion_cup_${cupRun.name}_${year}_${player.club.id}`;
    out.push(make({
      id, type: 'champion', day, date, priority: 10,
      icon: cupRun.name?.toLowerCase().includes('champions') || cupRun.name?.toLowerCase().includes('europa') || cupRun.name?.toLowerCase().includes('afc') ? '🌍' : '🏆',
      headline: `${player.club.name} win the ${cupRun.name}!`,
      summary: `A ${golFor}-${golAgainst} final win over ${opp.name} lifts the trophy.`,
      body: [
        `${player.club.name} are the ${cupRun.name} champions after beating ${opp.name} ${golFor}-${golAgainst} in the final${golFor === golAgainst ? ' on penalties' : ''}.`,
        `${fullName(player)} and teammates celebrated a memorable piece of silverware.`,
      ],
      stats: [{ label: 'Final', value: `${golFor}-${golAgainst}` }, { label: 'Opponent', value: opp.name }, { label: 'Year', value: year }],
      tags: [player.club.name, cupRun.name], involvesPlayer: true,
    }));
  }
  return out;
}

// ---------------------------------------------------------------------------
// 2) Liga chempioni - mavsum tugaganda (standings hali reset qilinmagan paytda)
// ---------------------------------------------------------------------------
export function buildSeasonEndNews({ player, standings, topScorers, date, day }) {
  if (!player || !standings) return [];
  const rows = Object.values(standings)
    .map((r) => ({ ...r, gd: r.gf - r.ga }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  if (!rows.length || !rows[0].played) return [];
  const champ = teamOf(rows[0].teamId);
  const second = teamOf(rows[1]?.teamId);
  if (!champ) return [];
  const year = Number(date.slice(0, 4));
  const league = player.club.leagueName || 'League';
  const mine = champ.id === player.club.id;
  const top = Object.values(topScorers || {}).sort((a, b) => b.goals - a.goals)[0];
  const id = `champion_${player.club.leagueId}_${year}`;
  const gap = rows[1] ? rows[0].pts - rows[1].pts : null;
  return [make({
    id, type: 'champion', day, date, priority: mine ? 10 : 9,
    headline: mine ? `CHAMPIONS! ${champ.name} win the ${league}` : `${champ.name} crowned ${league} champions`,
    summary: `${rows[0].pts} points from ${rows[0].played} games${gap != null ? `, ${gap} clear of ${second?.name || 'the chasing pack'}` : ''}.`,
    body: [
      `${champ.name} have won the ${league} title with ${rows[0].pts} points (${rows[0].win}W ${rows[0].draw}D ${rows[0].loss}L, ${rows[0].gf}:${rows[0].ga}).`,
      second ? `${second.name} finished runners-up${gap != null ? `, ${gap} point${gap === 1 ? '' : 's'} behind` : ''}.` : '',
      top ? `${top.name} (${top.teamName}) topped the scoring charts with ${top.goals} goals.` : '',
      mine ? `${fullName(player)} and ${player.club.name} will never forget this season.` : '',
    ].filter(Boolean),
    stats: [
      { label: 'Points', value: rows[0].pts },
      { label: 'Record', value: `${rows[0].win}-${rows[0].draw}-${rows[0].loss}` },
      { label: 'Goals', value: `${rows[0].gf}:${rows[0].ga}` },
      { label: 'Lead', value: gap != null ? `+${gap}` : '-' },
    ],
    tags: [champ.name, league], involvesPlayer: mine,
  })];
}

// ---------------------------------------------------------------------------
// 4) Team of the Month (oy almashganda, inson o'yinchining o'tgan oy ko'rsatkichi)
// ---------------------------------------------------------------------------
export function buildMonthNews({ player, monthKey, date, day }) {
  if (!player || !monthKey) return [];
  const entries = (player.career.matchHistory || []).filter((h) => (h.date || '').startsWith(monthKey));
  if (entries.length < TOM_MIN_APPS) return [];
  const avg = entries.reduce((s, h) => s + (h.rating || 0), 0) / entries.length;
  if (avg < TOM_MIN_AVG) return [];
  const goals = entries.reduce((s, h) => s + (h.goals || 0), 0);
  const assists = entries.reduce((s, h) => s + (h.assists || 0), 0);
  const name = fullName(player);
  const id = `tom_${player.id}_${monthKey}`;
  return [make({
    id, type: 'tom', day, date, priority: 8, involvesPlayer: true,
    headline: `${name} named in the ${monthName(monthKey)} Team of the Month`,
    summary: `${avg.toFixed(2)} average rating over ${entries.length} matches${goals ? `, ${goals} goal${goals > 1 ? 's' : ''}` : ''}.`,
    body: [
      `${name} was one of the standout performers of ${monthName(monthKey)}, averaging ${avg.toFixed(2)} across ${entries.length} appearances for ${player.club.name}.`,
      `${goals} goal${goals === 1 ? '' : 's'} and ${assists} assist${assists === 1 ? '' : 's'} sealed a place in the Team of the Month.`,
    ],
    stats: [
      { label: 'Avg rating', value: avg.toFixed(2) },
      { label: 'Matches', value: entries.length },
      { label: 'Goals', value: goals },
      { label: 'Assists', value: assists },
    ],
    tags: [player.club.name, monthName(monthKey)],
  })];
}

// ---------------------------------------------------------------------------
// 1) Katta transferlar ($50M+)
// ---------------------------------------------------------------------------
export function buildTransferNews(transfers, day) {
  return (transfers || [])
    .filter((t) => t.fee >= BIG_TRANSFER_M)
    .map((t) => make({
      id: `transfer_${t.id}`, type: 'transfer', day, date: t.date,
      priority: Math.min(9, 6 + Math.floor((t.fee - BIG_TRANSFER_M) / 20)),
      headline: `${t.toClub} sign ${t.playerName} for $${t.fee.toFixed(1)}M`,
      summary: `${t.playerPos}, ${t.ovr} OVR - ${t.fromClub} → ${t.toClub}.`,
      body: [
        `${t.toClub} have completed the blockbuster signing of ${t.playerName} (${t.playerPos}, ${t.ovr} OVR) from ${t.fromClub}.`,
        `The reported fee of $${t.fee.toFixed(1)}M makes it one of the biggest deals on the market.`,
      ],
      stats: [
        { label: 'Fee', value: `$${t.fee.toFixed(1)}M` },
        { label: 'OVR', value: t.ovr },
        { label: 'Position', value: t.playerPos },
      ],
      tags: [t.fromClub, t.toClub],
    }));
}

// ---------------------------------------------------------------------------
// 4, 5, 8) Server mukofotlari (Ballon d'Or, Golden Boot, Team of the Season).
// Bular serverdan keladi (fetchAwards), shuning uchun `day` bu yerda null -
// useNewsFeed.js "birinchi ko'rilgan kun" bilan to'ldiradi.
// ---------------------------------------------------------------------------
export function buildAwardsNews(awardsList, player) {
  const out = [];
  (awardsList || []).slice(0, 2).forEach((a, idx) => {
    const season = a.season;
    const date = a.date || null;
    const league = a.leagueName || player?.club?.leagueName || 'League';
    const fresh = idx === 0;
    const isMe = (x) => !!x && (x.isHuman || (player && x.id === player.id));

    const bd = a.ballonDor?.winner;
    if (bd) {
      const me = isMe(bd);
      out.push(make({
        id: `award_bd_${a.leagueName}_${season}`, type: 'trophy', day: null, date, fresh,
        priority: me ? 10 : 9, icon: '🥇',
        headline: me ? `YOU WIN THE BALLON D'OR!` : `${bd.name} wins the Ballon d'Or`,
        summary: `${bd.clubName} ${bd.pos} crowned the best player of ${league} Season ${season}.`,
        body: [
          `${bd.name} (${bd.pos}, ${bd.ovr} OVR) of ${bd.clubName} has been named the Ballon d'Or winner for Season ${season}.`,
          `${bd.goals || 0} league goal${bd.goals === 1 ? '' : 's'} and a dominant campaign were enough to edge out ${(a.ballonDor.nominees || []).slice(0, 3).map((n) => n.name).join(', ') || 'the field'}.`,
        ],
        stats: [{ label: 'Winner', value: bd.name }, { label: 'Goals', value: bd.goals || 0 }, { label: 'OVR', value: bd.ovr }, { label: 'Season', value: season }],
        tags: [bd.clubName, league, "Ballon d'Or"], involvesPlayer: me,
      }));
    }

    const gb = a.goldenBoot?.[0];
    if (gb) {
      const me = isMe(gb);
      out.push(make({
        id: `award_gb_${a.leagueName}_${season}`, type: 'trophy', day: null, date, fresh,
        priority: me ? 9 : 8, icon: '👟',
        headline: me ? `YOU WIN THE GOLDEN BOOT with ${gb.goals} goals!` : `${gb.name} takes the Golden Boot with ${gb.goals} goals`,
        summary: `Top scorer of ${league} Season ${season} for ${gb.clubName}.`,
        body: [
          `${gb.name} finished as the leading scorer of the ${league} with ${gb.goals} goals for ${gb.clubName}.`,
          (a.goldenBoot || []).length > 1 ? `Runners-up: ${a.goldenBoot.slice(1).map((s) => `${s.name} (${s.goals})`).join(', ')}.` : '',
        ].filter(Boolean),
        stats: [{ label: 'Goals', value: gb.goals }, { label: 'Club', value: gb.clubName }, { label: 'Season', value: season }],
        tags: [gb.clubName, league, 'Golden Boot'], involvesPlayer: me,
      }));
    }

    const xi = a.teamOfSeason || [];
    if (xi.length) {
      const lineup = xi.map((c) => ({ slot: c.slot === 'MID' ? 'MID' : c.slot === 'FW' ? 'FW' : c.slot === 'GK' ? 'GK' : 'DEF', pos: c.pos, name: c.name, club: c.clubName, logo: c.logo, human: isMe(c), goals: c.goals || 0 }));
      const me = lineup.find((l) => l.human);
      const bestClub = Object.entries(xi.reduce((acc, c) => ({ ...acc, [c.clubName]: (acc[c.clubName] || 0) + 1 }), {})).sort((x, y) => y[1] - x[1])[0];
      out.push(make({
        id: `award_toty_${a.leagueName}_${season}`, type: 'toty', day: null, date, fresh,
        priority: 8, lineup,
        headline: `Best Team of the Year: ${league} Season ${season} XI revealed`,
        summary: bestClub ? `${bestClub[0]} supply the most players (${bestClub[1]}) to the best XI of the season.` : 'The best XI of the season is in.',
        body: [
          `The ${league} Team of the Year for Season ${season} has been announced in a 4-3-3 formation.`,
          bestClub ? `${bestClub[0]} lead the way with ${bestClub[1]} selections.` : '',
          me ? `${me.name} is included - a huge honour.` : '',
        ].filter(Boolean),
        stats: [{ label: 'Formation', value: '4-3-3' }, { label: 'Players', value: xi.length }, { label: 'Season', value: season }],
        tags: [league, 'Team of the Year'], involvesPlayer: !!me,
      }));
      if (me) {
        out.push(make({
          id: `award_tos_${a.leagueName}_${season}`, type: 'tos', day: null, date, fresh,
          priority: 9, involvesPlayer: true, lineup,
          headline: `${me.name} included in the Team of the Season`,
          summary: `Recognised among the best ${me.slot === 'GK' ? 'goalkeepers' : 'players'} of ${league} Season ${season}.`,
          body: [`${me.name} (${me.pos}, ${me.club}) has earned a place in the Team of the Season for ${league} Season ${season}.`],
          stats: [{ label: 'Season', value: season }, { label: 'Position', value: me.pos }],
          tags: [me.club, league, 'Team of the Season'],
        }));
      }
    }
  });
  return out;
}
