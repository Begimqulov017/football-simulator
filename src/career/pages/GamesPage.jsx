import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';
import { getPlayerFixtures } from '../utils/season';
import { INITIAL_TEAMS } from '../../data/teamsData';

export default function GamesPage() {
  const { player, pendingWorldMatch, waitingForAdmin } = useGame();
  const navigate = useNavigate();
  if (!player) return null;

  const fixtures = getPlayerFixtures(player);
  const played = fixtures.filter((f) => f.played).reverse();
  const upcoming = fixtures.filter((f) => !f.played);
  const injured = !!player.career.injury;

  // PHASE 11: o'yin FAQAT serverdagi kutilayotgan (pending) match orqali, o'z kunida, LiveMatch'da o'ynaladi.
  const tomorrow = (() => { const d = new Date(player.career.gameDate); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); })();
  const dueNow = !!(pendingWorldMatch && pendingWorldMatch.date && pendingWorldMatch.date <= tomorrow);
  const isDueLeague = (f) => dueNow && pendingWorldMatch.competition === 'league' && pendingWorldMatch.round === f.round;
  const isDueCup = (cup, i) => dueNow && pendingWorldMatch.competition === 'cup' && cup === player.career.domesticCup && cup.fixtures[i]?.round === pendingWorldMatch.round && !cup.fixtures[i]?.played;
  const handlePlay = () => navigate('/world-match');

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Matchday</h1>
          <div className="sub">{player.club.name} · {player.club.leagueName}</div>
        </div>
        <span className="badge badge-green">Round {Math.min(played.length + 1, fixtures.length)} of {fixtures.length}</span>
      </div>

      {waitingForAdmin && !dueNow && (
        <div className="card" style={{ marginBottom: 18, background: '#FFFBEB', borderColor: '#FDE68A' }}>
          <b>Siz adminga yetib oldingiz.</b> Admin keyingi kunni o'tkazishini kuting - o'yinlar o'z kunida, umumiy simulyatsiyada o'ynaladi.
        </div>
      )}
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
              const isNextPlayable = isDueCup(cup, i);
              return (
                <div key={i} className="list-row" style={{ paddingLeft: 8 }}>
                  <span>{cup.roundNames[i] || `Round ${i + 1}`}: {opp?.logo} {opp?.name || '?'}</span>
                  {f.played ? (
                    <span className={`badge ${f.golFor > f.golAgainst ? 'badge-green' : f.golFor < f.golAgainst ? 'badge-red' : ''}`}>{f.golFor}-{f.golAgainst}</span>
                  ) : isNextPlayable ? (
                    <button className="btn btn-primary" style={{ padding: '4px 14px', fontSize: 12 }} onClick={handlePlay}>
                      ▶ Play
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
              const isNext = isDueLeague(f);
              return (
                <div key={f.round} className="list-row">
                  <span>{f.opponentLogo} {f.isHome ? 'vs' : '@'} {f.opponent}</span>
                  {isNext ? (
                    <button className="btn btn-primary" style={{ padding: '4px 14px', fontSize: 12 }} onClick={handlePlay}>
                      ▶ Play
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
          {played.length === 0 && <div className="sub" style={{ padding: 12 }}>No matches played yet - your first match appears here once the admin advances the day.</div>}
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
