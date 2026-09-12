import React from 'react';

/**
 * Generic "not started yet" / "coming soon" placeholder used by every
 * page/panel that isn't wired up yet (All Stats, Messages, Transfers,
 * Matchday, League, Top Scorers, Money, Training).
 */
export default function NotStarted({ icon = '🚧', title = 'Not started yet', desc, badge = 'Not Started' }) {
  return (
    <div className="not-started">
      <div className="icon">{icon}</div>
      <div className="title">{title}</div>
      {desc && <div className="desc">{desc}</div>}
      <span className="badge badge-gold" style={{ marginTop: 6 }}>{badge}</span>
    </div>
  );
}
