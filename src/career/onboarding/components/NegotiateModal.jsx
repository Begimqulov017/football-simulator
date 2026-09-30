import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../../../components/ui';
import Icon from '../../../components/Icon';
import {
  ROLES, CONTRACT_YEARS, clubBaseWage, wageBounds, roundTo,
  evaluateProposal, buildCounterOffer, buildFinalOffer,
} from '../onboardingUtils';

const MAX_ATTEMPTS = 3;
const CONFETTI = ['#10B981', '#0284C7', '#F59E0B', '#EF4444', '#8B5CF6'];

function Confetti() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden">
      {Array.from({ length: 28 }, (_, i) => (
        <span
          key={i}
          className="absolute top-0 w-2 h-3 rounded-sm motion-safe:animate-fs-confetti"
          style={{
            left: `${(i * 37) % 100}%`,
            backgroundColor: CONFETTI[i % CONFETTI.length],
            animationDelay: `${(i % 7) * 0.12}s`,
            animationDuration: `${2.2 + (i % 5) * 0.25}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function NegotiateModal({ ctx, onClose, onSigned }) {
  // ctx: { clubResult, rating (=ovr), potential, naturalTier }
  const { clubResult, potential, naturalTier } = ctx;
  const leagueId = clubResult.league.id;
  const ovr = ctx.ovr;

  const defaultRole = naturalTier === 'starter' ? 'key' : 'rotation';
  const base = clubBaseWage({ ovr, leagueId, role: defaultRole });
  const [role, setRole] = useState(defaultRole);
  const [wage, setWage] = useState(base);
  const [years, setYears] = useState(3);
  const [attempts, setAttempts] = useState(0);
  const [reply, setReply] = useState(null); // { type: 'reject'|'final', text, counter }
  const [signed, setSigned] = useState(null);
  const [thinking, setThinking] = useState(false);

  const roleBase = clubBaseWage({ ovr, leagueId, role });
  const bounds = wageBounds(roleBase);
  useEffect(() => {
    setWage((w) => Math.min(bounds.max, Math.max(bounds.min, w)));
  }, [bounds.min, bounds.max]);

  const proposal = { ovr, potential, naturalTier, leagueId, wage, years, role };
  const ev = useMemo(() => evaluateProposal(proposal), [wage, years, role]); // eslint-disable-line react-hooks/exhaustive-deps
  const pct = Math.round(ev.probability * 100);
  const meterColor = pct >= 65 ? 'bg-brand' : pct >= 35 ? 'bg-amber-500' : 'bg-red-500';
  const forcedFinal = reply?.type === 'final';

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !signed && !thinking) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [signed, thinking, onClose]);

  const sign = (contract) => setSigned(contract);

  const submit = () => {
    if (thinking) return;
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      if (Math.random() < ev.probability) {
        sign({ wage, years, role });
        return;
      }
      const n = attempts + 1;
      setAttempts(n);
      if (n >= MAX_ATTEMPTS) {
        const fin = buildFinalOffer({ ovr, leagueId, naturalTier });
        setReply({ type: 'final', text: "Muzokara to'xtadi. Klub oxirgi (o'zgarmas) taklifini yubordi.", counter: fin });
      } else {
        const c = buildCounterOffer(proposal);
        setReply({ type: 'reject', text: `Klub taklifingizni rad etdi. ${ev.notes[0]}.`, counter: c });
      }
    }, 900);
  };

  const applyCounter = () => {
    if (!reply) return;
    const c = reply.counter;
    setRole(c.role); setWage(c.wage); setYears(c.years);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 font-sans" role="dialog" aria-modal="true" aria-label="Shartnoma muzokarasi">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm motion-safe:animate-fs-fade-up" onClick={() => !signed && !thinking && onClose()} />
      <div className="relative w-full sm:max-w-lg max-h-[94vh] overflow-y-auto bg-surface-card rounded-t-[24px] sm:rounded-[24px] shadow-lift border border-surface-line text-ink motion-safe:animate-fs-pop-in">
        {signed ? (
          <div className="relative px-6 py-10 flex flex-col items-center text-center gap-4">
            <Confetti />
            <svg width="96" height="96" viewBox="0 0 96 96" className="relative">
              <circle cx="48" cy="48" r="44" fill="#ECFDF5" stroke="#10B981" strokeWidth="4" />
              <path d="M28 50l14 14 27-30" fill="none" stroke="#059669" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" className="motion-safe:animate-fs-draw" />
            </svg>
            <div className="relative">
              <div className="text-2xl font-black">Shartnoma imzolandi!</div>
              <p className="mt-1 text-sm text-ink-muted">{clubResult.team.logo} {clubResult.team.name} bilan yangi bosqich boshlanadi.</p>
            </div>
            <div className="relative w-full grid grid-cols-3 gap-2 text-center">
              <div className="rounded-control bg-brand-tint border border-brand-soft py-3">
                <div className="text-lg font-black tabular-nums">${signed.wage.toLocaleString()}</div>
                <div className="text-[10px] font-extrabold uppercase text-brand-dark">Haftalik</div>
              </div>
              <div className="rounded-control bg-accent-tint border border-accent-soft py-3">
                <div className="text-lg font-black tabular-nums">{signed.years} yil</div>
                <div className="text-[10px] font-extrabold uppercase text-accent-dark">Muddat</div>
              </div>
              <div className="rounded-control bg-surface border border-surface-line py-3">
                <div className="text-lg font-black">{ROLES[signed.role].icon}</div>
                <div className="text-[10px] font-extrabold uppercase text-ink-muted">{ROLES[signed.role].label}</div>
              </div>
            </div>
            <Button variant="primary" size="lg" className="relative w-full" onClick={() => onSigned(signed)}>
              Karyerani boshlash →
            </Button>
          </div>
        ) : (
          <div className="p-5 sm:p-7 flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-full bg-surface-muted border border-surface-line flex items-center justify-center text-2xl">{clubResult.team.logo}</span>
                <div>
                  <div className="text-lg font-black leading-tight">Shartnoma muzokarasi</div>
                  <div className="text-xs text-ink-muted">{clubResult.team.name} · urinish {Math.min(attempts + 1, MAX_ATTEMPTS)}/{MAX_ATTEMPTS}</div>
                </div>
              </div>
              <button type="button" onClick={onClose} disabled={thinking} aria-label="Yopish" className="w-8 h-8 rounded-full bg-surface-muted border-0 cursor-pointer text-ink-muted hover:text-ink flex items-center justify-center">✕</button>
            </div>

            {reply && (
              <div className={`motion-safe:animate-fs-pop-in rounded-control border px-4 py-3 text-sm ${forcedFinal ? 'bg-accent-tint border-accent-soft text-accent-dark' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                <div className="font-bold">{reply.text}</div>
                <div className="mt-1 text-xs">
                  Klub taklifi: <b>${reply.counter.wage.toLocaleString()}</b>/hafta · <b>{reply.counter.years}</b> yil · <b>{ROLES[reply.counter.role].label}</b>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant={forcedFinal ? 'accent' : 'secondary'} onClick={() => sign(reply.counter)}>Qabul qilish</Button>
                  {!forcedFinal && <Button size="sm" variant="ghost" onClick={applyCounter}>Maydonlarga qo'yish</Button>}
                </div>
              </div>
            )}

            <div>
              <div className="text-xs font-bold text-ink-soft mb-2">Jamoadagi rol</div>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(ROLES).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    disabled={forcedFinal}
                    onClick={() => setRole(r.id)}
                    className={`text-left rounded-control border-2 p-3 cursor-pointer font-sans transition-all disabled:opacity-50 ${
                      role === r.id ? 'border-accent bg-accent-tint' : 'border-surface-line bg-surface-card hover:border-ink-subtle'
                    }`}
                  >
                    <div className="text-sm font-extrabold text-ink">{r.icon} {r.label}</div>
                    <div className="text-[11px] text-ink-muted mt-0.5 leading-snug">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs font-bold text-ink-soft">Haftalik maosh (Weekly Wage)</span>
                <span className="text-xl font-black tabular-nums text-brand-dark">${wage.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={bounds.min}
                max={bounds.max}
                step={10}
                value={wage}
                disabled={forcedFinal}
                onChange={(e) => setWage(roundTo(Number(e.target.value)))}
                className="w-full accent-emerald-500"
                aria-label="Haftalik maosh"
              />
              <div className="flex justify-between text-[11px] text-ink-muted">
                <span>${bounds.min.toLocaleString()}</span>
                <span>Klub bahosi: ${roleBase.toLocaleString()}</span>
                <span>${bounds.max.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-ink-soft mb-2">Shartnoma muddati (Contract Length)</div>
              <div className="grid grid-cols-5 gap-2">
                {CONTRACT_YEARS.map((y) => (
                  <button
                    key={y}
                    type="button"
                    disabled={forcedFinal}
                    onClick={() => setYears(y)}
                    className={`rounded-control border-2 py-2 text-sm font-extrabold cursor-pointer font-sans transition-all disabled:opacity-50 ${
                      years === y ? 'border-brand bg-brand-tint text-brand-dark' : 'border-surface-line bg-surface-card text-ink-soft hover:border-ink-subtle'
                    }`}
                  >
                    {y} yil
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-control bg-surface border border-surface-line p-3">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-ink-soft">Klub rozi bo'lish ehtimoli</span>
                <span className="tabular-nums">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-surface-line overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${meterColor}`} style={{ width: `${pct}%` }} />
              </div>
              <ul className="list-none m-0 mt-2 p-0 flex flex-col gap-0.5">
                {ev.notes.map((n) => (
                  <li key={n} className="text-[11px] text-ink-muted flex gap-1.5"><Icon name="check" size={12} className="mt-0.5 shrink-0 text-ink-subtle" />{n}</li>
                ))}
              </ul>
            </div>

            <Button variant="primary" size="lg" disabled={thinking || forcedFinal} onClick={submit} className="w-full">
              {thinking ? 'Klub o\'ylab ko\'rmoqda…' : 'Taklifni yuborish'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
