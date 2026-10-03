import React from 'react';

// Shared card shell for the Club page (Clean Light design tokens).
export default function Panel({ title, aside, children, className = '' }) {
  return (
    <section className={`bg-surface-card border border-surface-line rounded-card shadow-soft p-4 sm:p-5 ${className}`}>
      {(title || aside) && (
        <div className="flex items-center justify-between gap-3 mb-3">
          {title && <h2 className="m-0 text-sm font-extrabold text-ink">{title}</h2>}
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

// Small OVR chip, coloured by the app's gold / silver / bronze tiers.
const CHIP = {
  gold: 'bg-amber-300 text-amber-950',
  silver: 'bg-slate-200 text-slate-900',
  bronze: 'bg-amber-700 text-amber-50',
};
export function OvrChip({ tier, value }) {
  return (
    <span className={`inline-flex items-center justify-center min-w-[30px] h-[20px] px-1.5 rounded-md text-[11px] font-extrabold tabular-nums ${CHIP[tier]}`}>
      {value ?? '-'}
    </span>
  );
}
