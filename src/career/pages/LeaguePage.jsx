import React, { useState } from 'react';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';
import { getLeagueTable } from '../utils/season';
import { INITIAL_TEAMS } from '../data/teamsData';

export default function LeaguePage() {
  const { player } = useGame();
  const [roundIdx, setRoundIdx] = useState(null);
  if (!player) return null;

  const table = getLeagueTable(player);
  const log = player.career.roundResultsLog || [];
  const selected = roundIdx === null ? log[log.length - 1] : log[roundIdx];
  const teamName = (id) => INITIAL_TEAMS.find((t) => t.id === id)?.name || id;
  const teamLogo = (id) => INITIAL_TEAMS.find((t) => t.id === id)?.logo || '⚽';

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

      {log.length > 0 && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>ROUND {selected.round} RESULTS</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="btn"
                style={{ padding: '4px 10px', fontSize: 12 }}
                disabled={(roundIdx ?? log.length - 1) <= 0}
                onClick={() => setRoundIdx(Math.max(0, (roundIdx ?? log.length - 1) - 1))}
              >
                ← Prev
              </button>
              <button
                className="btn"
                style={{ padding: '4px 10px', fontSize: 12 }}
                disabled={(roundIdx ?? log.length - 1) >= log.length - 1}
                onClick={() => setRoundIdx(Math.min(log.length - 1, (roundIdx ?? log.length - 1) + 1))}
              >
                Next →
              </button>
            </div>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {selected.matches.map((m, i) => {
              const involvesPlayer = m.home === player.club.id || m.away === player.club.id;
              return (
                <div key={i} className="list-row" style={involvesPlayer ? { color: 'var(--accent-gold)' } : undefined}>
                  <span>{teamLogo(m.home)} {teamName(m.home)} vs {teamName(m.away)} {teamLogo(m.away)}</span>
                  <span className="badge">{m.golA} - {m.golB}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AppShell>
  );
}
