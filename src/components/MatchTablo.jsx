import React from 'react';

export default function MatchTablo({
  teamA,
  teamB,
  score,
  matchTime,
  addedTime,
  isFinished,
  isPaused,
  isFinishing,
  speedMode,
  redCardsA,
  redCardsB,
  liveTicker,
  onTogglePause,
  onToggleSpeed,
  onFinish,
}) {
  const timeLabel = () => {
    if (isFinished) return `TUGADI (${90 + addedTime}')`;
    if (matchTime > 90) return `${isPaused ? 'PAUZA' : 'LIVE'}: 90+${matchTime - 90}'`;
    return `${isPaused ? 'PAUZA' : 'LIVE'}: ${matchTime}'`;
  };

  return (
    <div className="match-hero">
      <div className="match-hero-comp">🏆 Tezkor O'yin • Do'stona Uchrashuv</div>

      <div className="match-hero-teams">
        <div className="hero-team">
          <span className="hero-logo">{teamA.logo}</span>
          <span className="hero-team-name">{teamA.name}</span>
          {redCardsA > 0 && <span style={{ color: '#fca5a5', fontSize: '10px', fontWeight: 'bold' }}>🔴 {redCardsA}</span>}
        </div>

        <div className="hero-center">
          <div className="hero-live-badge">{timeLabel()}</div>
          <div className="hero-score">{score.a} - {score.b}</div>
          {!isFinished && liveTicker && (
            <div className="hero-ticker">{liveTicker}</div>
          )}
        </div>

        <div className="hero-team">
          <span className="hero-logo">{teamB.logo}</span>
          <span className="hero-team-name">{teamB.name}</span>
          {redCardsB > 0 && <span style={{ color: '#fca5a5', fontSize: '10px', fontWeight: 'bold' }}>🔴 {redCardsB}</span>}
        </div>
      </div>

      <div className="hero-controls">
        {!isFinished && (
          <button className="hero-ctrl-btn" onClick={onTogglePause} disabled={isFinishing}>
            <span className="hero-ctrl-icon">{isPaused ? '▶' : '⏸'}</span>
            <span className="hero-ctrl-label">{isPaused ? 'Davom' : 'Pauza'}</span>
          </button>
        )}
        {!isFinished && (
          <button className={`hero-ctrl-btn ${speedMode === 'fast' ? 'fast-active' : ''}`} onClick={onToggleSpeed} disabled={isFinishing}>
            <span className="hero-ctrl-icon">⏩</span>
            <span className="hero-ctrl-label">{speedMode === 'fast' ? 'Tez rejim' : 'Tezlashtirish'}</span>
          </button>
        )}
        {!isFinished && (
          <button className="hero-ctrl-btn" onClick={onFinish} disabled={isFinishing}>
            <span className="hero-ctrl-icon">⏭</span>
            <span className="hero-ctrl-label">{isFinishing ? 'Yakunlanmoqda' : 'Tugatish'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
