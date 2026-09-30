import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import NotStarted from '../components/NotStarted';
import { useGame } from '../context/GameContext';
import CareerDashboard from '../dashboard/CareerDashboard';
import AwardsBanner from '../awards/AwardsBanner';
import { getLeagueTable, getTopScorers } from '../utils/season';

export default function HomePage() {
  const { player, worldDate } = useGame();
  const navigate = useNavigate();

  if (!player) return null;

  const table = getLeagueTable(player).slice(0, 5);
  const scorers = getTopScorers(player).slice(0, 5);
  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Welcome back, {player.name}</h1>
          <div className="sub">{player.club.logo} {player.club.name} · {player.club.leagueName}</div>
        </div>
        <span className="badge badge-green">Day {player.career.day}</span>
      </div>

      {worldDate && (
        <div className="sub" style={{ marginBottom: 12 }}>
          🌍 Umumiy dunyo sanasi: <b>{worldDate}</b> (admin tomonidan boshqariladi)
        </div>
      )}

      {player.career.freeAgent && (
        <div className="card" style={{ marginBottom: 18, borderColor: 'var(--accent-red)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-red)', marginBottom: 4 }}>🆓 FREE AGENT</div>
          <div className="sub">You're without a club right now - check Messages for offers coming in.</div>
        </div>
      )}

      <AwardsBanner player={player} />

      <div style={{ marginBottom: 18 }}>
        <CareerDashboard />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/league')}>
          <div className="card-title">LEAGUE TOP 5</div>
          {table.map((row, i) => (
            <div key={row.teamId} className="list-row" style={row.teamId === player.club.id ? { color: 'var(--accent-gold)', fontWeight: 700 } : undefined}>
              <span>{i + 1}. {row.logo} {row.name}</span>
              <span className="badge">{row.pts} pts</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/top-scorers')}>
          <div className="card-title">TOP SCORERS TOP 5</div>
          {scorers.length === 0 && <div className="sub" style={{ padding: 8 }}>No goals yet.</div>}
          {scorers.map((s, i) => (
            <div key={s.id} className="list-row" style={s.id === player.id ? { color: 'var(--accent-gold)', fontWeight: 700 } : undefined}>
              <span>{i + 1}. {s.name}</span>
              <span className="badge badge-gold">{s.goals}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">NEWS</div>
          <NotStarted icon="📰" title="Coming Soon" desc="Club and league news will appear here." badge="Coming Soon" />
        </div>

        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/money')}>
          <div className="card-title">MONEY AND BUDGET</div>
          <div className="list-row"><span>Balance</span><span className="badge badge-green">${player.career.money.toLocaleString()}</span></div>
          <div className="list-row"><span>Weekly Wage</span><span className="badge">${player.career.weeklyWage.toLocaleString()}</span></div>
        </div>
      </div>
    </AppShell>
  );
}
