import React from 'react';
import RatingBadge from './RatingBadge';

const SHIRT = {
  gk: 'border-amber-400 text-amber-700',
  df: 'border-accent text-accent-dark',
  mf: 'border-brand text-brand-dark',
  fw: 'border-rose-400 text-rose-600',
};

function EventChips({ ev }) {
  if (!ev) return null;
  return (
    <span className="flex gap-0.5 text-[10px] leading-none">
      {ev.goals > 0 && <span>⚽{ev.goals > 1 ? `×${ev.goals}` : ''}</span>}
      {ev.assists > 0 && <span>🅰️{ev.assists > 1 ? `×${ev.assists}` : ''}</span>}
      {ev.yellow && <span>🟨</span>}
      {ev.red && <span>🟥</span>}
      {ev.injured && <span>🩹</span>}
    </span>
  );
}

function PitchLines() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 300" preserveAspectRatio="none" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2">
      <rect x="6" y="6" width="188" height="288" rx="2" />
      <line x1="6" y1="150" x2="194" y2="150" />
      <circle cx="100" cy="150" r="26" />
      <rect x="45" y="6" width="110" height="44" />
      <rect x="72" y="6" width="56" height="18" />
      <rect x="45" y="250" width="110" height="44" />
      <rect x="72" y="276" width="56" height="18" />
    </svg>
  );
}

export default function PitchCard({
  team, formation, slots, tone = 'accent', getRating, playerEventsMap, bench, offPitch, findPlayer,
}) {
  return (
    <section className="bg-surface-card border border-surface-line rounded-card shadow-soft p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm font-extrabold ${tone === 'accent' ? 'text-accent-dark' : 'text-brand-dark'}`}>{team.name}</span>
        <span className="text-xs font-extrabold bg-surface-muted border border-surface-line rounded-md px-2 py-0.5 text-ink-soft">{formation.name}</span>
      </div>

      <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-gradient-to-b from-emerald-500 to-emerald-700">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 8.33%, rgba(0,0,0,0.25) 8.33% 16.66%)' }} />
        <PitchLines />
        {slots.map((s) => {
          const r = getRating(s.player.id);
          return (
            <div
              key={s.player.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 w-[54px] transition-all duration-500"
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
            >
              <div className="relative">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border-2 flex items-center justify-center text-[10px] font-extrabold shadow-soft ${SHIRT[s.category.toLowerCase()]}`}>
                  {s.player.pos}
                </div>
                <RatingBadge value={r} size="sm" className="absolute -top-1.5 -right-3 shadow-soft" />
              </div>
              <span className="text-[10px] font-bold text-white drop-shadow max-w-[54px] truncate">
                {s.player.name.split(' ').slice(-1)[0]}
              </span>
              <EventChips ev={playerEventsMap[s.player.id]} />
            </div>
          );
        })}
      </div>

      {(bench.length > 0 || offPitch.length > 0) && (
        <div className="mt-3">
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-ink-muted mb-1.5">Zahira</div>
          <div className="flex flex-col gap-1">
            {bench.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-xs text-ink-soft bg-surface rounded-md px-2 py-1">
                <span className="truncate">{p.name} <span className="text-ink-subtle">{p.pos}</span></span>
              </div>
            ))}
            {offPitch.map((id) => {
              const p = findPlayer(team, id);
              if (!p) return null;
              return (
                <div key={id} className="flex items-center justify-between gap-2 text-xs text-ink-muted bg-surface rounded-md px-2 py-1 opacity-80">
                  <span className="truncate flex items-center gap-1.5">{p.name} <EventChips ev={playerEventsMap[id]} /></span>
                  <RatingBadge value={getRating(id)} size="sm" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
