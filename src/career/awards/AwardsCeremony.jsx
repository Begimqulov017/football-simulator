import React, { useEffect, useState } from 'react';
import { Button, Badge } from '../../components/ui';

const CONFETTI = ['#10B981', '#0284C7', '#F59E0B', '#EF4444', '#8B5CF6'];
function Confetti() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-card">
      {Array.from({ length: 34 }, (_, i) => (
        <span
          key={i}
          className="absolute top-0 w-2 h-3 rounded-sm motion-safe:animate-fs-confetti"
          style={{ left: `${(i * 29) % 100}%`, backgroundColor: CONFETTI[i % CONFETTI.length], animationDelay: `${(i % 9) * 0.1}s`, animationDuration: `${2.2 + (i % 5) * 0.3}s` }}
        />
      ))}
    </div>
  );
}

const SLOT_COORDS = {
  GK: [[50, 90]],
  LB: [[13, 70]],
  CB: [[37, 73], [63, 73]],
  RB: [[87, 70]],
  MID: [[24, 48], [50, 43], [76, 48]],
  FW: [[20, 17], [50, 11], [80, 17]],
};

function Pitch({ players, myId }) {
  const counters = {};
  return (
    <div className="relative w-full max-w-md mx-auto aspect-[2/3] rounded-xl overflow-hidden bg-gradient-to-b from-emerald-500 to-emerald-700">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 300" preserveAspectRatio="none" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2">
        <rect x="6" y="6" width="188" height="288" rx="2" /><line x1="6" y1="150" x2="194" y2="150" /><circle cx="100" cy="150" r="26" />
        <rect x="45" y="6" width="110" height="44" /><rect x="45" y="250" width="110" height="44" />
      </svg>
      {players.map((p, i) => {
        const idx = counters[p.slot] = (counters[p.slot] || 0);
        counters[p.slot] += 1;
        const [x, y] = (SLOT_COORDS[p.slot] || [[50, 50]])[idx] || [50, 50];
        return (
          <div
            key={p.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-[64px] flex flex-col items-center gap-0.5 motion-safe:animate-fs-pop-in"
            style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 70}ms` }}
          >
            <div className={`w-9 h-9 rounded-full bg-white border-2 flex items-center justify-center text-[10px] font-extrabold shadow-soft ${p.id === myId ? 'border-amber-400 text-amber-700' : 'border-accent text-accent-dark'}`}>{p.pos}</div>
            <span className="text-[10px] font-bold text-white drop-shadow text-center leading-tight max-w-[64px] truncate">{p.name.split(' ').slice(-1)[0]}</span>
            <span className="text-[9px] text-white/80">{p.logo}</span>
          </div>
        );
      })}
    </div>
  );
}

const STEPS = [
  { key: 'goldenBoot', icon: '👟', title: 'Oltin batinka', sub: 'Mavsumning eng yaxshi bombardiri' },
  { key: 'team', icon: '🧩', title: 'Mavsumning eng yaxshi tarkibi', sub: '4-3-3 formatidagi ramziy jamoa' },
  { key: 'ballon', icon: '🏆', title: "Oltin to'p (Ballon d'Or)", sub: "Mavsumning eng yaxshi o'yinchisi" },
];

export default function AwardsCeremony({ awards, myId }) {
  const [step, setStep] = useState(-1); // -1 = kirish
  useEffect(() => setStep(-1), [awards.season, awards.leagueName]);

  const gb = awards.goldenBoot || [];
  const bd = awards.ballonDor || {};
  const meWon = (id) => id && id === myId;

  return (
    <div className="relative bg-surface-card border border-surface-line rounded-card shadow-soft p-5 sm:p-8 font-sans text-ink overflow-hidden">
      {step === 2 && <Confetti />}
      <div className="relative flex flex-col gap-6">
        <div className="text-center">
          <Badge tone="accent">{awards.leagueName} · {awards.season}-mavsum</Badge>
          <div className="mt-3 text-2xl sm:text-3xl font-black tracking-tight">Individual mukofotlar marosimi</div>
          <div className="mt-1 flex items-center justify-center gap-2">
            {STEPS.map((s, i) => <span key={s.key} className={`h-1.5 w-10 rounded-full transition-colors duration-500 ${i <= step ? 'bg-brand' : 'bg-surface-line'}`} />)}
          </div>
        </div>

        {step === -1 && (
          <div className="motion-safe:animate-fs-fade-up text-center flex flex-col items-center gap-4 py-6">
            <div className="text-6xl">🎖️</div>
            <p className="max-w-md text-sm text-ink-muted">Mavsum yakunlandi. Oltin batinka, mavsumning eng yaxshi tarkibi va Oltin to'p g'olibi e'lon qilinadi.</p>
            <Button size="lg" onClick={() => setStep(0)}>Marosimni boshlash →</Button>
          </div>
        )}

        {step === 0 && (
          <div key="gb" className="motion-safe:animate-fs-pop-in flex flex-col gap-4">
            <div className="text-center"><div className="text-4xl">{STEPS[0].icon}</div><div className="text-xl font-black">{STEPS[0].title}</div><div className="text-xs text-ink-muted">{STEPS[0].sub}</div></div>
            <div className="grid grid-cols-3 gap-3 items-end max-w-xl mx-auto w-full">
              {[gb[1], gb[0], gb[2]].map((p, i) => {
                if (!p) return <div key={i} />;
                const first = p === gb[0];
                return (
                  <div key={p.id} className={`rounded-card border text-center px-2 py-4 ${first ? 'bg-amber-50 border-amber-300 pb-8 shadow-glow-brand' : 'bg-surface border-surface-line'} ${meWon(p.id) ? 'ring-2 ring-amber-400' : ''}`}>
                    <div className="text-2xl">{first ? '🥇' : p === gb[1] ? '🥈' : '🥉'}</div>
                    <div className="text-xl mt-1">{p.logo}</div>
                    <div className="text-sm font-extrabold leading-tight mt-1">{p.name}</div>
                    <div className="text-[11px] text-ink-muted truncate">{p.clubName}</div>
                    <div className="text-2xl font-black tabular-nums mt-1">{p.goals}<span className="text-xs text-ink-muted font-bold"> gol</span></div>
                    {meWon(p.id) && <div className="text-[10px] font-extrabold text-amber-700">SIZ!</div>}
                  </div>
                );
              })}
            </div>
            {gb.length === 0 && <div className="text-center text-sm text-ink-muted">Bu mavsumda gol urilmagan.</div>}
          </div>
        )}

        {step === 1 && (
          <div key="tos" className="flex flex-col gap-4">
            <div className="text-center"><div className="text-4xl">{STEPS[1].icon}</div><div className="text-xl font-black">{STEPS[1].title}</div><div className="text-xs text-ink-muted">{STEPS[1].sub}</div></div>
            <Pitch players={awards.teamOfSeason || []} myId={myId} />
            {(awards.teamOfSeason || []).some((p) => meWon(p.id)) && <div className="text-center text-sm font-extrabold text-amber-700">⭐ Siz mavsumning eng yaxshi tarkibiga kirdingiz!</div>}
          </div>
        )}

        {step === 2 && bd.winner && (
          <div key="bd" className="motion-safe:animate-fs-pop-in flex flex-col items-center gap-4 text-center">
            <div className="text-5xl">{STEPS[2].icon}</div>
            <div className="text-sm font-extrabold uppercase tracking-wide text-ink-muted">{STEPS[2].title}</div>
            <div className={`rounded-card border-2 px-8 py-6 bg-gradient-to-br from-amber-50 to-white ${meWon(bd.winner.id) ? 'border-amber-400' : 'border-amber-200'} shadow-lift`}>
              <div className="text-4xl">{bd.winner.logo}</div>
              <div className="text-2xl sm:text-3xl font-black mt-1">{bd.winner.name}</div>
              <div className="text-sm text-ink-muted">{bd.winner.clubName} · {bd.winner.pos} · OVR {bd.winner.ovr}</div>
              <div className="mt-2 text-xs font-bold text-ink-soft">{bd.winner.goals} gol · ball: {bd.winner.score}</div>
              {meWon(bd.winner.id) && <div className="mt-2 text-sm font-black text-amber-700">🎉 Tabriklaymiz — bu mukofot SIZGA!</div>}
            </div>
            {(bd.nominees || []).length > 0 && (
              <div className="w-full max-w-md">
                <div className="text-[11px] font-extrabold uppercase tracking-wide text-ink-muted mb-1.5">Boshqa nomzodlar</div>
                {bd.nominees.map((n, i) => (
                  <div key={n.id} className="flex items-center gap-3 text-sm bg-surface rounded-control border border-surface-line px-3 py-2 mb-1.5">
                    <span className="w-5 font-bold text-ink-muted">{i + 2}</span><span>{n.logo}</span>
                    <span className="flex-1 text-left font-semibold truncate">{n.name}</span><span className="text-xs text-ink-muted tabular-nums">{n.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step >= 0 && (
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>← Orqaga</Button>
            {step < 2 ? <Button onClick={() => setStep((s) => s + 1)}>Keyingisi →</Button> : <Button variant="secondary" onClick={() => setStep(0)}>Qayta ko'rish</Button>}
          </div>
        )}
      </div>
    </div>
  );
}
