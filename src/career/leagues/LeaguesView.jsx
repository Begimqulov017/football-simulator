import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLeagues, fetchHubLeague } from '../utils/careerApi';
import { useFetch, Panel, Loading, ErrorBox, Empty } from '../admin/adminUi';
import StatLeaders from './StatLeaders';
import TrophyCabinet from './TrophyCabinet';
import { Chips, Tag, clubLogo, counterSeason } from './shared';

// 1-bo'lim: Ligalar. `division` maydoni bo'yicha guruhlanadi (1 = yuqori divizion).
// Hozir o'yin ma'lumotlarida faqat 1-divizionlar bor; server /api/leagues'ga
// division: 2 bilan liga qo'shilganda "2-divizion" bo'limi o'zi paydo bo'ladi.
const REGIONS = [
  { key: 'all', label: 'Barchasi' },
  { key: 'UEFA', label: 'Yevropa' },
  { key: 'AFC', label: 'Osiyo' },
  { key: 'CONCACAF', label: 'Shimoliy Amerika' },
];

function LeagueCard({ l, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(l.id)}
      aria-pressed={selected}
      className={`text-left font-sans rounded-card border p-3 cursor-pointer transition-all bg-surface-card hover:shadow-soft ${selected ? 'border-accent ring-2 ring-accent/20' : 'border-surface-line'}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-2xl leading-none">{l.flag}</span>
        <div className="min-w-0 flex-1">
          <div className="font-extrabold text-sm text-ink truncate">{l.name}</div>
          <div className="text-[11px] text-ink-muted truncate">{l.country} · {l.teamCount} klub</div>
        </div>
        {l.isMine && <Tag tone="gold">Sizniki</Tag>}
      </div>
      <div className="mt-2 text-[11px] text-ink-soft min-h-[16px] truncate">
        {l.leader
          ? <>🥇 {l.leader.logo} <b>{l.leader.name}</b> · {l.leader.pts} och.</>
          : l.lastChampion
            ? <>🏆 {l.lastChampion.logo} {l.lastChampion.name}</>
            : <span className="text-ink-subtle">Hali boshlanmagan</span>}
      </div>
      <div className="mt-1 text-[10px] font-bold text-ink-muted">{l.season ? `${counterSeason(l.season)} · ${l.day}-kun` : '—'}</div>
    </button>
  );
}

function LeagueDetail({ league }) {
  const navigate = useNavigate();
  const { loading, data, error, reload } = useFetch(() => fetchHubLeague(league.id), [league.id]);

  const rows = useMemo(() => (data?.champions || []).map((c) => ({
    key: `${c.season}`,
    label: counterSeason(c.season),
    winner: c.name,
    winnerBadge: c.logo,
    note: [c.pts != null ? `${c.pts} och.` : null, c.topScorer ? `Top butsi: ${c.topScorer.name} (${c.topScorer.goals})` : null].filter(Boolean).join(' · '),
  })), [data]);

  const cupRows = useMemo(() => (data?.cupChampions || []).map((c) => ({
    key: `cup${c.season}`,
    label: counterSeason(c.season),
    winner: c.champion,
    winnerBadge: c.logo,
    runnerUp: c.runnerUp,
    runnerUpBadge: c.runnerUpLogo,
  })), [data]);

  return (
    <Panel
      title={`${league.flag} ${league.name}`}
      action={<button type="button" onClick={() => navigate(`/leagues/${league.id}`)} className="text-xs font-bold text-accent-dark bg-transparent border-0 cursor-pointer font-sans">Jadval va o'yinlar →</button>}
    >
      {loading && <Loading />}
      {error && <ErrorBox error={error} onRetry={reload} />}
      {data?.ok && (
        <div className="flex flex-col gap-6">
          {!data.started && <div className="text-sm text-ink-muted">Bu liga hali boshlanmagan — birinchi o'yin kunidan keyin statistika paydo bo'ladi.</div>}
          <StatLeaders leaders={data.leaders} badgeOf={clubLogo} title={`Joriy mavsum${data.season ? ` (${counterSeason(data.season)})` : ''}`} />
          <TrophyCabinet title="Chempionlar tarixi" rows={rows} emptyText="Hali birorta mavsum yakunlanmagan." />
          {cupRows.length > 0 && <TrophyCabinet title="Ichki kubok g'oliblari" rows={cupRows} />}
        </div>
      )}
    </Panel>
  );
}

export default function LeaguesView() {
  const { loading, data, error, reload } = useFetch(fetchLeagues, []);
  const [region, setRegion] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  const leagues = useMemo(() => data?.leagues || [], [data]);
  useEffect(() => {
    if (selectedId || !leagues.length) return;
    setSelectedId((leagues.find((l) => l.isMine) || leagues[0]).id);
  }, [leagues, selectedId]);

  const visible = leagues.filter((l) => region === 'all' || l.region === region);
  const divisions = [...new Set(visible.map((l) => l.division || 1))].sort((a, b) => a - b);
  const selected = leagues.find((l) => l.id === selectedId);

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  return (
    <div className="flex flex-col gap-5">
      <Chips items={REGIONS} active={region} onChange={setRegion} />
      {visible.length === 0 && <Empty>Bu hududda liga topilmadi.</Empty>}
      {divisions.map((d) => (
        <div key={d} className="flex flex-col gap-2">
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-ink-muted">{d}-divizion {d === 1 ? '· Yuqori liga' : '· Quyi liga'}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {visible.filter((l) => (l.division || 1) === d).map((l) => (
              <LeagueCard key={l.id} l={l} selected={l.id === selectedId} onSelect={setSelectedId} />
            ))}
          </div>
        </div>
      ))}
      {selected && <LeagueDetail key={selected.id} league={selected} />}
    </div>
  );
}
