import React, { useState } from 'react';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';

const TYPE_ICON = { club: '🏟️', transfer: '💸', contract: '📄', scout: '🔎', teammate: '🗣️', national: '🌍' };

export default function MessagesPage() {
  const { player, markMessageRead, acceptTransferOffer, acceptContractOffer, submitContractCounter, declineOffer } = useGame();
  const [negotiatingId, setNegotiatingId] = useState(null);
  const [draftWage, setDraftWage] = useState('');
  const [draftYears, setDraftYears] = useState('');
  if (!player) return null;

  const messages = [...player.career.messages].sort((a, b) => (a.date < b.date ? 1 : -1));

  const openNegotiate = (m) => {
    setNegotiatingId(m.id);
    setDraftWage(String(m.offer.wage));
    setDraftYears(String(m.offer.years || 3));
  };

  const sendNegotiate = (m) => {
    submitContractCounter(m.id, { wage: draftWage, years: draftYears });
    setNegotiatingId(null);
  };

  return (
    <AppShell>
      <div className="page-header"><h1>Messages & Suggests</h1></div>

      {messages.length === 0 && (
        <div className="card">
          <p className="sub">No messages yet - clubs will reach out here with match reports, transfer interest and contract offers.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m) => {
          const awaitingClubResponse = m.type === 'contract' && !m.resolved && m.negotiation?.counterOffer && m.negotiation.awaitingClubSince;
          const canNegotiateMore = (m.negotiation?.round || 0) < 2;
          return (
            <div
              key={m.id}
              className="card"
              style={!m.read ? { borderColor: 'rgba(255,70,70,0.55)', boxShadow: '0 0 0 1px rgba(255,70,70,0.25)' } : undefined}
              onClick={() => !m.read && markMessageRead(m.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div>
                  <div className="card-title">{TYPE_ICON[m.type] || '✉️'} {m.subject}</div>
                  <div className="sub" style={{ fontSize: 12 }}>{m.from} · {m.date}</div>
                </div>
                {!m.read && <span className="badge badge-red">Yangi</span>}
                {m.resolved && m.outcome && (
                  <span className={`badge ${m.outcome === 'accepted' ? 'badge-green' : 'badge-red'}`}>
                    {m.outcome === 'accepted' ? 'Accepted' : 'Declined'}
                  </span>
                )}
                {awaitingClubResponse && <span className="badge">Waiting on club...</span>}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>{m.body}</p>

              {!m.resolved && m.type === 'transfer' && (
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); acceptTransferOffer(m.id); }}>Accept</button>
                  <button className="btn" onClick={(e) => { e.stopPropagation(); declineOffer(m.id); }}>Decline</button>
                </div>
              )}

              {!m.resolved && m.type === 'contract' && !awaitingClubResponse && negotiatingId !== m.id && (
                <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); acceptContractOffer(m.id); }}>Accept</button>
                  {canNegotiateMore && (
                    <button className="btn" onClick={(e) => { e.stopPropagation(); openNegotiate(m); }}>Negotiate</button>
                  )}
                  <button className="btn" onClick={(e) => { e.stopPropagation(); declineOffer(m.id); }}>Decline</button>
                </div>
              )}

              {!m.resolved && m.type === 'contract' && negotiatingId === m.id && (
                <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 12, padding: 12, borderRadius: 10, background: 'var(--glass-fill)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="sub" style={{ fontSize: 12 }}>O'z shartingizni yozing - klub 1 kun ichida javob beradi (rozi bo'ladi, qarshi taklif beradi, yoki juda ochko'z bo'lsa rad etadi):</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <label className="sub" style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      Haftalik maosh ($)
                      <input type="number" min="1" value={draftWage} onChange={(e) => setDraftWage(e.target.value)} style={{ width: 130, padding: 6, borderRadius: 6 }} />
                    </label>
                    <label className="sub" style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      Muddat (yil)
                      <input type="number" min="1" max="6" value={draftYears} onChange={(e) => setDraftYears(e.target.value)} style={{ width: 80, padding: 6, borderRadius: 6 }} />
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-primary" onClick={() => sendNegotiate(m)}>Yuborish</button>
                    <button className="btn" onClick={() => setNegotiatingId(null)}>Bekor qilish</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
