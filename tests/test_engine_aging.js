// Standalone check of the NPC lifecycle: seed a league's squads the way the
// server does, then age them year by year and print REAL numbers.
const engine = require('../server/engine.js');

const league = engine.LEAGUES.find((l) => l.id === 'la_liga');
const squads = {};
league.teamIds.forEach((id) => {
  const team = engine.INITIAL_TEAMS.find((t) => t.id === id);
  squads[id] = engine.initWorldSquad(team, league.country);
});

// --- Sanity on the seeded state ---
const all0 = Object.values(squads).flat();
console.log('=== SEED ===');
console.log('clubs:', Object.keys(squads).length, '| players:', all0.length, '| per-club sizes:', league.teamIds.map(i=>squads[i].length).join(','));
console.log('every player has age:', all0.every((p) => Number.isInteger(p.age)));
console.log('every player has retireAge > age:', all0.every((p) => p.retireAge > p.age));
console.log('every player has nationality:', all0.every((p) => !!p.nationality));
console.log('every player has ovr:', all0.every((p) => Number.isFinite(p.ovr)));
const ages0 = all0.map((p) => p.age);
console.log('age min/avg/max:', Math.min(...ages0), (ages0.reduce((a, b) => a + b, 0) / ages0.length).toFixed(1), Math.max(...ages0));
const homeShare = all0.filter((p) => p.nationality === 'Spain').length / all0.length;
console.log('Spain nationality share:', (homeShare * 100).toFixed(1) + '%');

// Deep-copy isolation: the static data must be untouched
const staticRM = engine.INITIAL_TEAMS.find((t) => t.id === 'real_madrid');
console.log('static teamsData untouched (no age leaked):', staticRM.squad.every((p) => p.age === undefined));

// Track a specific known player across the years
const trackId = 'mbappe';
function findTracked() {
  const s = squads['real_madrid'].find((p) => p.id === trackId);
  return s ? `${s.name} age=${s.age} ovr=${s.ovr} (retires at ${s.retireAge})` : 'RETIRED';
}
console.log('tracked:', findTracked());

// --- Age 10 seasons ---
console.log('\n=== AGEING ===');
const idsBefore = new Set(all0.map((p) => p.id));
let totalRetired = 0;
let totalFamousRetired = 0;
let totalAcademy = 0;

for (let season = 1; season <= 10; season += 1) {
  const retirementLog = [];
  league.teamIds.forEach((id) => {
    const name = engine.INITIAL_TEAMS.find((t) => t.id === id).name;
    squads[id] = engine.ageAndRefreshSquad(squads[id], retirementLog, name, league.country, []);
  });
  const all = Object.values(squads).flat();
  const ages = all.map((p) => p.age);
  const famous = retirementLog.filter((r) => r.finalOvr >= 80);
  const academy = all.filter((p) => p.isAcademy && p.age <= 18).length;
  totalRetired += retirementLog.length;
  totalFamousRetired += famous.length;
  totalAcademy += academy;
  const avgOvr = all.reduce((s, p) => s + p.ovr, 0) / all.length;
  console.log(
    `season ${String(season).padStart(2)} | players ${String(all.length).padStart(4)}` +
    ` | retired ${String(retirementLog.length).padStart(3)} (famous ${String(famous.length).padStart(2)})` +
    ` | new academy ${String(academy).padStart(3)}` +
    ` | avg age ${(ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1)}` +
    ` | avg ovr ${avgOvr.toFixed(1)}` +
    ` | oldest ${Math.max(...ages)}`
  );
  if (famous.length) console.log('    star retirements:', famous.slice(0, 3).map((r) => `${r.name} (${r.age}y, ovr ${r.finalOvr})`).join(', '));
  if (season <= 6 || season === 10) console.log('    tracked:', findTracked());
}

// --- Final assertions with real numbers ---
console.log('\n=== SUMMARY ===');
const allEnd = Object.values(squads).flat();
const idsEnd = new Set(allEnd.map((p) => p.id));
const originalsLeft = [...idsBefore].filter((id) => idsEnd.has(id)).length;
const brandNew = [...idsEnd].filter((id) => !idsBefore.has(id)).length;
console.log('original players still active after 10 seasons:', originalsLeft, '/', idsBefore.size);
console.log('players that did not exist at seed:', brandNew);
console.log('total retirements:', totalRetired, '| of them famous (ovr>=80):', totalFamousRetired);
console.log('total academy graduates:', totalAcademy);
console.log('duplicate ids anywhere:', allEnd.length - idsEnd.size);
console.log('anyone past their retireAge still around:', allEnd.filter((p) => p.age >= p.retireAge).length);
console.log('anyone with a broken ovr:', allEnd.filter((p) => !Number.isFinite(p.ovr) || p.ovr < 40 || p.ovr > 94).length);
console.log('anyone missing nationality:', allEnd.filter((p) => !p.nationality).length);
const strengths = league.teamIds.map((id) => ({ id, s: engine.teamStrength(squads[id]) })).sort((a, b) => b.s - a.s);
console.log('strongest 3 clubs after 10y:', strengths.slice(0, 3).map((x) => `${x.id} ${x.s.toFixed(1)}`).join(', '));
console.log('weakest 3 clubs after 10y:', strengths.slice(-3).map((x) => `${x.id} ${x.s.toFixed(1)}`).join(', '));
