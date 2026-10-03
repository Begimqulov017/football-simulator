import React, { useMemo, useState } from 'react';
import { fetchInternational } from '../utils/careerApi';
import { useFetch, Panel, Loading, ErrorBox, Empty } from '../admin/adminUi';
import TournamentView from '../tournaments/TournamentView';
import StatLeaders from './StatLeaders';
import TrophyCabinet from './TrophyCabinet';
import { Chips, nationFlag, keyOfHistory } from './shared';

// 4-bo'lim: Xalqaro turnirlar (terma jamoalar).
const TOURNAMENTS = [
  { key: 'world_cup', label: 'World Cup', hint: "Har 4 yilda iyun oyida (2010, 2014, …)" },
  { key: 'euro', label: 'Euro', hint: "Har 4 yilda iyun oyida (2012, 2016, …)" },
  { key: 'asian_cup', label: 'Asian Cup', hint: "Har 4 yilda iyun oyida (2012, 2016, …)" },
  { key: 'nations_league', label: 'Nations League', hint: "Har toq yili iyun oyida" },
  { key: 'copa_america', label: 'Copa América', hint: "Har 4 yilda iyun oyida (2012, 2016, …)" },
  { key: 'africa_cup', label: 'Africa Cup', hint: "Har 4 yilda iyun oyida (2012, 2016, …)" },
];

export default function InternationalView() {
  const { loading, data, error, reload } = useFetch(fetchInternational, []);
  const [key, setKey] = useState('world_cup');

  const comp = useMemo(() => {
    const list = (data?.tournaments || []).filter((t) => t.key === key).sort((a, b) => b.year - a.year);
    return list[0] || null;
  }, [data, key]);

  const rows = useMemo(() => (data?.history || []).filter((h) => keyOfHistory(h) === key).map((h) => ({
    key: h.id,
    label: String(h.year),
    winner: h.winner,
    winnerBadge: nationFlag(h.winner),
    runnerUp: h.runnerUp,
    runnerUpBadge: nationFlag(h.runnerUp),
    note: h.topScorer ? `Top butsi: ${h.topScorer.name} (${h.topScorer.goals})` : '',
  })), [data, key]);

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const def = TOURNAMENTS.find((t) => t.key === key);

  return (
    <div className="flex flex-col gap-5">
      <Chips items={TOURNAMENTS} active={key} onChange={setKey} />

      <Panel>
        {comp ? (
          <div className="flex flex-col gap-6">
            <TournamentView comp={comp} mode="nation" />
            <StatLeaders leaders={comp.leaders} badgeOf={nationFlag} title={`${comp.name} — statistik peshqadamlar`} />
          </div>
        ) : (
          <Empty>{def.label} hozir o'ynalmayapti. {def.hint}.</Empty>
        )}
      </Panel>

      <Panel>
        <TrophyCabinet title={`${def.label} — g'oliblar tarixi`} rows={rows} />
      </Panel>
    </div>
  );
}
