import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';
import { getPlayerFixtures } from '../utils/season';
import { INITIAL_TEAMS } from '../data/teamsData';

export default function GamesPage() {
  const { player, matchdayNext, prepareMatchday } = useGame();
  const navigate = useNavigate();
  if (!player) return null;

  const fixtures = getPlayerFixtures(player);
  const played = fixtures.filter((f) => f.played).reverse();
  const upcoming = fixtures.filter((f) => !f.played);
  const injured = !!player.career.injury;

  // matchdayNext could be a league round OR a cup fixture - only show the
  // "Play" button next to whichever one is actually due tomorrow, so
  // clicking it never surprises the person with a different match.
  const newDate = (() => { const d = new Date(player.career.gameDate); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); })();
  const nextIsLeagueFixture = matchdayNext && upcoming[0]?.date === newDate;
  const nextCupFixture = matchdayNext && !nextIsLeagueFixture
    ? [player.career.domesticCup, player.career.continentalCup].filter(Boolean).find((c) => c.fixtures[c.stage]?.date === newDate && !c.fixtures[c.stage]?.played)
    : null;

  const handlePlay = () => {
    if (injured) return;
    try {
      prepareMatchday();
      navigate('/play-match');
    } catch (err) {
      console.error('Failed to prepare matchday', err);
      alert("O'yinni tayyorlashda xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    }
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

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-title">CUPS</div>
        {[player.career.domesticCup, player.career.continentalCup].filter(Boolean).map((cup, idx) => (
          <div key={idx} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontWeight: 600 }}>{cup.name}</span>
              {cup.won ? <span className="badge badge-gold">🏆 Won</span> : cup.eliminated ? <span className="badge badge-red">Eliminated</span> : <span className="badge badge-green">In progress</span>}
            </div>
            {cup.fixtures.map((f, i) => {
              const opp = INITIAL_TEAMS.find((t) => t.id === f.opponentId);
              const isNextPlayable = nextCupFixture === cup && i === cup.stage;
              return (
                <div key={i} className="list-row" style={{ paddingLeft: 8 }}>
                  <span>{cup.roundNames[i] || `Round ${i + 1}`}: {opp?.logo} {opp?.name || '?'}</span>
                  {f.played ? (
                    <span className={`badge ${f.won ? 'badge-green' : 'badge-red'}`}>{f.golFor}-{f.golAgainst}</span>
                  ) : isNextPlayable ? (
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
        ))}
        {!player.career.domesticCup && !player.career.continentalCup && (
          <div className="sub" style={{ padding: 8 }}>No active cup competitions.</div>
        )}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">UPCOMING FIXTURES ({upcoming.length})</div>
          {upcoming.length === 0 && <div className="sub" style={{ padding: 12 }}>Season complete.</div>}
          <div style={{ maxHeight: 480, overflowY: 'auto' }}>
            {upcoming.map((f, i) => {
              const isNext = i === 0 && nextIsLeagueFixture;
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
        </div>

        <div className="card">
          <div className="card-title">RESULTS ({played.length})</div>
          {played.length === 0 && <div className="sub" style={{ padding: 12 }}>No matches played yet - hit Play on your next fixture.</div>}
          <div style={{ maxHeight: 480, overflowY: 'auto' }}>
            {played.map((f) => {
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
      </div>
    </AppShell>
  );
}
