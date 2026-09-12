// Leagues are grouped from INITIAL_TEAMS. Each league lists the team ids that
// belong to it (in the same order they appear in teamsData.js). This powers
// the "First Club" roulette on the Start Page (pick a country -> pick a club)
// and the League / Top Scorers pages later on.

export const LEAGUES = [
  {
    id: 'la_liga',
    name: 'La Liga',
    country: 'Spain',
    flag: '🇪🇸',
    teamIds: [
      'real_madrid', 'barcelona', 'atletico_madrid', 'athletic_bilbao', 'villarreal',
      'real_sociedad', 'real_betis', 'sevilla', 'valencia', 'celta_vigo',
      'rayo_vallecano', 'osasuna', 'getafe', 'alaves', 'espanyol',
      'las_palmas', 'levante', 'racing_santander', 'deportivo_coruna', 'malaga'
    ]
  },
  {
    id: 'premier_league',
    name: 'Premier League',
    country: 'England',
    flag: '🏴',
    teamIds: [
      'manchester_city', 'liverpool', 'arsenal', 'man_utd', 'aston_villa',
      'bournemouth', 'sunderland', 'brighton', 'brentford', 'chelsea',
      'fulham', 'newcastle', 'everton', 'leeds', 'crystal_palace',
      'nottingham_forest', 'tottenham', 'coventry', 'ipswich', 'hull'
    ]
  },
  {
    id: 'bundesliga',
    name: 'Bundesliga',
    country: 'Germany',
    flag: '🇩🇪',
    teamIds: [
      'bayern-munchen', 'dortmund', 'rb_leipzig', 'leverkusen', 'eintracht_frankfurt',
      'stuttgart', 'gladbach', 'freiburg', 'werder_bremen', 'mainz',
      'union_berlin', 'hoffenheim', 'augsburg', 'holstein_kiel', 'fc_koln',
      'schalke', 'elversberg', 'paderborn'
    ]
  },
  {
    id: 'ligue_1',
    name: 'Ligue 1',
    country: 'France',
    flag: '🇫🇷',
    teamIds: [
      'psg', 'marseille', 'monaco', 'lille', 'lyon', 'lens', 'nice', 'rennes',
      'strasbourg', 'toulouse', 'brest', 'le_havre', 'auxerre', 'angers',
      'lorient', 'paris_fc', 'troyes', 'le_mans'
    ]
  },
  {
    id: 'serie_a',
    name: 'Serie A',
    country: 'Italy',
    flag: '🇮🇹',
    teamIds: [
      'inter_milan', 'juventus', 'ac_milan', 'napoli', 'roma', 'atalanta',
      'bologna', 'fiorentina', 'lazio', 'torino', 'udinese', 'genoa',
      'cagliari', 'parma', 'lecce', 'sassuolo', 'venezia', 'frosinone', 'monza'
    ]
  },
  {
    id: 'uzbekistan_super_league',
    name: 'Uzbekistan Super League',
    country: 'Uzbekistan',
    flag: '🇺🇿',
    teamIds: [
      'pakhtakor', 'nasaf', 'bunyodkor', 'neftchi', 'navbahor', 'andijon',
      'agmk', 'sogdiana', 'mashal', 'turon', 'kokand1912', 'surxon', 'metallurg'
    ]
  },
  {
    id: 'saudi_pro_league',
    name: 'Saudi Pro League',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    teamIds: ['al_hilal', 'al_nassr', 'al_ittihad', 'al_ahli_sa', 'al_taawoun', 'al_ettifaq']
  },
  {
    id: 'j1_league',
    name: 'J1 League',
    country: 'Japan',
    flag: '🇯🇵',
    teamIds: ['urawa_reds', 'kawasaki_frontale', 'vissel_kobe', 'yokohama_marinos', 'sanfrecce_hiroshima', 'gamba_osaka']
  },
  {
    id: 'k_league',
    name: 'K League 1',
    country: 'South Korea',
    flag: '🇰🇷',
    teamIds: ['ulsan_hd', 'pohang_steelers', 'jeonbuk_hyundai', 'fc_seoul', 'gangwon_fc']
  },
  {
    id: 'qatar_stars_league',
    name: 'Qatar Stars League',
    country: 'Qatar',
    flag: '🇶🇦',
    teamIds: ['al_sadd', 'al_duhail', 'al_rayyan', 'al_gharafa']
  },
  {
    id: 'uae_pro_league',
    name: 'UAE Pro League',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    teamIds: ['al_ain', 'al_wahda', 'shabab_al_ahli', 'sharjah_fc']
  },
  {
    id: 'iran_pro_league',
    name: 'Iran Pro League',
    country: 'Iran',
    flag: '🇮🇷',
    teamIds: ['persepolis', 'esteghlal', 'sepahan', 'tractor_sc']
  },
  {
    id: 'iraqi_premier_league',
    name: 'Iraqi Premier League',
    country: 'Iraq',
    flag: '🇮🇶',
    teamIds: ['al_shorta', 'al_zawraa', 'naft_al_wasat']
  },
  {
    id: 'chinese_super_league',
    name: 'Chinese Super League',
    country: 'China',
    flag: '🇨🇳',
    teamIds: ['shanghai_port', 'shandong_taishan', 'beijing_guoan', 'zhejiang_fc']
  },
  {
    id: 'a_league',
    name: 'A-League',
    country: 'Australia',
    flag: '🇦🇺',
    teamIds: ['melbourne_city', 'sydney_fc', 'central_coast_mariners']
  },
  {
    id: 'primeira_liga',
    name: 'Primeira Liga',
    country: 'Portugal',
    flag: '🇵🇹',
    teamIds: ['benfica', 'sporting_cp', 'fc_porto', 'sc_braga']
  },
  {
    id: 'eredivisie',
    name: 'Eredivisie',
    country: 'Netherlands',
    flag: '🇳🇱',
    teamIds: ['ajax', 'psv', 'feyenoord', 'az_alkmaar']
  },
  {
    id: 'belgian_pro_league',
    name: 'Belgian Pro League',
    country: 'Belgium',
    flag: '🇧🇪',
    teamIds: ['club_brugge', 'anderlecht', 'union_sg']
  },
  {
    id: 'super_lig',
    name: 'Süper Lig',
    country: 'Turkey',
    flag: '🇹🇷',
    teamIds: ['galatasaray', 'fenerbahce', 'besiktas', 'trabzonspor']
  },
  {
    id: 'swiss_super_league',
    name: 'Swiss Super League',
    country: 'Switzerland',
    flag: '🇨🇭',
    teamIds: ['young_boys', 'fc_basel', 'fc_zurich']
  },
  {
    id: 'mls',
    name: 'MLS',
    country: 'USA',
    flag: '🇺🇸',
    teamIds: ['inter_miami', 'lafc', 'lagalaxy', 'seattle_sounders', 'fc_cincinnati', 'nycfc']
  }
];

export function getLeagueByTeamId(teamId) {
  return LEAGUES.find((l) => l.teamIds.includes(teamId));
}

// Nationalities selectable on the Start Page. Every league's home country is
// included (so the "home country boost" on rollClub always has somewhere to
// land), plus a handful of other big footballing nations that don't have a
// league in this dataset yet — picking one of those just means no home-club
// boost is applied and the roll stays fully random across all leagues.
export const NATIONALITIES = [
  { name: 'Uzbekistan', flag: '🇺🇿' },
  { name: 'Spain', flag: '🇪🇸' },
  { name: 'England', flag: '🏴' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Italy', flag: '🇮🇹' },
  { name: 'Portugal', flag: '🇵🇹' },
  { name: 'Netherlands', flag: '🇳🇱' },
  { name: 'Belgium', flag: '🇧🇪' },
  { name: 'Turkey', flag: '🇹🇷' },
  { name: 'Switzerland', flag: '🇨🇭' },
  { name: 'Saudi Arabia', flag: '🇸🇦' },
  { name: 'United Arab Emirates', flag: '🇦🇪' },
  { name: 'Qatar', flag: '🇶🇦' },
  { name: 'Iran', flag: '🇮🇷' },
  { name: 'Iraq', flag: '🇮🇶' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'South Korea', flag: '🇰🇷' },
  { name: 'China', flag: '🇨🇳' },
  { name: 'Australia', flag: '🇦🇺' },
  { name: 'USA', flag: '🇺🇸' },
  { name: 'Brazil', flag: '🇧🇷' },
  { name: 'Argentina', flag: '🇦🇷' },
  { name: 'Croatia', flag: '🇭🇷' },
  { name: 'Serbia', flag: '🇷🇸' },
  { name: 'Poland', flag: '🇵🇱' },
  { name: 'Ukraine', flag: '🇺🇦' },
  { name: 'Kazakhstan', flag: '🇰🇿' },
  { name: 'Tajikistan', flag: '🇹🇯' },
  { name: 'Kyrgyzstan', flag: '🇰🇬' },
  { name: 'Nigeria', flag: '🇳🇬' },
  { name: 'Senegal', flag: '🇸🇳' },
  { name: 'Morocco', flag: '🇲🇦' },
  { name: 'Egypt', flag: '🇪🇬' },
  { name: 'Ghana', flag: '🇬🇭' }
];

// How much more likely the Start Page's "First Club" roll is to land in the
// player's own country's league, relative to every other league. A boost of
// 6 means the home league is weighted 6x a foreign league (so with the 21
// leagues currently in the game, picking a home nationality raises the
// chance of a home-country club from ~5% to ~20-25%), instead of a flat
// leaguesCount-way random pick.
export const HOME_COUNTRY_CLUB_BOOST = 6;
