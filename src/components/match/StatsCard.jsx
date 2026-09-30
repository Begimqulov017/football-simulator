import React from 'react';

function Row({ label, a, b, suffix = '', highlight }) {
  const na = Number(a) || 0;
  const nb = Number(b) || 0;
  const total = na + nb;
  const pa = total ? (na / total) * 100 : 50;
  return (
    <div className="py-2">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className={`font-extrabold tabular-nums ${na >= nb ? 'text-accent-dark' : 'text-ink-muted'}`}>{a}{suffix}</span>
        <span className="text-xs font-semibold text-ink-muted">{label}</span>
        <span className={`font-extrabold tabular-nums ${nb >= na ? 'text-brand-dark' : 'text-ink-muted'}`}>{b}{suffix}</span>
      </div>
      <div className="flex gap-1 h-1.5">
        <div className="flex-1 flex justify-end bg-surface-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${highlight ? 'bg-accent' : 'bg-accent/70'}`} style={{ width: `${pa}%` }} />
        </div>
        <div className="flex-1 bg-surface-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${highlight ? 'bg-brand' : 'bg-brand/70'}`} style={{ width: `${100 - pa}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function StatsCard({ teamA, teamB, rows }) {
  return (
    <section className="bg-surface-card border border-surface-line rounded-card shadow-soft p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2 text-sm font-extrabold">
        <span className="text-accent-dark truncate">{teamA.name}</span>
        <span className="text-brand-dark truncate">{teamB.name}</span>
      </div>
      <div className="divide-y divide-surface-line">
        {rows.map((r) => <Row key={r.label} {...r} />)}
      </div>
    </section>
  );
}
