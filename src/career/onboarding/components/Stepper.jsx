import React from 'react';

const STEPS = [
  { key: 'create', label: "O'yinchi" },
  { key: 'wheel', label: 'Klub' },
  { key: 'contract', label: 'Shartnoma' },
];

export default function Stepper({ current }) {
  const idx = STEPS.findIndex((s) => s.key === current);
  return (
    <ol className="list-none m-0 p-0 flex items-center justify-center gap-2 sm:gap-3">
      {STEPS.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <li key={s.key} className="flex items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-colors duration-300 ${
                  done ? 'bg-brand text-white' : active ? 'bg-ink text-white' : 'bg-surface-muted text-ink-subtle border border-surface-line'
                }`}
              >
                {done ? '✓' : i + 1}
              </span>
              <span className={`text-xs sm:text-sm font-bold ${active ? 'text-ink' : done ? 'text-brand-dark' : 'text-ink-subtle'}`}>{s.label}</span>
            </span>
            {i < STEPS.length - 1 && <span className={`w-6 sm:w-10 h-0.5 rounded ${i < idx ? 'bg-brand' : 'bg-surface-line'}`} />}
          </li>
        );
      })}
    </ol>
  );
}
