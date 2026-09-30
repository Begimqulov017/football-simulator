import React from 'react';

// Qayta ishlatiluvchi tugma (Design System). Faqat light-mode tokenlaridan foydalanadi.
const VARIANTS = {
  primary:
    'bg-brand text-white shadow-soft hover:bg-brand-dark hover:shadow-glow-brand border border-transparent',
  accent:
    'bg-accent text-white shadow-soft hover:bg-accent-dark hover:shadow-glow-accent border border-transparent',
  secondary:
    'bg-surface-card text-ink border border-surface-line hover:border-ink-subtle hover:bg-surface-muted',
  ghost: 'bg-transparent text-ink-soft border border-transparent hover:bg-surface-muted',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3.5 text-base gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center font-sans font-semibold rounded-control cursor-pointer',
        'transition-all duration-200 motion-safe:active:scale-[0.98]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
