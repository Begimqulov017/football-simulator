import React, { useEffect, useRef } from 'react';
import { COMPETITION_STYLE } from './timelineUtils';
import TeamLogo from '../../components/TeamLogo';

const INTL_TINT = 'bg-violet-50 border-violet-200';

// 31 kunlik kalendar: mobilda gorizontal siljitiladigan lenta, desktopda 7 ustunli setka.
export default function Timeline({ days, selectedIso, onSelect }) {
  const todayRef = useRef(null);
  useEffect(() => {
    // Mobil lentada bugungi kun ko'rinib turishi uchun (sahifa scroll qilinmaydi)
    const el = todayRef.current;
    if (el && el.parentElement && el.parentElement.scrollWidth > el.parentElement.clientWidth) {
      el.parentElement.scrollLeft = Math.max(0, el.offsetLeft - 12);
    }
  }, [days[0]?.iso]);

  return (
    <div
      role="list"
      aria-label="31 kunlik kalendar"
      className="grid grid-flow-col auto-cols-[68px] gap-2 overflow-x-auto pb-2 snap-x md:grid-flow-row md:grid-cols-7 md:auto-cols-auto md:overflow-visible"
    >
      {days.map((d) => {
        const ev = d.events[0];
        const style = ev ? COMPETITION_STYLE[ev.kind] : null;
        const selected = selectedIso === d.iso;
        return (
          <button
            key={d.iso}
            ref={d.isToday ? todayRef : null}
            role="listitem"
            type="button"
            onClick={() => onSelect && onSelect(d.iso)}
            aria-label={`${d.day} ${d.monthLabel}${ev ? `, ${ev.kind === 'international' ? ev.opponent : `${ev.opponent} bilan o'yin`}` : ''}`}
            className={[
              'snap-start relative flex flex-col items-center gap-1 rounded-control border px-1.5 py-2 min-h-[92px] cursor-pointer font-sans',
              'transition-all duration-200 motion-safe:hover:-translate-y-0.5 hover:shadow-soft',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              d.isToday ? 'bg-ink text-white border-ink' : d.isTarget ? 'bg-accent-tint border-accent' : d.intl ? INTL_TINT : style ? `${style.tint} border-transparent` : 'bg-surface-card border-surface-line',
              selected && !d.isToday ? 'ring-2 ring-ink/70' : '',
            ].join(' ')}
          >
            <span className={`text-[10px] font-bold uppercase tracking-wide ${d.isToday ? 'text-white/70' : 'text-ink-muted'}`}>{d.weekday}</span>
            <span className="text-lg font-black tabular-nums leading-none">{d.day}</span>
            <span className={`text-[10px] font-semibold ${d.isToday ? 'text-white/70' : 'text-ink-subtle'}`}>{d.isFirstOfMonth ? d.monthLabel : '\u00A0'}</span>
            {ev ? (
              <span className="flex flex-col items-center gap-0.5">
                <span className="text-xl leading-none" title={ev.opponent}>{ev.teamId && !ev.isFlag ? <TeamLogo id={ev.teamId} logo={ev.logo} size={26} /> : ev.logo}</span>
                {ev.played ? (
                  <span className={`text-[10px] font-extrabold tabular-nums ${d.isToday ? 'text-white' : 'text-ink-soft'}`}>{ev.score || '✓'}</span>
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full ${d.intl ? 'bg-violet-500' : style.dot}`} />
                )}
              </span>
            ) : (
              <span className="h-[34px]" />
            )}
            {d.intl && !ev && <span className="text-base leading-none" title={d.intl.label}>{d.intlFlag}</span>}
            {d.events.length > 1 && (
              <span className="absolute top-1 right-1 text-[9px] font-extrabold bg-ink text-white rounded-full px-1">+{d.events.length - 1}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
