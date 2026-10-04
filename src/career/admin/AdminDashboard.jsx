import React, { useState } from 'react';
import SegmentedTabs from '../../components/match/SegmentedTabs';
import { Badge } from '../../components/ui';
import MasterCalendar from './MasterCalendar';
import PlayersTab from './PlayersTab';
import LeaguesTab from './LeaguesTab';
import PendingTab from './PendingTab';
import FixturesTab from './FixturesTab';
import RosterTab from './RosterTab';
import NewsTab from './NewsTab';
import UsersTab from './UsersTab';
import ChatPanel from '../chat/ChatPanel';
import { useFetch, Panel, Loading, ErrorBox, Empty } from './adminUi';
import { fetchChatAudit } from '../utils/careerApi';

// Phase 10 — Admin Dashboard.
// Admin: hamma tablar + Master Calendar. Moderator: faqat Chat moderatsiyasi.
const ADMIN_TABS = [
  { key: 'players', label: 'Players Stats' },
  { key: 'leagues', label: 'Leagues / Tournaments' },
  { key: 'fixtures', label: 'Fixtures' },
  { key: 'roster', label: 'Roster & Stats' },
  { key: 'news', label: 'News' },
  { key: 'chat', label: 'Chat' },
  { key: 'users', label: 'Users' },
  { key: 'pending', label: 'Skip / Pending' },
];
const MOD_TABS = [{ key: 'chat', label: 'Chat' }];

const ACTION_LABEL = { pin: 'biriktirdi', unpin: 'pinni oldi', delete: "o'chirdi", mute: 'mute qildi', unmute: 'unmute qildi' };

function ChatModeration({ currentUser }) {
  const audit = useFetch(fetchChatAudit, []);
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4 items-start">
      <ChatPanel currentUser={currentUser} moderate height={460} onModerated={audit.reload} />
      <Panel title="Moderatsiya jurnali" action={<button type="button" onClick={audit.reload} className="text-xs font-bold text-accent-dark bg-transparent border-0 cursor-pointer font-sans">Yangilash</button>}>
        {audit.loading ? <Loading /> : audit.error ? <ErrorBox error={audit.error} onRetry={audit.reload} /> : audit.data.audit.length === 0 ? <Empty>Hali amal bajarilmagan.</Empty> : (
          <ul className="list-none m-0 p-0 flex flex-col divide-y divide-surface-line max-h-[420px] overflow-y-auto">
            {audit.data.audit.map((a, i) => (
              <li key={i} className="py-2 text-xs">
                <b>{a.by}</b> <span className="text-ink-soft">{a.target} {a.action === 'mute' || a.action === 'unmute' ? 'ni' : 'xabarini'} {ACTION_LABEL[a.action] || a.action}</span>
                {a.detail && <div className="text-ink-muted truncate">{a.detail}</div>}
                <div className="text-[10px] text-ink-subtle tabular-nums">{new Date(a.at).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

export default function AdminDashboard({ currentUser }) {
  const isAdmin = !!currentUser?.isAdmin;
  const tabs = isAdmin ? ADMIN_TABS : MOD_TABS;
  const [tab, setTab] = useState(isAdmin ? 'players' : 'chat');
  // Kun o'tgach (qo'lda yoki avto-rejim) barcha tablar ma'lumotni qayta yuklashi uchun
  const [version, setVersion] = useState(0);
  const bump = () => setVersion((v) => v + 1);

  return (
    <div className="font-sans text-ink flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="accent">{isAdmin ? 'Admin' : 'Moderator'}: {currentUser?.username}</Badge>
      </div>
      {isAdmin && <MasterCalendar onAdvanced={bump} />}
      <SegmentedTabs tabs={tabs} active={tab} onChange={setTab} />
      <div key={`${tab}-${version}`} className="motion-safe:animate-fs-fade-up">
        {isAdmin && tab === 'players' && <PlayersTab />}
        {isAdmin && tab === 'leagues' && <LeaguesTab />}
        {isAdmin && tab === 'fixtures' && <FixturesTab />}
        {isAdmin && tab === 'roster' && <RosterTab />}
        {isAdmin && tab === 'news' && <NewsTab />}
        {tab === 'chat' && <ChatModeration currentUser={currentUser} />}
        {isAdmin && tab === 'users' && <UsersTab currentUser={currentUser} />}
        {isAdmin && tab === 'pending' && <PendingTab />}
      </div>
    </div>
  );
}
