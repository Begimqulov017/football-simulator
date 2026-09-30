import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';
import { buildMatchTimeline } from '../utils/season';
import { isMvpPerformance } from '../utils/statCalc';

const SPEEDS = [
  { id: 1, label: '1x', ms: 260 },
  { id: 2, label: '2x', ms: 130 },
  { id: 4, label: '4x', ms: 60 }
];

// Shown whenever the admin has resolved a new shared-world matchday that
// involved the player's club - the outcome is already final (decided
// server-side, possibly together with other real players on either side),
// this screen just plays it back for the person to watch.
export default function LiveResultPage() {
  const { player, acknowledgeResult } = useGame();
  const navigate = useNavigate();

  const [minute, setMinute] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef(null);

  const matchInfo = player?.career?.lastMatchResult;
  const timeline = useMemo(() => buildMatchTimeline(matchInfo), [matchInfo]);
  const finalMinute = useMemo(() => 90 + 1 + Math.floor(Math.random() * 4), [matchInfo]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!matchInfo) return undefined;
    const speedDef = SPEEDS.find((s) => s.id === speed) || SPEEDS[0];
    timerRef.current = setInterval(() => {
      setMinute((m) => {
        if (m >= finalMinute) {
          clearInterval(timerRef.current);
          setFinished(true);
          return m;
        }
        return m + 1;
      });
    }, speedDef.ms);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed, matchInfo, finalMinute]);

  if (!player) return null;
  if (!matchInfo) {
    navigate('/home', { replace: true });
    return null;
  }

  const { opponentName, opponentLogo, isHome, pStats } = matchInfo;
  const passedEvents = timeline.filter((e) => e.minute <= minute);
  const liveGolFor = passedEvents.filter((e) => e.side === 'for').length;
  const liveGolAgainst = passedEvents.filter((e) => e.side === 'against').length;
  const mvp = isMvpPerformance(pStats);

  const homeName = isHome ? player.club.name : opponentName;
  const awayName = isHome ? opponentName : player.club.name;
  const homeLogo = isHome ? player.club.logo : opponentLogo;
  const awayLogo = isHome ? opponentLogo : player.club.logo;
  const homeGoals = isHome ? liveGolFor : liveGolAgainst;
  const awayGoals = isHome ? liveGolAgainst : liveGolFor;

  const handleContinue = async () => {
    await acknowledgeResult();
    navigate('/home', { replace: true });
  };

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Umumiy dunyo natijasi</h1>
          <div className="sub">{player.club.leagueName} · Admin tomonidan hal qilindi</div>
        </div>
        {!finished && (
          <div style={{ display: 'flex', gap: 6 }}>
            {SPEEDS.map((s) => (
              <button
                key={s.id}
                className="btn"
                style={{
                  padding: '6px 12px', fontSize: 12,
                  borderColor: speed === s.id ? 'var(--accent-gold)' : undefined,
                  color: speed === s.id ? 'var(--accent-gold)' : undefined
                }}
                onClick={() => setSpeed(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ textAlign: 'center', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 40 }}>{homeLogo}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, marginTop: 4 }}>{homeName}</div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, minWidth: 120 }}>
            {homeGoals} - {awayGoals}
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 40 }}>{awayLogo}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, marginTop: 4 }}>{awayName}</div>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <span className={`badge ${finished ? 'badge-gold' : 'badge-green'}`}>
            {finished ? 'FULL TIME' : `${minute}'`}
          </span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-title">MATCH EVENTS</div>
        <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {passedEvents.length === 0 && (
            <div className="sub" style={{ padding: 8 }}>{finished ? 'A quiet match, no goals.' : 'Kick-off...'}</div>
          )}
          {[...passedEvents].reverse().map((e) => (
            <div key={e.id} className="list-row">
              <span>
                ⚽ {e.minute}' —{' '}
                {e.side === 'for'
                  ? (e.isPlayerGoal ? 'You scored!' : e.isPlayerAssist ? 'Teammate scores (assist: you)' : `${player.club.name} scores`)
                  : `${opponentName} scores`}
              </span>
              {e.isPlayerGoal && <span className="badge badge-gold">GOAL</span>}
              {e.isPlayerAssist && <span className="badge badge-green">ASSIST</span>}
            </div>
          ))}
        </div>
      </div>

      {finished && (
        <div className="card card--glow-green" style={{ textAlign: 'center' }}>
          <div className="card-title">YOUR PERFORMANCE</div>
          {!pStats.played ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
              You stayed on the bench this time - keep training to force your way into the XI.
            </p>
          ) : (
            <>
              {mvp && (
                <div style={{ marginBottom: 10 }}>
                  <span className="badge badge-gold" style={{ fontSize: 13, padding: '6px 14px' }}>⭐ MAN OF THE MATCH</span>
                </div>
              )}
              <div className="grid grid-3" style={{ marginBottom: 8 }}>
                <div className="result-card">
                  <div className="value" style={{ fontSize: 26 }}>{pStats.rating.toFixed(1)}</div>
                  <div className="label">Rating</div>
                </div>
                <div className="result-card">
                  <div className="value" style={{ fontSize: 26, color: 'var(--accent-green)' }}>{pStats.goals}</div>
                  <div className="label">Goals</div>
                </div>
                <div className="result-card">
                  <div className="value" style={{ fontSize: 26, color: 'var(--accent-blue)' }}>{pStats.assists}</div>
                  <div className="label">Assists</div>
                </div>
              </div>
              {pStats.injured && (
                <div className="badge badge-red" style={{ marginTop: 6 }}>
                  Injured - out for ~{pStats.injuryDays} days
                </div>
              )}
            </>
          )}
          <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={handleContinue}>
            Davom etish
          </button>
        </div>
      )}
    </AppShell>
  );
}
