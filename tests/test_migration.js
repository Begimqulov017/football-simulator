// Verifies that a db.json written by the OLD (v6) server - a league world with
// no squads/season/newsLog, mid-season, with fixtures already played - is
// migrated in place by the v7 server without losing schedule or standings.
const BASE = 'http://127.0.0.1:4000';
const api = async (path, { method = 'GET', token, body } = {}) => (await fetch(`${BASE}${path}`, {
  method,
  headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  body: body ? JSON.stringify(body) : undefined
})).json();

(async () => {
  const pre = JSON.parse(require('fs').readFileSync(process.argv[2], 'utf-8')).leagueWorlds.la_liga;
  console.log('BEFORE (old-format world on disk)');
  console.log('  keys:', Object.keys(pre).sort().join(','));
  const playedBefore = pre.schedule.filter((r) => r.matches.every((m) => m.played)).length;
  const standingsPlayedBefore = Math.max(...Object.values(pre.standings).map((t) => t.played));
  console.log('  rounds:', pre.schedule.length, '| fully played:', playedBefore,
    '| max standings.played:', standingsPlayedBefore, '| gameDate:', pre.gameDate);

  const { token } = await api('/api/login', { method: 'POST', body: { username: 'Begimqulov017', password: 'beg1mqulov.011' } });
  const { world } = await api('/api/world/la_liga?includeSquads=1', { token });

  const all = Object.values(world.squads).flat();
  console.log('\nAFTER (v7 server migrated it)');
  console.log('  season:', world.season, '| seasonStartDate:', world.seasonStartDate, '| gameDate:', world.gameDate);
  console.log('  squads:', Object.keys(world.squads).length, 'clubs /', all.length, 'players');

  const checks = [
    ['squads created for every club', Object.keys(world.squads).length === 20],
    ['every player has age/retireAge/nationality', all.every((p) => Number.isInteger(p.age) && p.retireAge > p.age && !!p.nationality)],
    ['every club has >= 2 GK', Object.values(world.squads).every((s) => s.filter((p) => p.pos === 'GK').length >= 2)],
    ['season defaulted to 1', world.season === 1],
    ['newsLog + seasonHistory initialised', Array.isArray(world.newsLog) && Array.isArray(world.seasonHistory)],
    ['existing schedule NOT wiped', world.schedule.length === pre.schedule.length],
    ['already-played rounds preserved', world.schedule.filter((r) => r.matches.every((m) => m.played)).length === playedBefore],
    ['existing standings preserved', Math.max(...Object.values(world.standings).map((t) => t.played)) === standingsPlayedBefore],
    ['gameDate untouched by migration', world.gameDate === pre.gameDate]
  ];

  // advancing must still work on a migrated world
  let last;
  for (let i = 0; i < 8; i += 1) last = await api('/api/admin/advance-world-day', { method: 'POST', token });
  console.log('\n  after 8 advances -> worldDate', last.worldDate, '| resolved this day:', last.resolvedMatches);
  if (last.matches?.length) console.log('  sample:', last.matches.slice(0, 2).map((m) => `${m.home} ${m.score} ${m.away}`).join(' | '));
  checks.push(['advancing a migrated world works', last.ok === true]);

  console.log('\nCHECKS');
  let failed = 0;
  checks.forEach(([l, ok]) => { if (!ok) failed += 1; console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${l}`); });
  console.log(failed === 0 ? '\n*** MIGRATION OK ***' : `\n*** ${failed} FAILED ***`);
  process.exit(failed ? 1 : 0);
})();
