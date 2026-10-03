import React, { useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';
import { generateNews } from '../utils/season';
import { useNewsFeed, isFeatured } from '../utils/useNewsFeed';
import { NEWS_TYPES } from '../utils/newsGenerator';
import { NewsModal, CategoryChip, accentOf, newsDate } from '../news/newsUi';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthLabel = (key) => (key === 'unknown' ? 'Earlier' : `${MONTHS[Number(key.slice(5, 7)) - 1]} ${key.slice(0, 4)}`);

// Eski saqlanmalar (newsFeed yo'q) uchun oldingi generateNews() natijasini
// yangi shaklga o'tkazamiz - arxiv bo'sh qolmasin.
function legacyItems(player) {
  return generateNews(player).map((n) => ({
    id: `legacy_${n.id}`, type: 'legacy', day: -9999, date: n.date, priority: 1,
    icon: n.icon, accent: 'cyan', category: 'League Story', headline: n.headline,
    summary: n.body, body: [n.body], stats: [], tags: [], lineup: null,
  }));
}

const chipBase = 'cursor-pointer whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold transition-colors';
const chipOn = 'border-cyan-400/60 bg-cyan-400/15 text-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.25)]';
const chipOff = 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10';

export default function NewsPage() {
  const { player } = useGame();
  const { feed, day } = useNewsFeed(player);
  const [month, setMonth] = useState('all');
  const [type, setType] = useState('all');
  const [open, setOpen] = useState(null);

  const all = useMemo(() => {
    if (!player) return [];
    const ids = new Set(feed.map((n) => n.id));
    const old = feed.length < 5 ? legacyItems(player).filter((n) => !ids.has(n.id)) : [];
    return [...feed, ...old].sort((a, b) => ((a.date || '') < (b.date || '') ? 1 : (a.date || '') > (b.date || '') ? -1 : (b.priority || 0) - (a.priority || 0)));
  }, [player, feed]);

  const monthKeys = useMemo(() => {
    const counts = {};
    all.forEach((n) => { const k = n.date ? n.date.slice(0, 7) : 'unknown'; counts[k] = (counts[k] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [all]);

  const typeKeys = useMemo(() => [...new Set(all.map((n) => n.type).filter((t) => NEWS_TYPES[t]))], [all]);

  const shown = all.filter((n) => (month === 'all' || (n.date ? n.date.slice(0, 7) : 'unknown') === month) && (type === 'all' || n.type === type));

  const groups = useMemo(() => {
    const g = [];
    shown.forEach((n) => {
      const k = n.date ? n.date.slice(0, 7) : 'unknown';
      const last = g[g.length - 1];
      if (last && last.key === k) last.items.push(n); else g.push({ key: k, items: [n] });
    });
    return g;
  }, [shown]);

  if (!player) return null;

  const openIdx = open ? shown.findIndex((n) => n.id === open.id) : -1;
  const newer = openIdx > 0 ? () => setOpen(shown[openIdx - 1]) : null;
  const older = openIdx >= 0 && openIdx < shown.length - 1 ? () => setOpen(shown[openIdx + 1]) : null;

  return (
    <AppShell>
      <div
        className="relative -mx-2 overflow-hidden rounded-3xl border border-white/10 bg-[#05080f] p-4 text-slate-100 sm:p-6"
        style={{
          backgroundImage: 'radial-gradient(700px 320px at 10% -10%, rgba(167,139,250,0.14), transparent 60%), radial-gradient(600px 300px at 100% 0%, rgba(34,211,238,0.12), transparent 60%), linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: 'auto, auto, 36px 36px, 36px 36px',
        }}
      >
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-2xl font-black text-white sm:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>News</div>
            <div className="mt-1 text-sm text-slate-400">Storylines from around {player.club.leagueName} and your own career</div>
          </div>
          <span className="rounded-full border border-violet-400/40 bg-violet-400/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-violet-200">{shown.length} / {all.length} stories</span>
        </div>

        {all.length > 0 && (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0b1020]/90 p-4">
            <div>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Month</div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button type="button" onClick={() => setMonth('all')} className={`${chipBase} ${month === 'all' ? chipOn : chipOff}`}>All ({all.length})</button>
                {monthKeys.map(([k, c]) => (
                  <button key={k} type="button" onClick={() => setMonth(k)} className={`${chipBase} ${month === k ? chipOn : chipOff}`}>{monthLabel(k)} ({c})</button>
                ))}
              </div>
            </div>
            {typeKeys.length > 1 && (
              <div>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Category</div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setType('all')} className={`${chipBase} ${type === 'all' ? chipOn : chipOff}`}>All</button>
                  {typeKeys.map((t) => (
                    <button key={t} type="button" onClick={() => setType(t)} className={`${chipBase} ${type === t ? chipOn : chipOff}`}>{NEWS_TYPES[t].icon} {NEWS_TYPES[t].label}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {all.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#0b1020]/90 p-10 text-center">
            <div className="text-4xl">📰</div>
            <div className="mt-2 text-sm text-slate-400">Nothing to report yet - play a few more matchdays and headlines will start rolling in.</div>
          </div>
        )}

        {all.length > 0 && shown.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#0b1020]/90 p-8 text-center text-sm text-slate-400">No stories match this filter.</div>
        )}

        <div className="flex flex-col gap-6">
          {groups.map((g) => (
            <div key={g.key}>
              <div className="mb-2 flex items-center gap-3">
                <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300" style={{ fontFamily: 'var(--font-display)' }}>{monthLabel(g.key)}</div>
                <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/30 to-transparent" />
              </div>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {g.items.map((n) => {
                  const a = accentOf(n);
                  const live = isFeatured(n, day);
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setOpen(n)}
                      className={`group relative flex w-full cursor-pointer gap-3 overflow-hidden rounded-2xl border bg-[#0b1020]/90 p-4 text-left transition hover:-translate-y-0.5 hover:bg-[#101831] ${a.border}`}
                    >
                      <div className={`absolute inset-y-0 left-0 w-[3px] ${a.dot}`} />
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl">{n.icon}</div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <CategoryChip item={n} />
                          {live && <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-extrabold uppercase text-emerald-300">Featured</span>}
                          {n.involvesPlayer && <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-extrabold uppercase text-amber-300">You</span>}
                        </div>
                        <div className="text-sm font-extrabold leading-snug text-white">{n.headline}</div>
                        {n.summary && <div className="mt-1 line-clamp-2 text-xs text-slate-400">{n.summary}</div>}
                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                          <span>{newsDate(n)}</span>
                          <span className={`font-bold opacity-0 transition-opacity group-hover:opacity-100 ${a.text}`}>Preview →</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <NewsModal item={open} onClose={() => setOpen(null)} onPrev={newer} onNext={older} />
    </AppShell>
  );
}
