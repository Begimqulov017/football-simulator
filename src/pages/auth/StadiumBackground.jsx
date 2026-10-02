import React, { useMemo } from 'react';

// Ambient night-stadium backdrop: floodlights, crowd bokeh, striped pitch in
// perspective and gradient overlays. Pure CSS/SVG — no image downloads.
// Crowd dots use a deterministic pseudo-random sequence so they don't jump
// around on every re-render.
function seeded(n) {
  let s = n;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

export default function StadiumBackground() {
  const dots = useMemo(() => {
    const r = seeded(7);
    return Array.from({ length: 46 }, () => ({
      left: `${r() * 100}%`,
      top: `${r() * 100}%`,
      size: 2 + r() * 4,
      delay: -r() * 4,
      dur: 3 + r() * 4,
    }));
  }, []);

  return (
    <div className="au-bg" aria-hidden="true">
      <div className="au-bg-sky" />
      <div className="au-beam l" />
      <div className="au-beam r" />
      <span className="au-flare l" />
      <span className="au-flare r" />

      <div className="au-crowd">
        {dots.map((d, i) => (
          <i key={i} style={{ left: d.left, top: d.top, width: d.size, height: d.size, animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }} />
        ))}
      </div>
      <div className="au-stand" />

      <div className="au-pitch-wrap">
        <div className="au-pitch">
          <svg viewBox="0 0 800 500" preserveAspectRatio="none" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="3">
            <rect x="30" y="20" width="740" height="460" />
            <line x1="400" y1="20" x2="400" y2="480" />
            <circle cx="400" cy="250" r="64" />
            <rect x="30" y="140" width="120" height="220" />
            <rect x="650" y="140" width="120" height="220" />
            <rect x="30" y="200" width="44" height="100" />
            <rect x="726" y="200" width="44" height="100" />
          </svg>
        </div>
      </div>

      <div className="au-overlay" />
      <div className="au-grain" />
    </div>
  );
}
