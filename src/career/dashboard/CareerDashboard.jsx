import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { addDays } from '../utils/season';
import { Button, Badge } from '../../components/ui';
import Icon from '../../components/Icon';
import Timeline from './Timeline';
import DayMatches from './DayMatches';
import { buildTimeline, getDayPlan, formatLongDate, COMPETITION_STYLE } from './timelineUtils';
import { getInternationalContext, nextBreakDay, flagOfNation } from '../international/calendar';

// Phase 4 — Career Dashboard: yuqorida sana + 31 kunlik Timeline, markazda
// "Play Match" (o'yin tugagach avtomatik "Next Day") va kun o'yinlari ro'yxati.
export default function CareerDashboard({ extraEvents = {} }) {
  const navigate = useNavigate();
  const { player, nextDay, matchdayNext, prepareMatchday, hasUnwatchedResult, pendingWorldMatch } = useGame();
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  const today = player.career.gameDate;
  const injured = !!player.career.injury;
  const playable = matchdayNext && !injured;
  const plan = useMemo(() => getDayPlan(player, matchdayNext), [player, matchdayNext]);
  const days = useMemo(
    () => buildTimeline(player, today, { days: 31, extraEvents, targetIso: matchdayNext ? addDays(today, 1) : null }),
    [player, today, matchdayNext, extraEvents],
  );

  // Timeline'da tanlangan kun (agar bor bo'lsa) — o'sha kun o'yinlari ko'rsatiladi
  const selectedDay = selected ? days.find((d) => d.iso === selected) : null;

  const primary = (() => {
    if (pendingWorldMatch) return { kind: 'play', label: `Play Match (${pendingWorldMatch.competition === 'cup' ? 'Kubok' : 'Liga'})` };
    if (playable) return { kind: 'play', label: 'Play Match' };
    return { kind: 'next', label: 'Next Day' };
  })();

  const handlePrimary = () => {
    if (busy) return;
    if (pendingWorldMatch) { navigate('/world-match'); return; }
    if (playable) {
      try {
        prepareMatchday();
        navigate('/play-match');
      } catch (err) {
        console.error('Failed to prepare matchday', err);
        alert("O'yinni tayyorlashda xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
      }
      return;
    }
    // Kun o'tishi: qisqa animatsiya uchun busy bayrog'i
    setBusy(true);
    nextDay();
    setTimeout(() => setBusy(false), 350);
  };

  const intlNow = plan.intl || getInternationalContext(today);
  const upcomingBreak = intlNow ? null : nextBreakDay(today);
  const nextEvent = plan.events[0];
  const st = nextEvent ? COMPETITION_STYLE[nextEvent.kind] : null;

  return (
    <section className={`bg-surface-card border rounded-card shadow-soft p-4 sm:p-6 flex flex-col gap-5 font-sans text-ink transition-colors duration-500 ${intlNow ? 'border-violet-300' : 'border-surface-line'}`}>
      {intlNow && (
        <div className="motion-safe:animate-fs-fade-up -mt-1 rounded-control border border-violet-200 bg-violet-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{flagOfNation(player.nationality)}</span>
            <div>
              <div className="text-sm font-extrabold text-violet-800">🌍 {intlNow.label} haftaligi</div>
              <div className="text-xs text-violet-700">Klub logotiplari o'rniga davlat bayroqlari ko'rsatilmoqda · {player.nationality} terma jamoasi</div>
            </div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => navigate('/national-team')}>Terma jamoa →</Button>
        </div>
      )}
      {/* Yuqori: joriy sana */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-control bg-brand-tint border border-brand-soft flex items-center justify-center text-brand-dark">
            <Icon name="calendar" size={20} />
          </span>
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wide text-ink-muted">Joriy sana</div>
            <div className="text-xl font-black tracking-tight">{formatLongDate(today)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone="brand">Day {player.career.day}</Badge>
          <Badge tone="neutral">Form: {player.career.form}</Badge>
          {injured && <Badge tone="accent">🩹 Jarohat: {player.career.injury.daysLeft} kun</Badge>}
          {upcomingBreak && <Badge tone="neutral">🌍 Keyingi tanaffus: {formatLongDate(upcomingBreak)}</Badge>}
        </div>
      </div>

      {/* Timeline */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-extrabold">Kalendar · keyingi 31 kun</div>
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-semibold text-ink-muted">
            {['league', 'cup', 'continental', 'international'].map((k) => (
              <span key={k} className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${COMPETITION_STYLE[k].dot}`} />{COMPETITION_STYLE[k].label}</span>
            ))}
          </div>
        </div>
        <Timeline days={days} selectedIso={selected} onSelect={(iso) => setSelected((s) => (s === iso ? null : iso))} />
        {selectedDay && (
          <div className="mt-2 rounded-control border border-surface-line bg-surface px-3 py-2 text-sm motion-safe:animate-fs-fade-up">
            <b>{formatLongDate(selectedDay.iso)}</b>{' — '}
            {selectedDay.events.length === 0
              ? "o'yin yo'q"
              : selectedDay.events.map((e) => `${e.isHome ? 'vs' : '@'} ${e.opponent} (${e.competition})`).join(' · ')}
          </div>
        )}
      </div>

      {/* Markaz: asosiy tugma + kun o'yinlari */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,260px)_1fr] gap-5 items-stretch">
        <div className="rounded-card border border-surface-line bg-surface p-5 flex flex-col items-center justify-center gap-3 text-center">
          {pendingWorldMatch || playable ? (
            <>
              <div className="text-3xl">{nextEvent?.logo || '⚽'}</div>
              <div className="text-sm font-bold text-ink-soft">
                {nextEvent ? `${nextEvent.isHome ? 'vs' : '@'} ${nextEvent.opponent}` : "O'yin kutmoqda"}
              </div>
              {st && <span className={`text-[11px] font-bold ${st.text}`}>{nextEvent.competition}</span>}
            </>
          ) : (
            <>
              <div className="text-3xl">{plan.mode === 'finished' ? '✅' : '🌤️'}</div>
              <div className="text-sm font-bold text-ink-soft">
                {plan.mode === 'finished' ? "Kun o'yinlari yakunlandi" : injured && matchdayNext ? "Jarohat: o'yin sizsiz o'tadi" : "Bugun dam kuni"}
              </div>
            </>
          )}
          <Button
            key={primary.kind}
            variant={primary.kind === 'play' ? 'primary' : 'accent'}
            size="lg"
            onClick={handlePrimary}
            disabled={busy}
            className="w-full motion-safe:animate-fs-pop-in"
          >
            <Icon name={primary.kind === 'play' ? 'play' : 'arrow'} size={18} />
            {primary.label}
          </Button>
          <div className="w-full mt-1">
            <div className="flex justify-between text-[11px] font-bold text-ink-muted mb-1"><span>Stamina</span><span>{player.career.stamina}%</span></div>
            <div className="h-1.5 rounded-full bg-surface-line overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-all duration-500" style={{ width: `${player.career.stamina}%` }} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {hasUnwatchedResult && (
            <button
              type="button"
              onClick={() => navigate('/live-result')}
              className="text-left cursor-pointer font-sans rounded-control border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between gap-3"
            >
              <span>
                <span className="block text-sm font-extrabold text-amber-800">🌍 Yangi natija tayyor!</span>
                <span className="block text-xs text-amber-700">Umumiy dunyoda o'yiningiz hal qilindi — ko'rish uchun bosing.</span>
              </span>
              <Badge tone="accent">▶ Ko'rish</Badge>
            </button>
          )}
          <DayMatches plan={plan} />
        </div>
      </div>
    </section>
  );
}
