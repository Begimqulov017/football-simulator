import React, { useState } from 'react';
import AppShell from '../components/AppShell';
import NotStarted from '../components/NotStarted';
import { useGame } from '../context/GameContext';
import { getTopScorers } from '../utils/season';

const TABS = ['Top Scorers', 'Top Assists', 'Top Cards', 'Top Rating'];

export default function TopScorersPage() {
  const { player } = useGame();
  const [tab, setTab] = useState(0);
  if (!player) return null;

  const scorers = getTopScorers(player).slice(0, 15);

  return (
    <AppShell>
      <div className="page-header"><h1>Top</h1></div>
      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {TABS.map((t, i) => (
            <button
              key={t}
              className="btn"
              onClick={() => setTab(i)}
              style={tab === i ? { background: 'var(--glass-fill-strong)' } : undefined}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === 0 ? (
        <div className="card">
          <div className="card-title">TOP SCORERS - {player.club.leagueName}</div>
          {scorers.length === 0 && <div className="sub" style={{ padding: 12 }}>No goals yet - play some matches from Home.</div>}
          {scorers.map((s, i) => (
            <div
              key={s.id}
              className="list-row"
              style={s.id === player.id ? { color: 'var(--accent-gold)', fontWeight: 600 } : undefined}
            >
              <span>{i + 1}. {s.name}{s.id === player.id ? ' (You)' : ''} <span className="sub" style={{ fontSize: 12 }}>· {s.teamName}</span></span>
              <span className="badge badge-gold">{s.goals}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <NotStarted icon="⚽" title="Leaderboard not started" desc="Assists, cards and ratings leaderboards are coming soon." />
        </div>
      )}
    </AppShell>
  );
}
