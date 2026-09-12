import React from 'react';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';

const TYPE_ICON = { club: '🏟️', transfer: '💸', contract: '📄' };

export default function MessagesPage() {
  const { player, markMessageRead, acceptTransferOffer, acceptContractOffer, declineOffer } = useGame();
  if (!player) return null;

  const messages = [...player.career.messages].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <AppShell>
      <div className="page-header"><h1>Messages & Suggests</h1></div>

      {messages.length === 0 && (
        <div className="card">
          <p className="sub">No messages yet - clubs will reach out here with match reports, transfer interest and contract offers.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m) => (
          <div
            key={m.id}
            className="card"
            style={!m.read ? { borderColor: 'rgba(255,215,0,0.4)' } : undefined}
            onClick={() => !m.read && markMessageRead(m.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div>
                <div className="card-title">{TYPE_ICON[m.type] || '✉️'} {m.subject}</div>
                <div className="sub" style={{ fontSize: 12 }}>{m.from} · {m.date}</div>
              </div>
              {!m.read && <span className="badge badge-gold">New</span>}
              {m.resolved && m.outcome && (
                <span className={`badge ${m.outcome === 'accepted' ? 'badge-green' : 'badge-red'}`}>
                  {m.outcome === 'accepted' ? 'Accepted' : 'Declined'}
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>{m.body}</p>

            {!m.resolved && (m.type === 'transfer' || m.type === 'contract') && (
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (m.type === 'transfer') acceptTransferOffer(m.id);
                    else acceptContractOffer(m.id);
                  }}
                >
                  Accept
                </button>
                <button className="btn" onClick={(e) => { e.stopPropagation(); declineOffer(m.id); }}>
                  Decline
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
