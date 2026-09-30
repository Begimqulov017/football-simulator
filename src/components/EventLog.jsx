import React from 'react';

const TYPE_BY_ICON = { '⚽': 'goal', '🟨': 'yellow', '🟥': 'red', '🔄': 'sub' };
const ROW_TONE = {
  goal: 'bg-brand-tint border-brand-soft',
  red: 'bg-red-50 border-red-100',
  yellow: 'bg-amber-50 border-amber-100',
  sub: 'bg-surface border-surface-line',
};

export default function EventLog({ matchEvents, liveChances, teamA, teamB, isRiskA, isRiskB }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface-card border border-surface-line rounded-card shadow-soft p-4">
        <div className="flex items-center justify-between text-sm font-extrabold mb-2">
          <span className="text-accent-dark">{teamA.name}{isRiskA && ' 🎲'} {liveChances.winA}%</span>
          <span className="text-ink-muted text-xs font-semibold">Durang {liveChances.draw}%</span>
          <span className="text-brand-dark">{liveChances.winB}% {teamB.name}{isRiskB && ' 🎲'}</span>
        </div>
        <div className="flex h-2.5 rounded-full overflow-hidden bg-surface-muted">
          <div className="bg-accent transition-all duration-500" style={{ width: `${liveChances.winA}%` }} />
          <div className="bg-surface-line transition-all duration-500" style={{ width: `${liveChances.draw}%` }} />
          <div className="bg-brand transition-all duration-500" style={{ width: `${liveChances.winB}%` }} />
        </div>
      </div>

      <div className="bg-surface-card border border-surface-line rounded-card shadow-soft p-3 sm:p-4 flex flex-col gap-2">
        {matchEvents.length === 0 && (
          <div className="text-center text-sm text-ink-muted py-6">Hali hodisalar yo'q — o'yin boshlanishini kuting…</div>
        )}
        {[...matchEvents].reverse().map((ev, idx) => {
          const type = TYPE_BY_ICON[ev.icon] || 'sub';
          const isRight = ev.side === 'right';
          return (
            <div
              key={`${ev.minute}-${idx}`}
              className={`motion-safe:animate-fs-fade-up flex items-center gap-3 rounded-control border px-3 py-2 ${ROW_TONE[type]} ${isRight ? 'flex-row-reverse text-right' : ''}`}
            >
              <span className="text-xs font-extrabold tabular-nums text-ink-muted w-10 shrink-0 text-center">
                {ev.minute > 90 ? `90+${ev.minute - 90}` : ev.minute}'
              </span>
              <span className="text-lg shrink-0">{ev.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-ink">{ev.text}</div>
                {ev.sub && <div className="text-xs text-ink-muted">{ev.sub}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
