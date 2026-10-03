import React, { useMemo } from 'react';
import Panel from './Panel';

// Groups repeat wins of the same trophy: "Premier League Champion ×3 (2027, 2029, 2031)".
export default function TrophyCase({ trophies = [] }) {
  const groups = useMemo(() => {
    const map = new Map();
    trophies.forEach((t) => {
      const g = map.get(t.name) || { name: t.name, icon: t.icon || '🏆', years: [], count: 0 };
      if (t.year != null) g.years.push(t.year);
      g.count = (g.count || 0) + 1;
      map.set(t.name, g);
    });
    return [...map.values()]
      .map((g) => ({ ...g, years: [...g.years].sort() }))
      .sort((a, b) => b.count - a.count || (b.years[b.years.length - 1] || 0) - (a.years[a.years.length - 1] || 0));
  }, [trophies]);

  return (
    <Panel
      title="Trophy cabinet"
      aside={<span className="text-xs font-bold text-ink-muted">{trophies.length} won</span>}
    >
      {groups.length === 0 ? (
        <p className="m-0 text-sm text-ink-muted">The cabinet is empty. Win a league title or cup and it appears here.</p>
      ) : (
        <ul className="m-0 p-0 list-none flex flex-col gap-2">
          {groups.map((g) => (
            <li key={g.name} className="flex items-center gap-3 rounded-control border border-amber-200 bg-amber-50 px-3 py-2">
              <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-amber-200 text-xl" aria-hidden="true">{g.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-ink truncate">{g.name}</span>
                <span className="block text-[11px] text-ink-muted">{g.years.length ? g.years.join(', ') : 'Honour'}</span>
              </span>
              <span className="shrink-0 text-lg font-extrabold text-amber-700 tabular-nums">×{g.count}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
