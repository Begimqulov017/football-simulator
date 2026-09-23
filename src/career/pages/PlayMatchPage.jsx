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

export default function PlayMatchPage() {
  const { player, pendingMatchday, prepareMatchday, commitMatchday } = useGame();
  const navigate = useNavigate();

  const [minute, setMinute] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [finished, setFinished] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const timerRef = useRef(null);

  // If someone lands here directly (refresh, back button) without a pending
  // matchday prepared yet, prepare one on mount - never during render itself.
  // If it turns out there genuinely isn't a matchday to play, bounce home. If
  // preparing it throws for any reason, show a clear recoverable error
  // instead of leaving the page stuck on "Loading..." forever.
  useEffect(() => {
    if (!pendingMatchday) {
      try {
        const prepared = prepareMatchday();
        if (!prepared || !prepared.matchInfo) navigate('/home', { replace: true });
      } catch (err) {
        console.error('Failed to prepare matchday', err);
        setLoadError("O'yinni tayyorlashda xatolik yuz berdi. Iltimos, bosh sahifaga qaytib qayta urinib ko'ring.");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Safety net: if nothing has resolved (no record, no redirect, no error)
  // within a few seconds, don't leave the person staring at a spinner.
  useEffect(() => {
    if (pendingMatchday) return undefined;
    const t = setTimeout(() => {
      setLoadError((prev) => prev || "O'yin yuklanmadi. Internetni tekshiring yoki bosh sahifaga qaytib qayta urinib ko'ring.");
    }, 6000);
    return () => clearTimeout(t);
  }, [pendingMatchday]);

  const record = pendingMatchday;
  const matchInfo = record?.matchInfo;

  const timeline = useMemo(() => buildMatchTimeline(matchInfo), [matchInfo]);
  // Stoppage time is rolled once per match (memoized on matchInfo identity),
  // not on every render - otherwise the "full time" threshold would keep
  // jumping around as the minute counter re-renders every tick.
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

  if (loadError) {
    return (
      <AppShell>
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <p style={{ color: 'var(--accent-red)', marginBottom: 16 }}>{loadError}</p>
          <button className="btn btn-primary" onClick={() => navigate('/home', { replace: true })}>
            Bosh sahifaga qaytish
          </button>
        </div>
      </AppShell>
    );
  }

  if (!record || !matchInfo) {
    return (
      <AppShell>
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>Yuklanmoqda...</div>
      </AppShell>
    );
  }

  const { opponentName, opponentLogo, isHome, pStats } = matchInfo;
  const passedEvents = timeline.filter((e) => e.minute <= minute);
  const passedGoals = passedEvents.filter((e) => e.kind === 'goal');
  const liveGolFor = passedGoals.filter((e) => e.side === 'for').length;
  const liveGolAgainst = passedGoals.filter((e) => e.side === 'against').length;
  const mvp = isMvpPerformance(pStats);

  const homeName = isHome ? player.club.name : opponentName;
  const awayName = isHome ? opponentName : player.club.name;
  const homeLogo = isHome ? player.club.logo : opponentLogo;
  const awayLogo = isHome ? opponentLogo : player.club.logo;
  const homeGoals = isHome ? liveGolFor : liveGolAgainst;
  const awayGoals = isHome ? liveGolAgainst : liveGolFor;

  const handleContinue = () => {
    commitMatchday();
    navigate('/home', { replace: true });
  };

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Matchday</h1>
          <div className="sub">{player.club.leagueName}</div>
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
          {[...passedEvents].reverse().map((e) => {
            if (e.kind === 'card') {
              const teamName = e.side === 'for' ? player.club.name : opponentName;
              const icon = e.card?.type === 'red' ? '🟥' : '🟨';
              return (
                <div key={e.id} className="list-row">
                  <span>{icon} {e.minute}' — {e.card?.name || 'Noma\'lum futbolchi'} ({teamName}) kartochka oldi</span>
                </div>
              );
            }
            let label;
            if (e.side === 'for') {
              if (e.isPlayerGoal) label = 'Siz gol urdingiz!';
              else if (e.isPlayerAssist) label = `${e.scorerName || 'Jamoadosh'} gol urdi (assist: siz)`;
              else label = `${e.scorerName || player.club.name} gol urdi${e.assistName ? ` (assist: ${e.assistName})` : ''}`;
            } else {
              label = `${e.scorerName || opponentName} gol urdi${e.assistName ? ` (assist: ${e.assistName})` : ''}`;
            }
            return (
              <div key={e.id} className="list-row">
                <span>⚽ {e.minute}' — {label}</span>
                {e.isPlayerGoal && <span className="badge badge-gold">GOAL</span>}
                {e.isPlayerAssist && <span className="badge badge-green">ASSIST</span>}
              </div>
            );
          })}
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
            Continue
          </button>
        </div>
      )}
    </AppShell>
  );
}
