import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Badge } from '../../../components/ui';
import ClubWheel from '../components/ClubWheel';
import PlayerCard from '../components/PlayerCard';
import useCountUp from '../useCountUp';
import { rollFirstRating, rollPotential } from '../../utils/playerGen';
import { previewClubTier } from '../../data/clubRosterStore';
import {
  MAX_DECLINES, rollUniqueClub, buildWheel, computeSpinRotation,
} from '../onboardingUtils';

const SPIN_MS = 4200;

export default function WheelStep({ form, onBack, onAccepted }) {
  const [phase, setPhase] = useState('idle'); // idle | spinning | offer | accepted
  const [wheel, setWheel] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [offer, setOffer] = useState(null); // { team, league }
  const [declines, setDeclines] = useState(0);
  const [seen, setSeen] = useState([]);
  const [rating, setRating] = useState(null);
  const [potential, setPotential] = useState(null);
  const pending = useRef(null);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const reduceMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const spin = () => {
    if (phase === 'spinning') return;
    const result = rollUniqueClub(form.nationality, seen);
    const w = buildWheel(result);
    pending.current = result;
    setWheel(w);
    setPhase('spinning');
    // bir frame kutamiz: yangi bo'laklar chizilgach aylanish boshlansin
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setRotation((r) => computeSpinRotation(r, w.targetIndex));
    }));
    // transitionend SVG'da ishonchsiz — aniq taymer bilan tugatamiz
    clearTimeout(timer.current);
    timer.current = setTimeout(finishSpin, reduceMotion ? 60 : SPIN_MS + 250);
  };

  const finishSpin = () => {
    const result = pending.current;
    if (!result) return;
    pending.current = null;
    setOffer(result);
    setSeen((s) => [...s, result.team.id]);
    setPhase('offer');
  };

  const decline = () => {
    if (declines >= MAX_DECLINES) return;
    setDeclines((d) => d + 1);
    setOffer(null);
    setPhase('idle');
  };

  const accept = () => {
    const r = rollFirstRating();
    setRating(r);
    setPotential(rollPotential(r).potential);
    setPhase('accepted');
  };

  const ratingShown = useCountUp(rating, { start: phase === 'accepted', duration: 1300 });
  const potentialShown = useCountUp(potential, { start: phase === 'accepted', duration: 1600 });

  const tier = useMemo(
    () => (offer && rating != null ? previewClubTier(offer.team, rating) : null),
    [offer, rating],
  );
  const lastChance = declines >= MAX_DECLINES;
  const spinning = phase === 'spinning';

  // Boshlang'ich holatda g'ildirak uchun bo'sh bo'laklar
  const idleWheel = useMemo(() => {
    const r = rollUniqueClub(form.nationality, []);
    return buildWheel(r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const shown = wheel || idleWheel;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
      <div className="bg-surface-card border border-surface-line rounded-card shadow-soft p-5 sm:p-7 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-2xl font-black tracking-tight text-ink">Klub tanlash</div>
            <p className="mt-1 text-sm text-ink-muted">
              G'ildirakni aylantiring — {form.nationality} klublari ko'proq chiqadi. {MAX_DECLINES} martagacha rad etishingiz mumkin.
            </p>
          </div>
          <Badge tone={lastChance ? 'accent' : 'brand'}>{MAX_DECLINES - declines} ta rad etish qoldi</Badge>
        </div>

        <ClubWheel
          segments={shown.segments}
          rotation={rotation}
          spinning={spinning}
          durationMs={SPIN_MS}
          highlightIndex={phase === 'offer' || phase === 'accepted' ? wheel?.targetIndex : -1}
        />

        {(phase === 'idle' || phase === 'spinning') && (
          <Button variant="primary" size="lg" disabled={spinning} onClick={spin} className="w-full">
            {spinning ? 'Aylanmoqda…' : declines > 0 ? 'Keyingi klub (Next) →' : 'Next — g\'ildirakni aylantirish →'}
          </Button>
        )}

        {phase === 'offer' && offer && (
          <div className="motion-safe:animate-fs-pop-in rounded-card border border-brand-soft bg-brand-tint p-5 flex flex-col items-center gap-3 text-center">
            <div className="text-5xl">{offer.team.logo}</div>
            <div>
              <div className="text-xl font-black text-ink">{offer.team.name}</div>
              <div className="text-sm text-ink-muted">{offer.league.flag} {offer.league.name} · {offer.league.country}</div>
            </div>
            <div className="text-sm font-semibold text-ink-soft">
              {lastChance ? "Bu oxirgi taklif — uni qabul qilishingiz kerak." : "Klub sizni jamoasiga taklif qilmoqda."}
            </div>
            <div className="flex gap-3 w-full">
              <Button variant="secondary" className="flex-1" disabled={lastChance} onClick={decline}>
                Decline ({declines}/{MAX_DECLINES})
              </Button>
              <Button variant="primary" className="flex-1" onClick={accept}>Accept ✓</Button>
            </div>
          </div>
        )}

        {phase === 'accepted' && offer && (
          <div className="motion-safe:animate-fs-pop-in flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-control border border-surface-line bg-surface p-3">
                <div className="text-3xl">{offer.team.logo}</div>
                <div className="text-[11px] font-bold text-ink-muted mt-1 truncate">{offer.team.name}</div>
              </div>
              <div className="rounded-control border border-brand-soft bg-brand-tint p-3">
                <div className="text-3xl font-black tabular-nums text-ink">{ratingShown}</div>
                <div className="text-[11px] font-extrabold uppercase text-brand-dark">Rating</div>
              </div>
              <div className="rounded-control border border-accent-soft bg-accent-tint p-3">
                <div className="text-3xl font-black tabular-nums text-ink">{potentialShown}</div>
                <div className="text-[11px] font-extrabold uppercase text-accent-dark">Potential</div>
              </div>
            </div>
            {tier && (
              <div className={`text-center text-sm font-bold rounded-control px-3 py-2 border ${tier === 'starter' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-surface-muted border-surface-line text-ink-soft'}`}>
                {tier === 'starter' ? "⭐ Klub sizni asosiy tarkib darajasida ko'radi" : "🪑 Hozircha zaxira darajasida — muzokarada rolni so'rashingiz mumkin"}
              </div>
            )}
            <Button variant="accent" size="lg" onClick={() => onAccepted({ clubResult: offer, rating, potential, naturalTier: tier })} className="w-full">
              🤝 Negotiate — shartnoma muzokarasi
            </Button>
          </div>
        )}

        <button
          type="button"
          onClick={onBack}
          disabled={spinning}
          className="self-start bg-transparent border-0 cursor-pointer font-sans text-sm font-semibold text-ink-muted hover:text-ink disabled:opacity-40"
        >
          ← Orqaga
        </button>
      </div>

      <div className="lg:sticky lg:top-6">
        <PlayerCard
          player={form}
          club={phase === 'accepted' ? offer?.team : null}
          rating={phase === 'accepted' ? ratingShown : null}
          potential={phase === 'accepted' ? potentialShown : null}
        />
      </div>
    </div>
  );
}
