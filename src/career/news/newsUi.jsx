import React, { useEffect } from 'react';
import { formatLongDate } from '../dashboard/timelineUtils';
import { TeamBadge } from '../../components/TeamLogo';

// Dark neon aksent palitrasi. Tailwind class'lari to'liq yozilgan (dynamic
// string yig'ilmaydi) - aks holda build paytida o'chib ketadi.
export const ACCENTS = {
  amber: { text: 'text-amber-300', chip: 'border-amber-400/40 bg-amber-400/10 text-amber-200', border: 'border-amber-400/30', glow: 'shadow-[0_0_40px_rgba(251,191,36,0.18)]', grad: 'from-amber-500/25 via-[#0b1020] to-[#070b14]', bar: 'bg-amber-400', dot: 'bg-amber-400' },
  cyan: { text: 'text-cyan-300', chip: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200', border: 'border-cyan-400/30', glow: 'shadow-[0_0_40px_rgba(34,211,238,0.18)]', grad: 'from-cyan-500/25 via-[#0b1020] to-[#070b14]', bar: 'bg-cyan-400', dot: 'bg-cyan-400' },
  emerald: { text: 'text-emerald-300', chip: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200', border: 'border-emerald-400/30', glow: 'shadow-[0_0_40px_rgba(52,211,153,0.18)]', grad: 'from-emerald-500/25 via-[#0b1020] to-[#070b14]', bar: 'bg-emerald-400', dot: 'bg-emerald-400' },
  violet: { text: 'text-violet-300', chip: 'border-violet-400/40 bg-violet-400/10 text-violet-200', border: 'border-violet-400/30', glow: 'shadow-[0_0_40px_rgba(167,139,250,0.2)]', grad: 'from-violet-500/25 via-[#0b1020] to-[#070b14]', bar: 'bg-violet-400', dot: 'bg-violet-400' },
  rose: { text: 'text-rose-300', chip: 'border-rose-400/40 bg-rose-400/10 text-rose-200', border: 'border-rose-400/30', glow: 'shadow-[0_0_40px_rgba(251,113,133,0.18)]', grad: 'from-rose-500/25 via-[#0b1020] to-[#070b14]', bar: 'bg-rose-400', dot: 'bg-rose-400' },
  fuchsia: { text: 'text-fuchsia-300', chip: 'border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-200', border: 'border-fuchsia-400/30', glow: 'shadow-[0_0_40px_rgba(232,121,249,0.18)]', grad: 'from-fuchsia-500/25 via-[#0b1020] to-[#070b14]', bar: 'bg-fuchsia-400', dot: 'bg-fuchsia-400' },
};
export const accentOf = (n) => ACCENTS[n?.accent] || ACCENTS.cyan;

export const newsDate = (n) => (n?.date ? formatLongDate(n.date) : '');

export function CategoryChip({ item }) {
  const a = accentOf(item);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${a.chip}`}>
      <span>{item.icon}</span>{item.category}
    </span>
  );
}

const SLOT_ORDER = [['FW', 'Forwards'], ['MID', 'Midfield'], ['DEF', 'Defence'], ['GK', 'Goalkeeper']];

function Lineup({ lineup, accent }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Starting XI · 4-3-3</div>
      <div className="flex flex-col gap-2">
        {SLOT_ORDER.map(([slot, label]) => {
          const row = lineup.filter((l) => l.slot === slot);
          if (!row.length) return null;
          return (
            <div key={slot}>
              <div className="mb-1 text-[10px] font-semibold text-slate-500">{label}</div>
              <div className="flex flex-wrap gap-1.5">
                {row.map((l, i) => (
                  <span key={`${l.name}_${i}`} className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs ${l.human ? `${accent.chip} font-extrabold` : 'border-white/10 bg-white/5 text-slate-200'}`}>
                    <span><TeamBadge value={l.logo} size={16} /></span>
                    <span className="font-semibold">{l.name}</span>
                    <span className="text-[10px] text-slate-400">{l.pos}</span>
                    {l.goals > 0 && <span className="text-[10px] text-amber-300">⚽{l.goals}</span>}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Boy yangilik preview modali (Home banner va News arxivi uchun umumiy)
export function NewsModal({ item, onClose, onPrev, onNext }) {
  useEffect(() => {
    if (!item) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, onClose, onPrev, onNext]);

  if (!item) return null;
  const a = accentOf(item);
  const body = Array.isArray(item.body) ? item.body : [item.body].filter(Boolean);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={item.headline}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border bg-[#070b14] text-slate-100 ${a.border} ${a.glow}`} style={{ animation: 'newsModalIn .28s ease-out both' }}>
        <style>{'@keyframes newsModalIn{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}'}</style>
        <div className={`relative overflow-hidden bg-gradient-to-br px-6 pb-5 pt-6 ${a.grad}`}>
          <div className="pointer-events-none absolute -right-4 -top-6 select-none text-[120px] leading-none opacity-15">{item.icon}</div>
          <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 h-8 w-8 cursor-pointer rounded-full border border-white/15 bg-black/40 text-base font-bold text-slate-200 hover:bg-white/10">✕</button>
          <div className="flex flex-wrap items-center gap-2">
            <CategoryChip item={item} />
            <span className="text-[11px] font-semibold text-slate-400">{newsDate(item)}</span>
          </div>
          <div className="mt-3 pr-8 text-2xl font-black leading-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>{item.headline}</div>
          {item.summary && <div className="mt-2 text-sm text-slate-300">{item.summary}</div>}
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
          {item.stats?.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {item.stats.map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{s.label}</div>
                  <div className={`mt-0.5 truncate text-lg font-black tabular-nums ${a.text}`}>{s.value}</div>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-3 text-sm leading-relaxed text-slate-300">
            {body.map((p, i) => <p key={i} style={{ margin: 0 }}>{p}</p>)}
          </div>
          {item.lineup?.length > 0 && <Lineup lineup={item.lineup} accent={a} />}
          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((t) => <span key={t} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-400">#{String(t).replace(/\s+/g, '')}</span>)}
            </div>
          )}
        </div>

        {(onPrev || onNext) && (
          <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
            <button type="button" onClick={onPrev} disabled={!onPrev} className="cursor-pointer rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/10 disabled:cursor-default disabled:opacity-30">← Newer</button>
            <button type="button" onClick={onNext} disabled={!onNext} className="cursor-pointer rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/10 disabled:cursor-default disabled:opacity-30">Older →</button>
          </div>
        )}
      </div>
    </div>
  );
}
