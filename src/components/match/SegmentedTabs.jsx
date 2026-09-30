import React from 'react';

export default function SegmentedTabs({ tabs, active, onChange }) {
  return (
    <div role="tablist" className="flex gap-1 p-1 bg-surface-muted border border-surface-line rounded-control overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={active === t.key}
          onClick={() => onChange(t.key)}
          className={`flex-1 whitespace-nowrap px-3 py-2 rounded-[10px] border-0 cursor-pointer font-sans text-sm font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            active === t.key ? 'bg-surface-card text-ink shadow-soft' : 'bg-transparent text-ink-muted hover:text-ink'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
