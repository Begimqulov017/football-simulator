import React, { useMemo } from 'react';
import { Empty } from '../admin/adminUi';

// Phase 5 — Trophy Cabinet / G'oliblar tarixi.
// rows: [{ key, label, winner, winnerBadge, runnerUp?, runnerUpBadge?, note? }]
//   label  — mavsum/yil ("2026/27", "3-mavsum")
//   winner — g'olib nomi (titullar shu nom bo'yicha sanaladi)
export default function TrophyCabinet({ title = "Kubok javoni", rows, emptyText = "Hali tugagan turnir yo'q.", showTimeline = true, topN = 5 }) {
  const table = useMemo(() => {
    const map = new Map();
    rows.forEach((r) => {
      if (!r.winner) return;
      const cur = map.get(r.winner) || { name: r.winner, badge: r.winnerBadge, count: 0, labels: [] };
      cur.count += 1;
      cur.labels.push(r.label);
      map.set(r.winner, cur);
    });
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, topN);
  }, [rows, topN]);

  const done = rows.filter((r) => r.winner);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-extrabold text-ink">🏆 {title}</div>
      {done.length === 0 ? <Empty>{emptyText}</Empty> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
            {table.map((t, i) => (
              <div key={t.name} className={`flex items-center gap-3 rounded-control border px-3 py-2.5 ${i === 0 ? 'bg-amber-50 border-amber-200' : 'bg-surface border-surface-line'}`}>
                <span className="text-2xl leading-none">{t.badge}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{t.name}</div>
                  <div className="text-[11px] text-ink-muted truncate">{t.labels.slice(0, 4).join(' · ')}{t.labels.length > 4 ? ' …' : ''}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black tabular-nums leading-none">{t.count}</div>
                  <div className="text-[10px] font-extrabold uppercase text-ink-muted">titul</div>
                </div>
              </div>
            ))}
          </div>

          {showTimeline && (
            <div className="rounded-control border border-surface-line divide-y divide-surface-line overflow-hidden">
              {done.map((r) => (
                <div key={r.key} className="flex items-center gap-3 px-3 py-2 text-sm bg-surface-card">
                  <span className="w-20 shrink-0 text-xs font-extrabold text-ink-muted tabular-nums">{r.label}</span>
                  <span className="flex-1 min-w-0 font-bold truncate">🏆 {r.winnerBadge} {r.winner}</span>
                  <span className="hidden sm:block text-xs text-ink-muted truncate max-w-[45%] text-right">
                    {r.runnerUp ? `Finalchi: ${r.runnerUpBadge || ''} ${r.runnerUp}` : ''}{r.note ? `${r.runnerUp ? ' · ' : ''}${r.note}` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
