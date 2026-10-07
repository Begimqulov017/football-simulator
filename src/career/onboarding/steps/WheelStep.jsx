import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Badge } from '../../../components/ui';
import ClubWheel from '../components/ClubWheel';
import PlayerCard from '../components/PlayerCard';
import useCountUp from '../useCountUp';
import { rollFirstRating, rollPotential } from '../../utils/playerGen';
import { previewClubTier } from '../../data/clubRosterStore';
import { TeamBadge, LeagueBadge } from '../../../components/TeamLogo';
import { LEAGUES } from '../../../data/leaguesData';
import {
  MAX_LEAGUE_DECLINES, rollLeague, rollClubInLeague, leagueTeams, maxClubDeclinesFor,
  buildItemsWheel, leagueSeg, teamSeg, computeSpinRotation, WHEEL_SEGMENTS,
} from '../onboardingUtils';

const SPIN_MS = 4200;

export default function WheelStep({ form, onBack, onAccepted }) {
  // Oqim: 1) liga g'ildiragi (2 marta rad etish)  2) tanlangan liganing klublari g'ildiragi (3 marta rad etish)
  const [stage, setStage] = useState('league'); // league | club
  const [phase, setPhase] = useState('idle'); // idle | spinning | offer | accepted
  const [wheel, setWheel] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [league, setLeague] = useState(null); // qabul qilingan liga
  const [offerLeague, setOfferLeague] = useState(null);
  const [offer, setOffer] = useState(null); // { team, league }
  const [leagueDeclines, setLeagueDeclines] = useState(0);
  const [clubDeclines, setClubDeclines] = useState(0);
  const [seenLeagues, setSeenLeagues] = useState([]);
  const [seenClubs, setSeenClubs] = useState([]);
  const [rating, setRating] = useState(null);
  const [potential, setPotential] = useState(null);
  const pending = useRef(null);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const reduceMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const maxClubDeclines = league ? maxClubDeclinesFor(league) : 0;

  const startSpin = (result, w) => {
    pending.current = result;
    setWheel(w);
    setPhase('spinning');
    // bir frame kutamiz: yangi bo'laklar chizilgach aylanish boshlansin
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setRotation((r) => computeSpinRotation(r, w.targetIndex, w.segments.length));
    }));
    // transitionend SVG'da ishonchsiz — aniq taymer bilan tugatamiz
    clearTimeout(timer.current);
    timer.current = setTimeout(finishSpin, reduceMotion ? 60 : SPIN_MS + 250);
  };

  const spin = () => {
    if (phase === 'spinning') return;
    if (stage === 'league') {
      const l = rollLeague(form.nationality, seenLeagues);
      startSpin({ kind: 'league', league: l }, buildItemsWheel(leagueSeg(l), LEAGUES.map(leagueSeg), WHEEL_SEGMENTS));
    } else {
      const r = rollClubInLeague(league, seenClubs);
      startSpin({ kind: 'club', result: r }, buildItemsWheel(teamSeg(r.team), leagueTeams(league).map(teamSeg), WHEEL_SEGMENTS));
    }
  };

  function finishSpin() {
    const res = pending.current;
    if (!res) return;
    pending.current = null;
    if (res.kind === 'league') {
      setOfferLeague(res.league);
      setSeenLeagues((s) => [...s, res.league.id]);
    } else {
      setOffer(res.result);
      setSeenClubs((s) => [...s, res.result.team.id]);
    }
    setPhase('offer');
  }

  const declineLeague = () => {
    if (leagueDeclines >= MAX_LEAGUE_DECLINES) return;
    setLeagueDeclines((d) => d + 1);
    setOfferLeague(null);
    setPhase('idle');
  };

  const acceptLeague = () => {
    setLeague(offerLeague);
    setStage('club');
    setWheel(null);
    setOffer(null);
    setPhase('idle');
  };

  const declineClub = () => {
    if (clubDeclines >= maxClubDeclines) return;
    setClubDeclines((d) => d + 1);
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
  const spinning = phase === 'spinning';
  const isLeague = stage === 'league';
  const lastLeagueChance = leagueDeclines >= MAX_LEAGUE_DECLINES;
  const lastClubChance = clubDeclines >= maxClubDeclines;
  const lastChance = isLeague ? lastLeagueChance : lastClubChance;
  const declinesLeft = isLeague ? MAX_LEAGUE_DECLINES - leagueDeclines : maxClubDeclines - clubDeclines;

  // Boshlang'ich (aylanmagan) g'ildirak: liga bosqichida ligalar, klub bosqichida tanlangan liga klublari
  const idleLeagueWheel = useMemo(
    () => buildItemsWheel(leagueSeg(LEAGUES[0]), LEAGUES.map(leagueSeg), WHEEL_SEGMENTS),
    [],
  );
  const idleClubWheel = useMemo(() => {
    if (!league) return null;
    const teams = leagueTeams(league);
    return buildItemsWheel(teamSeg(teams[0]), teams.map(teamSeg), WHEEL_SEGMENTS);
  }, [league]);
  const shown = wheel || (isLeague ? idleLeagueWheel : idleClubWheel) || idleLeagueWheel;

  // Rad etilgan klublar (hozirgi taklif ro'yxatga kirmaydi)
  const declinedClubIds = seenClubs.filter((id) => id !== offer?.team.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
      <div className="bg-surface-card border border-surface-line rounded-card shadow-soft p-5 sm:p-7 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-2xl font-black tracking-tight text-ink flex items-center gap-2">
              {isLeague ? 'Liga tanlash' : (<><LeagueBadge league={league} size={28} /> {league.name}: klub tanlash</>)}
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              {isLeague
                ? `G'ildirakni aylantiring — ${form.nationality} ligasi ko'proq chiqadi. Ligani ${MAX_LEAGUE_DECLINES} martagacha rad etishingiz mumkin.`
                : `Tanlangan liga klublari orasidan g'ildirak bitta klubni tanlaydi. Klubni ${maxClubDeclines} martagacha rad etishingiz mumkin.`}
            </p>
          </div>
          {phase !== 'accepted' && (
            <Badge tone={lastChance ? 'accent' : 'brand'}>
              {declinesLeft} ta rad etish qoldi
            </Badge>
          )}
        </div>

        <ClubWheel
          segments={shown.segments}
          rotation={rotation}
          spinning={spinning}
          durationMs={SPIN_MS}
          highlightIndex={phase === 'offer' || phase === 'accepted' ? wheel?.targetIndex : -1}
        />

        {/* ---- Klub bosqichi: liganing barcha klublari ---- */}
        {!isLeague && (
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wide text-ink-muted mb-2">{league.name} klublari</div>
            <div className="flex flex-wrap gap-1.5">
              {leagueTeams(league).map((t) => {
                const out = declinedClubIds.includes(t.id);
                const cur = offer?.team.id === t.id;
                return (
                  <span
                    key={t.id}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${cur ? 'border-brand bg-brand-tint text-ink' : 'border-surface-line bg-surface text-ink-soft'} ${out ? 'opacity-40 line-through' : ''}`}
                  >
                    <TeamBadge id={t.id} value={t.logo} size={14} /> {t.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {(phase === 'idle' || phase === 'spinning') && (
          <Button variant="primary" size="lg" disabled={spinning} onClick={spin} className="w-full">
            {spinning
              ? 'Aylanmoqda…'
              : isLeague
                ? (leagueDeclines > 0 ? 'Keyingi liga (Next) →' : "Next — ligani aylantirish →")
                : (clubDeclines > 0 ? 'Keyingi klub (Next) →' : "Next — klubni aylantirish →")}
          </Button>
        )}

        {/* ---- Liga taklifi ---- */}
        {phase === 'offer' && isLeague && offerLeague && (
          <div className="motion-safe:animate-fs-pop-in rounded-card border border-brand-soft bg-brand-tint p-5 flex flex-col items-center gap-3 text-center">
            <div className="text-5xl"><LeagueBadge league={offerLeague} size={64} /></div>
            <div>
              <div className="text-xl font-black text-ink">{offerLeague.name}</div>
              <div className="text-sm text-ink-muted">{offerLeague.flag} {offerLeague.country} · {offerLeague.teamIds.length} ta klub</div>
            </div>
            <div className="text-sm font-semibold text-ink-soft">
              {lastLeagueChance ? "Bu oxirgi liga — uni tanlashingiz kerak." : "Shu ligada o'ynashni xohlaysizmi?"}
            </div>
            <div className="flex gap-3 w-full">
              <Button variant="secondary" className="flex-1" disabled={lastLeagueChance} onClick={declineLeague}>
                Rad etish ({leagueDeclines}/{MAX_LEAGUE_DECLINES})
              </Button>
              <Button variant="primary" className="flex-1" onClick={acceptLeague}>Ligani tanlash ✓</Button>
            </div>
          </div>
        )}

        {/* ---- Klub taklifi ---- */}
        {phase === 'offer' && !isLeague && offer && (
          <div className="motion-safe:animate-fs-pop-in rounded-card border border-brand-soft bg-brand-tint p-5 flex flex-col items-center gap-3 text-center">
            <div className="text-5xl"><TeamBadge id={offer.team.id} value={offer.team.logo} size={56} /></div>
            <div>
              <div className="text-xl font-black text-ink">{offer.team.name}</div>
              <div className="text-sm text-ink-muted">{offer.league.flag} {offer.league.name} · {offer.league.country}</div>
            </div>
            <div className="text-sm font-semibold text-ink-soft">
              {lastClubChance ? "Bu oxirgi taklif — uni qabul qilishingiz kerak." : "Klub sizni jamoasiga taklif qilmoqda."}
            </div>
            <div className="flex gap-3 w-full">
              <Button variant="secondary" className="flex-1" disabled={lastClubChance} onClick={declineClub}>
                Decline ({clubDeclines}/{maxClubDeclines})
              </Button>
              <Button variant="primary" className="flex-1" onClick={accept}>Accept ✓</Button>
            </div>
          </div>
        )}

        {phase === 'accepted' && offer && (
          <div className="motion-safe:animate-fs-pop-in flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-control border border-surface-line bg-surface p-3">
                <div className="text-3xl"><TeamBadge id={offer.team.id} value={offer.team.logo} size={36} /></div>
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
