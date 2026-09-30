import React from 'react';
import { COMPETITION_STYLE, formatLongDate } from './timelineUtils';

function Row({ ev }) {
  const st = COMPETITION_STYLE[ev.kind];
  return (
    <div className={`flex items-center gap-3 rounded-control border border-surface-line px-3 py-2.5 ${st.tint}`}>
      <span className={`w-1.5 self-stretch rounded-full ${st.dot}`} />
      <span className="text-2xl">{ev.logo}</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-extrabold text-ink truncate">{ev.isHome ? 'vs' : '@'} {ev.opponent}</div>
        <div className={`text-[11px] font-semibold ${st.text}`}>{ev.competition}{ev.round ? ` · ${typeof ev.round === 'number' ? `${ev.round}-tur` : ev.round}` : ''}</div>
      </div>
      {ev.played && <span className="text-sm font-black tabular-nums text-ink">{ev.score}</span>}
    </div>
  );
}

// Kun o'yinlari: o'yinchining o'z o'yinlari + shu turdagi qolgan liga o'yinlari
export default function DayMatches({ plan }) {
  const { mode, iso, events, round, intl } = plan;
  const others = round.filter((m) => !m.mine);
  const baseTitle = mode === 'upcoming' ? "Ertangi kun o'yinlari" : mode === 'finished' ? "Bugungi o'yinlar (yakunlangan)" : "Bugun o'yin yo'q";
  const title = intl ? `🌍 ${intl.label}: ${baseTitle.toLowerCase()}` : baseTitle;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-sm font-extrabold text-ink">{title}</div>
        <div className="text-xs font-semibold text-ink-muted">{formatLongDate(iso)}</div>
      </div>

      {events.length === 0 && (
        <div className="rounded-control border border-dashed border-surface-line bg-surface px-4 py-5 text-center text-sm text-ink-muted">
          Jamoangizning o'yini yo'q — vaqtni keyingi kunga o'tkazing.
        </div>
      )}
      {events.map((ev, i) => <Row key={`${ev.kind}-${i}`} ev={ev} />)}

      {others.length > 0 && (
        <details className="group rounded-control border border-surface-line bg-surface-card">
          <summary className="cursor-pointer list-none px-3 py-2 text-xs font-bold text-ink-soft flex items-center justify-between">
            <span>Ligadagi boshqa o'yinlar ({others.length})</span>
            <span className="transition-transform group-open:rotate-180">⌄</span>
          </summary>
          <div className="px-3 pb-3 flex flex-col gap-1.5">
            {others.map((m, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-xs text-ink-soft">
                <span className="truncate flex-1 text-right">{m.home.name} {m.home.logo}</span>
                <span className="font-black tabular-nums text-ink w-12 text-center">{m.played ? `${m.golA}-${m.golB}` : 'vs'}</span>
                <span className="truncate flex-1">{m.away.logo} {m.away.name}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
