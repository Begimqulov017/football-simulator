import React, { useMemo, useState } from 'react';
import Panel, { OvrChip } from './Panel';
import { cleanName, catOf, CAT_COLOR, CAT_SHORT } from './squadUtils';
import { getRatingTier } from '../../utils/ratingTier';
import { NATION_BY_NAME, flagFor } from '../../data/nationsData';

// Futbolchi millati (terma jamoasi): teamsData.js dagi `nat` yoki o'yinchi karyerasidagi `nationality`.
const natOf = (p) => { const n = p.nat || p.nationality; return n && NATION_BY_NAME[n] ? n : null; };

const FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'GK', label: 'GK' },
  { id: 'DF', label: 'DEF' },
  { id: 'MF', label: 'MID' },
  { id: 'FW', label: 'ATT' },
];
const CAT_ORDER = { GK: 0, DF: 1, MF: 2, FW: 3 };

const BAR = { gold: 'bg-amber-400', silver: 'bg-slate-400', bronze: 'bg-amber-700' };

export default function SquadTable({ squad, starterIds, myId, selectedId, onSelect }) {
  const [filter, setFilter] = useState('ALL');
  const [sort, setSort] = useState({ key: 'ovr', dir: 'desc' });

  const rows = useMemo(() => {
    const list = squad.filter((p) => filter === 'ALL' || catOf(p.pos) === filter);
    const dir = sort.dir === 'asc' ? 1 : -1;
    const cmp = {
      ovr: (a, b) => ((a.ovr || 0) - (b.ovr || 0)) * dir,
      name: (a, b) => cleanName(a.name).localeCompare(cleanName(b.name)) * dir,
      pos: (a, b) => (CAT_ORDER[catOf(a.pos)] - CAT_ORDER[catOf(b.pos)] || (b.ovr || 0) - (a.ovr || 0)) * dir,
    }[sort.key];
    return [...list].sort(cmp);
  }, [squad, filter, sort]);

  const toggleSort = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'ovr' ? 'desc' : 'asc' }));
  const arrow = (key) => (sort.key === key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : '');
  const th = 'text-left text-xs font-bold text-ink-muted px-3 py-2 bg-surface-muted border-b border-surface-line';

  return (
    <Panel
      title={`Squad (${squad.length})`}
      aside={
        <div className="flex gap-1" role="group" aria-label="Filter by position group">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                filter === f.id ? 'bg-brand-tint border-brand text-brand-dark' : 'bg-white border-surface-line text-ink-muted hover:bg-surface-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full border-collapse min-w-[520px] text-sm">
          <thead>
            <tr>
              <th className={`${th} rounded-tl-lg`}><button type="button" className="bg-transparent border-0 p-0 font-bold text-xs text-ink-muted cursor-pointer" onClick={() => toggleSort('name')}>Player{arrow('name')}</button></th>
              <th className={th}><button type="button" className="bg-transparent border-0 p-0 font-bold text-xs text-ink-muted cursor-pointer" onClick={() => toggleSort('pos')}>Position{arrow('pos')}</button></th>
              <th className={th} style={{ width: '34%' }}><button type="button" className="bg-transparent border-0 p-0 font-bold text-xs text-ink-muted cursor-pointer" onClick={() => toggleSort('ovr')}>Overall{arrow('ovr')}</button></th>
              <th className={`${th} rounded-tr-lg`}>Role</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const cat = catOf(p.pos);
              const tier = getRatingTier(p.ovr || 0);
              const isMe = p.id === myId;
              const starting = starterIds.has(p.id);
              return (
                <tr
                  key={p.id}
                  onClick={() => onSelect(p.id)}
                  className={`cursor-pointer ${p.id === selectedId ? 'bg-amber-50' : isMe ? 'bg-brand-tint' : 'hover:bg-surface'}`}
                >
                  <td className="px-3 py-2 border-b border-surface-line">
                    {natOf(p) && <span className="mr-1.5" title={natOf(p)} aria-label={natOf(p)}>{flagFor(natOf(p))}</span>}
                    <span className="font-bold text-ink">{cleanName(p.name)}</span>
                    {isMe && <span className="ml-1.5 text-[11px] font-bold text-brand-dark">You</span>}
                    {!isMe && p.isUser && <span className="ml-1.5 text-[11px] font-bold text-accent-dark">Player-created</span>}
                  </td>
                  <td className="px-3 py-2 border-b border-surface-line">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: CAT_COLOR[cat] }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: CAT_COLOR[cat] }} />
                      {p.pos} <span className="text-ink-muted font-semibold">{CAT_SHORT[cat]}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 border-b border-surface-line">
                    <span className="flex items-center gap-2.5">
                      <OvrChip tier={tier} value={p.ovr} />
                      <span className="flex-1 h-1.5 rounded-full bg-surface-line overflow-hidden">
                        <span className={`block h-full rounded-full ${BAR[tier]}`} style={{ width: `${Math.max(4, Math.min(100, p.ovr || 0))}%` }} />
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-2 border-b border-surface-line">
                    <span className={`text-xs font-bold ${starting ? 'text-brand-dark' : 'text-ink-muted'}`}>{starting ? 'Starting XI' : 'Bench'}</span>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-6 text-center text-sm text-ink-muted">No players in this position group.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
