import React from 'react';

const TONES = {
  brand: 'bg-brand-tint text-brand-dark border-brand-soft',
  accent: 'bg-accent-tint text-accent-dark border-accent-soft',
  neutral: 'bg-surface-muted text-ink-soft border-surface-line',
};

export default function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        TONES[tone],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
