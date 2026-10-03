import React from 'react';
import Panel, { OvrChip } from './Panel';
import { splitBench, cleanName, getSurname, initials, catOf, CAT_COLOR, CAT_SHORT } from './squadUtils';
import { getRatingTier } from '../../utils/ratingTier';

function SubCard({ p, isMe, selected, nameMode, onSelect }) {
  const cat = catOf(p.pos);
  const label = nameMode === 'full' ? cleanName(p.name) : getSurname(p.name);
  return (
    <button
      type="button"
      onClick={() => onSelect(p.id)}
      aria-pressed={selected}
      title={`${cleanName(p.name)} · ${p.pos} · OVR ${p.ovr ?? '-'}`}
      className={`flex items-center gap-2.5 text-left rounded-control border px-2.5 py-2 cursor-pointer transition-colors ${
        selected ? 'border-amber-400 bg-amber-50' : 'border-surface-line bg-surface hover:bg-surface-muted'
      }`}
    >
      <span
        className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-white text-[11px] font-extrabold"
        style={{ color: CAT_COLOR[cat], border: `2px solid ${CAT_COLOR[cat]}` }}
      >
        {initials(p.name)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold text-ink truncate">
          {label}{isMe ? ' ★' : p.isUser ? ' 👤' : ''}
        </span>
        <span className="block text-[11px] text-ink-muted">{p.pos} · {CAT_SHORT[cat]}</span>
      </span>
      <OvrChip tier={getRatingTier(p.ovr || 0)} value={p.ovr} />
    </button>
  );
}

export default function BenchPanel({ bench, myId, selectedId, nameMode, onSelect }) {
  const { matchday, reserves } = splitBench(bench);

  const grid = (list) => (
    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((p) => (
        <SubCard key={p.id} p={p} isMe={p.id === myId} selected={p.id === selectedId} nameMode={nameMode} onSelect={onSelect} />
      ))}
    </div>
  );

  return (
    <Panel
      title="Substitutes"
      aside={<span className="text-xs font-bold text-ink-muted">{bench.length} not in the XI</span>}
    >
      {bench.length === 0 ? (
        <p className="m-0 text-sm text-ink-muted">Everyone in the squad is starting. Sign more players to build a bench.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-xs font-bold text-ink-soft mb-2">Matchday bench ({matchday.length}/9)</div>
            {grid(matchday)}
          </div>
          {reserves.length > 0 && (
            <div>
              <div className="text-xs font-bold text-ink-soft mb-2">Reserves ({reserves.length})</div>
              {grid(reserves)}
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}
