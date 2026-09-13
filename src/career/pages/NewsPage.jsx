import React from 'react';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';
import { generateNews } from '../utils/season';

export default function NewsPage() {
  const { player } = useGame();
  if (!player) return null;

  const news = generateNews(player);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>News</h1>
          <div className="sub">Storylines from around {player.club.leagueName} and your own career</div>
        </div>
      </div>

      {news.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div className="sub">Nothing to report yet - play a few more matchdays and headlines will start rolling in.</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {news.map((n) => (
          <div key={n.id} className="card" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 24 }}>{n.icon}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, marginBottom: 2 }}>{n.headline}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{n.body}</div>
              <div className="sub" style={{ marginTop: 4, fontSize: 11 }}>{n.date}</div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
