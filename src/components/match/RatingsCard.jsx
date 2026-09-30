import React from 'react';
import RatingBadge from './RatingBadge';

function TeamList({ title, tone, rows }) {
  return (
    <div className="flex-1 min-w-0">
      <div className={`text-sm font-extrabold mb-2 ${tone === 'accent' ? 'text-accent-dark' : 'text-brand-dark'}`}>{title}</div>
      <div className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center gap-3 bg-surface rounded-control border border-surface-line px-3 py-2">
            <RatingBadge value={r.rating} size="md" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-ink truncate">{r.name} <span className="text-ink-subtle text-xs font-semibold">{r.pos}</span></div>
              <div className="text-[11px] text-ink-muted">
                {r.minutes}' · Pas {r.passOk}/{r.passAtt}
                {r.goals > 0 && ` · ⚽${r.goals}`}
                {r.assists > 0 && ` · 🅰️${r.assists}`}
                {r.saves > 0 && ` · 🧤${r.saves}`}
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="text-xs text-ink-muted">Ma'lumot hali yo'q</div>}
      </div>
    </div>
  );
}

export default function RatingsCard({ teamA, teamB, rowsA, rowsB, motm, isFinished }) {
  return (
    <section className="bg-surface-card border border-surface-line rounded-card shadow-soft p-4 sm:p-5 flex flex-col gap-4">
      {motm && (
        <div className="flex items-center gap-3 rounded-control bg-gradient-to-r from-accent-tint to-brand-tint border border-surface-line px-4 py-3">
          <span className="text-2xl">🏅</span>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-extrabold uppercase tracking-wide text-ink-muted">
              {isFinished ? "O'yin o'yinchisi" : 'Hozirgi eng yaxshi'}
            </div>
            <div className="text-base font-extrabold text-ink truncate">{motm.name}</div>
          </div>
          <RatingBadge value={motm.rating} size="lg" />
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-5">
        <TeamList title={teamA.name} tone="accent" rows={rowsA} />
        <TeamList title={teamB.name} tone="brand" rows={rowsB} />
      </div>
    </section>
  );
}
