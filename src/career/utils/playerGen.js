import { LEAGUES, HOME_COUNTRY_CLUB_BOOST } from '../data/leaguesData';
import { INITIAL_TEAMS } from '../../data/teamsData';
import { generateSubStatsForMain, generateGkSubStats, calcMainStats, calcGoalkeeperOVR, calcOVR } from './statCalc';

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Step 1: First Rating -> random 65-73.
export function rollFirstRating() {
  return randInt(65, 73);
}

// Step 2: First Potential -> a single rounded band, 73-90, so it always sits
// close enough above your First Rating to feel earned but never wildly out of
// reach. (Potential isn't locked in forever - great prime-years performances
// can nudge it up later, while injuries and poor games can knock it down.)
export function rollPotential(firstRating) {
  const min = Math.min(90, Math.max(73, firstRating));
  const potential = randInt(min, 90);
  return { potential, tier: potential >= 82 ? 'high' : 'low' };
}

// Step 3: First Club -> pick a random league/country, then a random club
// from inside it. When the player's nationality matches a league's country,
// that league gets weighted HOME_COUNTRY_CLUB_BOOST times higher than every
// other league, so starting your career close to home is noticeably more
// likely (but never guaranteed - moving abroad from day one is still on the
// table).
export function rollClub(nationality) {
  let league;
  if (nationality) {
    const weighted = [];
    LEAGUES.forEach((l) => {
      const weight = l.country === nationality ? HOME_COUNTRY_CLUB_BOOST : 1;
      for (let i = 0; i < weight; i += 1) weighted.push(l);
    });
    league = pick(weighted);
  } else {
    league = pick(LEAGUES);
  }
  const teamId = pick(league.teamIds);
  const team = INITIAL_TEAMS.find((t) => t.id === teamId);
  return { league, team };
}

// Build sub-stats + main stats for a freshly created player from a target
// overall rating, spread across a starting position.
export function buildStartingStats(position, overall) {
  // Goalkeepers use their own stat block (diving/handling/kicking/reflexes/
  // speed/positioning) and their own OVR formula, not the outfield PAC/SHO/
  // PAS/DRI/DEF/PHY block.
  if (position === 'GK') {
    const subStats = generateGkSubStats(overall);
    const ovr = calcGoalkeeperOVR(subStats);
    return { subStats, mainStats: subStats, ovr };
  }

  const mainTargets = {
    pac: overall + randInt(-4, 4),
    sho: position === 'ST' || position === 'CAM' ? overall + randInt(-2, 4) : overall + randInt(-8, 2),
    pas: overall + randInt(-4, 4),
    dri: overall + randInt(-4, 4),
    def: position === 'CB' || position === 'CDM' ? overall + randInt(-2, 4) : overall + randInt(-15, 0),
    phy: overall + randInt(-4, 4)
  };

  const subStats = {};
  Object.entries(mainTargets).forEach(([key, val]) => {
    Object.assign(subStats, generateSubStatsForMain(key, Math.max(30, Math.min(94, val))));
  });

  const mainStats = calcMainStats(subStats);
  const ovr = calcOVR(position, mainStats);
  return { subStats, mainStats, ovr };
}

export function createNewPlayer({ name, surname, number, position = 'ST', nationality }) {
  const firstRating = rollFirstRating();
  const { potential, tier } = rollPotential(firstRating);
  const { league, team } = rollClub(nationality);
  const { subStats, mainStats, ovr } = buildStartingStats(position, firstRating);

  return {
    id: `player_${Date.now()}`,
    name,
    surname,
    number,
    position,
    nationality,
    age: 17,
    createdAt: new Date().toISOString(),
    firstRating,
    potential,
    potentialTier: tier,
    overall: ovr,
    mainStats,
    subStats,
    club: {
      id: team.id,
      name: team.name,
      logo: team.logo,
      leagueId: league.id,
      leagueName: league.name,
      country: league.country,
      flag: league.flag
    },
    career: {
      gameDate: '2026-08-01', // first matchday, matches/training not started yet
      day: 1,
      money: 0,
      weeklyWage: 0,
      form: 'Average',
      stamina: 100,
      trophies: [],
      goals: 0,
      assists: 0,
      appearances: 0
    }
  };
}
