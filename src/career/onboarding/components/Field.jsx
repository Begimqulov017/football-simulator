import React from 'react';

export const inputCls =
  'w-full font-sans text-sm text-ink bg-surface-card border border-surface-line rounded-control px-3 py-2.5 ' +
  'placeholder:text-ink-subtle transition-colors focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 ' +
  'disabled:bg-surface-muted disabled:text-ink-muted';

export default function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-bold text-ink-soft">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-ink-muted">{hint}</span>}
    </label>
  );
}
