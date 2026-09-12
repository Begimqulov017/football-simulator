import React from 'react';

export default function StatBar({ label, value, max = 99, tone = 'green' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="stat-row">
      <div className="stat-label">{label}</div>
      <div className="stat-track">
        <div className={`stat-fill ${tone !== 'green' ? tone : ''}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="stat-value">{Math.round(value)}</div>
    </div>
  );
}
