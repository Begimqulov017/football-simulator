import React, { useMemo, useState } from 'react';
import { fetchContinental } from '../utils/careerApi';
import { useFetch, Panel, Loading, ErrorBox, Empty } from '../admin/adminUi';
import TournamentView from '../tournaments/TournamentView';
import StatLeaders from './StatLeaders';
import TrophyCabinet from './TrophyCabinet';
import { Chips, clubLogo, yearSeason, keyOfHistory } from './shared';

// 3-bo'lim: Kontinental klub turnirlari (UCL, UEL, AFC CL).
const COMPS = [
  { key: 'ucl', label: 'Champions League', hint: 'UEFA · 32 klub · 1-sentabrdan avtomatik boshlanadi' },
  { key: 'uel', label: 'Europa League', hint: 'UEFA · 32 klub · 1-sentabrdan avtomatik boshlanadi' },
  { key: 'acl', label: 'AFC Champions League', hint: 'Osiyo · 16 klub · 1-sentabrdan avtomatik boshlanadi' },
];

export default function ContinentalView() {
  const { loading, data, error, reload } = useFetch(fetchContinental, []);
  const [key, setKey] = useState('ucl');

  const comp = useMemo(() => {
    const list = (data?.active || []).filter((c) => c.key === key).sort((a, b) => b.season - a.season);
    return list[0] || null;
  }, [data, key]);

  const rows = useMemo(() => (data?.history || []).filter((h) => keyOfHistory(h) === key).map((h) => ({
    key: h.id,
    label: yearSeason(h.season),
    winner: h.winner?.name,
    winnerBadge: h.winner?.logo,
    runnerUp: h.runnerUp?.name,
    runnerUpBadge: h.runnerUp?.logo,
    note: h.topScorer ? `Top butsi: ${h.topScorer.name} (${h.topScorer.goals})` : '',
  })), [data, key]);

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const def = COMPS.find((c) => c.key === key);

  return (
    <div className="flex flex-col gap-5">
      <Chips items={COMPS} active={key} onChange={setKey} />

      <Panel>
        {comp ? (
          <div className="flex flex-col gap-6">
            <TournamentView comp={comp} mode="club" />
            <StatLeaders leaders={comp.leaders} badgeOf={(id) => comp.clubs?.[id]?.logo || clubLogo(id)} title={`${comp.name} — statistik peshqadamlar`} />
          </div>
        ) : (
          <Empty>{def.label} hozir o'ynalmayapti. {def.hint}. Admin kunlarni o'tkazgach turnir shu yerda paydo bo'ladi.</Empty>
        )}
      </Panel>

      <Panel>
        <TrophyCabinet title={`${def.label} — g'oliblar tarixi`} rows={rows} />
      </Panel>
    </div>
  );
}
