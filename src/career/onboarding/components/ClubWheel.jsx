import React, { useState } from 'react';
import { useLogoUrl } from '../../../components/TeamLogo';

// G'ildirak (roulette): SVG bo'laklar + CSS transform bilan aylanadi.
// `segments` — [{ id, icon, name }]: liga yoki klub (icon — emoji/bayroq; haqiqiy logotip bo'lsa rasm chiqadi).
// `rotation` — kumulyativ gradus.
const SIZE = 320;
const R = 150;
const C = SIZE / 2;
const FILLS = ['#ECFDF5', '#F0F9FF', '#FFFFFF', '#F1F5F9'];

const polar = (angleDeg, radius) => {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [C + radius * Math.cos(a), C + radius * Math.sin(a)];
};

function slicePath(i, n) {
  if (n === 1) return `M ${C} ${C - R} A ${R} ${R} 0 1 1 ${C - 0.01} ${C - R} Z`;
  const a0 = (360 / n) * i;
  const a1 = (360 / n) * (i + 1);
  const [x0, y0] = polar(a0, R);
  const [x1, y1] = polar(a1, R);
  return `M ${C} ${C} L ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1} Z`;
}

// SVG ichida HTML (<img>/<span>) chizilmaydi - shuning uchun <image> yoki <text> ishlatamiz.
function SvgIcon({ seg, x, y, size, rot }) {
  const url = useLogoUrl(seg.id);
  const [broken, setBroken] = useState(false);
  if (url && !broken) {
    return (
      <image
        href={url}
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        preserveAspectRatio="xMidYMid meet"
        transform={`rotate(${rot} ${x} ${y})`}
        onError={() => setBroken(true)}
      />
    );
  }
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.85} transform={`rotate(${rot} ${x} ${y})`}>
      {seg.icon || '\u26BD'}
    </text>
  );
}

const shortName = (name = '') => (name.length > 11 ? `${name.slice(0, 10)}…` : name);

export default function ClubWheel({ segments, rotation, spinning, durationMs, highlightIndex }) {
  const n = segments.length;
  const iconSize = n <= 6 ? 40 : n <= 9 ? 34 : 28;
  return (
    <div className="relative mx-auto w-full max-w-[320px] aspect-square select-none">
      {/* Ko'rsatkich (tepada) */}
      <div className="absolute left-1/2 -top-1 -translate-x-1/2 z-10 drop-shadow">
        <svg width="28" height="34" viewBox="0 0 28 34">
          <path d="M14 34 2 8a13 13 0 1 1 24 0L14 34Z" fill="#0F172A" />
          <circle cx="14" cy="11" r="4.5" fill="#10B981" />
        </svg>
      </div>

      <div className="absolute inset-0 rounded-full overflow-hidden shadow-lift border-4 border-white bg-white pointer-events-none">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="block w-full h-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? `transform ${durationMs}ms cubic-bezier(0.12, 0.72, 0.16, 1)` : 'none',
            willChange: 'transform',
          }}
        >
          <circle cx={C} cy={C} r={R + 6} fill="#E2E8F0" />
          {segments.map((t, i) => {
            const mid = n === 1 ? 0 : (360 / n) * (i + 0.5);
            const [ix, iy] = polar(mid, R * 0.72);
            const [lx, ly] = polar(mid, R * 0.46);
            const hit = highlightIndex === i;
            return (
              <g key={`${t.id}-${i}`}>
                <path d={slicePath(i, n)} fill={hit ? '#D1FAE5' : FILLS[i % FILLS.length]} stroke="#CBD5E1" strokeWidth="1" />
                <SvgIcon seg={t} x={ix} y={iy} size={iconSize} rot={mid} />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="8.5"
                  fontWeight="700"
                  fill="#475569"
                  transform={`rotate(${mid} ${lx} ${ly})`}
                >
                  {shortName(t.name)}
                </text>
              </g>
            );
          })}
          <circle cx={C} cy={C} r="22" fill="#0F172A" />
          <text x={C} y={C} textAnchor="middle" dominantBaseline="central" fontSize="18">⚽</text>
        </svg>
      </div>
    </div>
  );
}
