import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui';
import Icon from './Icon';
import StatusPill from './match/StatusPill';
import TeamLogo from './TeamLogo';

// Hisob paneli (Sofascore uslubidagi karta): jamoalar, hisob, daqiqa, holat va boshqaruv.
function TeamSide({ team, reds }) {
  return (
    <div className="flex-1 min-w-0 flex flex-col items-center gap-2 text-center">
      <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-surface-muted border border-surface-line flex items-center justify-center text-3xl sm:text-4xl">
        <TeamLogo id={team.id} logo={team.logo} size={44} />
      </span>
      <span className="text-sm sm:text-base font-extrabold text-ink leading-tight break-words max-w-full">{team.name}</span>
      {reds > 0 && <span className="text-[11px] font-bold text-red-600">🟥 {reds}</span>}
    </div>
  );
}

export default function MatchTablo({
  teamA, teamB, score, matchTime, addedTime,
  isFinished, isPaused, isFinishing, speedMode, slowMo,
  redCardsA, redCardsB, liveTicker,
  onTogglePause, onToggleSpeed, onFinish,
  competition = "Tezkor O'yin • Do'stona uchrashuv",
}) {
  // Gol bo'lganda hisob "pop" animatsiyasi bilan yonadi
  const totalGoals = score.a + score.b;
  const prevGoals = useRef(totalGoals);
  const [pop, setPop] = useState(false);
  useEffect(() => {
    if (totalGoals > prevGoals.current) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 900);
      prevGoals.current = totalGoals;
      return () => clearTimeout(t);
    }
    prevGoals.current = totalGoals;
    return undefined;
  }, [totalGoals]);

  const matchEnd = 90 + addedTime;
  const minuteLabel = matchTime > 90 ? `90+${matchTime - 90}'` : `${matchTime}'`;
  const progress = Math.min(100, (matchTime / matchEnd) * 100);

  let status;
  if (isFinished) status = { tone: 'neutral', text: 'Tugadi', pulse: false };
  else if (isPaused) status = { tone: 'neutral', text: 'Pauza', pulse: false };
  else if (isFinishing) status = { tone: 'accent', text: 'Yakunlanmoqda…', pulse: true };
  else if (slowMo) status = { tone: 'danger', text: 'Xavfli vaziyat • 0.3x', pulse: true };
  else if (speedMode === 'quick') status = { tone: 'accent', text: 'Quick Play', pulse: true };
  else status = { tone: 'brand', text: "O'yin davom etmoqda", pulse: true };

  const speedChip = isFinished ? null : slowMo && !isFinishing ? '0.3x' : speedMode === 'quick' ? 'Quick' : '1x';

  return (
    <section className="bg-surface-card border border-surface-line rounded-card shadow-soft p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="text-xs font-semibold text-ink-muted truncate">🏆 {competition}</span>
        {speedChip && (
          <span
            className={`text-[11px] font-extrabold rounded-md px-2 py-0.5 border transition-colors duration-300 ${
              slowMo && !isFinishing ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-surface-muted text-ink-soft border-surface-line'
            }`}
          >
            {speedChip}
          </span>
        )}
      </div>

      <div className="flex justify-center mb-4">
        <StatusPill tone={status.tone} pulse={status.pulse}>{status.text}</StatusPill>
      </div>

      <div className="flex items-center gap-2 sm:gap-6">
        <TeamSide team={teamA} reds={redCardsA} />

        <div className="flex flex-col items-center gap-1 shrink-0 min-w-[110px]">
          <div
            className={`text-4xl sm:text-5xl font-black tracking-tight tabular-nums text-ink ${pop ? 'motion-safe:animate-fs-pop text-brand-dark' : ''}`}
          >
            {score.a} <span className="text-ink-subtle">-</span> {score.b}
          </div>
          <div className="text-sm font-extrabold tabular-nums text-ink-muted">
            {isFinished ? `To'liq vaqt (${matchEnd}')` : minuteLabel}
          </div>
        </div>

        <TeamSide team={teamB} reds={redCardsB} />
      </div>

      <div className="mt-4 h-1.5 rounded-full bg-surface-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${slowMo && !isFinished ? 'bg-amber-500' : 'bg-gradient-to-r from-brand to-accent'}`}
          style={{ width: `${isFinished ? 100 : progress}%` }}
        />
      </div>

      <div className={`mt-4 flex items-center justify-center ${isFinished ? "" : "min-h-[44px]"}`}>
        {!isFinished && liveTicker && (
          <div
            key={liveTicker}
            className="motion-safe:animate-fs-fade-up text-center text-sm font-medium text-ink-soft bg-surface rounded-control border border-surface-line px-3 py-2 w-full"
          >
            {liveTicker}
          </div>
        )}
      </div>

      {!isFinished && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <Button variant="secondary" size="sm" onClick={onTogglePause} disabled={isFinishing}>
            <Icon name={isPaused ? 'play' : 'pause'} size={15} />
            {isPaused ? 'Davom' : 'Pauza'}
          </Button>
          <Button
            variant={speedMode === 'quick' ? 'accent' : 'secondary'}
            size="sm"
            onClick={onToggleSpeed}
            disabled={isFinishing}
            aria-pressed={speedMode === 'quick'}
          >
            <Icon name="bolt" size={15} />
            Quick Play
          </Button>
          <Button variant="secondary" size="sm" onClick={onFinish} disabled={isFinishing}>
            <Icon name="skip" size={15} />
            {isFinishing ? 'Yakunlanmoqda…' : 'Tugatish'}
          </Button>
        </div>
      )}
    </section>
  );
}
