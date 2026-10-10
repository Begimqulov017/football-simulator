import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';
import { MAIN_STAT_LABELS, displayRating } from '../utils/statCalc';
import { fetchNationSquad } from '../utils/careerApi';
import { flagOfNation } from '../international/calendar';
import { buildHonours, yearOf } from '../utils/honours';
import TeamLogo from '../../components/TeamLogo';
import { TeamBadge } from '../../components/TeamLogo';

// ---------------------------------------------------------------------------
// PHASE 3 - PROFILE PAGE
//   * Hero player card + quick numbers
//   * Tabs: Overview | Attributes (radar) | Career | Honours
//   * International Status (squad rank / "Not Called Up Yet" + min OVR)
//   * Trophy cabinet: Individual Awards vs Club & Country trophies,
//     locked empty state and a celebratory unlock animation for NEW honours
// Bitta fayl - faqat mavjud modullarni import qiladi.
// ---------------------------------------------------------------------------

const STARTING_XI = 11;

const POS_GROUP = {
  GK: 'GK',
  CB: 'DEF', LB: 'DEF', RB: 'DEF',
  CDM: 'MID', CM: 'MID', CAM: 'MID', LM: 'MID', RM: 'MID',
  ST: 'ATT', LW: 'ATT', RW: 'ATT', CF: 'ATT', SS: 'ATT',
};

const ovrTone = (v) => (v >= 85 ? 'text-amber-300' : v >= 75 ? 'text-emerald-300' : v >= 65 ? 'text-cyan-300' : 'text-slate-300');
const statColor = (v) => (v >= 85 ? '#22c55e' : v >= 70 ? '#10b981' : v >= 55 ? '#f59e0b' : '#ef4444');
const avgOf = (arr) => (arr && arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

const seenKeyFor = (id) => `fs_honours_seen_${id}`;
function readSeen(id) {
  try {
    const raw = localStorage.getItem(seenKeyFor(id));
    return raw ? new Set(JSON.parse(raw)) : null;
  } catch (e) { return null; }
}
function writeSeen(id, keys) {
  try { localStorage.setItem(seenKeyFor(id), JSON.stringify(keys)); } catch (e) { /* e'tiborsiz */ }
}

// ---------------------------------------------------------------------------
// Kichik UI bo'laklari
// ---------------------------------------------------------------------------
const Card = ({ title, right, children, className = '' }) => (
  <div className={`rounded-card border border-surface-line bg-surface-card p-5 shadow-soft ${className}`}>
    {(title || right) && (
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-muted">{title}</div>
        {right}
      </div>
    )}
    {children}
  </div>
);

const Row = ({ label, value, strong }) => (
  <div className="flex items-center justify-between gap-3 border-b border-surface-line py-2 text-sm last:border-b-0">
    <span className="text-ink-muted">{label}</span>
    <span className={`tabular-nums ${strong ? 'font-black text-ink' : 'font-bold text-ink-soft'}`}>{value}</span>
  </div>
);

function BigStat({ label, value, tone = 'text-ink' }) {
  return (
    <div className="rounded-control border border-surface-line bg-surface-muted px-3 py-2.5 text-center">
      <div className={`text-xl font-black tabular-nums ${tone}`}>{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">{label}</div>
    </div>
  );
}

function StatMeter({ label, value }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 shrink-0 text-xs font-bold uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: statColor(value) }} />
      </div>
      <div className="w-8 text-right text-sm font-black tabular-nums text-ink">{Math.round(value)}</div>
    </div>
  );
}

// SVG radar (6 ta asosiy statistika)
function RadarChart({ stats }) {
  const entries = Object.entries(stats || {});
  const n = entries.length;
  if (n < 3) return null;
  const size = 300;
  const c = size / 2;
  const R = 100;
  const pt = (i, r) => {
    const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [c + Math.cos(ang) * r, c + Math.sin(ang) * r];
  };
  const ring = (f) => entries.map((_, i) => pt(i, R * f).join(',')).join(' ');
  const poly = entries.map(([, v], i) => pt(i, (R * Math.max(0, Math.min(99, v))) / 99).join(',')).join(' ');
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[340px]" role="img" aria-label="Attribute radar chart">
      {[0.25, 0.5, 0.75, 1].map((f) => <polygon key={f} points={ring(f)} fill={f === 1 ? 'rgba(16,185,129,0.04)' : 'none'} stroke="#CBD5E1" strokeWidth="1" />)}
      {entries.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="#E2E8F0" strokeWidth="1" />; })}
      <g style={{ transformOrigin: `${c}px ${c}px`, animation: 'pfRadar .8s cubic-bezier(.22,1,.36,1) both' }}>
        <polygon points={poly} fill="rgba(16,185,129,0.25)" stroke="#10B981" strokeWidth="2.5" strokeLinejoin="round" />
        {entries.map(([k, v], i) => { const [x, y] = pt(i, (R * Math.min(99, v)) / 99); return <circle key={k} cx={x} cy={y} r="4" fill="#059669" stroke="#fff" strokeWidth="1.5" />; })}
      </g>
      {entries.map(([k, v], i) => {
        const [x, y] = pt(i, R + 26);
        return (
          <g key={k}>
            <text x={x} y={y - 3} textAnchor="middle" fontSize="11" fontWeight="800" fill="#475569">{MAIN_STAT_LABELS[k] || k.toUpperCase()}</text>
            <text x={x} y={y + 11} textAnchor="middle" fontSize="12" fontWeight="900" fill={statColor(v)}>{Math.round(v)}</text>
          </g>
        );
      })}
    </svg>
  );
}

// So'nggi 10 o'yin reytingi - mini bar chart
function FormChart({ ratings }) {
  if (!ratings?.length) return <div className="py-4 text-sm text-ink-muted">No rated matches yet.</div>;
  return (
    <div className="flex h-24 items-end gap-1.5">
      {ratings.map((r, i) => (
        <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1" title={`Rating ${r}`}>
          <div className="text-[10px] font-bold tabular-nums text-ink-muted">{Number(r).toFixed(1)}</div>
          <div className="w-full rounded-t-md transition-all duration-500" style={{ height: `${Math.max(8, ((r - 3) / 7) * 64)}px`, background: r >= 8 ? '#10B981' : r >= 6.5 ? '#38bdf8' : r >= 5.5 ? '#f59e0b' : '#ef4444' }} />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// INTERNATIONAL STATUS
// ---------------------------------------------------------------------------
function InternationalStatus({ player }) {
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, team: null });
  const nat = player.nationality;
  const intl = player.career?.international;
  const myOvr = displayRating(player.overall);

  useEffect(() => {
    let alive = true;
    if (!nat) { setState({ loading: false, team: null }); return undefined; }
    setState((s) => ({ ...s, loading: true }));
    fetchNationSquad(nat)
      .then((r) => { if (alive) setState({ loading: false, team: r.ok ? r.team : null }); })
      .catch(() => { if (alive) setState({ loading: false, team: null }); });
    return () => { alive = false; };
  }, [nat, myOvr]);

  const list = state.team?.squad || [];
  const idx = list.findIndex((p) => p.isYou || p.id === player.id);
  const calledUp = idx >= 0;
  const rank = idx + 1;
  const starting = calledUp && idx < STARTING_XI;

  // Tanlanish uchun minimal OVR = hozirgi tarkibdagi eng past OVR
  const cutoff = list.length ? Math.min(...list.map((p) => p.ovr)) : null;
  const group = POS_GROUP[player.position];
  const groupMin = (() => {
    const same = list.filter((p) => POS_GROUP[p.pos] === group);
    return same.length ? Math.min(...same.map((p) => p.ovr)) : null;
  })();
  const gap = cutoff != null ? Math.max(0, cutoff - myOvr) : 0;

  const link = (
    <button type="button" onClick={() => navigate('/national-team')} className="cursor-pointer rounded-control border border-accent/30 bg-accent-tint px-3.5 py-2 text-xs font-extrabold text-accent-dark hover:bg-accent-soft">
      National Team page →
    </button>
  );

  return (
    <Card
      title="International Status"
      right={<span className="text-sm">{flagOfNation(nat)} <span className="text-xs font-bold text-ink-muted">{nat || '—'}</span></span>}
    >
      {state.loading && (
        <div className="flex animate-pulse flex-col gap-2">
          <div className="h-6 w-40 rounded bg-surface-muted" />
          <div className="h-3 w-full rounded bg-surface-muted" />
          <div className="h-3 w-2/3 rounded bg-surface-muted" />
        </div>
      )}

      {!state.loading && !nat && <div className="text-sm text-ink-muted">No nationality set on this career, so there is no national team to represent.</div>}

      {!state.loading && nat && !state.team && (
        <div className="flex flex-col gap-3">
          <div className="text-lg font-black text-ink">Not Called Up Yet</div>
          <div className="text-sm text-ink-muted">The {nat} squad isn't available right now (not enough players from this nation yet).</div>
          <div>{link}</div>
        </div>
      )}

      {!state.loading && state.team && calledUp && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-sm font-black ${starting ? 'border-emerald-300 bg-brand-tint text-brand-dark' : 'border-amber-300 bg-amber-50 text-amber-800'}`}>
              {starting ? '⭐ Starting 11' : `🪑 #${rank} - Bench`}
            </span>
            <span className="text-xs font-bold text-ink-muted">Squad rank #{rank} of {list.length}</span>
          </div>
          {/* Tarkib zinasi: yashil = Starting 11, sariq = Bench, siz = ring */}
          <div className="flex flex-wrap gap-1" aria-label="Squad ladder">
            {list.map((p, i) => (
              <span
                key={p.id}
                title={`#${i + 1} ${p.name} (${p.ovr})`}
                className={`h-3.5 w-3.5 rounded-sm ${i < STARTING_XI ? 'bg-emerald-400' : 'bg-amber-300'} ${i === idx ? 'scale-125 ring-2 ring-ink ring-offset-1' : 'opacity-60'}`}
              />
            ))}
          </div>
          <div className="text-xs text-ink-muted">
            {state.team.flag} {state.team.country} · {state.team.confederation} · strength {state.team.strength}
            {intl?.caps ? ` · ${intl.caps} caps, ${intl.goals || 0} goals` : ''}
          </div>
          <div>{link}</div>
        </div>
      )}

      {!state.loading && state.team && !calledUp && (
        <div className="flex flex-col gap-3">
          <div>
            <span className="rounded-full border border-slate-300 bg-surface-muted px-3 py-1 text-sm font-black text-ink-soft">🔒 Not Called Up Yet</span>
          </div>
          {cutoff != null && (
            <div className="rounded-control border border-surface-line bg-surface-muted p-3">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Minimum OVR to be selected</div>
                  <div className="text-3xl font-black tabular-nums text-ink">{cutoff}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Your OVR</div>
                  <div className={`text-3xl font-black tabular-nums ${gap > 0 ? 'text-rose-500' : 'text-brand-dark'}`}>{myOvr}</div>
                </div>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-brand transition-all duration-700" style={{ width: `${Math.min(100, (myOvr / cutoff) * 100)}%` }} />
              </div>
              <div className="mt-2 text-xs text-ink-muted">
                {gap > 0
                  ? `You need +${gap} OVR to reach the current cutoff.`
                  : player.career?.injury
                    ? 'You meet the OVR cutoff, but injured players are skipped in call-ups.'
                    : 'You meet the OVR cutoff - positional quotas decide the rest at the next international break.'}
              </div>
              {groupMin != null && group && (
                <div className="mt-1 text-xs text-ink-muted">Lowest {group} in the squad right now: <b className="text-ink-soft">{groupMin}</b></div>
              )}
            </div>
          )}
          {!!intl?.caps && <div className="text-xs text-ink-muted">Career record: {intl.caps} caps · {intl.goals || 0} goals · {intl.assists || 0} assists</div>}
          <div>{link}</div>
        </div>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// HONOURS TAB (trophy cabinet)
// ---------------------------------------------------------------------------
const KIND_STYLE = {
  individual: { ring: 'border-amber-300/60', glow: 'rgba(251,191,36,0.35)', chip: 'text-amber-300' },
  club: { ring: 'border-emerald-300/60', glow: 'rgba(52,211,153,0.35)', chip: 'text-emerald-300' },
  country: { ring: 'border-cyan-300/60', glow: 'rgba(34,211,238,0.35)', chip: 'text-cyan-300' },
};

function TrophyCard({ h, fresh, delay }) {
  const s = KIND_STYLE[h.kind];
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-b from-[#111a33] to-[#0a1124] p-4 text-center ${s.ring}`}
      style={{ animation: `pfUnlock .7s cubic-bezier(.22,1,.36,1) ${delay}ms both`, boxShadow: fresh ? `0 0 28px ${s.glow}` : undefined }}
    >
      {fresh && <span className="absolute right-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-black" style={{ animation: 'pfPulse 1.4s ease-in-out infinite' }}>New</span>}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(115deg,transparent 40%,rgba(255,255,255,.12) 50%,transparent 60%)', backgroundSize: '250% 100%', animation: 'pfShine 3.8s ease-in-out infinite' }} />
      <div className="text-4xl drop-shadow-[0_0_12px_rgba(251,191,36,0.45)]">{h.icon}</div>
      <div className="mt-2 text-sm font-extrabold leading-tight text-white">{h.title}</div>
      <div className="mt-0.5 text-[11px] text-slate-400">{h.sub}</div>
      <div className={`mt-2 text-xs font-black tabular-nums ${s.chip}`}>{h.year || ''}</div>
    </div>
  );
}

function LockedGrid({ items }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((it) => (
        <div key={it.label} className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-center">
          <div className="text-3xl opacity-30 grayscale">{it.icon}</div>
          <div className="mt-1 text-lg">🔒</div>
          <div className="mt-1 text-[11px] font-bold text-slate-500">{it.label}</div>
        </div>
      ))}
    </div>
  );
}

function Section({ title, subtitle, count, children }) {
  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <div className="text-sm font-black uppercase tracking-[0.14em] text-white">{title}</div>
          <div className="text-xs text-slate-400">{subtitle}</div>
        </div>
        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-black tabular-nums text-amber-300">{count}</span>
      </div>
      {children}
    </div>
  );
}

function HonoursTab({ player, honours, freshKeys }) {
  const career = player.career || {};
  const individual = honours.filter((h) => h.kind === 'individual');
  const club = honours.filter((h) => h.kind === 'club');
  const country = honours.filter((h) => h.kind === 'country');
  const feed = career.newsFeed || [];
  const mine = (t) => feed.filter((n) => n.type === t && n.involvesPlayer).length;
  const count = (...types) => individual.filter((h) => types.includes(h.type)).length;

  const tiles = [
    { icon: '🥇', label: "Ballon d'Or", n: count('ballon_dor', 'global_ballon_dor') },
    { icon: '👟', label: 'Golden Boot', n: count('golden_boot', 'global_golden_boot') },
    { icon: '⭐', label: 'Man of the Match', n: career.mvpCount || 0 },
    { icon: '🌟', label: 'Team of the Season', n: count('team_of_season', 'global_team_of_season') || mine('tos') },
    { icon: '📅', label: 'Team of the Month', n: mine('tom') },
    { icon: '📋', label: 'Team of the Week', n: mine('totw') },
  ];

  const total = honours.length;
  let delay = 0;
  const nextDelay = () => { delay += 70; return delay; };

  return (
    <div
      className="relative overflow-hidden rounded-card border border-[#1c2a4d] bg-[#070b14] p-5 sm:p-6"
      style={{ backgroundImage: 'radial-gradient(520px 220px at 10% -10%, rgba(251,191,36,0.12), transparent 60%), radial-gradient(520px 220px at 100% 0%, rgba(34,211,238,0.10), transparent 60%)' }}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>Trophy Cabinet</div>
          <div className="text-xs text-slate-400">{total} honour{total === 1 ? '' : 's'} · {individual.length} individual · {club.length + country.length} club &amp; country</div>
        </div>
        {total === 0 && <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">🔒 Cabinet locked</span>}
      </div>

      {/* Individual award counters */}
      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((t) => (
          <div key={t.label} className={`rounded-xl border p-3 text-center ${t.n ? 'border-amber-300/40 bg-amber-300/10' : 'border-white/10 bg-white/[0.03]'}`}>
            <div className={`text-2xl ${t.n ? '' : 'opacity-30 grayscale'}`}>{t.n ? t.icon : '🔒'}</div>
            <div className={`mt-1 text-xl font-black tabular-nums ${t.n ? 'text-amber-300' : 'text-slate-600'}`}>{t.n}</div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{t.label}</div>
          </div>
        ))}
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/5 text-5xl" style={{ animation: 'pfFloat 4s ease-in-out infinite' }}>
            <span className="opacity-30 grayscale">🏆</span>
            <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#0b1020] text-lg">🔒</span>
          </div>
          <div>
            <div className="text-lg font-black text-white">No trophies yet</div>
            <div className="mt-1 max-w-md text-sm text-slate-400">Win a league, a cup or an individual award and it will unlock here with a celebration.</div>
          </div>
          <div className="w-full max-w-xl">
            <LockedGrid items={[
              { icon: '🏆', label: 'League Champion' }, { icon: '🥇', label: "Ballon d'Or" }, { icon: '👟', label: 'Golden Boot' },
              { icon: '🌍', label: 'Continental Cup' }, { icon: '🏅', label: 'Domestic Cup' }, { icon: '🌟', label: 'Team of the Season' },
            ]} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-7">
          <Section title="Individual Awards" subtitle="Ballon d'Or, Golden Boot, Team of the Season" count={individual.length}>
            {individual.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {individual.map((h) => <TrophyCard key={h.key} h={h} fresh={freshKeys.has(h.key)} delay={nextDelay()} />)}
              </div>
            ) : (
              <LockedGrid items={[{ icon: '🥇', label: "Ballon d'Or" }, { icon: '👟', label: 'Golden Boot' }, { icon: '🌟', label: 'Team of the Season' }]} />
            )}
          </Section>

          <Section title="Club Trophies" subtitle="League titles, domestic and continental cups" count={club.length}>
            {club.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {club.map((h) => <TrophyCard key={h.key} h={h} fresh={freshKeys.has(h.key)} delay={nextDelay()} />)}
              </div>
            ) : (
              <LockedGrid items={[{ icon: '🏆', label: 'League Champion' }, { icon: '🏅', label: 'Domestic Cup' }, { icon: '🌍', label: 'Continental Cup' }]} />
            )}
          </Section>

          <Section title="Country Trophies" subtitle="Won with the national team" count={country.length}>
            {country.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {country.map((h) => <TrophyCard key={h.key} h={h} fresh={freshKeys.has(h.key)} delay={nextDelay()} />)}
              </div>
            ) : (
              <LockedGrid items={[{ icon: '🌍', label: 'World Cup' }, { icon: '🏆', label: 'Continental Nations Cup' }]} />
            )}
          </Section>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Yangi kubok ochilganda celebration overlay (konfeti + kubok "pop")
// ---------------------------------------------------------------------------
const CONFETTI_COLORS = ['#fbbf24', '#34d399', '#22d3ee', '#a78bfa', '#fb7185', '#f8fafc'];

function UnlockCelebration({ items, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const pieces = useMemo(() => Array.from({ length: 44 }, (_, i) => ({
    left: (i * 37) % 100,
    delay: ((i * 53) % 100) / 60,
    dur: 2.4 + ((i * 29) % 15) / 10,
    size: 6 + ((i * 7) % 7),
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    round: i % 3 === 0,
  })), []);

  const main = items[0];
  const rest = items.slice(1, 5);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Trophy unlocked">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {pieces.map((p, i) => (
          <span
            key={i}
            className="absolute top-0 block"
            style={{ left: `${p.left}%`, width: p.size, height: p.round ? p.size : p.size * 1.8, borderRadius: p.round ? '50%' : 2, background: p.color, animation: `pfConfetti ${p.dur}s ${p.delay}s ease-in infinite` }}
          />
        ))}
      </div>
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-300/50 bg-gradient-to-b from-[#16203f] to-[#080d1c] p-7 text-center text-white" style={{ animation: 'pfUnlock .7s cubic-bezier(.22,1,.36,1) both', boxShadow: '0 0 80px rgba(251,191,36,0.3)' }}>
        <div className="pointer-events-none absolute left-1/2 top-16 h-56 w-56 -translate-x-1/2 rounded-full" style={{ background: 'radial-gradient(circle, rgba(251,191,36,.35), transparent 65%)', animation: 'pfPulse 2s ease-in-out infinite' }} />
        <div className="relative text-[11px] font-black uppercase tracking-[0.3em] text-amber-300">{items.length > 1 ? `${items.length} honours unlocked` : 'Trophy unlocked'}</div>
        <div className="relative my-4 text-[88px] leading-none" style={{ animation: 'pfTrophy 1.1s cubic-bezier(.34,1.56,.64,1) both', filter: 'drop-shadow(0 0 24px rgba(251,191,36,.6))' }}>{main.icon}</div>
        <div className="relative text-2xl font-black" style={{ fontFamily: 'var(--font-display)' }}>{main.title}</div>
        <div className="relative mt-1 text-sm text-slate-300">{main.sub}{main.year ? ` · ${main.year}` : ''}</div>
        {rest.length > 0 && (
          <div className="relative mt-4 flex flex-wrap justify-center gap-2">
            {rest.map((h) => <span key={h.key} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold">{h.icon} {h.title}{h.year ? ` ${h.year}` : ''}</span>)}
            {items.length > 5 && <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">+{items.length - 5} more</span>}
          </div>
        )}
        <button type="button" onClick={onClose} className="relative mt-6 cursor-pointer rounded-control border border-amber-300/60 bg-amber-300/15 px-6 py-2.5 text-sm font-black text-amber-200 hover:bg-amber-300/25">
          View my cabinet →
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------
const TABS = [['overview', 'Overview'], ['attributes', 'Attributes'], ['career', 'Career'], ['honours', 'Honours']];

export default function ProfilePage() {
  const { player } = useGame();
  const [tab, setTab] = useState('overview');
  const [celebrate, setCelebrate] = useState(null);
  const [freshKeys, setFreshKeys] = useState(() => new Set());

  const honours = useMemo(() => (player ? buildHonours(player) : []), [player]);
  const honourSig = honours.map((h) => h.key).join('|');

  // Yangi ochilgan kubok/mukofotlarni aniqlash ("ko'rilgan" ro'yxat bilan solishtirib)
  useEffect(() => {
    if (!player || !honours.length) return;
    const seen = readSeen(player.id);
    const gameYear = yearOf(player.career?.gameDate) || 0;
    // Birinchi marta ochilsa: faqat so'nggi ~1 yil ichidagilarni "yangi" deb hisoblaymiz,
    // eski saqlanmadagi hamma kubok birdan chiqib ketmasin.
    const fresh = seen
      ? honours.filter((h) => !seen.has(h.key))
      : honours.filter((h) => h.year && h.year >= gameYear - 1);
    if (!fresh.length) {
      writeSeen(player.id, honours.map((h) => h.key));
      return;
    }
    setFreshKeys(new Set(fresh.map((h) => h.key)));
    setCelebrate(fresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.id, honourSig]);

  if (!player) return null;

  const career = player.career || {};
  const ovr = displayRating(player.overall); // Phase 7: ichki 2 xonali, UI'da butun son
  const avgRating = avgOf(career.matchRatings);
  const stats = player.mainStats || {};
  const keyStats = Object.entries(stats).slice(0, 6);
  const potGap = Math.max(0, (player.potential || 0) - (ovr || 0));
  const injury = career.injury;
  const seasonHistory = [...(career.seasonHistory || [])].reverse();
  const recentMatches = [...(career.matchHistory || [])].reverse().slice(0, 8);
  const contractYears = career.contract
    ? Math.max(0, Math.ceil((career.contract.signedDay + career.contract.yearsTotal * 365 - career.day) / 365))
    : null;

  const closeCelebration = () => {
    writeSeen(player.id, honours.map((h) => h.key));
    setCelebrate(null);
    setTab('honours');
  };

  return (
    <AppShell>
      <style>{`
        @keyframes pfUnlock{0%{opacity:0;transform:translateY(24px) scale(.88)}60%{transform:translateY(-4px) scale(1.03)}100%{opacity:1;transform:none}}
        @keyframes pfTrophy{0%{opacity:0;transform:scale(.2) rotate(-25deg)}60%{opacity:1;transform:scale(1.2) rotate(8deg)}100%{transform:scale(1) rotate(0)}}
        @keyframes pfConfetti{0%{transform:translateY(-30px) rotate(0);opacity:1}100%{transform:translateY(105vh) rotate(720deg);opacity:.85}}
        @keyframes pfPulse{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}
        @keyframes pfShine{0%{background-position:150% 0}100%{background-position:-100% 0}}
        @keyframes pfFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes pfFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes pfRadar{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}
      `}</style>

      {/* ===== HERO ===== */}
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        {/* FUT-style player card */}
        <div className="relative overflow-hidden rounded-[22px] border border-amber-300/40 p-5 text-white shadow-lift" style={{ background: 'linear-gradient(160deg,#1b2b55 0%,#0d1730 55%,#2a1f0a 130%)' }}>
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-amber-300/10 blur-2xl" />
          <div className="flex items-start justify-between">
            <div>
              <div className={`text-6xl font-black leading-none tabular-nums ${ovrTone(ovr)}`} style={{ fontFamily: 'var(--font-display)' }}>{ovr}</div>
              <div className="mt-1 text-sm font-black tracking-widest text-amber-200">{player.position}</div>
            </div>
            <div className="text-right">
              <div className="text-3xl">{flagOfNation(player.nationality)}</div>
              <div className="mt-1 text-3xl"><TeamLogo id={player.club?.id} logo={player.club?.logo} size={40} /></div>
            </div>
          </div>
          <div className="mt-4 text-center text-6xl">⚽</div>
          <div className="mt-2 border-t border-amber-200/20 pt-3 text-center">
            <div className="text-xl font-black uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>{player.name} {player.surname}</div>
            <div className="text-[11px] font-semibold text-slate-400">#{player.number} · Age {player.age}</div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-x-3 gap-y-1.5">
            {keyStats.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-center gap-1.5">
                <span className="text-sm font-black tabular-nums text-white">{Math.round(v)}</span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-amber-200/80">{MAIN_STAT_LABELS[k] || k.slice(0, 3).toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-2xl font-black text-ink sm:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>{player.name} {player.surname}</div>
                <div className="mt-1 text-sm text-ink-muted">
                  <TeamLogo id={player.club?.id} logo={player.club?.logo} size={20} /> {player.club?.name} · {player.club?.flag} {player.club?.leagueName}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {player.club?.tier && (
                  <span className={`rounded-full border px-3 py-1 text-xs font-extrabold ${player.club.tier === 'starter' ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-surface-line bg-surface-muted text-ink-soft'}`}>
                    {player.club.tier === 'starter' ? '⭐ Asosiy 11lik' : player.club.tier === 'reserve' ? '📦 Rezerv' : '🪑 Zaxira (bench)'}
                  </span>
                )}
                <span className="rounded-full border border-accent/30 bg-accent-tint px-3 py-1 text-xs font-extrabold text-accent-dark">Form: {career.form || 'Average'}</span>
                {career.freeAgent && <span className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-extrabold text-rose-700">🆓 Free agent</span>}
                {injury && <span className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-extrabold text-rose-700">🩹 Injured · {injury.daysLeft}d</span>}
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs font-bold text-ink-muted">
                <span>OVR {ovr}</span>
                <span>{potGap > 0 ? `${potGap} to potential` : 'Potential reached'} · POT {player.potential}</span>
              </div>
              <div className="relative h-3 overflow-hidden rounded-full bg-surface-muted">
                <div className="absolute inset-y-0 left-0 rounded-full bg-brand-soft" style={{ width: `${Math.min(100, player.potential || 0)}%` }} />
                <div className="absolute inset-y-0 left-0 rounded-full bg-brand transition-all duration-700" style={{ width: `${Math.min(100, ovr || 0)}%` }} />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <BigStat label="Apps" value={career.appearances || 0} />
            <BigStat label="Goals" value={career.goals || 0} tone="text-brand-dark" />
            <BigStat label="Assists" value={career.assists || 0} tone="text-accent" />
            <BigStat label="Avg rating" value={avgRating ? avgRating.toFixed(1) : '—'} tone="text-amber-600" />
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="mb-4 flex gap-2 overflow-x-auto rounded-control border border-surface-line bg-surface-muted p-1.5" role="tablist">
        {TABS.map(([k, label]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`flex-1 cursor-pointer whitespace-nowrap rounded-[10px] border-0 px-4 py-2 text-sm font-extrabold transition-colors ${tab === k ? 'bg-white text-ink shadow-soft' : 'bg-transparent text-ink-muted hover:text-ink'}`}
          >
            {label}
            {k === 'honours' && (
              <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-black ${honours.length ? 'bg-amber-100 text-amber-800' : 'bg-white text-ink-subtle'}`}>
                {honours.length || '🔒'}
              </span>
            )}
          </button>
        ))}
      </div>

      <div key={tab} style={{ animation: 'pfFade .35s ease-out both' }}>
        {/* ===== OVERVIEW ===== */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <InternationalStatus player={player} />

            <Card title="Contract">
              {career.freeAgent ? (
                <div className="text-sm font-semibold text-rose-600">🆓 You're a free agent - waiting for club offers in your Messages.</div>
              ) : career.contract ? (
                <>
                  <Row label="Years remaining" value={`${contractYears} / ${career.contract.yearsTotal}`} strong />
                  <Row label="Weekly wage" value={`$${(career.weeklyWage || 0).toLocaleString()}`} />
                  <Row label="Balance" value={`$${(career.money || 0).toLocaleString()}`} />
                </>
              ) : (
                <div className="text-sm text-ink-muted">No contract on file.</div>
              )}
            </Card>

            <Card title="Recent form (last 10 ratings)">
              <FormChart ratings={career.matchRatings || []} />
            </Card>

            <Card title="This season">
              <div className="grid grid-cols-3 gap-3">
                <BigStat label="Apps" value={career.seasonAppearances || 0} />
                <BigStat label="Goals" value={career.seasonGoals || 0} tone="text-brand-dark" />
                <BigStat label="Assists" value={career.seasonAssists || 0} tone="text-accent" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <BigStat label="Man of the Match" value={career.mvpCount || 0} tone="text-amber-600" />
                <BigStat label="Stamina" value={`${Math.round(career.stamina ?? 100)}%`} />
              </div>
            </Card>
          </div>
        )}

        {/* ===== ATTRIBUTES ===== */}
        {tab === 'attributes' && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card title="Attribute radar">
              <RadarChart stats={stats} />
            </Card>
            <Card title="All stats" right={<span className="text-xs font-black text-ink-muted">OVR {ovr}</span>}>
              <div className="flex flex-col gap-3.5">
                {Object.entries(stats).map(([k, v]) => <StatMeter key={k} label={MAIN_STAT_LABELS[k] || k.toUpperCase()} value={v} />)}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <BigStat label="Overall" value={ovr} tone="text-brand-dark" />
                <BigStat label="Potential" value={player.potential} tone="text-accent" />
              </div>
            </Card>
          </div>
        )}

        {/* ===== CAREER ===== */}
        {tab === 'career' && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card title="Career totals">
              <Row label="Appearances" value={career.appearances || 0} />
              <Row label="Goals" value={career.goals || 0} />
              <Row label="Assists" value={career.assists || 0} />
              <Row label="Average rating" value={avgRating ? avgRating.toFixed(2) : '—'} />
              <Row label="Man of the Match" value={career.mvpCount || 0} />
              <Row label="Weekly wage" value={`$${(career.weeklyWage || 0).toLocaleString()}`} />
              <Row label="Balance" value={`$${(career.money || 0).toLocaleString()}`} strong />
            </Card>

            <Card title="Recent matches">
              {recentMatches.length === 0 && <div className="text-sm text-ink-muted">No matches played yet.</div>}
              <div className="flex flex-col gap-1.5">
                {recentMatches.map((m) => {
                  const res = m.golFor > m.golAgainst ? 'W' : m.golFor < m.golAgainst ? 'L' : 'D';
                  return (
                    <div key={m.id} className="flex items-center gap-3 rounded-control border border-surface-line px-3 py-2 text-sm">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-black text-white ${res === 'W' ? 'bg-brand' : res === 'L' ? 'bg-rose-500' : 'bg-slate-400'}`}>{res}</span>
                      <span className="min-w-0 flex-1 truncate font-semibold text-ink">{m.isHome ? 'vs' : '@'} <TeamBadge value={m.opponentLogo} size={16} /> {m.opponent}</span>
                      <span className="font-black tabular-nums text-ink-soft">{m.golFor}-{m.golAgainst}</span>
                      <span className="w-10 text-right text-xs font-black tabular-nums text-amber-600">{m.rating != null ? Number(m.rating).toFixed(1) : '—'}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card title="Season history" className="lg:col-span-2">
              {seasonHistory.length === 0 ? (
                <div className="text-sm text-ink-muted">Your first completed season will appear here.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr className="text-left text-[10px] font-extrabold uppercase tracking-wider text-ink-muted">
                        <th className="py-2 pr-3">Year</th><th className="pr-3">Club</th><th className="pr-3">Pos.</th><th className="pr-3">Apps</th><th className="pr-3">Goals</th><th className="pr-3">Assists</th><th>Honours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seasonHistory.map((s, i) => (
                        <tr key={i} className="border-t border-surface-line text-ink-soft">
                          <td className="py-2 pr-3 font-black text-ink">{s.year}</td>
                          <td className="pr-3">{s.club}</td>
                          <td className="pr-3 tabular-nums">{s.position || '—'}</td>
                          <td className="pr-3 tabular-nums">{s.appearances}</td>
                          <td className="pr-3 tabular-nums">{s.goals}</td>
                          <td className="pr-3 tabular-nums">{s.assists}</td>
                          <td>{s.wonLeague ? '🏆 ' : ''}{s.wonGoldenBoot ? '👟' : ''}{!s.wonLeague && !s.wonGoldenBoot ? '—' : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ===== HONOURS ===== */}
        {tab === 'honours' && <HonoursTab player={player} honours={honours} freshKeys={freshKeys} />}
      </div>

      {celebrate && <UnlockCelebration items={celebrate} onClose={closeCelebration} />}
    </AppShell>
  );
}
