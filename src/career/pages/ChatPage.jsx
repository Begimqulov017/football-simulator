import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AppShell from '../components/AppShell';
import Icon from '../../components/Icon';
import { useGame } from '../context/GameContext';
import { fetchChat, sendChatMessage, pinChatMessage, deleteChatMessage, muteUser } from '../utils/careerApi';
import { setChatSeen } from '../utils/chatSeen';

// Phase 9 — Global Chat
//   • Hamma uchun ochiq chat; HTTP polling (~2.5s) bilan real-time
//   • Admin: xabarni pin qilish (bitta) va o'chirish
//   • @username teglari: matnda ajratib ko'rsatiladi, sizga tegilgan xabar sariq fon bilan
//   • Anti-spam: 60 soniyada 7 ta xabar, undan keyin 1 daqiqa cooldown (server majburlaydi,
//     bu yerda faqat hisoblagich va bloklash ko'rsatiladi)

const POLL_MS = 2500;
const MAX_LEN = 300;

const timeOf = (iso) => {
  try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; }
};

// Matnni bo'laklarga ajratadi: oddiy matn va haqiqiy foydalanuvchilarga @teglar
function renderText(text, mentions, me) {
  if (!mentions || !mentions.length) return text;
  const names = [...mentions].sort((a, b) => b.length - a.length);
  const escaped = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`(@(?:${escaped.join('|')}))(?![A-Za-z0-9_])`, 'gi');
  return text.split(re).map((part, i) => {
    if (part.startsWith('@') && names.some((n) => `@${n}`.toLowerCase() === part.toLowerCase())) {
      const isMe = part.slice(1).toLowerCase() === me.toLowerCase();
      return (
        <span key={i} className={`font-extrabold rounded px-1 ${isMe ? 'bg-amber-300 text-amber-950' : 'bg-accent-soft text-accent-dark'}`}>{part}</span>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function Message({ m, me, isStaff, isAdmin, pinned, onPin, onDelete, onMute }) {
  const mine = m.username === me;
  const tagged = (m.mentions || []).some((x) => x.toLowerCase() === me.toLowerCase()) && !mine;
  return (
    <div
      className={`group rounded-control px-3 py-2 border ${tagged ? 'bg-amber-50 border-amber-300 shadow-soft' : mine ? 'bg-accent-tint border-accent-soft' : 'bg-surface-card border-surface-line'}`}
      data-tagged={tagged ? 'true' : undefined}
    >
      <div className="flex items-center gap-2 text-xs">
        {m.clubLogo ? <span>{m.clubLogo}</span> : null}
        <span className="font-extrabold text-ink">{m.displayName}</span>
        <span className="text-ink-muted">@{m.username}</span>
        {m.isAdmin && <span className="text-[10px] font-extrabold bg-ink text-white rounded-full px-2 py-0.5">ADMIN</span>}
        {!m.isAdmin && m.role === 'moderator' && <span className="text-[10px] font-extrabold bg-brand text-white rounded-full px-2 py-0.5">MOD</span>}
        {tagged && <span className="text-[10px] font-extrabold bg-red-500 text-white rounded-full px-2 py-0.5">SIZGA TEG</span>}
        <span className="ml-auto text-ink-subtle">{timeOf(m.at)}</span>
      </div>
      <div className="mt-1 text-sm text-ink break-words whitespace-pre-wrap">{renderText(m.text, m.mentions, me)}</div>
      {isStaff && (
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] font-bold opacity-70 group-hover:opacity-100">
          <button type="button" onClick={() => onPin(m.id)} className="cursor-pointer text-accent-dark bg-transparent border-0 p-0 inline-flex items-center gap-1">
            <Icon name="pin" size={12} /> {pinned ? 'Pinni olish' : 'Pin qilish'}
          </button>
          <button type="button" onClick={() => onDelete(m.id)} className="cursor-pointer text-red-600 bg-transparent border-0 p-0 inline-flex items-center gap-1">
            <Icon name="trash" size={12} /> O'chirish
          </button>
          {!mine && !m.isAdmin && (
            <select aria-label={`${m.username}ni mute qilish`} value="" onChange={(e) => e.target.value && onMute(m, e.target.value)} className="text-[11px] font-bold bg-surface-card border border-surface-line rounded-md px-1.5 py-0.5 font-sans cursor-pointer">
              <option value="">Mute…</option>
              <option value="10">10 daqiqa</option><option value="60">1 soat</option><option value="1440">24 soat</option>
              {isAdmin && <option value="forever">Doimiy</option>}
            </select>
          )}
        </div>
      )}
    </div>
  );
}

export default function ChatPage({ currentUser }) {
  const { player } = useGame();
  const me = currentUser?.username || '';
  const isAdmin = !!currentUser?.isAdmin;
  const isStaff = isAdmin || currentUser?.role === 'moderator'; // Phase 10: moderator ham pin/delete/mute qila oladi

  const [messages, setMessages] = useState([]);
  const [pinned, setPinned] = useState(null);
  const [muted, setMuted] = useState(null);
  const [users, setUsers] = useState([]);
  const [rate, setRate] = useState({ remaining: 7, limit: 7, cooldownMs: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [suggest, setSuggest] = useState(null); // { query, start }
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const stickRef = useRef(true);
  const latestSeqRef = useRef(0);

  const applySnapshot = useCallback((r) => {
    setMessages(r.messages || []);
    setPinned(r.pinned || null);
    setMuted(r.me?.muted || null);
    setUsers(r.users || []);
    if (r.rate) {
      setRate(r.rate);
      if (r.rate.cooldownMs > 0) setCooldownUntil(Date.now() + r.rate.cooldownMs);
    }
    latestSeqRef.current = r.latestSeq || 0;
  }, []);

  // Polling
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      if (document.hidden) return;
      const r = await fetchChat();
      if (!alive) return;
      if (r && r.ok) { applySnapshot(r); setError(null); } else if (r) setError(r.error || 'Chatni yuklab bo\'lmadi');
      setLoading(false);
    };
    tick();
    const id = setInterval(tick, POLL_MS);
    const onVis = () => { if (!document.hidden) tick(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { alive = false; clearInterval(id); document.removeEventListener('visibilitychange', onVis); };
  }, [applySnapshot]);

  // Sahifa ochiq va xabarlar ko'rinib turibdi -> "ko'rildi" deb belgilaymiz (nav badge tozalanadi)
  useEffect(() => {
    if (me && latestSeqRef.current) setChatSeen(me, latestSeqRef.current);
  }, [messages, me]);

  // Cooldown sanagich
  useEffect(() => {
    if (cooldownUntil <= Date.now()) return undefined;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const cooldownLeft = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
  const coolingDown = !isAdmin && cooldownLeft > 0;

  // Pastga avtomatik skroll (foydalanuvchi tepaga chiqmagan bo'lsa)
  useEffect(() => {
    const el = listRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages]);
  const onScroll = () => {
    const el = listRef.current;
    if (el) stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  };

  // @tag takliflari
  const candidates = useMemo(() => {
    if (!suggest) return [];
    const q = suggest.query.toLowerCase();
    return users.filter((u) => u.username.toLowerCase().startsWith(q) && u.username !== me).slice(0, 5);
  }, [suggest, users, me]);

  const onChange = (e) => {
    const v = e.target.value.slice(0, MAX_LEN);
    setText(v);
    const pos = e.target.selectionStart ?? v.length;
    const m = /(^|\s)@([A-Za-z0-9_]*)$/.exec(v.slice(0, pos));
    setSuggest(m ? { query: m[2], start: pos - m[2].length - 1 } : null);
  };

  const pickUser = (username) => {
    const pos = inputRef.current?.selectionStart ?? text.length;
    const next = `${text.slice(0, suggest.start)}@${username} ${text.slice(pos)}`;
    setText(next.slice(0, MAX_LEN));
    setSuggest(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const submit = async () => {
    const t = text.trim();
    if (!t || sending || coolingDown || muted) return;
    setSending(true);
    setNotice(null);
    const r = await sendChatMessage(t);
    setSending(false);
    if (r.ok) {
      setText('');
      setSuggest(null);
      stickRef.current = true;
      setMessages((prev) => [...prev, r.message]);
      if (r.rate) setRate(r.rate);
      latestSeqRef.current = Math.max(latestSeqRef.current, r.message.seq || 0);
    } else {
      setNotice(r.error || 'Xabar yuborilmadi');
      if (r.code === 'muted') setMuted(r.muted || { until: null, forever: false, reason: '' });
      if (r.rateLimited) {
        setCooldownUntil(Date.now() + (r.retryAfterMs || 60000));
        setNow(Date.now());
        setRate((p) => ({ ...p, remaining: 0 }));
      }
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (suggest && candidates.length) pickUser(candidates[0].username);
      else submit();
    } else if (e.key === 'Escape') setSuggest(null);
  };

  const doPin = async (id) => { const r = await pinChatMessage(id); if (!r.ok) setNotice(r.error); else setPinned((p) => (p && p.id === id ? null : messages.find((m) => m.id === id) || null)); };
  const doMute = async (m, v) => {
    const body = v === 'forever' ? { forever: true, reason: 'Chat qoidalarini buzish' } : { minutes: Number(v), reason: 'Chat qoidalarini buzish' };
    const r = await muteUser(m.username, body);
    setNotice(r.ok ? `${m.username} mute qilindi` : (r.error || 'Mute bajarilmadi'));
  };
  const doDelete = async (id) => {
    if (!window.confirm("Xabar hamma uchun o'chirilsinmi?")) return;
    const r = await deleteChatMessage(id);
    if (!r.ok) setNotice(r.error);
    else { setMessages((prev) => prev.filter((m) => m.id !== id)); setPinned((p) => (p && p.id === id ? null : p)); }
  };

  if (!player) return null;

  const left = isAdmin ? null : rate.remaining;

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Global Chat</h1>
          <div className="sub">Barcha o'yinchilar uchun ochiq chat · @username bilan teg qiling</div>
        </div>
      </div>

      <div className="font-sans text-ink flex flex-col gap-3" style={{ maxWidth: 760 }}>
        {muted && (
          <div className="rounded-control border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700" role="alert">
            {muted.forever ? 'Siz doimiy mute qilingansiz.' : `Siz ${new Date(muted.until).toLocaleString()} gacha mute qilingansiz.`}{muted.reason ? ` Sabab: ${muted.reason}` : ''}
          </div>
        )}
        {pinned && (
          <div className="rounded-card border border-amber-300 bg-amber-50 px-4 py-3 shadow-soft" role="note" aria-label="Pin qilingan xabar">
            <div className="flex items-center gap-2 text-[11px] font-extrabold text-amber-800 mb-1">
              <Icon name="pin" size={13} /> PIN QILINGAN · {pinned.displayName}
              {isStaff && <button type="button" onClick={() => doPin(pinned.id)} className="ml-auto cursor-pointer bg-transparent border-0 text-amber-800 underline text-[11px] font-bold">Olib tashlash</button>}
            </div>
            <div className="text-sm text-ink break-words">{renderText(pinned.text, pinned.mentions, me)}</div>
          </div>
        )}

        <div
          ref={listRef}
          onScroll={onScroll}
          className="bg-surface-muted border border-surface-line rounded-card p-3 flex flex-col gap-2 overflow-y-auto"
          style={{ height: 'min(56vh, 520px)' }}
          aria-live="polite"
        >
          {loading && <div className="text-sm text-ink-muted text-center py-6">Yuklanmoqda…</div>}
          {!loading && error && <div className="text-sm text-red-600 text-center py-2">{error}</div>}
          {!loading && !messages.length && !error && <div className="text-sm text-ink-muted text-center py-10">Hali xabar yo'q. Birinchi bo'lib yozing 👋</div>}
          {messages.map((m) => (
            <Message key={m.id} m={m} me={me} isStaff={isStaff} isAdmin={isAdmin} pinned={pinned && pinned.id === m.id} onPin={doPin} onDelete={doDelete} onMute={doMute} />
          ))}
        </div>

        {notice && (
          <div className="rounded-control border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2" role="alert">{notice}</div>
        )}

        <div className="relative">
          {suggest && candidates.length > 0 && (
            <ul className="absolute bottom-full mb-1 left-0 w-64 bg-surface-card border border-surface-line rounded-control shadow-lift overflow-hidden z-10" role="listbox">
              {candidates.map((u) => (
                <li key={u.username}>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); pickUser(u.username); }} className="w-full text-left px-3 py-2 text-sm bg-transparent border-0 cursor-pointer hover:bg-surface-muted">
                    <b>@{u.username}</b> <span className="text-ink-muted text-xs">{u.displayName !== u.username ? u.displayName : ''}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={text}
              onChange={onChange}
              onKeyDown={onKeyDown}
              rows={2}
              disabled={coolingDown}
              placeholder={coolingDown ? `Cooldown: ${cooldownLeft} soniya…` : 'Xabar yozing… (@ bilan teg qiling, Enter — yuborish)'}
              className="flex-1 font-sans text-sm text-ink bg-surface-card border border-surface-line rounded-control px-3 py-2 resize-none focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:bg-surface-muted"
              aria-label="Xabar matni"
            />
            <button
              type="button"
              onClick={submit}
              disabled={!text.trim() || sending || coolingDown}
              className="font-sans text-sm font-extrabold rounded-control px-4 py-2.5 border-0 cursor-pointer bg-brand text-white disabled:bg-surface-line disabled:text-ink-subtle disabled:cursor-not-allowed"
            >
              {coolingDown ? `${cooldownLeft}s` : sending ? '…' : 'Yuborish'}
            </button>
          </div>
          <div className="mt-1.5 flex flex-wrap justify-between gap-2 text-[11px] text-ink-muted">
            <span>
              {isAdmin ? 'Admin: tezlik cheklovi yo\'q' : coolingDown
                ? `Juda ko'p xabar — ${cooldownLeft} soniyadan keyin yozishingiz mumkin`
                : `60 soniyada ${rate.limit || 7} tagacha xabar · qoldi: ${left}`}
            </span>
            <span>{text.length}/{MAX_LEN}</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
