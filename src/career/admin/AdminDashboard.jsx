import React, { useState } from 'react';
import SegmentedTabs from '../../components/match/SegmentedTabs';
import { Button, Badge } from '../../components/ui';
import Icon from '../../components/Icon';
import { advanceWorldDay, fetchLeagues } from '../utils/careerApi';
import { useFetch, Panel } from './adminUi';
import PlayersTab from './PlayersTab';
import LeaguesTab from './LeaguesTab';
import PermissionsTab from './PermissionsTab';
import PendingTab from './PendingTab';

const TABS = [
  { key: 'players', label: 'Players Stats' },
  { key: 'leagues', label: 'Leagues / Tournaments' },
  { key: 'permissions', label: 'Player Permissions' },
  { key: 'pending', label: 'Skip / Pending' },
];

// Dunyo kalendari: admin bir bosishda 1, 7 yoki 31 kunni o'tkazadi.
function WorldClock({ onAdvanced }) {
  const { data, reload } = useFetch(fetchLeagues, []);
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState(null);
  const skip = async (days) => {
    setBusy(true);
    try {
      const r = await advanceWorldDay(days);
      setLast(r.ok ? `${r.days} kun o'tdi · ${r.resolvedMatches} o'yin hal qilindi · ${r.pendingNow} ta kutmoqda${(r.continentalEvents || []).length ? ` · ${r.continentalEvents.length} kontinental tadbir` : ''}` : (r.error || 'Xatolik'));
      await reload();
      onAdvanced();
    } catch (e) { setLast(e.message); }
    setBusy(false);
  };
  return (
    <Panel className="!p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-control bg-accent-tint border border-accent-soft flex items-center justify-center text-accent-dark"><Icon name="calendar" size={20} /></span>
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wide text-ink-muted">Dunyo sanasi</div>
            <div className="text-xl font-black">{data?.worldDate || '—'}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="primary" disabled={busy} onClick={() => skip(1)}>+1 kun</Button>
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => skip(7)}>+7 kun</Button>
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => skip(31)}>+31 kun</Button>
        </div>
      </div>
      {(busy || last) && <div className="mt-3 text-xs font-semibold text-ink-soft">{busy ? 'Simulyatsiya ketmoqda…' : last}</div>}
    </Panel>
  );
}

export default function AdminDashboard({ currentUser }) {
  const [tab, setTab] = useState('players');
  const [version, setVersion] = useState(0); // kun o'tgach ma'lumotlarni qayta yuklash uchun
  return (
    <div className="font-sans text-ink flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="accent">Admin: {currentUser?.username}</Badge>
      </div>
      <WorldClock onAdvanced={() => setVersion((v) => v + 1)} />
      <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} />
      <div key={`${tab}-${version}`} className="motion-safe:animate-fs-fade-up">
        {tab === 'players' && <PlayersTab />}
        {tab === 'leagues' && <LeaguesTab />}
        {tab === 'permissions' && <PermissionsTab currentUser={currentUser} />}
        {tab === 'pending' && <PendingTab />}
      </div>
    </div>
  );
}
