import React, { useState } from 'react';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';
import { getLeagueTable, getConfederation } from '../utils/season';
import { INITIAL_TEAMS } from '../../data/teamsData';

// 5-BOSQICH: liganing turli o'rinlari endi rangga ega - qaysi o'rin qaysi
// Yevropa/Osiyo kubogiga yoki relegatsiyaga olib borishi bir qarashda
// ko'rinadi (avval bularning hech biri ajratilmagan edi).
function zoneFor(position, total, confederation) {
  if (confederation === 'UEFA') {
    if (position <= 2) return { key: 'cl', label: 'UEFA Chempionlar ligasi', color: '#e6c200' };
    if (position <= 4) return { key: 'el', label: 'UEFA Yevropa ligasi', color: '#5aa9ff' };
    if (position <= 6) return { key: 'ecl', label: 'UEFA Konferensiyalar ligasi', color: '#5fd18a' };
  } else if (confederation === 'AFC') {
    if (position <= 2) return { key: 'afc_elite', label: 'AFC Chempionlar ligasi Elite', color: '#e6c200' };
    if (position <= 4) return { key: 'afc_two', label: 'AFC Chempionlar ligasi Two', color: '#5aa9ff' };
  }
  if (position > total - 3) return { key: 'rel', label: 'Relegatsiya zonasi', color: '#ff5a5a' };
  return null;
}

export default function LeaguePage() {
  const { player } = useGame();
  const [roundIdx, setRoundIdx] = useState(null);
  const [seasonView, setSeasonView] = useState('current');
  if (!player) return null;

  const confederation = getConfederation(player.club.leagueId);
  const currentTable = getLeagueTable(player);
  const previousTable = player.career.previousSeasonTable || [];
  const hasPrevious = previousTable.length > 0;
  const table = seasonView === 'previous' && hasPrevious ? previousTable : currentTable;

  const log = player.career.roundResultsLog || [];
  const selected = roundIdx === null ? log[log.length - 1] : log[roundIdx];
  const teamName = (id) => INITIAL_TEAMS.find((t) => t.id === id)?.name || id;
  const teamLogo = (id) => INITIAL_TEAMS.find((t) => t.id === id)?.logo || '⚽';

  const zonesUsed = [];
  table.forEach((_, i) => {
    const z = zoneFor(i + 1, table.length, confederation);
    if (z && !zonesUsed.some((zz) => zz.key === z.key)) zonesUsed.push(z);
  });

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>League</h1>
          <div className="sub">
            {player.club.flag} {player.club.leagueName}
            {hasPrevious && seasonView === 'previous' ? ` · ${player.career.previousSeasonYear} mavsumi (${player.career.previousSeasonLeagueName})` : ''}
          </div>
        </div>
        {hasPrevious && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn" style={seasonView === 'current' ? { background: 'var(--glass-fill-strong)' } : undefined} onClick={() => setSeasonView('current')}>Bu sezon</button>
            <button className="btn" style={seasonView === 'previous' ? { background: 'var(--glass-fill-strong)' } : undefined} onClick={() => setSeasonView('previous')}>O'tgan sezon</button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">JADVAL</div>
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
              {table.map((row, i) => {
                const zone = zoneFor(i + 1, table.length, confederation);
                const isPlayerRow = row.teamId === player.club.id;
                return (
                  <tr
                    key={row.teamId}
                    style={{
                      ...(isPlayerRow ? { background: 'rgba(255,215,0,0.08)', fontWeight: 600 } : undefined),
                      borderLeft: zone ? `3px solid ${zone.color}` : '3px solid transparent'
                    }}
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
                );
              })}
            </tbody>
          </table>
        </div>
        {zonesUsed.length > 0 && (
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12, fontSize: 12 }}>
            {zonesUsed.map((z) => (
              <div key={z.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: z.color, display: 'inline-block' }} />
                <span className="sub">{z.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {seasonView === 'current' && log.length > 0 && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{selected.round}-TUR NATIJALARI</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="btn"
                style={{ padding: '4px 10px', fontSize: 12 }}
                disabled={(roundIdx ?? log.length - 1) <= 0}
                onClick={() => setRoundIdx(Math.max(0, (roundIdx ?? log.length - 1) - 1))}
              >
                ← Oldingi
              </button>
              <button
                className="btn"
                style={{ padding: '4px 10px', fontSize: 12 }}
                disabled={(roundIdx ?? log.length - 1) >= log.length - 1}
                onClick={() => setRoundIdx(Math.min(log.length - 1, (roundIdx ?? log.length - 1) + 1))}
              >
                Keyingi →
              </button>
            </div>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {selected.matches.map((m, i) => {
              const involvesPlayer = m.home === player.club.id || m.away === player.club.id;
              return (
                <div key={i} className="list-row" style={involvesPlayer ? { color: 'var(--accent-gold)' } : undefined}>
                  <span>{teamLogo(m.home)} {teamName(m.home)} - {teamName(m.away)} {teamLogo(m.away)}</span>
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
