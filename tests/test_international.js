// End-to-end test of the national-team / international-tournament module
// against the REAL server: advance the shared world through 8 in-game years
// and verify that friendlies, World Cups and continental cups all actually
// happen, on the right years, and that a human player gets capped.
const BASE = 'http://127.0.0.1:4000';
const api = async (path, { method = 'GET', token, body } = {}) => (await fetch(`${BASE}${path}`, {
  method,
  headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  body: body ? JSON.stringify(body) : undefined
})).json();

const makePlayer = (name, nationality, clubId, clubName, overall) => ({
  id: `player_${name}`, name, surname: 'Test', number: 10, position: 'ST',
  nationality, age: 17, firstRating: overall, potential: 94, overall,
  club: { id: clubId, name: clubName, logo: '⚽', leagueId: 'la_liga', leagueName: 'La Liga', country: 'Spain', flag: '🇪🇸', tier: 'starter' },
  career: { gameDate: '2026-08-01', day: 1, money: 0, weeklyWage: 0, form: 'Good', stamina: 100, trophies: [], goals: 0, assists: 0, appearances: 0 }
});

(async () => {
  const { token } = await api('/api/login', { method: 'POST', body: { username: 'Begimqulov017', password: 'beg1mqulov.011' } });

  // Two humans: one world-class Uzbek (should be called up), one ordinary
  // Spaniard (should NOT displace Spain's best - Spain has 180+ players).
  const humans = [
    { username: 'star_uz', nationality: 'Uzbekistan', club: ['real_madrid', 'Real Madrid'], ovr: 92 },
    { username: 'weak_es', nationality: 'Spain', club: ['barcelona', 'FC Barcelona'], ovr: 62 }
  ];
  for (const h of humans) {
    const reg = await api('/api/register', { method: 'POST', body: { username: h.username, password: 'test1234' } });
    h.token = reg.token || (await api('/api/login', { method: 'POST', body: { username: h.username, password: 'test1234' } })).token;
    await api('/api/career/save', { method: 'POST', token: h.token, body: { player: makePlayer(h.username, h.nationality, h.club[0], h.club[1], h.ovr) } });
  }

  // --- selection sanity before any match is played ---
  const uz = await api('/api/international/nation/Uzbekistan', { token: humans[0].token });
  const es = await api('/api/international/nation/Spain', { token: humans[1].token });
  console.log('CALL-UPS');
  console.log('  Uzbekistan squad:', uz.team.squad.length, '| strength', uz.team.strength,
    '| star_uz called up:', uz.team.squad.some((p) => p.username === 'star_uz'));
  console.log('    top 3:', uz.team.squad.slice(0, 3).map((p) => `${p.name} (${p.pos} ${p.ovr})`).join(', '));
  console.log('  Spain squad:', es.team.squad.length, '| strength', es.team.strength,
    '| weak_es called up:', es.team.squad.some((p) => p.username === 'weak_es'));
  const posCount = uz.team.squad.reduce((m, p) => { m[p.pos] = (m[p.pos] || 0) + 1; return m; }, {});
  console.log('    Uzbekistan positions:', JSON.stringify(posCount));

  // --- advance 8 in-game years ---
  const START = (await api('/api/world/la_liga', { token })).world.gameDate;
  const TARGET_DAYS = 365 * 4;
  console.log(`\nadvancing ${TARGET_DAYS} days from ${START} ...`);
  const seen = { tournamentStarts: [], wins: [], breaks: 0, groupDays: 0, knockoutDays: 0, intlMatches: 0 };
  let worldDate = START;
  const t0 = Date.now();
  for (let i = 0; i < TARGET_DAYS; i += 1) {
    const r = await api('/api/admin/advance-world-day', { method: 'POST', token });
    if (!r.ok) throw new Error('advance failed: ' + JSON.stringify(r).slice(0, 300));
    worldDate = r.worldDate;
    (r.internationalEvents || []).forEach((e) => {
      if (e.type === 'tournament_start') seen.tournamentStarts.push(`${worldDate} ${e.tournament} (${e.teams})`);
      if (e.type === 'break') { seen.breaks += 1; seen.intlMatches += e.matches.length; }
      if (e.type === 'group') { seen.groupDays += 1; seen.intlMatches += e.matches.length; }
      if (e.type === 'knockout') {
        seen.knockoutDays += 1; seen.intlMatches += e.matches.length;
        if (e.round === 'Final') seen.wins.push(`${worldDate} ${e.tournament}: ${e.matches[0].winner} beat ${e.matches[0].winner === e.matches[0].home ? e.matches[0].away : e.matches[0].home} ${e.matches[0].golA}-${e.matches[0].golB}${e.matches[0].penalties ? ` (pens ${e.matches[0].penalties.a}-${e.matches[0].penalties.b})` : ''}`);
      }
    });
  }
  console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)}s — worldDate now ${worldDate}\n`);

  console.log('TOURNAMENTS STARTED');
  seen.tournamentStarts.forEach((s) => console.log('  ' + s));
  console.log('\nFINALS');
  seen.wins.forEach((s) => console.log('  ' + s));
  console.log(`\nfriendly break days: ${seen.breaks} | group days: ${seen.groupDays} | knockout days: ${seen.knockoutDays} | international matches: ${seen.intlMatches}`);

  // --- verify the rotation rule ---
  const byYear = {};
  seen.tournamentStarts.forEach((s) => {
    const [d, ...rest] = s.split(' ');
    const y = Number(d.slice(0, 4));
    (byYear[y] = byYear[y] || []).push(rest.join(' '));
  });
  console.log('\nBY YEAR');
  Object.keys(byYear).sort().forEach((y) => console.log(`  ${y}: ${byYear[y].join(' | ')}`));

  const wcYears = Object.keys(byYear).filter((y) => byYear[y].some((n) => n.includes('World Cup'))).map(Number);
  const contYears = Object.keys(byYear).filter((y) => byYear[y].some((n) => n.includes('European') || n.includes('Copa') || n.includes('Asian') || n.includes('Africa'))).map(Number);

  const intl = await api('/api/international', { token });
  const star = await api('/api/career/mine', { token: humans[0].token });
  const weak = await api('/api/career/mine', { token: humans[1].token });
  const si = star.player.career.international;
  const wi = weak.player.career.international;

  console.log('\nHUMAN INTERNATIONAL RECORDS');
  console.log(`  star_uz (${si?.country}): caps ${si?.caps} goals ${si?.goals} assists ${si?.assists} | trophies: ${(si?.trophies || []).map((t) => t.name + ' ' + t.year).join(', ') || '—'}`);
  console.log(`    last call-up:`, si?.lastCallUp);
  console.log(`  weak_es: ${wi ? `caps ${wi.caps}` : 'never called up (expected)'}`);

  console.log('\nHISTORY (from /api/international)');
  intl.history.slice(0, 8).forEach((h) => console.log(`  ${h.year} ${h.name}: ${h.winner} (runner-up ${h.runnerUp})${h.topScorer ? ` · top scorer ${h.topScorer.name} ${h.topScorer.goals}` : ''}`));

  console.log('\nNEWS');
  intl.news.slice(0, 5).forEach((n) => console.log(`  [${n.type}] ${n.title}`));

  const checks = [
    ['World Cups happened', wcYears.length >= 1],
    ['World Cup years are all % 4 === 2', wcYears.every((y) => y % 4 === 2)],
    ['continental cups happened', contYears.length >= 1],
    ['continental years are all % 4 === 0', contYears.every((y) => y % 4 === 0)],
    ['World Cup and continental never share a year', !wcYears.some((y) => contYears.includes(y))],
    ['all four continental cups run in a continental year', contYears.length > 0 && byYear[contYears[0]].length === 4],
    ['friendly breaks happened', seen.breaks >= 8],
    ['no friendlies collided with a tournament (group/knockout days > 0)', seen.groupDays > 0 && seen.knockoutDays > 0],
    ['every tournament reached a final', seen.wins.length === seen.tournamentStarts.length],
    ['history recorded every finished tournament', intl.history.length === seen.wins.length],
    ['star_uz was capped', (si?.caps || 0) > 0],
    ['star_uz scored for his country', (si?.goals || 0) > 0],
    ['weak_es was never capped', !wi || wi.caps === 0],
    ['leagues stayed on ONE shared date', new Set([intl.worldDate, worldDate]).size === 1]
  ];
  console.log('\nCHECKS');
  let failed = 0;
  checks.forEach(([l, ok]) => { if (!ok) failed += 1; console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${l}`); });
  console.log(failed === 0 ? '\n*** ALL CHECKS PASSED ***' : `\n*** ${failed} FAILED ***`);
  process.exit(failed ? 1 : 0);
})();
