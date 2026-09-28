import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import NotStarted from '../components/NotStarted';
import { useGame } from '../context/GameContext';
import LiveMatch from '../../components/LiveMatch';

// 11-BOSQICH / VAZIFA 1: milliy terma jamoa o'yini natijasi allaqachon
// serverda (server/international.js -> playNationalMatch) hal qilingan -
// bu sahifa faqat o'sha natijani AYNAN shu seed va shu paytdagi tarkib
// (career.international.lastCallUp.teamASquad/teamBSquad) bilan LiveMatch
// orqali "tomosha qilish" uchun. MatchReplayPage.jsx (liga/kubok qayta
// tomosha) bilan bir xil mantiq: onFinish hech narsa qilmaydi, chunki
// natija allaqachon yozilgan - bu shunchaki qayta ko'rsatish.
export default function NationalMatchReplayPage() {
  const { player } = useGame();
  const navigate = useNavigate();

  if (!player) return null;

  const intl = player.career?.international;
  const lastCallUp = intl?.lastCallUp;

  const goBack = () => navigate('/national-team', { replace: true });

  if (!lastCallUp || lastCallUp.seed === undefined || lastCallUp.seed === null) {
    return (
      <AppShell>
        <div className="card">
          <NotStarted
            icon="🏳️"
            title="Tomosha qilish uchun o'yin yo'q"
            desc="Hali milliy terma jamoa safida birorta o'yin o'ynalmagan."
          />
          <button className="btn" style={{ marginTop: 12 }} onClick={goBack}>
            ← Terma jamoaga qaytish
          </button>
        </div>
      </AppShell>
    );
  }

  const teamA = {
    id: intl.country || 'A',
    name: intl.country || 'Bizning terma jamoa',
    squad: lastCallUp.teamASquad || [],
  };
  const teamB = {
    id: lastCallUp.opponent || 'B',
    name: lastCallUp.opponent || 'Raqib',
    squad: lastCallUp.teamBSquad || [],
  };

  const competitionLabel = lastCallUp.competition
    ? `${lastCallUp.competition} — ${teamA.name} — ${teamB.name}`
    : `${teamA.name} — ${teamB.name}`;

  return (
    <LiveMatch
      teamA={teamA}
      teamB={teamB}
      seed={lastCallUp.seed}
      competitionLabel={competitionLabel}
      onFinish={() => {}}
      onExit={goBack}
    />
  );
}
