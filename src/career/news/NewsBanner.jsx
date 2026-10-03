import React, { useEffect, useState, useCallback } from 'react';
import { accentOf, CategoryChip, newsDate } from './newsUi';

export const AUTO_SLIDE_MS = 6000; // X soniya - avtomatik almashish oralig'i

// Home: bitta full-width "featured" yangilik kartasi. Auto-slide + Prev/Next.
export default function NewsBanner({ items, fallbackLabel, onOpen, onViewAll, modalOpen }) {
  const [idx, setIdx] = useState(0);
  const [hover, setHover] = useState(false);
  const count = items.length;
  const paused = hover || modalOpen;

  useEffect(() => { if (idx >= count) setIdx(0); }, [count, idx]);

  const go = useCallback((d) => setIdx((i) => (count ? (i + d + count) % count : 0)), [count]);

  useEffect(() => {
    if (count < 2 || paused) return undefined;
    const t = setTimeout(() => go(1), AUTO_SLIDE_MS);
    return () => clearTimeout(t);
  }, [idx, count, paused, go]);

  if (!count) {
    return (
      <div className="relative flex min-h-[220px] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020] p-8 text-center">
        <div>
          <div className="text-4xl">📰</div>
          <div className="mt-2 text-base font-extrabold text-white" style={{ fontFamily: 'var(--font-display)' }}>Quiet news day</div>
          <div className="mt-1 text-sm text-slate-400">Play a few matchdays - blowouts, star ratings, transfers and awards will headline here.</div>
        </div>
      </div>
    );
  }

  const item = items[idx];
  const a = accentOf(item);

  return (
    <section
      className={`group relative w-full overflow-hidden rounded-2xl border bg-gradient-to-br ${a.grad} ${a.border} ${a.glow}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-roledescription="carousel"
      aria-label="Featured news"
    >
      <style>{`@keyframes newsSlide{from{opacity:0;transform:translateX(26px)}to{opacity:1;transform:none}}@keyframes newsBar{from{width:0}to{width:100%}}`}</style>

      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '34px 34px' }} />
      <div key={`ico_${item.id}`} className="pointer-events-none absolute -right-2 top-1/2 -translate-y-1/2 select-none text-[190px] leading-none opacity-[0.13]" style={{ animation: 'newsSlide .6s ease-out both' }}>{item.icon}</div>

      <div key={item.id} className="relative flex min-h-[260px] flex-col justify-between gap-5 px-6 py-6 sm:px-10 sm:py-8" style={{ animation: 'newsSlide .55s cubic-bezier(.22,1,.36,1) both' }}>
        <div className="flex flex-wrap items-center gap-2">
          <CategoryChip item={item} />
          <span className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">{fallbackLabel || 'Featured'}</span>
          {item.involvesPlayer && <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">You</span>}
          <span className="text-[11px] font-semibold text-slate-400">{newsDate(item)}</span>
        </div>

        <div className="max-w-3xl">
          <div className="text-2xl font-black leading-tight text-white sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>{item.headline}</div>
          {item.summary && <div className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">{item.summary}</div>}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {(item.stats || []).slice(0, 4).map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-black/30 px-3 py-1.5 backdrop-blur">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{s.label}</div>
                <div className={`text-sm font-black tabular-nums ${a.text}`}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => onOpen(item)} className={`cursor-pointer rounded-xl border px-4 py-2 text-xs font-extrabold uppercase tracking-wider hover:brightness-125 ${a.chip}`}>Read story →</button>
            <button type="button" onClick={onViewAll} className="cursor-pointer rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-200 hover:bg-white/10">All news</button>
          </div>
        </div>
      </div>

      {count > 1 && (
        <>
          <button type="button" aria-label="Previous story" onClick={() => go(-1)} className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/50 text-lg font-bold text-white opacity-80 backdrop-blur hover:bg-black/70 hover:opacity-100">‹</button>
          <button type="button" aria-label="Next story" onClick={() => go(1)} className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/50 text-lg font-bold text-white opacity-80 backdrop-blur hover:bg-black/70 hover:opacity-100">›</button>
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
            {items.map((n, i) => (
              <button key={n.id} type="button" aria-label={`Story ${i + 1}`} onClick={() => setIdx(i)} className={`h-1.5 cursor-pointer rounded-full border-0 p-0 transition-all ${i === idx ? `w-6 ${a.dot}` : 'w-1.5 bg-white/30'}`} />
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/5">
            <div key={`bar_${idx}_${paused}`} className={`h-full ${a.bar}`} style={{ animation: paused ? 'none' : `newsBar ${AUTO_SLIDE_MS}ms linear both`, width: paused ? '100%' : undefined, opacity: paused ? 0.25 : 1 }} />
          </div>
        </>
      )}
    </section>
  );
}
