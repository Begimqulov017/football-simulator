import React from 'react';
import AppShell from '../components/AppShell';
import NotStarted from '../components/NotStarted';
import StatBar from '../components/StatBar';
import { useGame } from '../context/GameContext';
import { MAIN_STAT_LABELS } from '../utils/statCalc';

export default function ProfilePage() {
  const { player } = useGame();
  if (!player) return null;

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>{player.name} {player.surname}</h1>
          <div className="sub">#{player.number} · {player.position} · Age {player.age}{player.nationality ? ` · ${player.nationality}` : ''}</div>
        </div>
        <span className="badge badge-gold">OVR {player.overall} · POT {player.potential}</span>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="card-title">NAME</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>{player.name} {player.surname}</div>
          <div className="card-title" style={{ marginTop: 14 }}>POSITION</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>{player.position}</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div className="card-title">CLUB LOGO</div>
          <div style={{ fontSize: 44 }}>{player.club.logo}</div>
          <div style={{ marginTop: 8, fontFamily: 'var(--font-display)' }}>{player.club.name}</div>
          <div className="sub">{player.club.flag} {player.club.leagueName}</div>
          {player.club.tier && (
            <span className={`badge${player.club.tier === 'starter' ? ' badge-gold' : ''}`} style={{ marginTop: 8, display: 'inline-block' }}>
              {player.club.tier === 'starter' ? '⭐ Starting XI' : '🪑 Bench'}
            </span>
          )}
        </div>

        <div className="card">
          <div className="card-title">TRANSFERS</div>
          <NotStarted icon="🔁" title="No transfer history" desc="Transfer negotiations aren't live yet." />
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="card-title">THIS SEASON</div>
          <div className="list-row"><span>Appearances</span><span>{player.career.seasonAppearances || 0}</span></div>
          <div className="list-row"><span>Goals</span><span>{player.career.seasonGoals || 0}</span></div>
          <div className="list-row"><span>Assists</span><span>{player.career.seasonAssists || 0}</span></div>
        </div>

        <div className="card">
          <div className="card-title">CAREER TOTALS</div>
          <div className="list-row"><span>Appearances</span><span>{player.career.appearances}</span></div>
          <div className="list-row"><span>Goals</span><span>{player.career.goals}</span></div>
          <div className="list-row"><span>Assists</span><span>{player.career.assists}</span></div>
          <div className="list-row">
            <span>Average Rating</span>
            <span>{player.career.matchRatings.length ? (player.career.matchRatings.reduce((a, b) => a + b, 0) / player.career.matchRatings.length).toFixed(1) : '—'}</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-title">WEEKLY WAGE</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--accent-gold)' }}>
          ${player.career.weeklyWage.toLocaleString()} / week
        </div>
        <div className="sub" style={{ marginTop: 4 }}>Balance: ${player.career.money.toLocaleString()}</div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">ALL STATS</div>
          {Object.entries(player.mainStats).map(([key, val]) => (
            <StatBar key={key} label={MAIN_STAT_LABELS[key]} value={val} />
          ))}
        </div>

        <div className="card">
          <div className="card-title">TROPHIES</div>
          {(!player.career.trophies || player.career.trophies.length === 0) ? (
            <NotStarted icon="🏆" title="No trophies yet" desc="Win silverware to fill your cabinet." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
              {[...player.career.trophies].reverse().map((t, i) => (
                <div key={i} className="list-row">
                  <span>{t.icon || '🏆'} {t.name}</span>
                  <span className="badge badge-gold">{t.year}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
