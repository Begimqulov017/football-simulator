import React from 'react';
import { getSurname, cleanName, CAT_COLOR } from './squadUtils';
import { getRatingTier } from '../../utils/ratingTier';

// Grain for the turf: fractal noise baked into a data URI so there is no
// image asset to ship. Layered over the mowing stripes below.
const GRAIN = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0.1  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>\")";

const TURF = {
  background: [
    // mowing stripes: 10 bands top to bottom
    'repeating-linear-gradient(180deg, #2f9e5b 0 10%, #29904f 10% 20%)',
    // light falloff so the middle of the pitch reads brighter than the corners
    'radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.14), rgba(0,0,0,0.18) 85%)',
  ].join(', '),
};

// Line markings on a 300x400 canvas (same 3:4 ratio as the pitch box, so
// nothing is stretched). Proportions follow a 68x105 m pitch.
function PitchMarkings() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 400" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" aria-hidden="true">
      <rect x="10" y="10" width="280" height="380" rx="2" />
      <line x1="10" y1="200" x2="290" y2="200" />
      <circle cx="150" cy="200" r="33" />
      <circle cx="150" cy="200" r="2" fill="rgba(255,255,255,0.7)" />
      {/* top box */}
      <rect x="68" y="10" width="164" height="60" />
      <rect x="112" y="10" width="76" height="20" />
      <circle cx="150" cy="50" r="2" fill="rgba(255,255,255,0.7)" />
      <path d="M123.8 70 A33 33 0 0 0 176.2 70" />
      {/* bottom box */}
      <rect x="68" y="330" width="164" height="60" />
      <rect x="112" y="370" width="76" height="20" />
      <circle cx="150" cy="350" r="2" fill="rgba(255,255,255,0.7)" />
      <path d="M123.8 330 A33 33 0 0 1 176.2 330" />
      {/* corners */}
      <path d="M10 17 A7 7 0 0 0 17 10" />
      <path d="M283 10 A7 7 0 0 0 290 17" />
      <path d="M10 383 A7 7 0 0 1 17 390" />
      <path d="M283 390 A7 7 0 0 1 290 383" />
    </svg>
  );
}

const TIER_CHIP = {
  gold: 'bg-amber-300 text-amber-950',
  silver: 'bg-slate-200 text-slate-900',
  bronze: 'bg-amber-700 text-amber-50',
};

function Pin({ slot, isMe, selected, nameMode, onSelect }) {
  const { player, category, kind } = slot;
  const color = CAT_COLOR[category];
  const fullName = cleanName(player.name);
  const label = nameMode === 'full' ? fullName : getSurname(player.name);
  const outOfPlace = kind !== 'natural';

  return (
    <button
      type="button"
      onClick={() => onSelect(player.id)}
      aria-pressed={selected}
      aria-label={`${fullName}, ${player.pos}, overall ${player.ovr ?? 'unknown'}`}
      title={`${fullName} · ${player.pos} · OVR ${player.ovr ?? '-'}${kind === 'cover' ? ' · covering this line' : ''}${kind === 'out' ? ' · out of position' : ''}`}
      className="absolute p-0 bg-transparent border-0 cursor-pointer group focus:outline-none"
      style={{ left: `${slot.x}%`, top: `${slot.y}%`, transform: 'translate(-50%, -100%)' }}
    >
      {/* pin: round head + pointed tail, tip sits exactly on the slot coordinate */}
      <span className="relative flex flex-col items-center transition-transform duration-200 group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5">
        <span
          className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-[11px] sm:text-xs font-extrabold shadow-lift"
          style={{
            color,
            border: `3px solid ${selected ? '#FACC15' : color}`,
            boxShadow: selected ? '0 0 0 4px rgba(250,204,21,0.45), 0 6px 14px rgba(0,0,0,0.3)' : '0 6px 14px rgba(0,0,0,0.28)',
          }}
        >
          {player.pos}
          <span className={`absolute -top-2 -right-3 min-w-[24px] h-[17px] px-1 rounded-md text-[10px] leading-[17px] font-extrabold text-center tabular-nums shadow-soft ${TIER_CHIP[getRatingTier(player.ovr || 0)]}`}>
            {player.ovr ?? '-'}
          </span>
          {isMe && (
            <span className="absolute -top-2 -left-2 w-[18px] h-[18px] rounded-full bg-amber-400 text-[11px] leading-[18px] text-center shadow-soft" aria-hidden="true">★</span>
          )}
          {outOfPlace && (
            <span className="absolute -bottom-1 -left-2 w-[16px] h-[16px] rounded-full bg-rose-500 text-white text-[10px] leading-[16px] font-extrabold text-center shadow-soft" aria-hidden="true">!</span>
          )}
        </span>
        <span
          className="block w-0 h-0 -mt-[1px]"
          style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `9px solid ${selected ? '#FACC15' : color}` }}
        />
      </span>

      {/* ground marker the pin tip rests on */}
      <span className="absolute left-1/2 top-full w-4 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-black/20" aria-hidden="true" />

      {/* name, directly under the pin */}
      <span
        className={`absolute left-1/2 top-full -translate-x-1/2 mt-1.5 px-2 py-0.5 text-[11px] sm:text-xs font-bold text-white bg-slate-900/75 shadow-soft ${
          nameMode === 'full'
            ? 'w-max max-w-[104px] sm:max-w-[132px] rounded-lg text-center leading-tight whitespace-normal'
            : 'w-max max-w-[92px] sm:max-w-[116px] rounded-full truncate whitespace-nowrap'
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function EmptyPin({ slot }) {
  return (
    <div
      className="absolute flex flex-col items-center"
      style={{ left: `${slot.x}%`, top: `${slot.y}%`, transform: 'translate(-50%, -100%)' }}
      title="No player available for this position"
    >
      <span className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-dashed border-white/70 text-white/80 text-[11px] font-bold">?</span>
      <span className="block w-0 h-0" style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '9px solid rgba(255,255,255,0.55)' }} />
    </div>
  );
}

export default function TacticalPitch({ slots, emptySlots = [], myId, selectedId, nameMode = 'surname', onSelect }) {
  return (
    <div
      className="relative w-full max-w-[620px] mx-auto aspect-[3/4] rounded-2xl overflow-hidden shadow-lift"
      style={{ ...TURF, boxShadow: 'inset 0 0 0 6px rgba(255,255,255,0.12), 0 16px 40px rgba(15,23,42,0.18)' }}
    >
      <div className="absolute inset-0 opacity-60 mix-blend-multiply pointer-events-none" style={{ backgroundImage: GRAIN }} aria-hidden="true" />
      <PitchMarkings />
      {emptySlots.map((s, i) => <EmptyPin key={`empty-${i}`} slot={s} />)}
      {slots.map((s) => (
        <Pin
          key={s.player.id}
          slot={s}
          isMe={s.player.id === myId}
          selected={s.player.id === selectedId}
          nameMode={nameMode}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
