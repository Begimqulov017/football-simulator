import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import SegmentedTabs from '../../components/match/SegmentedTabs';
import { useCurrentUser } from '../context/ExitContext';
import LeaguesView from '../leagues/LeaguesView';
import CupsView from '../leagues/CupsView';
import ContinentalView from '../leagues/ContinentalView';
import InternationalView from '../leagues/InternationalView';

// PHASE 5 — Leagues & Tournaments Dashboard.
// Foydalanuvchilar uchun 4 ta bo'lim; "Simulyatsiya tarixi" faqat Admin panelida
// qoladi (AdminPage -> Ligalar/Turnirlar). Faol bo'lim URL'da (?tab=) saqlanadi,
// shuning uchun liga sahifasidan "orqaga" qaytganda o'sha bo'limga qaytiladi.
const TABS = [
  { key: 'leagues', label: '⚽ Ligalar' },
  { key: 'cups', label: '🏆 Kuboklar' },
  { key: 'continental', label: '🌍 Kontinental' },
  { key: 'international', label: '🌐 Xalqaro' },
];

const SUBTITLE = {
  leagues: "Yuqori va quyi divizionlar: jadval, statistika va chempionlar tarixi.",
  cups: "Davlat kuboklari: joriy bosqich va g'oliblar tarixi.",
  continental: 'Champions League, Europa League va AFC Champions League.',
  international: 'World Cup, Euro, Asian Cup, Nations League va boshqalar.',
};

export default function LeaguesPage() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab');
  const tab = TABS.some((t) => t.key === requested) ? requested : 'leagues';

  const setTab = (key) => setParams({ tab: key }, { replace: true });

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Ligalar va turnirlar</h1>
          <div className="sub">{SUBTITLE[tab]}</div>
        </div>
        {currentUser?.isAdmin && (
          <button type="button" className="btn" onClick={() => navigate('/admin')}>⚙ Admin: simulyatsiya tarixi</button>
        )}
      </div>

      <div className="font-sans text-ink flex flex-col gap-5">
        <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} />
        {tab === 'leagues' && <LeaguesView />}
        {tab === 'cups' && <CupsView />}
        {tab === 'continental' && <ContinentalView />}
        {tab === 'international' && <InternationalView />}
      </div>
    </AppShell>
  );
}
