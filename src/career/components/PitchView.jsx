import React from 'react';

// 4-3-3 maydon koordinatalari (foizda). Slot nomlari server bilan bir xil:
// GK / LB / CB / RB / MID / FW. Bir slotda bir nechta o'yinchi bo'lsa, ro'yxat tartibida joylashadi.
const SLOT_COORDS = {
  GK: [[50, 90]],
  LB: [[13, 70]],
  CB: [[37, 73], [63, 73]],
  RB: [[87, 70]],
  MID: [[24, 48], [50, 43], [76, 48]],
  FW: [[20, 17], [50, 11], [80, 17]],
};

// players: [{ id, name, slot, pos, ovr?, isYou?, sub? }]  — `sub` kichik yozuv (klub logotipi/bayroq)
export default function PitchView({ players, highlightId = null, showOvr = true }) {
  const counters = {};
  return (
    <div className="relative w-full max-w-md mx-auto aspect-[2/3] rounded-xl overflow-hidden bg-gradient-to-b from-emerald-500 to-emerald-700 shadow-soft">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 300" preserveAspectRatio="none" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" aria-hidden="true">
        <rect x="6" y="6" width="188" height="288" rx="2" />
        <line x1="6" y1="150" x2="194" y2="150" />
        <circle cx="100" cy="150" r="26" />
        <rect x="45" y="6" width="110" height="44" />
        <rect x="45" y="250" width="110" height="44" />
        <rect x="75" y="6" width="50" height="18" />
        <rect x="75" y="276" width="50" height="18" />
      </svg>
      {players.map((p, i) => {
        const idx = (counters[p.slot] = counters[p.slot] || 0);
        counters[p.slot] += 1;
        const [x, y] = (SLOT_COORDS[p.slot] || [[50, 50]])[idx] || [50, 50];
        const me = p.isYou || (highlightId && p.id === highlightId);
        const last = String(p.name || '').split(' ').slice(-1)[0];
        return (
          <div
            key={p.id || i}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-[68px] flex flex-col items-center gap-0.5 motion-safe:animate-fs-pop-in"
            style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 60}ms` }}
          >
            <div className={`w-10 h-10 rounded-full bg-white border-2 flex flex-col items-center justify-center shadow-soft leading-none ${me ? 'border-amber-400 text-amber-700 ring-2 ring-amber-200' : 'border-accent text-accent-dark'}`}>
              <span className="text-[12px] font-extrabold">{showOvr && p.ovr != null ? p.ovr : p.pos}</span>
              {showOvr && p.ovr != null && <span className="text-[8px] font-bold opacity-70">{p.pos}</span>}
            </div>
            <span className="text-[10px] font-bold text-white drop-shadow text-center leading-tight max-w-[68px] truncate">{last}{me ? ' ★' : ''}</span>
            {p.sub ? <span className="text-[9px] text-white/85">{p.sub}</span> : null}
          </div>
        );
      })}
    </div>
  );
}
