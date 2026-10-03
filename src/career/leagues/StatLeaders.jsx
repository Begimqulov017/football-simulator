import React, { useState } from 'react';
import SegmentedTabs from '../../components/match/SegmentedTabs';
import { Empty } from '../admin/adminUi';
import { useGame } from '../context/GameContext';

// Phase 5 — Statistik peshqadamlar: Top Scorers / Assists / Cards / Rating.
// `leaders` — server (engine.buildLeaders) qaytargan obyekt.
// `badgeOf(teamId)` — jamoa belgisi (klub logotipi yoki davlat bayrog'i).

const VIEWS = [
  { key: 'scorers', label: 'Top Scorers' },
  { key: 'assists', label: 'Top Assists' },
  { key: 'cards', label: 'Top Cards' },
  { key: 'ratings', label: 'Top Rating' },
];

const EMPTY_TEXT = {
  scorers: "Hali gol urilmagan.",
  assists: "Hali assist qayd etilmagan.",
  cards: "Hali kartochka ko'rsatilmagan.",
  ratings: "Reyting hisoblash uchun yetarli o'yin o'tmagan.",
};

function Value({ view, s }) {
  if (view === 'scorers') return <span className="font-black tabular-nums text-base">{s.goals}</span>;
  if (view === 'assists') return <span className="font-black tabular-nums text-base">{s.assists}</span>;
  if (view === 'cards') {
    return (
      <span className="flex items-center gap-2 font-black tabular-nums text-sm">
        <span title="Sariq kartochka">🟨 {s.yellow}</span>
        <span title="Qizil kartochka">🟥 {s.red}</span>
      </span>
    );
  }
  const tone = s.rating >= 7.5 ? 'bg-brand text-white' : s.rating >= 6.8 ? 'bg-brand-soft text-brand-dark' : 'bg-surface-muted text-ink-soft';
  return <span className={`font-black tabular-nums text-sm rounded-md px-2 py-0.5 ${tone}`}>{Number(s.rating).toFixed(2)}</span>;
}

function subline(view, s) {
  if (view === 'scorers') return `${s.apps ? `${s.apps} o'yin · ` : ''}${s.assists} assist`;
  if (view === 'assists') return `${s.goals} gol${s.apps ? ` · ${s.apps} o'yin` : ''}`;
  if (view === 'cards') return `${s.apps} o'yin`;
  return `${s.apps} o'yin · ${s.goals} gol · ${s.assists} assist`;
}

export default function StatLeaders({ leaders, badgeOf = () => '', title = 'Statistik peshqadamlar' }) {
  const [view, setView] = useState('scorers');
  const { player } = useGame();
  const list = leaders?.[view] || [];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm font-extrabold text-ink">{title}</div>
        {view === 'ratings' && leaders?.minApps > 1 && (
          <div className="text-[11px] text-ink-muted">Kamida {leaders.minApps} ta o'yin o'ynaganlar</div>
        )}
      </div>
      <SegmentedTabs tabs={VIEWS} active={view} onChange={setView} />
      {list.length === 0 ? <Empty>{EMPTY_TEXT[view]}</Empty> : (
        <div className="flex flex-col gap-1.5">
          {list.map((s, i) => {
            const me = player && s.id === player.id;
            return (
              <div
                key={s.id}
                className={`flex items-center gap-3 rounded-control border px-3 py-2 text-sm ${me ? 'bg-amber-50 border-amber-200' : 'bg-surface border-surface-line'}`}
              >
                <span className={`w-6 text-center font-extrabold ${i < 3 ? 'text-amber-600' : 'text-ink-muted'}`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">
                    {s.name}{me ? ' (Siz)' : ''}
                    {s.pos && <span className="ml-1.5 text-[10px] font-extrabold text-ink-muted">{s.pos}</span>}
                  </div>
                  <div className="text-[11px] text-ink-muted truncate">{badgeOf(s.teamId)} {s.teamName} · {subline(view, s)}</div>
                </div>
                <Value view={view} s={s} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
