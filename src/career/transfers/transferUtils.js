// ---------------------------------------------------------------------------
// Phase 8 — Interactive Transfer Negotiation: toza (React'siz) mantiq.
//
// Bu fayl hech qanday UI bilmaydi: klub qiziqishi, bozor bahosi, 3 bosqichli
// muzokara (User Offer -> Club Counter -> Final Decision) va tarix yozuvlari
// shu yerda hisoblanadi. Natija DETERMINISTIK (tasodifsiz): foydalanuvchi
// "Club willingness" ko'rsatkichini ko'rib turadi va xuddi shu qiymat qaror
// chiqaradi — shuning uchun muzokara adolatli va test qilish oson.
// ---------------------------------------------------------------------------
import { INITIAL_TEAMS } from '../../data/teamsData';
import { LEAGUES } from '../../data/leaguesData';
import { getMergedSquad } from '../data/clubRosterStore';
import { displayRating } from '../utils/statCalc';

// Phase 7: o'yinchi OVR ichki 2 xonali saqlanadi; transfer bozori hamma ko'rgan butun songa tayanadi.
const ovrOf = (p) => displayRating(p?.overall) ?? 60;
import { computeStartingWage } from '../utils/season';

export const MAX_TURNS = 3;
export const COOLDOWN_DAYS = 30; // rad etilgan/tashlab ketilgan klub bilan qayta gaplashish uchun
export const CONTRACT_YEARS = [1, 2, 3, 4, 5, 6];

// Jamoadagi rol. rank = o'yinchi shu rolga ega bo'lish uchun jamoada nechta
// o'yinchidan YUQORI bo'lmasligi kerak (kichikroq = yuqoriroq rol).
export const ROLES = {
  star: {
    id: 'star', label: 'Star Player', icon: '🌟', order: 3, wageMult: 1.3,
    desc: 'Centrepiece of the squad. Highest pay, highest expectations.',
  },
  key: {
    id: 'key', label: 'Key Player', icon: '⭐', order: 2, wageMult: 1.0,
    desc: 'Regular starter with plenty of playing time.',
  },
  rotation: {
    id: 'rotation', label: 'Rotation', icon: '🔄', order: 1, wageMult: 0.7,
    desc: 'Rotation player. Lower pay, so the club agrees more easily.',
  },
  prospect: {
    id: 'prospect', label: 'Prospect', icon: '🌱', order: 0, wageMult: 0.55,
    desc: 'Young talent being developed. Lowest pay and minutes.',
  },
};
export const ROLE_LIST = [ROLES.star, ROLES.key, ROLES.rotation, ROLES.prospect];

export const TERM_LABELS = {
  salary: 'Weekly salary',
  role: 'Squad role',
  years: 'Contract length',
  clause: 'Release clause',
  fee: 'Transfer fee',
};

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const round1 = (n) => Math.round(n * 10) / 10;
export const roundTo = (n, step = 10) => Math.round(n / step) * step;

// Klub nomidan barqaror "xarakter" (har klub o'ziga xos qattiqroq/yumshoqroq).
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
const clubStubbornness = (teamId) => (hashStr(teamId) % 9) - 4; // -4..+4 ball

// ---------------------------------------------------------------------------
// Lookup'lar
// ---------------------------------------------------------------------------
const TEAM_BY_ID = new Map(INITIAL_TEAMS.map((t) => [t.id, t]));
const LEAGUE_BY_TEAM = new Map();
LEAGUES.forEach((l) => l.teamIds.forEach((id) => LEAGUE_BY_TEAM.set(id, l)));

export const getTeam = (id) => TEAM_BY_ID.get(id) || null;
export const getLeagueOfTeam = (id) => LEAGUE_BY_TEAM.get(id) || null;
export const ALL_LEAGUES = LEAGUES;

// ---------------------------------------------------------------------------
// O'yinchi bahosi va transfer summasi ($ million)
// ---------------------------------------------------------------------------
export function marketValue(player) {
  const ovr = ovrOf(player);
  const age = player.age || 20;
  const pot = player.potential || ovr;
  const base = Math.max(0.5, (ovr - 60) * 1.8);
  const ageMult = age <= 21 ? 1.6 : age <= 24 ? 1.4 : age <= 29 ? 1 : age <= 32 ? 0.6 : 0.35;
  const potMult = age <= 24 ? 1 + Math.max(0, pot - ovr) * 0.02 : 1;
  return Math.max(0.3, round1(base * ageMult * potMult));
}

// Joriy shartnoma bo'yicha qolgan yillar (kun hisobida o'yin kalendari).
export function remainingContractYears(career) {
  if (!career.contract || career.freeAgent) return 0;
  const left = career.contract.signedDay + career.contract.yearsTotal * 365 - career.day;
  return Math.max(0, left / 365);
}

// Yangi klub eski klubga to'laydigan summa. Erkin agent bo'lsa — 0.
// Joriy shartnomada Release Clause bo'lsa — aynan o'sha summa (shuning uchun
// past clause kelajakda chiqib ketishni ARZON va oson qiladi).
export function transferFee(player, career) {
  if (career.freeAgent || !career.contract) return 0;
  if (career.contract.releaseClause) return round1(career.contract.releaseClause);
  const remaining = remainingContractYears(career);
  const mult = 0.7 + Math.min(remaining, 4) * 0.1; // 0.7 .. 1.1
  return round1(marketValue(player) * mult);
}

// ---------------------------------------------------------------------------
// Klub tahlili: quvvat, rol, qiziqish, status
// ---------------------------------------------------------------------------
export function analyseClub(player, team) {
  const squad = getMergedSquad(team).filter((p) => p.id !== player.id);
  const top11 = squad.slice(0, 11);
  const power = top11.length ? top11.reduce((s, p) => s + (p.ovr || 0), 0) / top11.length : 60;
  const cutoff = squad[10]?.ovr ?? 60; // 11-o'rindagi o'yinchi OVR'i
  const rank = squad.filter((p) => (p.ovr || 0) > ovrOf(player)).length;
  let deservedRole = 'prospect';
  if (rank < 3) deservedRole = 'star';
  else if (rank < 11) deservedRole = 'key';
  else if (rank < 18) deservedRole = 'rotation';

  // Klubning qiziqishi: asosiy tarkibga kirish chegarasiga nisbatan.
  const age = player.age || 20;
  const potBonus = age <= 21 ? Math.max(0, (player.potential || ovrOf(player)) - ovrOf(player)) * 0.15 : 0;
  const agePenalty = age >= 33 ? 3 : age >= 31 ? 1.5 : 0;
  const value = ovrOf(player) - cutoff + potBonus - agePenalty;
  let interest = 'closed';
  if (value >= 3) interest = 'hot';
  else if (value >= -2) interest = 'open';
  else if (value >= -7) interest = 'monitoring';

  return {
    power: round1(power), cutoff, rank, deservedRole, interest, value: round1(value),
    squadSize: squad.length,
  };
}

export const INTEREST_META = {
  hot: { label: 'Wants you', tone: 'green', hint: 'The club is actively chasing you — talks should be easy.' },
  open: { label: 'Interested', tone: 'green', hint: 'The club is open to signing you.' },
  monitoring: { label: 'Monitoring', tone: 'gold', hint: 'The club is watching you — expect tougher talks.' },
  closed: { label: 'Not interested', tone: 'red', hint: "You're not at this club's level yet." },
};

// Interest + negotiation holatini bitta "status"ga yig'adi (kartadagi indikator).
export function clubStatus({ team, analysis, player, career, offerMsg }) {
  if (player.club?.id === team.id) return { key: 'current', label: 'Your club', tone: 'blue' };
  const neg = (career.negotiations || {})[team.id];
  if (neg) {
    if (neg.stage === 'accepted') return { key: 'agreed', label: 'Deal agreed', tone: 'green' };
    if (['offer', 'counter', 'final'].includes(neg.stage)) {
      return { key: 'negotiating', label: `Negotiating · turn ${turnOf(neg.stage)}/${MAX_TURNS}`, tone: 'gold' };
    }
    const left = cooldownLeft(neg, career.day);
    if (left > 0) return { key: 'cooldown', label: `Cooling off · ${left}d`, tone: 'red' };
  }
  if (offerMsg) return { key: 'offer', label: 'Offer received', tone: 'green' };
  const meta = INTEREST_META[analysis.interest];
  return { key: analysis.interest, label: meta.label, tone: meta.tone };
}

export const turnOf = (stage) => (stage === 'offer' ? 1 : stage === 'counter' ? 2 : stage === 'final' ? 3 : 3);

export function cooldownLeft(neg, day) {
  if (!neg || !['walked', 'rejected'].includes(neg.stage) || neg.closedDay == null) return 0;
  return Math.max(0, COOLDOWN_DAYS - (day - neg.closedDay));
}

// ---------------------------------------------------------------------------
// Muzokara konteksti: bitta klubga nisbatan "ideal" shartlar
// ---------------------------------------------------------------------------
// offer — kiruvchi taklif (messages'dagi {teamId, wage, years}); bo'lsa klubning
// byudjeti shu taklifdan olinadi.
export function buildContext({ player, career, team, offer = null }) {
  const league = getLeagueOfTeam(team.id);
  const leagueId = league?.id;
  const analysis = analyseClub(player, team);
  const mv = marketValue(player);
  const fee = transferFee(player, career);

  const keyAnchor = computeStartingWage(ovrOf(player), 'starter', leagueId); // 'key' roli uchun asos
  const deservedMult = ROLES[analysis.deservedRole].wageMult;
  const anchor = offer?.wage ? offer.wage / deservedMult : keyAnchor;

  const age = player.age || 20;
  const idealYears = offer?.years || (age <= 23 ? 5 : age <= 29 ? 4 : age <= 32 ? 2 : 1);
  const idealClause = Math.max(1, round1(mv * 2.5));
  const budget = Math.max(5, (analysis.power - 62) * 6); // klubning transfer byudjeti ($M)
  const freeAgent = !!career.freeAgent;

  // Qiziqish yuqori bo'lsa klub yumshoqroq, past bo'lsa qattiqroq.
  const interestShift = { hot: -6, open: 0, monitoring: 8, closed: 99 }[analysis.interest];
  const stubborn = clubStubbornness(team.id);
  const potentialLeniency = Math.max(0, (player.potential || ovrOf(player)) - 78) * 0.006;
  const leniency = clamp(0.12 + potentialLeniency + (analysis.interest === 'hot' ? 0.05 : 0), 0.1, 0.3);

  return {
    team, league, leagueId, analysis, marketValue: mv, fee, budget: round1(budget), freeAgent, day: career.day,
    anchor, idealYears: clamp(idealYears, 1, 6), idealClause, leniency,
    thresholds: {
      1: 82 + interestShift + stubborn,
      2: 72 + interestShift + stubborn,
    },
    offer,
  };
}

export const idealWageFor = (ctx, roleId) => Math.max(100, roundTo(ctx.anchor * ROLES[roleId].wageMult));
export function wageBoundsFor(ctx, roleId) {
  const base = idealWageFor(ctx, roleId);
  return { min: Math.max(100, roundTo(base * 0.6)), max: roundTo(base * 1.8), base };
}
export function clauseBoundsFor(ctx) {
  return { min: Math.max(1, Math.round(ctx.marketValue)), max: Math.max(5, Math.round(ctx.marketValue * 5)), ideal: ctx.idealClause };
}

// Foydalanuvchi uchun boshlang'ich (turn 1) shartlar.
export function defaultTerms(ctx) {
  const role = ctx.analysis.deservedRole;
  return {
    wage: idealWageFor(ctx, role),
    role,
    years: ctx.idealYears,
    clause: null, // null = klauzulasiz
  };
}

// ---------------------------------------------------------------------------
// Baholash: har bir shart uchun 0..1 qoniqish + umumiy ball (0..100)
// ---------------------------------------------------------------------------
export function evaluateTerms(terms, ctx) {
  const roleBase = idealWageFor(ctx, terms.role);
  const ratio = terms.wage / roleBase;
  const salary = ratio <= 1 ? 1 : Math.max(0, 1 - (ratio - 1) / (ctx.leniency * 2.5));

  const deserved = ROLES[ctx.analysis.deservedRole].order;
  const asked = ROLES[terms.role].order;
  const over = Math.max(0, asked - deserved);
  const role = over === 0 ? 1 : Math.max(0, 1 - over * 0.45);

  const yearsSat = Math.max(0.3, 1 - Math.abs(terms.years - ctx.idealYears) * 0.12);

  let clauseSat = 1;
  if (terms.clause != null) {
    const r = terms.clause / ctx.idealClause;
    clauseSat = r >= 1 ? 1 : Math.max(0, (r - 0.4) / 0.6);
  }

  // Klub byudjeti — shartnoma sharti emas, lekin ballga ta'sir qiladi (ochiq ko'rsatiladi).
  const feeRatio = ctx.freeAgent || ctx.fee === 0 ? 0 : ctx.fee / ctx.budget;
  const fee = feeRatio <= 0.5 ? 1 : Math.max(0, 1 - (feeRatio - 0.5));

  const score = Math.round(100 * (0.35 * salary + 0.2 * role + 0.15 * yearsSat + 0.15 * clauseSat + 0.15 * fee));

  const notes = {
    salary: ratio <= 1 ? 'Within budget' : ratio <= 1 + ctx.leniency ? 'A bit above budget' : 'Far above budget',
    role: over === 0 ? 'Fits your level' : `Club sees you as ${ROLES[ctx.analysis.deservedRole].label}`,
    years: terms.years === ctx.idealYears ? 'Ideal length' : terms.years > ctx.idealYears ? 'Longer than the club wants' : 'Shorter than the club wants',
    clause: terms.clause == null ? 'No clause — club is happy' : clauseSat >= 1 ? 'Protects the club' : 'Too cheap to buy you out',
    fee: ctx.freeAgent || ctx.fee === 0 ? 'Free agent — no fee' : fee >= 1 ? 'Fee fits the club budget' : 'Fee strains the club budget',
  };
  const sats = { salary, role, years: yearsSat, clause: clauseSat, fee };
  const status = (v) => (v >= 0.85 ? 'good' : v >= 0.5 ? 'warn' : 'bad');
  const terms2 = Object.fromEntries(Object.keys(sats).map((k) => [k, { value: sats[k], status: status(sats[k]), note: notes[k] }]));

  return { score, terms: terms2, ratio };
}

export const willAccept = (terms, ctx, turn) => evaluateTerms(terms, ctx).score >= (ctx.thresholds[turn] ?? 100);

// ---------------------------------------------------------------------------
// Klub javobi: qarshi taklif va yakuniy taklif
// ---------------------------------------------------------------------------
const lerp = (a, b, t) => a + (b - a) * t;

// Klubning "ideal" taklifi (rol -> maosh -> muddat -> clause).
export function clubIdealTerms(ctx) {
  const role = ctx.analysis.deservedRole;
  return { wage: idealWageFor(ctx, role), role, years: ctx.idealYears, clause: ctx.idealClause };
}

function pullToward(terms, ctx, t) {
  const ideal = clubIdealTerms(ctx);
  // Rol: klub o'z bahosiga tushiradi (yuqoriroq so'ralgan bo'lsa), pastroqni qabul qiladi.
  const askedOrder = ROLES[terms.role].order;
  const role = askedOrder > ROLES[ideal.role].order ? ideal.role : terms.role;
  const roleIdeal = idealWageFor(ctx, role);
  const wage = terms.wage > roleIdeal ? roundTo(lerp(terms.wage, roleIdeal, t)) : terms.wage;
  const years = Math.round(lerp(terms.years, ideal.years, t));
  let clause = terms.clause;
  if (clause != null && clause < ideal.clause) clause = Math.round(lerp(clause, ideal.clause, t));
  return { wage: Math.max(100, wage), role, years: clamp(years, 1, 6), clause };
}

export const COUNTER_PULL = 0.6; // 2-bosqich: klub yarim yo'lgacha emas, ko'proq o'z tomoniga tortadi
export const FINAL_PULL = 0.9; // 3-bosqich: deyarli klubning o'z taklifi

export const buildCounterOffer = (terms, ctx) => pullToward(terms, ctx, COUNTER_PULL);
export const buildFinalOffer = (terms, ctx) => pullToward(terms, ctx, FINAL_PULL);

// Klub izohi (UI'dagi "chat"): eng yomon shartni nomlaydi.
function clubNote(terms, ctx, kind) {
  const ev = evaluateTerms(terms, ctx);
  const worst = Object.entries(ev.terms)
    .filter(([k]) => k !== 'fee')
    .sort((a, b) => a[1].value - b[1].value)[0];
  const [key, info] = worst;
  const label = TERM_LABELS[key].toLowerCase();
  if (kind === 'counter') return `We like you, but the ${label} is the sticking point (${info.note.toLowerCase()}). Here is our counter-proposal.`;
  if (kind === 'final') return 'This is our final decision. The terms are non-negotiable — take it or leave it.';
  return info.note;
}

// ---------------------------------------------------------------------------
// Muzokara holat mashinasi (toza funksiyalar)
// stage: 'offer' (1-tur) -> 'counter' (2-tur) -> 'final' (3-tur)
//        -> 'accepted' | 'walked' | 'rejected'
// ---------------------------------------------------------------------------
export function startNegotiation(ctx, day, messageId = null) {
  return {
    teamId: ctx.team.id,
    stage: 'offer',
    turn: 1,
    draft: defaultTerms(ctx),
    clubTerms: null,
    deal: null,
    fee: ctx.fee,
    messageId,
    startedDay: day,
    closedDay: null,
    thread: [],
  };
}

const push = (neg, entry) => [...neg.thread, entry];

// Foydalanuvchi taklif yuboradi (1-tur yoki 2-turdagi qayta taklif).
export function submitOffer(neg, terms, ctx) {
  if (!['offer', 'counter'].includes(neg.stage)) return neg; // 3-tur o'zgarmas
  const turn = neg.stage === 'offer' ? 1 : 2;
  const ev = evaluateTerms(terms, ctx);
  let thread = push(neg, { turn, by: 'you', kind: 'offer', terms, score: ev.score });

  if (ev.score >= ctx.thresholds[turn]) {
    thread = [...thread, { turn, by: 'club', kind: 'accept', terms, note: 'Deal! We accept your terms.' }];
    return { ...neg, thread, draft: terms, stage: 'accepted', deal: terms, clubTerms: null, turn };
  }

  if (turn === 1) {
    const counter = buildCounterOffer(terms, ctx);
    thread = [...thread, { turn: 2, by: 'club', kind: 'counter', terms: counter, note: clubNote(terms, ctx, 'counter') }];
    return { ...neg, thread, draft: counter, stage: 'counter', turn: 2, clubTerms: counter };
  }

  const final = buildFinalOffer(terms, ctx);
  thread = [...thread, { turn: 3, by: 'club', kind: 'final', terms: final, note: clubNote(terms, ctx, 'final') }];
  return { ...neg, thread, draft: final, stage: 'final', turn: 3, clubTerms: final };
}

// Klubning qarshi/yakuniy taklifini qabul qilish.
export function acceptClubTerms(neg) {
  if (!['counter', 'final'].includes(neg.stage) || !neg.clubTerms) return neg;
  const thread = push(neg, { turn: neg.turn, by: 'you', kind: 'accept', terms: neg.clubTerms, note: 'We accept your terms.' });
  return { ...neg, thread, stage: 'accepted', deal: neg.clubTerms };
}

// Qaytib ketish (2-turda) yoki yakuniy taklifni rad etish (3-turda).
export function walkAway(neg, day) {
  if (!['offer', 'counter', 'final'].includes(neg.stage)) return neg;
  const stage = neg.stage === 'final' ? 'rejected' : 'walked';
  const thread = push(neg, { turn: neg.turn, by: 'you', kind: stage, note: stage === 'rejected' ? 'Final offer rejected.' : 'You walked away from the talks.' });
  return { ...neg, thread, stage, closedDay: day };
}

// Tarix yozuvi uchun qisqa shartnoma matni
export const formatTerms = (t) => (t ? `$${t.wage.toLocaleString()}/wk · ${t.years}y · ${ROLES[t.role]?.label || t.role}${t.clause != null ? ` · clause $${t.clause}M` : ''}` : '—');
