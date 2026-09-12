import React from 'react';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';
import { getLeagueTable } from '../utils/season';

export default function LeaguePage() {
  const { player } = useGame();
  if (!player) return null;

  const table = getLeagueTable(player);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>League</h1>
          <div className="sub">{player.club.flag} {player.club.leagueName}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">STANDINGS</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)', textAlign: 'left' }}>
                <th style={{ padding: '6px 8px' }}>#</th>
                <th style={{ padding: '6px 8px' }}>Club</th>
                <th style={{ padding: '6px 8px' }}>P</th>
                <th style={{ padding: '6px 8px' }}>W</th>
                <th style={{ padding: '6px 8px' }}>D</th>
                <th style={{ padding: '6px 8px' }}>L</th>
                <th style={{ padding: '6px 8px' }}>GD</th>
                <th style={{ padding: '6px 8px' }}>Pts</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row, i) => (
                <tr
                  key={row.teamId}
                  style={row.teamId === player.club.id ? { background: 'rgba(255,215,0,0.08)', fontWeight: 600 } : undefined}
                >
                  <td style={{ padding: '6px 8px' }}>{i + 1}</td>
                  <td style={{ padding: '6px 8px' }}>{row.logo} {row.name}</td>
                  <td style={{ padding: '6px 8px' }}>{row.played}</td>
                  <td style={{ padding: '6px 8px' }}>{row.win}</td>
                  <td style={{ padding: '6px 8px' }}>{row.draw}</td>
                  <td style={{ padding: '6px 8px' }}>{row.loss}</td>
                  <td style={{ padding: '6px 8px' }}>{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--accent-gold)' }}>{row.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
