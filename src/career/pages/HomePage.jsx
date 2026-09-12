import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import NotStarted from '../components/NotStarted';
import { useGame } from '../context/GameContext';
import { getLeagueTable, getTopScorers, getPlayerFixtures } from '../utils/season';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function HomePage() {
  const { player, nextDay } = useGame();
  const navigate = useNavigate();

  if (!player) return null;

  const table = getLeagueTable(player).slice(0, 5);
  const scorers = getTopScorers(player).slice(0, 5);
  const upcoming = getPlayerFixtures(player).filter((f) => !f.played).slice(0, 3);
  const injured = !!player.career.injury;

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Welcome back, {player.name}</h1>
          <div className="sub">{player.club.logo} {player.club.name} · {player.club.leagueName}</div>
        </div>
        <span className="badge badge-green">Day {player.career.day}</span>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        {/* Time / Next Day */}
        <div className="card card--glow-green">
          <div className="card-title">TIME</div>
          <div className="next-day-cta" style={{ marginBottom: 18 }}>
            <button className="next-day-btn" onClick={nextDay}>Next Day =&gt;</button>
            <div className="indicator">
              <span className="indicator-label">FORM</span>
              <span className="indicator-value">{player.career.form}</span>
            </div>
            <div className="indicator">
              <span className="indicator-label">STAMINA</span>
              <div className="stamina-track"><div className="stamina-fill" style={{ width: `${player.career.stamina}%` }} /></div>
            </div>
          </div>
          {injured && (
            <div className="badge badge-red" style={{ marginBottom: 10, display: 'inline-block' }}>
              Injured - {player.career.injury.daysLeft} day(s) left
            </div>
          )}
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 10 }}>
            {formatDate(player.career.gameDate)}
          </div>
          <div className="grid grid-3">
            {[0, 1, 2].map((i) => {
              const f = upcoming[i];
              return (
                <div key={i} className="result-card" style={{ padding: '14px 8px' }}>
                  <div className="label" style={{ marginBottom: 8 }}>{f ? f.date : '—'}</div>
                  <button className="btn" disabled style={{ width: '100%', padding: '8px 6px', fontSize: 12 }}>
                    {f ? `${f.isHome ? 'vs' : '@'} ${f.opponent}` : 'Season done'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mini dashboard: League top 5 */}
        <div className="grid" style={{ gap: 18 }}>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/league')}>
            <div className="card-title">LEAGUE TOP 5</div>
            {table.map((row, i) => (
              <div key={row.teamId} className="list-row" style={row.teamId === player.club.id ? { color: 'var(--accent-gold)' } : undefined}>
                <span>{i + 1}. {row.logo} {row.name}</span>
                <span className="badge">{row.pts} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* News stays coming soon */}
        <div className="card">
          <div className="card-title">NEWS</div>
          <NotStarted icon="📰" title="Coming Soon" desc="Club and league news will appear here." badge="Coming Soon" />
        </div>

        <div className="grid" style={{ gap: 18 }}>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/top-scorers')}>
            <div className="card-title">TOP SCORERS TOP 5</div>
            {scorers.length === 0 && <div className="sub" style={{ padding: 8 }}>No goals yet.</div>}
            {scorers.map((s, i) => (
              <div key={s.id} className="list-row" style={s.id === player.id ? { color: 'var(--accent-gold)' } : undefined}>
                <span>{i + 1}. {s.name}</span>
                <span className="badge badge-gold">{s.goals}</span>
              </div>
            ))}
          </div>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/money')}>
            <div className="card-title">MONEY AND BUDGET</div>
            <div className="list-row"><span>Balance</span><span className="badge badge-green">${player.career.money.toLocaleString()}</span></div>
            <div className="list-row"><span>Weekly Wage</span><span className="badge">${player.career.weeklyWage.toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
