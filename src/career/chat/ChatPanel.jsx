import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Badge } from '../../components/ui';
import { fetchChat, sendChatMessage, pinChatMessage, deleteChatMessage, muteUser } from '../utils/careerApi';

const MAX_LEN = 300;
const POLL_MS = 5000;

const timeOf = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const roleBadge = (r) => (r === 'admin' ? <Badge tone="accent" className="!px-2 !py-0.5 !text-[10px]">Admin</Badge> : r === 'moderator' ? <Badge tone="brand" className="!px-2 !py-0.5 !text-[10px]">Mod</Badge> : null);

// Chat paneli. `moderate` true bo'lsa admin/moderator uchun pin / o'chirish / mute
// tugmalari chiqadi (server baribir rolni o'zi tekshiradi).
export default function ChatPanel({ currentUser, moderate = false, height = 420, onModerated }) {
  const [state, setState] = useState({ loading: true, error: null, messages: [], pinned: [], me: null });
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState(null);
  const listRef = useRef(null);
  const stick = useRef(true);

  const load = useCallback(async () => {
    const d = await fetchChat();
    if (!d.ok) { setState((s) => ({ ...s, loading: false, error: d.error || "Chatni yuklab bo'lmadi" })); return; }
    // Phase 9 snapshot: bitta `pinned` obyekt; Phase 10 paneli ro'yxat kutadi
    const pinnedList = d.pinned ? [d.pinned] : [];
    const messages = (d.messages || []).map((m) => ({ ...m, role: m.role || (m.isAdmin ? 'admin' : 'user'), pinned: !!(d.pinned && d.pinned.id === m.id) }));
    setState({ loading: false, error: null, messages, pinned: pinnedList.map((m) => ({ ...m, role: m.role || (m.isAdmin ? 'admin' : 'user'), pinned: true })), me: d.me });
  }, []);

  useEffect(() => { load(); const t = setInterval(load, POLL_MS); return () => clearInterval(t); }, [load]);
  useEffect(() => {
    const el = listRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [state.messages]);

  const onScroll = () => {
    const el = listRef.current;
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
  };

  const muted = state.me?.muted;
  const submit = async (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || sending) return;
    setSending(true); setNote(null);
    const r = await sendChatMessage(t);
    setSending(false);
    if (r.ok) { setText(''); stick.current = true; load(); } else { setNote(r.error || 'Yuborilmadi'); if (r.code === 'muted') load(); }
  };

  const act = async (fn, okText) => {
    const r = await fn();
    setNote(r.ok ? okText : (r.error || 'Amal bajarilmadi'));
    await load();
    if (r.ok && onModerated) onModerated();
  };
  const onMute = (m, v) => {
    if (!v) return;
    const body = v === 'forever' ? { forever: true, reason: 'Chat qoidalarini buzish' } : { minutes: Number(v), reason: 'Chat qoidalarini buzish' };
    act(() => muteUser(m.username, body), `${m.username} mute qilindi`);
  };

  const canActOn = (m) => moderate && m.username !== currentUser?.username && !(m.role === 'admin');
  const isAdmin = state.me?.role === 'admin';

  const Row = ({ m, compact }) => (
    <li className={`group px-3 py-2 ${m.pinned && !compact ? 'bg-amber-50/60' : ''}`}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-extrabold text-sm text-ink">{m.username}</span>
        {roleBadge(m.role)}
        <span className="text-[11px] text-ink-subtle tabular-nums">{timeOf(m.at)}</span>
        {m.pinned && !compact && <span className="text-[11px] font-bold text-amber-700">biriktirilgan</span>}
        {moderate && (
          <span className="ml-auto flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
            <button type="button" className="text-[11px] font-bold text-accent-dark bg-transparent border-0 cursor-pointer font-sans" onClick={() => act(() => pinChatMessage(m.id), m.pinned ? 'Pin olib tashlandi' : 'Xabar biriktirildi')}>{m.pinned ? 'Unpin' : 'Pin'}</button>
            {(m.role !== 'admin' || isAdmin) && <button type="button" className="text-[11px] font-bold text-red-600 bg-transparent border-0 cursor-pointer font-sans" onClick={() => act(() => deleteChatMessage(m.id), "Xabar o'chirildi")}>O'chirish</button>}
            {canActOn(m) && (
              <select aria-label={`${m.username}ni mute qilish`} className="text-[11px] font-bold bg-surface-card border border-surface-line rounded-md px-1.5 py-0.5 font-sans cursor-pointer" value="" onChange={(e) => onMute(m, e.target.value)}>
                <option value="">Mute…</option>
                <option value="10">10 daqiqa</option><option value="60">1 soat</option><option value="1440">24 soat</option>
                {isAdmin && <option value="forever">Doimiy</option>}
              </select>
            )}
          </span>
        )}
      </div>
      <div className="text-sm text-ink-soft mt-0.5 break-words">{m.text}</div>
    </li>
  );

  return (
    <div className="flex flex-col rounded-card border border-surface-line bg-surface-card overflow-hidden">
      {state.pinned.length > 0 && (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="px-3 pt-2 text-[11px] font-extrabold text-amber-800">Biriktirilgan xabarlar</div>
          <ul className="list-none m-0 p-0 max-h-32 overflow-y-auto">{state.pinned.map((m) => <Row key={`p_${m.id}`} m={m} compact />)}</ul>
        </div>
      )}
      <div ref={listRef} onScroll={onScroll} style={{ height }} className="overflow-y-auto" aria-live="polite">
        {state.loading ? <div className="p-6 text-sm text-ink-muted text-center">Yuklanmoqda…</div>
          : state.error ? <div className="p-6 text-sm text-red-700 text-center">{state.error}</div>
          : state.messages.length === 0 ? <div className="p-6 text-sm text-ink-muted text-center">Hali xabar yo'q. Birinchi bo'lib yozing.</div>
          : <ul className="list-none m-0 p-0 divide-y divide-surface-line">{state.messages.map((m) => <Row key={m.id} m={m} />)}</ul>}
      </div>
      <form onSubmit={submit} className="border-t border-surface-line p-3 flex flex-col gap-2 bg-surface">
        {muted && <div className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-control px-3 py-2">{muted.forever ? 'Siz doimiy mute qilingansiz.' : `Siz ${new Date(muted.until).toLocaleString()} gacha mute qilingansiz.`}{muted.reason ? ` Sabab: ${muted.reason}` : ''}</div>}
        <div className="flex gap-2">
          <input
            className="flex-1 min-w-0 font-sans text-sm text-ink bg-surface-card border border-surface-line rounded-control px-3 py-2 placeholder:text-ink-subtle focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
            placeholder={muted ? 'Mute davrida yozib bo\'lmaydi' : 'Xabar yozing…'} value={text} maxLength={MAX_LEN} disabled={!!muted}
            onChange={(e) => setText(e.target.value)} aria-label="Chat xabari"
          />
          <Button type="submit" size="md" variant="primary" disabled={!!muted || sending || !text.trim()}>Yuborish</Button>
        </div>
        <div className="flex justify-between text-[11px] text-ink-muted"><span role="status">{note}</span><span className="tabular-nums">{text.length}/{MAX_LEN}</span></div>
      </form>
    </div>
  );
}
