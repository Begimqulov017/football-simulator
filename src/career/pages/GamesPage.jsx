import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';
import { getPlayerFixtures } from '../utils/season';

export default function GamesPage() {
  const { player, matchdayNext, prepareMatchday } = useGame();
  const navigate = useNavigate();
  if (!player) return null;

  const fixtures = getPlayerFixtures(player);
  const played = fixtures.filter((f) => f.played).reverse();
  const upcoming = fixtures.filter((f) => !f.played);
  const injured = !!player.career.injury;

  const handlePlay = () => {
    if (injured) return;
    prepareMatchday();
    navigate('/play-match');
  };

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
          {upcoming.slice(0, 6).map((f, i) => {
            const isNext = i === 0 && matchdayNext;
            return (
              <div key={f.round} className="list-row">
                <span>{f.opponentLogo} {f.isHome ? 'vs' : '@'} {f.opponent}</span>
                {isNext ? (
                  <button className="btn btn-primary" style={{ padding: '4px 14px', fontSize: 12 }} disabled={injured} onClick={handlePlay}>
                    {injured ? 'Injured' : '▶ Play'}
                  </button>
                ) : (
                  <span className="badge">{f.date}</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="card-title">RESULTS</div>
          {played.length === 0 && <div className="sub" style={{ padding: 12 }}>No matches played yet - hit Play on your next fixture.</div>}
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
