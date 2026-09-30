import React from 'react';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';

export default function AllStatsPage() {
  const { player } = useGame();
  if (!player) return null;

  const c = player.career;
  const history = [...(c.matchHistory || [])].reverse();
  const ratings = c.matchRatings || [];
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;
  const bestRating = history.reduce((best, h) => Math.max(best, h.rating || 0), 0);
  const goalsPerGame = c.appearances ? (c.goals / c.appearances) : 0;
  const assistsPerGame = c.appearances ? (c.assists / c.appearances) : 0;
  const wins = history.filter((h) => h.golFor > h.golAgainst).length;
  const draws = history.filter((h) => h.golFor === h.golAgainst).length;
  const losses = history.filter((h) => h.golFor < h.golAgainst).length;

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>All Stats</h1>
          <div className="sub">{player.name} {player.surname} · {player.position} · {player.club.name}</div>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <div className="result-card">
          <div className="value">{c.appearances || 0}</div>
          <div className="label">Appearances</div>
        </div>
        <div className="result-card">
          <div className="value" style={{ color: 'var(--accent-green)' }}>{c.goals || 0}</div>
          <div className="label">Goals</div>
        </div>
        <div className="result-card">
          <div className="value" style={{ color: 'var(--accent-blue)' }}>{c.assists || 0}</div>
          <div className="label">Assists</div>
        </div>
        <div className="result-card">
          <div className="value">{avgRating ? avgRating.toFixed(2) : '-'}</div>
          <div className="label">Avg Rating</div>
        </div>
        <div className="result-card">
          <div className="value">{bestRating ? bestRating.toFixed(1) : '-'}</div>
          <div className="label">Best Rating</div>
        </div>
        <div className="result-card">
          <div className="value" style={{ color: 'var(--accent-gold)' }}>{c.mvpCount || 0}</div>
          <div className="label">MOTM Awards</div>
        </div>
        <div className="result-card">
          <div className="value">{goalsPerGame.toFixed(2)}</div>
          <div className="label">Goals / Game</div>
        </div>
        <div className="result-card">
          <div className="value">{assistsPerGame.toFixed(2)}</div>
          <div className="label">Assists / Game</div>
        </div>
        <div className="result-card">
          <div className="value">{(c.trophies || []).length}</div>
          <div className="label">Trophies</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">TEAM RECORD (with you involved)</div>
          <div className="grid grid-3">
            <div className="result-card">
              <div className="value" style={{ color: 'var(--accent-green)' }}>{wins}</div>
              <div className="label">Wins</div>
            </div>
            <div className="result-card">
              <div className="value" style={{ color: 'var(--accent-gold)' }}>{draws}</div>
              <div className="label">Draws</div>
            </div>
            <div className="result-card">
              <div className="value" style={{ color: 'var(--accent-red)' }}>{losses}</div>
              <div className="label">Losses</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">FORM (last {ratings.length})</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ratings.length === 0 && <div className="sub" style={{ padding: 8 }}>No matches played yet.</div>}
            {ratings.map((r, i) => (
              <span
                key={i}
                className={`badge ${r >= 7.5 ? 'badge-green' : r >= 6 ? 'badge-gold' : 'badge-red'}`}
              >
                {r.toFixed(1)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-title">SEASON BY SEASON</div>
        {(!c.seasonHistory || c.seasonHistory.length === 0) && (
          <div className="sub" style={{ padding: 12 }}>No completed seasons yet - finish your first season to see a year-by-year breakdown here.</div>
        )}
        {c.seasonHistory && c.seasonHistory.length > 0 && (
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {[...c.seasonHistory].reverse().map((s, i) => (
              <div key={i} className="list-row">
                <span>
                  {s.year} · {s.club}
                  <span className="sub" style={{ marginLeft: 8 }}>{s.league} · #{s.position}</span>
                </span>
                <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className="badge">{s.appearances} GP · {s.goals}G {s.assists}A</span>
                  {s.wonLeague && <span className="badge badge-gold">🏆 Champion</span>}
                  {s.wonGoldenBoot && <span className="badge badge-green">⚽ Golden Boot</span>}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-title">MATCH HISTORY</div>
        {history.length === 0 && <div className="sub" style={{ padding: 12 }}>No matches played yet.</div>}
        <div style={{ maxHeight: 420, overflowY: 'auto' }}>
          {history.map((h) => (
            <div key={h.id} className="list-row">
              <span>
                {h.opponentLogo} {h.isHome ? 'vs' : '@'} {h.opponent}
                <span className="sub" style={{ marginLeft: 8 }}>{h.date}</span>
              </span>
              <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span className={`badge ${h.golFor > h.golAgainst ? 'badge-green' : h.golFor === h.golAgainst ? 'badge-gold' : 'badge-red'}`}>
                  {h.golFor}-{h.golAgainst}
                </span>
                {h.injured ? (
                  <span className="badge badge-red">Injured</span>
                ) : (
                  <span className="badge">{h.rating?.toFixed(1)} · {h.goals}G {h.assists}A</span>
                )}
                {h.mvp && <span className="badge badge-gold">MOTM</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
