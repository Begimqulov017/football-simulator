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
          <div className="card-title">INTERNATIONAL</div>
          {player.career?.international?.caps ? (
            <>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>
                {player.career.international.country}
              </div>
              <div className="sub" style={{ marginTop: 6 }}>
                {player.career.international.caps} caps · {player.career.international.goals || 0} gol · {player.career.international.assists || 0} assist
              </div>
              {!!(player.career.international.trophies || []).length && (
                <div style={{ marginTop: 8 }}>
                  {player.career.international.trophies.map((t, i) => (
                    <span key={i} className="badge badge-gold" style={{ marginRight: 6, marginBottom: 4, display: 'inline-block' }}>
                      🏆 {t.name} {t.year}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <NotStarted icon="🌍" title="No caps yet" desc="Terma jamoaga eng yaxshi futbolchilar chaqiriladi — reytingingizni oshiring." />
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-title">CONTRACT</div>
        {player.career.freeAgent ? (
          <div style={{ color: 'var(--accent-red)', fontSize: 14 }}>
            🆓 You're a free agent - waiting for club offers in your Messages.
          </div>
        ) : player.career.contract ? (
          <>
            <div className="list-row">
              <span>Years remaining</span>
              <span>{Math.max(0, Math.ceil((player.career.contract.signedDay + player.career.contract.yearsTotal * 365 - player.career.day) / 365))} / {player.career.contract.yearsTotal}</span>
            </div>
            <div className="list-row"><span>Weekly wage</span><span>${player.career.weeklyWage.toLocaleString()}</span></div>
          </>
        ) : (
          <div className="sub">No contract on file.</div>
        )}
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
