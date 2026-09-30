import React from 'react';

const TONES = {
  brand: { box: 'bg-brand-tint text-brand-dark border-brand-soft', dot: 'bg-brand' },
  danger: { box: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  accent: { box: 'bg-accent-tint text-accent-dark border-accent-soft', dot: 'bg-accent' },
  neutral: { box: 'bg-surface-muted text-ink-soft border-surface-line', dot: 'bg-ink-subtle' },
};

// Yuqoridagi holat belgisi: "O'yin davom etmoqda", "Xavfli vaziyat • 0.3x", ...
export default function StatusPill({ tone = 'neutral', pulse = false, children }) {
  const t = TONES[tone];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${t.box}`}>
      <span className="relative flex w-2 h-2">
        {pulse && <span className={`absolute inline-flex h-full w-full rounded-full opacity-70 motion-safe:animate-ping ${t.dot}`} />}
        <span className={`relative inline-flex w-2 h-2 rounded-full ${t.dot}`} />
      </span>
      {children}
    </span>
  );
}
