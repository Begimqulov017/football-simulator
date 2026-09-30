// ---------------------------------------------------------------------------
// Phase 4 — Timeline / kalendar uchun toza yordamchi funksiyalar.
// ---------------------------------------------------------------------------
import { INITIAL_TEAMS } from '../../data/teamsData';
import { addDays } from '../utils/season';
import { getLeagueByTeamId } from '../../data/leaguesData';
import { getInternationalContext, flagOfNation } from '../international/calendar';

const TEAM_BY_ID = new Map(INITIAL_TEAMS.map((t) => [t.id, t]));
export const teamById = (id) => TEAM_BY_ID.get(id) || null;

// Klub o'rniga uning davlat bayrog'i (xalqaro tanaffus haftaligida ko'rsatiladi)
export const clubFlag = (teamId) => (getLeagueByTeamId(teamId) || {}).flag || '🌍';

export const WEEKDAYS = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
export const MONTHS_SHORT = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

export const COMPETITION_STYLE = {
  league: { label: 'Liga', dot: 'bg-brand', ring: 'ring-brand', text: 'text-brand-dark', tint: 'bg-brand-tint' },
  cup: { label: 'Kubok', dot: 'bg-amber-500', ring: 'ring-amber-500', text: 'text-amber-700', tint: 'bg-amber-50' },
  continental: { label: 'Yevrokubok', dot: 'bg-accent', ring: 'ring-accent', text: 'text-accent-dark', tint: 'bg-accent-tint' },
  international: { label: 'Terma jamoa', dot: 'bg-violet-500', ring: 'ring-violet-500', text: 'text-violet-700', tint: 'bg-violet-50' },
};

const parts = (iso) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return { weekday: WEEKDAYS[d.getUTCDay()], day: d.getUTCDate(), month: d.getUTCMonth(), year: d.getUTCFullYear() };
};

export const formatLongDate = (iso) => {
  const p = parts(iso);
  return `${p.day} ${MONTHS_SHORT[p.month]} ${p.year}`;
};

// Bitta kundagi o'yinchining o'z o'yinlari (liga + kuboklar)
export function getPlayerEventsOn(player, iso) {
  const out = [];
  const clubId = player?.club?.id;
  if (!clubId) return out;

  (player.career?.schedule || []).forEach((r) => {
    if (r.date !== iso) return;
    const m = r.matches.find((mm) => mm.home === clubId || mm.away === clubId);
    if (!m) return;
    const isHome = m.home === clubId;
    const opp = teamById(isHome ? m.away : m.home);
    out.push({
      kind: 'league', competition: player.club.leagueName, round: r.round,
      opponent: opp?.name || '?', logo: opp?.logo || '⚽', teamId: opp?.id, isHome, played: !!m.played,
      score: m.played ? `${isHome ? m.golA : m.golB}-${isHome ? m.golB : m.golA}` : null,
    });
  });

  [['domesticCup', 'cup'], ['continentalCup', 'continental']].forEach(([key, kind]) => {
    const cup = player.career?.[key];
    if (!cup) return;
    cup.fixtures.forEach((f, i) => {
      if (f.date !== iso) return;
      if (cup.eliminated && i > cup.stage) return;
      const opp = teamById(f.opponentId);
      out.push({
        kind, competition: cup.name, round: cup.roundNames?.[i] || `Round ${f.round}`,
        opponent: opp?.name || '?', logo: opp?.logo || '⚽', teamId: opp?.id, isHome: true, played: !!f.played,
        score: f.played ? `${f.golFor}-${f.golAgainst}` : null,
      });
    });
  });
  return out;
}

// Ligadagi o'sha kunning BARCHA o'yinlari (o'yinchi o'yini ajratib ko'rsatiladi)
export function getRoundMatchesOn(player, iso) {
  const clubId = player?.club?.id;
  const round = (player?.career?.schedule || []).find((r) => r.date === iso);
  if (!round) return [];
  return round.matches.map((m) => ({
    home: teamById(m.home), away: teamById(m.away), played: !!m.played,
    golA: m.golA, golB: m.golB, mine: m.home === clubId || m.away === clubId,
  })).filter((m) => m.home && m.away);
}

// `startIso`dan boshlab `days` kunlik timeline. extraEvents: { 'YYYY-MM-DD': [event] } (xalqaro tanaffus va h.k.)
export function buildTimeline(player, startIso, { days = 31, extraEvents = {}, targetIso = null } = {}) {
  const today = player?.career?.gameDate || startIso;
  return Array.from({ length: days }, (_, i) => {
    const iso = addDays(startIso, i);
    const p = parts(iso);
    const intl = getInternationalContext(iso);
    let events = [...getPlayerEventsOn(player, iso), ...(extraEvents[iso] || [])];
    if (intl) {
      // Xalqaro hafta: klub logotiplari o'rniga davlat bayroqlari chiqadi
      events = events.map((e) => ({ ...e, logo: e.teamId ? clubFlag(e.teamId) : (e.flag || e.logo) }));
      if (intl.matchDay && player?.nationality) {
        events.unshift({
          kind: 'international', competition: intl.label, round: intl.kind === 'break' ? 'Terma jamoa o\'yini' : 'Turnir kuni',
          opponent: `${player.nationality} terma jamoasi`, logo: flagOfNation(player.nationality), isHome: true, played: false, score: null,
        });
      }
    }
    return {
      iso, ...p, monthLabel: MONTHS_SHORT[p.month],
      isToday: iso === today, isTarget: iso === targetIso,
      isFirstOfMonth: p.day === 1 || i === 0,
      intl, intlFlag: intl ? flagOfNation(player?.nationality) : null, events,
    };
  });
}

// Bugungi vaziyatga qarab "Kun o'yinlari" bo'limi nimani ko'rsatishi kerak
export function getDayPlan(player, matchdayNext) {
  const today = player.career.gameDate;
  const tomorrow = addDays(today, 1);
  const iso = matchdayNext ? tomorrow : today;
  const intl = getInternationalContext(iso);
  const swap = (list) => (intl ? list.map((e) => ({ ...e, logo: e.teamId ? clubFlag(e.teamId) : e.logo })) : list);
  const events = swap(getPlayerEventsOn(player, iso));
  const roundRaw = getRoundMatchesOn(player, iso);
  const round = intl
    ? roundRaw.map((m) => ({ ...m, home: { ...m.home, logo: clubFlag(m.home.id) }, away: { ...m.away, logo: clubFlag(m.away.id) } }))
    : roundRaw;
  if (matchdayNext) return { mode: 'upcoming', iso, intl, events, round };
  return { mode: events.length ? 'finished' : 'idle', iso, intl, events, round };
}
