import React, { useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';
import { INBOX_TABS, categoryOf, unreadCounts } from '../utils/messageGenerator';

const TYPE_ICON = {
  club: '🏟️', transfer: '💸', contract: '📄', scout: '🔎', teammate: '🗣️',
  coach: '📋', national: '🌍', milestone: '🎉', system: '⚙️'
};

const EMPTY_TEXT = {
  all: 'No messages yet - your coach, club and national team will reach out here.',
  coach: 'No messages from your coach yet. Play a match and you will get a performance report.',
  club: 'No club messages yet - transfer interest, contract offers and teammates show up here.',
  national: 'No national team messages yet. Keep your rating high to earn a call-up.',
  system: 'No system notices.',
  starred: 'Nothing starred yet. Tap the ☆ on a message to keep it here.'
};

const RED = 'var(--accent-red)';

function UnreadDot({ title = 'Unread' }) {
  return (
    <span
      title={title}
      aria-label={title}
      style={{
        display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
        background: RED, boxShadow: '0 0 8px rgba(239, 68, 68, 0.7)', flex: 'none'
      }}
    />
  );
}

export default function MessagesPage() {
  const { player, updatePlayer, markMessageRead, acceptTransferOffer, acceptContractOffer, declineOffer } = useGame();
  const [tab, setTab] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const allMessages = player?.career?.messages;

  // Newest first. Messages from the same day keep insertion order (later = newer).
  const sorted = useMemo(() => (
    (allMessages || [])
      .map((m, i) => ({ m, i }))
      .sort((a, b) => (a.m.date === b.m.date ? b.i - a.i : a.m.date < b.m.date ? 1 : -1))
      .map(({ m }) => m)
  ), [allMessages]);

  const counts = useMemo(() => unreadCounts(allMessages), [allMessages]);

  const visible = useMemo(() => sorted.filter((m) => {
    if (tab === 'starred' ? !m.starred : tab !== 'all' && categoryOf(m) !== tab) return false;
    if (unreadOnly && m.read) return false;
    return true;
  }), [sorted, tab, unreadOnly]);

  if (!player) return null;

  const toggleStar = (id) => updatePlayer((prev) => ({
    career: {
      ...prev.career,
      messages: prev.career.messages.map((m) => (m.id === id ? { ...m, starred: !m.starred } : m))
    }
  }));

  const markVisibleRead = () => {
    const ids = new Set(visible.filter((m) => !m.read).map((m) => m.id));
    if (!ids.size) return;
    updatePlayer((prev) => ({
      career: {
        ...prev.career,
        messages: prev.career.messages.map((m) => (ids.has(m.id) ? { ...m, read: true } : m))
      }
    }));
  };

  const visibleUnread = visible.filter((m) => !m.read).length;

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Messages & Suggests</h1>
          <div className="sub">
            {counts.total ? `${counts.total} unread` : 'All caught up'} · {sorted.length} total
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn${unreadOnly ? '' : ' btn-ghost'}`}
            aria-pressed={unreadOnly}
            onClick={() => setUnreadOnly((v) => !v)}
          >
            Unread only
          </button>
          <button type="button" className="btn btn-ghost" disabled={!visibleUnread} onClick={markVisibleRead}>
            Mark all read
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div role="tablist" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {INBOX_TABS.map(({ key, label }) => {
          const hasUnread = counts[key] > 0 && key !== 'all' && key !== 'starred';
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`btn${tab === key ? '' : ' btn-ghost'}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              onClick={() => setTab(key)}
            >
              {key === 'starred' ? '★ ' : ''}{label}
              {hasUnread && <UnreadDot title={`${counts[key]} unread`} />}
            </button>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="card">
          <p className="sub">{unreadOnly ? 'No unread messages in this tab.' : EMPTY_TEXT[tab]}</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visible.map((m) => {
          const icon = TYPE_ICON[m.type] || '✉️';
          return (
            <div
              key={m.id}
              className="card"
              style={!m.read ? { borderColor: 'rgba(239, 68, 68, 0.45)', cursor: 'pointer' } : undefined}
              onClick={() => !m.read && markMessageRead(m.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {!m.read && <UnreadDot />}
                    <span>{icon} {m.subject}</span>
                  </div>
                  <div className="sub" style={{ fontSize: 12 }}>{m.from} · {m.date}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 'none' }}>
                  {!m.read && <span className="badge badge-gold">New</span>}
                  {m.resolved && m.outcome && (
                    <span className={`badge ${m.outcome === 'accepted' ? 'badge-green' : 'badge-red'}`}>
                      {m.outcome === 'accepted' ? 'Accepted' : 'Declined'}
                    </span>
                  )}
                  <button
                    type="button"
                    aria-pressed={!!m.starred}
                    aria-label={m.starred ? 'Remove star' : 'Star this message'}
                    title={m.starred ? 'Remove star' : 'Star this message'}
                    onClick={(e) => { e.stopPropagation(); toggleStar(m.id); }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: 2, fontSize: 20, lineHeight: 1,
                      color: m.starred ? 'var(--accent-gold)' : 'var(--text-muted)'
                    }}
                  >
                    {m.starred ? '★' : '☆'}
                  </button>
                </div>
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
          );
        })}
      </div>
    </AppShell>
  );
}
