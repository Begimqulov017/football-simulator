import React from 'react';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';
import { getPlayerFixtures } from '../utils/season';

export default function GamesPage() {
  const { player } = useGame();
  if (!player) return null;

  const fixtures = getPlayerFixtures(player);
  const played = fixtures.filter((f) => f.played).reverse();
  const upcoming = fixtures.filter((f) => !f.played);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Matchday</h1>
          <div className="sub">{player.club.name} · {player.club.leagueName}</div>
        </div>
        <span className="badge badge-green">Round {played.length + 1} of {fixtures.length}</span>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">UPCOMING FIXTURES</div>
          {upcoming.length === 0 && <div className="sub" style={{ padding: 12 }}>Season complete.</div>}
          {upcoming.slice(0, 6).map((f) => (
            <div key={f.round} className="list-row">
              <span>{f.opponentLogo} {f.isHome ? 'vs' : '@'} {f.opponent}</span>
              <span className="badge">{f.date}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">RESULTS</div>
          {played.length === 0 && <div className="sub" style={{ padding: 12 }}>No matches played yet - hit Next Day on Home.</div>}
          {played.slice(0, 10).map((f) => {
            const won = f.golFor > f.golAgainst;
            const drew = f.golFor === f.golAgainst;
            return (
              <div key={f.round} className="list-row">
                <span>{f.opponentLogo} {f.isHome ? 'vs' : '@'} {f.opponent}</span>
                <span className={`badge ${won ? 'badge-green' : drew ? 'badge-gold' : 'badge-red'}`}>
                  {f.golFor} - {f.golAgainst}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
