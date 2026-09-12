import React from 'react';
import AppShell from '../components/AppShell';
import NotStarted from '../components/NotStarted';
import { useGame } from '../context/GameContext';
import { INITIAL_TEAMS } from '../data/teamsData';
import { getMergedSquad } from '../data/clubRosterStore';

function initials(fullName) {
  return fullName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function ClubPage() {
  const { player } = useGame();
  if (!player) return null;

  const team = INITIAL_TEAMS.find((t) => t.id === player.club.id);
  // Built-in squad + every human-created player (anyone, from any save on
  // this browser) who has ever joined this club - a shared/global roster,
  // not just this player's own view of it.
  const squad = team ? getMergedSquad(team) : [];
  const starters = squad.slice(0, 11);
  const bench = squad.slice(11);
  const rows = [starters.slice(0, 3), starters.slice(3, 6), starters.slice(6, 10), starters.slice(10, 11)];

  const cardStyle = (p) => ({
    width: 64, height: 64, borderRadius: 14,
    background: 'var(--glass-fill)',
    border: p.id === player.id ? '2px solid var(--accent-gold)' : '1px solid var(--glass-border)',
    boxShadow: p.id === player.id ? '0 0 0 3px rgba(255, 200, 60, 0.15)' : 'none',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-display)', position: 'relative'
  });

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>{player.club.name}</h1>
          <div className="sub">{player.club.flag} {player.club.leagueName}</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">SQUAD</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {rows.map((row, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                {row.map((p) => (
                  <div
                    key={p.id}
                    title={`${p.name} · ${p.pos} · OVR ${p.ovr ?? '-'}${p.isUser ? ' · Player-created' : ''}${p.id === player.id ? ' (You)' : ''}`}
                    style={cardStyle(p)}
                  >
                    <span style={{ fontSize: 13 }}>{initials(p.name)}</span>
                    <span style={{ fontSize: 10, color: 'var(--accent-gold)' }}>{p.ovr ?? '-'}</span>
                    {p.isUser && (
                      <span style={{ position: 'absolute', top: -6, right: -6, fontSize: 11 }}>
                        {p.id === player.id ? '⭐' : '👤'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="grid" style={{ gap: 18 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="card-title">CLUB NAME AND LOGO</div>
            <div style={{ fontSize: 44 }}>{player.club.logo}</div>
            <div style={{ fontFamily: 'var(--font-display)', marginTop: 6 }}>{player.club.name}</div>
          </div>

          <div className="card">
            <div className="card-title">BENCH PLAYERS</div>
            <div style={{ maxHeight: 220, overflowY: 'auto' }}>
              {bench.map((p) => (
                <div
                  key={p.id}
                  className="list-row"
                  style={p.id === player.id ? { color: 'var(--accent-gold)' } : undefined}
                >
                  <span>{p.name}{p.isUser && p.id !== player.id ? ' 👤' : ''}{p.id === player.id ? ' ⭐ (You)' : ''}</span>
                  <span className="badge">{p.pos} · {p.ovr ?? '-'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">NEXT THREE GAMES</div>
            <NotStarted icon="📅" title="Fixtures not started" desc="Matchday goes live from 1 August 2026." />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
