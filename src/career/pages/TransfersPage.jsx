import React from 'react';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';

export default function TransfersPage() {
  const { player } = useGame();
  if (!player) return null;

  const log = player.career.transferLog || [];
  const recent = [...log].reverse().slice(0, 20);
  const top10 = [...log].sort((a, b) => b.fee - a.fee).slice(0, 10);
  const totalVolume = log.reduce((s, t) => s + t.fee, 0);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Transfers</h1>
          <div className="sub">Transfer market activity across the football world</div>
        </div>
        <span className="badge badge-gold">${totalVolume.toFixed(1)}M total volume</span>
      </div>

      {log.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div className="sub">The transfer window is quiet right now - check back after a few more matchdays.</div>
        </div>
      )}

      {log.length > 0 && (
        <div className="grid grid-2">
          <div className="card">
            <div className="card-title">TOP 10 BIGGEST TRANSFERS</div>
            <div style={{ maxHeight: 440, overflowY: 'auto' }}>
              {top10.map((t) => (
                <div key={t.id} className="list-row">
                  <span>
                    {t.playerName} <span className="sub">({t.playerPos}, {t.ovr} OVR)</span>
                    <br />
                    <span className="sub">{t.fromLogo} {t.fromClub} → {t.toLogo} {t.toClub}</span>
                  </span>
                  <span className="badge badge-gold">${t.fee.toFixed(1)}M</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">RECENT TRANSFERS</div>
            <div style={{ maxHeight: 440, overflowY: 'auto' }}>
              {recent.map((t) => (
                <div key={t.id} className="list-row">
                  <span>
                    {t.playerName}
                    <br />
                    <span className="sub">{t.fromClub} → {t.toClub} · {t.date}</span>
                  </span>
                  <span className="badge">${t.fee.toFixed(1)}M</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
