// Full end-to-end test against the REAL running server: register humans,
// give them careers in the same league, then let the admin advance the shared
// world through several full seasons and verify the squads actually evolve.
const BASE = 'http://localhost:4000';

async function api(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  return res.json();
}

function makePlayer(name, clubId, clubName) {
  return {
    id: `player_${name}`, name, surname: 'Test', number: 10, position: 'ST',
    nationality: 'Uzbekistan', age: 17, firstRating: 70, potential: 88, overall: 70,
    club: { id: clubId, name: clubName, logo: '⚽', leagueId: 'la_liga', leagueName: 'La Liga', country: 'Spain', flag: '🇪🇸', tier: 'starter' },
    career: { gameDate: '2026-08-01', day: 1, money: 0, weeklyWage: 0, form: 'Average', stamina: 100, trophies: [], goals: 0, assists: 0, appearances: 0 }
  };
}

(async () => {
  // --- setup ---
  const admin = await api('/api/login', { method: 'POST', body: { username: 'Begimqulov017', password: 'beg1mqulov.011' } });
  if (!admin.ok) throw new Error('admin login failed: ' + JSON.stringify(admin));
  const adminToken = admin.token;

  const humans = [
    { username: 'ali_rm', club: ['real_madrid', 'Real Madrid'] },
    { username: 'bek_fcb', club: ['barcelona', 'FC Barcelona'] }
  ];
  for (const h of humans) {
    const reg = await api('/api/register', { method: 'POST', body: { username: h.username, password: 'test1234' } });
    h.token = reg.token || (await api('/api/login', { method: 'POST', body: { username: h.username, password: 'test1234' } })).token;
    const save = await api('/api/career/save', { method: 'POST', token: h.token, body: { player: makePlayer(h.username, h.club[0], h.club[1]) } });
    if (!save.ok) throw new Error('career save failed');
  }
  console.log('setup: admin + 2 human players at Real Madrid / Barcelona (la_liga)\n');

  // --- baseline snapshot of the shared world squads ---
  const w0 = await api('/api/world/la_liga?includeSquads=1', { token: adminToken });
  const world0 = w0.world;
  const squads0 = world0.squads;
  const snapshot = (sq) => {
    const all = Object.values(sq).flat();
    return {
      players: all.length,
      avgAge: +(all.reduce((s, p) => s + p.age, 0) / all.length).toFixed(1),
      avgOvr: +(all.reduce((s, p) => s + p.ovr, 0) / all.length).toFixed(1),
      ids: new Set(all.map((p) => p.id)),
      academy: all.filter((p) => p.isAcademy).length
    };
  };
  const s0 = snapshot(squads0);
  console.log('BASELINE season', world0.season, '| date', world0.gameDate,
    '| rounds', world0.schedule.length, '| players', s0.players, '| avgAge', s0.avgAge, '| avgOvr', s0.avgOvr);
  const mbappe0 = squads0.real_madrid.find((p) => p.id === 'mbappe');
  console.log('  Mbappé at start: age', mbappe0.age, 'ovr', mbappe0.ovr, 'retires at', mbappe0.retireAge);
  console.log('  Real Madrid squad size:', squads0.real_madrid.length, '| every player has nationality:',
    squads0.real_madrid.every((p) => !!p.nationality), '\n');

  // --- advance until 4 season rollovers have happened ---
  const TARGET_SEASONS = 4;
  let rollovers = [];
  let calls = 0;
  let matchesResolved = 0;
  const t0 = Date.now();
  while (rollovers.length < TARGET_SEASONS && calls < 2000) {
    const r = await api('/api/admin/advance-world-day', { method: 'POST', token: adminToken });
    calls += 1;
    if (!r.ok) throw new Error('advance failed: ' + JSON.stringify(r));
    matchesResolved += r.resolvedMatches || 0;
    if (r.seasonRollovers?.length) {
      r.seasonRollovers.forEach((ro) => {
        rollovers.push(ro);
        console.log(`ROLLOVER after ${calls} admin clicks | season ${ro.season} done | champion: ${ro.championName}` +
          ` | retirements ${ro.retirements} (famous ${ro.famousRetirements}) | academy ${ro.newAcademy}` +
          ` | next season starts ${ro.nextSeasonStart}`);
      });
    }
  }
  console.log(`\nadmin clicks: ${calls} | matches resolved: ${matchesResolved} | elapsed ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);

  // --- verify the world after 4 seasons ---
  const w1 = await api('/api/world/la_liga?includeSquads=1', { token: adminToken });
  const world1 = w1.world;
  const s1 = snapshot(world1.squads);
  console.log('AFTER season', world1.season, '| date', world1.gameDate, '| seasonStart', world1.seasonStartDate);
  console.log('  players', s1.players, '(was', s0.players + ')', '| avgAge', s1.avgAge, '(was', s0.avgAge + ')',
    '| avgOvr', s1.avgOvr, '(was', s0.avgOvr + ')');
  const gone = [...s0.ids].filter((id) => !s1.ids.has(id)).length;
  const added = [...s1.ids].filter((id) => !s0.ids.has(id)).length;
  console.log('  original players gone:', gone, '| brand new players:', added, '| academy players now:', s1.academy);
  const mbappe1 = world1.squads.real_madrid.find((p) => p.id === 'mbappe');
  console.log('  Mbappé now:', mbappe1 ? `age ${mbappe1.age} ovr ${mbappe1.ovr}` : 'RETIRED/RELEASED');

  console.log('\nCHECKS');
  const checks = [
    ['season counter advanced to ' + world1.season, world1.season === TARGET_SEASONS + 1],
    ['new schedule generated and unplayed', world1.schedule.some((r) => r.matches.some((m) => !m.played))],
    ['next season kicks off in the future (off-season is being played through)',
      world1.schedule[0].date > world1.gameDate],
    ['standings reset for new season', Object.values(world1.standings).every((t) => t.played === 0)],
    ['topScorers reset', Object.keys(world1.topScorers).length === 0],
    ['squads actually aged', s1.avgAge !== s0.avgAge],
    ['some original players are gone', gone > 0],
    ['new academy players exist', added > 0],
    ['squad sizes stayed sane (18-26)', Object.values(world1.squads).every((sq) => sq.length >= 18 && sq.length <= 26)],
    ['no duplicate player ids', Object.values(world1.squads).flat().length === s1.ids.size],
    ['every club still has >= 2 GKs', Object.values(world1.squads).every((sq) => sq.filter((p) => p.pos === 'GK').length >= 2)],
    ['seasonHistory has 4 archived seasons', (world1.seasonHistory || []).length === TARGET_SEASONS],
    ['newsLog has retirement/champion entries', (world1.newsLog || []).some((n) => n.type === 'champion')],
    ['static teamsData never mutated', require('../server/gamedata/teamsData').INITIAL_TEAMS
      .find((t) => t.id === 'real_madrid').squad.every((p) => p.age === undefined)]
  ];
  let failed = 0;
  checks.forEach(([label, ok]) => { if (!ok) failed += 1; console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}`); });

  // --- human players got real stats out of the shared world ---
  console.log('\nHUMAN PLAYERS');
  for (const h of humans) {
    const mine = await api('/api/career/mine', { token: h.token });
    const c = mine.player.career;
    console.log(`  ${h.username}: apps ${c.appearances} goals ${c.goals} assists ${c.assists}` +
      ` | last: ${c.lastMatchResult ? `vs ${c.lastMatchResult.opponentName} ${c.lastMatchResult.golFor}-${c.lastMatchResult.golAgainst}` : 'none'}` +
      ` | worldDate ${mine.worldDate}`);
    if (!c.appearances) { failed += 1; console.log('    FAIL: human player got no appearances'); }
  }

  console.log('\n=== NEWS (latest 6) ===');
  (world1.newsLog || []).slice(0, 6).forEach((n) => console.log(`  [${n.type}] ${n.title}${n.detail ? ' — ' + n.detail : ''}`));

  console.log('\n=== SEASON HISTORY ===');
  (world1.seasonHistory || []).forEach((h) => console.log(`  season ${h.season}: ${h.championName} | top scorer: ${h.topScorers[0]?.name || '—'} (${h.topScorers[0]?.goals || 0})`));

  console.log(failed === 0 ? '\n*** ALL CHECKS PASSED ***' : `\n*** ${failed} CHECK(S) FAILED ***`);
  process.exit(failed === 0 ? 0 : 1);
})();
