import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchHubCups } from '../utils/careerApi';
import { useFetch, Panel, Loading, ErrorBox, Empty } from '../admin/adminUi';
import TrophyCabinet from './TrophyCabinet';
import { Chips, Tag, counterSeason } from './shared';

// 2-bo'lim: Ichki kuboklar (har bir liga o'z davlat kubogi).
const REGIONS = [
  { key: 'all', label: 'Barchasi' },
  { key: 'UEFA', label: 'Yevropa' },
  { key: 'AFC', label: 'Osiyo' },
  { key: 'CONCACAF', label: 'Shimoliy Amerika' },
];

function CupCard({ c, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(c.leagueId)}
      aria-pressed={selected}
      className={`text-left font-sans rounded-card border p-3 cursor-pointer transition-all bg-surface-card hover:shadow-soft ${selected ? 'border-accent ring-2 ring-accent/20' : 'border-surface-line'}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-2xl leading-none">{c.flag}</span>
        <div className="min-w-0 flex-1">
          <div className="font-extrabold text-sm text-ink truncate">{c.name}</div>
          <div className="text-[11px] text-ink-muted truncate">{c.leagueName}</div>
        </div>
      </div>
      <div className="mt-2 min-h-[18px] text-[11px] text-ink-soft truncate">
        {!c.started ? <span className="text-ink-subtle">Hali boshlanmagan</span>
          : c.champion ? <>🏆 {c.champion.logo} <b>{c.champion.name}</b></>
            : c.current ? <><Tag tone="accent">{c.current.label}</Tag> <span className="ml-1">{c.current.played}/{c.current.total} o'ynaldi</span></>
              : '—'}
      </div>
    </button>
  );
}

export default function CupsView() {
  const navigate = useNavigate();
  const { loading, data, error, reload } = useFetch(fetchHubCups, []);
  const [region, setRegion] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  const cups = useMemo(() => data?.cups || [], [data]);
  useEffect(() => {
    if (selectedId || !cups.length) return;
    setSelectedId(cups[0].leagueId);
  }, [cups, selectedId]);

  // Barcha kuboklar bo'yicha umumiy "eng ko'p titul" jadvali
  const allRows = useMemo(() => cups.flatMap((c) => c.history.map((h) => ({
    key: `${c.leagueId}-${h.season}`,
    label: `${c.flag} ${counterSeason(h.season)}`,
    winner: h.champion,
    winnerBadge: h.logo,
  }))), [cups]);

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  const visible = cups.filter((c) => region === 'all' || c.region === region);
  const selected = cups.find((c) => c.leagueId === selectedId);
  const selRows = (selected?.history || []).map((h) => ({
    key: `${h.season}`,
    label: counterSeason(h.season),
    winner: h.champion,
    winnerBadge: h.logo,
    runnerUp: h.runnerUp,
    runnerUpBadge: h.runnerUpLogo,
    note: h.finalScore ? `Final: ${h.finalScore.golA}-${h.finalScore.golB}` : '',
  }));

  return (
    <div className="flex flex-col gap-5">
      <Chips items={REGIONS} active={region} onChange={setRegion} />
      {visible.length === 0 ? <Empty>Bu hududda kubok topilmadi.</Empty> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {visible.map((c) => <CupCard key={c.leagueId} c={c} selected={c.leagueId === selectedId} onSelect={setSelectedId} />)}
        </div>
      )}

      {selected && (
        <Panel
          title={`${selected.flag} ${selected.name}`}
          action={<button type="button" onClick={() => navigate(`/leagues/${selected.leagueId}`)} className="text-xs font-bold text-accent-dark bg-transparent border-0 cursor-pointer font-sans">Setka va natijalar →</button>}
        >
          <div className="flex flex-col gap-5">
            <div className="rounded-control border border-surface-line bg-surface px-3 py-2.5 text-sm">
              {!selected.started && 'Kubok liga birinchi o\'yin kunidan keyin yaratiladi.'}
              {selected.started && selected.champion && <>🏆 {counterSeason(selected.season)} chempioni: <b>{selected.champion.logo} {selected.champion.name}</b></>}
              {selected.started && !selected.champion && selected.current && (
                <>Joriy bosqich: <b>{selected.current.label}</b> · {selected.current.date} · {selected.current.played}/{selected.current.total} o'yin o'ynaldi</>
              )}
            </div>
            <TrophyCabinet title={`${selected.name} — g'oliblar tarixi`} rows={selRows} emptyText="Bu kubok hali hech qachon yakunlanmagan." />
            <div className="text-[11px] text-ink-muted">
              Kubok o'yinlaridagi gollar, assistlar va reytinglar tegishli liganing statistikasiga qo'shiladi
              (Ligalar bo'limida «{selected.leagueName}» ni oching).
            </div>
          </div>
        </Panel>
      )}

      <Panel>
        <TrophyCabinet title="Barcha kuboklar bo'yicha eng ko'p titul" rows={allRows} showTimeline={false} topN={6} emptyText="Hali birorta kubok yakunlanmagan." />
      </Panel>
    </div>
  );
}
