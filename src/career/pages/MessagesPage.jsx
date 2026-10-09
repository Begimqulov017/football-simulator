import React, { useCallback, useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import NegotiationModal from '../transfers/NegotiationModal';
import { buildContext, startNegotiation, getTeam } from '../transfers/transferUtils';
import { useGame } from '../context/GameContext';
import { INBOX_TABS, categoryOf, unreadCounts } from '../utils/messageGenerator';

const LIVE_STAGES = ['offer', 'counter', 'final', 'accepted'];
const RENEW_KEY = (clubId) => `renew_${clubId}`;

const TYPE_ICON = {
  club: '🏟️', transfer: '💸', contract: '📄', scout: '🔎', teammate: '🗣️',
  coach: '📋', national: '🌍', milestone: '🎉', system: '⚙️'
};

const EMPTY_TEXT = {
  all: "Hozircha xabarlar yo'q — murabbiy, klub va terma jamoa shu yerda sizga yozadi.",
  coach: "Murabbiydan hali xabar yo'q. O'yin o'ynang — o'yin hisobotini olasiz.",
  club: "Klub xabarlari hali yo'q — transfer qiziqishi, shartnoma takliflari va jamoadoshlar shu yerda ko'rinadi.",
  national: "Terma jamoadan xabar yo'q. Chaqiruv olish uchun reytingingizni baland tuting.",
  system: "Tizim xabarlari yo'q.",
  starred: "Belgilangan xabar yo'q. Xabarni shu yerda saqlash uchun ☆ ni bosing."
};

const RED = 'var(--accent-red)';

function UnreadDot({ title = "O'qilmagan" }) {
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
  const {
    player, updatePlayer, markMessageRead, acceptTransferOffer, acceptContractOffer, declineOffer,
    saveNegotiation, completeNegotiatedTransfer, completeContractRenewal,
  } = useGame();
  const [tab, setTab] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [activeMsgId, setActiveMsgId] = useState(null); // JONLI muzokara ochilgan xabar
  const [fresh, setFresh] = useState(null);             // hali saqlanmagan (yangi boshlangan) muzokara

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

  const career = player?.career;
  const activeMsg = activeMsgId ? (allMessages || []).find((m) => m.id === activeMsgId) || null : null;
  const isRenewal = activeMsg?.type === 'contract';

  // Muzokara kontekst: transfer taklifi -> yangi klub; shartnoma yangilash -> hozirgi klub (summasiz).
  const negoCtx = useMemo(() => {
    if (!player || !activeMsg || !activeMsg.offer) return null;
    const team = isRenewal ? getTeam(player.club?.id) : getTeam(activeMsg.offer.teamId);
    if (!team) return null;
    return buildContext({ player, career: player.career, team, offer: activeMsg.offer, renewal: isRenewal });
  }, [activeMsg, isRenewal, player?.overall, player?.age, player?.potential, career?.day, career?.freeAgent, career?.contract]); // eslint-disable-line react-hooks/exhaustive-deps

  const negoKey = negoCtx ? (isRenewal ? RENEW_KEY(player.club.id) : negoCtx.team.id) : null;
  const persistedNego = negoKey ? (career?.negotiations || {})[negoKey] : null;
  const negotiation = persistedNego && LIVE_STAGES.includes(persistedNego.stage) ? persistedNego : fresh;

  const openNegotiation = useCallback((m) => {
    if (!player || !m.offer) return;
    const renewal = m.type === 'contract';
    const team = renewal ? getTeam(player.club?.id) : getTeam(m.offer.teamId);
    if (!team) return;
    const key = renewal ? RENEW_KEY(player.club.id) : team.id;
    const existing = (player.career.negotiations || {})[key];
    if (existing && LIVE_STAGES.includes(existing.stage) && existing.messageId === m.id) {
      setFresh(null);
    } else {
      const c = buildContext({ player, career: player.career, team, offer: m.offer, renewal });
      setFresh({ ...startNegotiation(c, player.career.day, m.id), teamId: key });
    }
    if (!m.read) markMessageRead(m.id);
    setActiveMsgId(m.id);
  }, [player, markMessageRead]);

  const closeRoom = useCallback(() => { setActiveMsgId(null); setFresh(null); }, []);
  const handleNegoChange = (next) => saveNegotiation(next.teamId, { ...next, teamId: negoKey });
  const handleNegoWalk = (next) => {
    saveNegotiation(negoKey, { ...next, teamId: negoKey });
    if (next.messageId) declineOffer(next.messageId);
    closeRoom();
  };
  const handleNegoSign = (deal) => {
    if (isRenewal) completeContractRenewal({ ...deal, teamId: player.club.id });
    else completeNegotiatedTransfer(deal);
    closeRoom();
  };

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
          <h1>Xabarlar va takliflar</h1>
          <div className="sub">
            {counts.total ? `${counts.total} ta o'qilmagan` : "Hammasi o'qilgan"} · jami {sorted.length} ta
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn${unreadOnly ? '' : ' btn-ghost'}`}
            aria-pressed={unreadOnly}
            onClick={() => setUnreadOnly((v) => !v)}
          >
            Faqat o'qilmaganlar
          </button>
          <button type="button" className="btn btn-ghost" disabled={!visibleUnread} onClick={markVisibleRead}>
            Hammasini o'qilgan deb belgilash
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
              {hasUnread && <UnreadDot title={`${counts[key]} ta o'qilmagan`} />}
            </button>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="card">
          <p className="sub">{unreadOnly ? "Bu bo'limda o'qilmagan xabar yo'q." : EMPTY_TEXT[tab]}</p>
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
                  {!m.read && <span className="badge badge-gold">Yangi</span>}
                  {m.resolved && m.outcome && (
                    <span className={`badge ${m.outcome === 'accepted' ? 'badge-green' : 'badge-red'}`}>
                      {m.outcome === 'accepted' ? 'Qabul qilindi' : 'Rad etildi'}
                    </span>
                  )}
                  <button
                    type="button"
                    aria-pressed={!!m.starred}
                    aria-label={m.starred ? 'Belgini olib tashlash' : 'Xabarni belgilash'}
                    title={m.starred ? 'Belgini olib tashlash' : 'Xabarni belgilash'}
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
                <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (m.type === 'transfer') acceptTransferOffer(m.id);
                      else acceptContractOffer(m.id);
                    }}
                  >
                    Qabul qilish
                  </button>
                  {m.offer && (
                    <button
                      className="btn"
                      style={{ borderColor: 'var(--accent-gold)', fontWeight: 700 }}
                      onClick={(e) => { e.stopPropagation(); openNegotiation(m); }}
                    >
                      🤝 Muzokara qilish
                    </button>
                  )}
                  <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); declineOffer(m.id); }}>
                    Rad etish
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {negoCtx && negotiation && activeMsg && !activeMsg.resolved && (
        <NegotiationModal
          key={negoKey}
          ctx={negoCtx}
          negotiation={negotiation}
          currentWage={career.weeklyWage}
          onChange={handleNegoChange}
          onWalk={handleNegoWalk}
          onSign={handleNegoSign}
          onClose={closeRoom}
        />
      )}
    </AppShell>
  );
}
