import React from 'react';

// A small, dependency-free icon set. Using real SVG paths (instead of emoji
// like ⬅ 🚪 🛡️) means every icon renders identically and crisply on every
// device/browser/font — no more "broken pencil-drawing" glyphs on systems
// without a full color-emoji font installed.
const PATHS = {
  back: 'M15 18l-6-6 6-6',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  login: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  shield: 'M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3Z',
  trophy: 'M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4ZM7 5H4a3 3 0 0 0 3 5M17 5h3a3 3 0 0 1-3 5',
  gamepad: 'M6 12h4M8 10v4M15 13h.01M17.5 11h.01M17 5H7a5 5 0 0 0-5 5v3a5 5 0 0 0 5 5h.5l1.5-2h6l1.5 2H17a5 5 0 0 0 5-5v-3a5 5 0 0 0-5-5Z',
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  club: 'M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3Z',
  stats: 'M4 20V10M12 20V4M20 20v-7',
  mail: 'M3 5h18v14H3zM3 6l9 7 9-7',
  dumbbell: 'M6 7v10M18 7v10M2 10v4M22 10v4M6 12h12',
  money: 'M3 6h18v12H3zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM6 6v0M18 18v0',
  transfer: 'M17 3l4 4-4 4M3 7h18M7 21l-4-4 4-4M21 17H3',
  lock: 'M6 10V7a6 6 0 1 1 12 0v3M5 10h14v10H5z',
  unlock: 'M6 10V7a6 6 0 0 1 11-3.6M5 10h14v10H5z',
  check: 'M20 6 9 17l-5-5',
  trash: 'M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14',
  warning: 'M12 2 1 21h22L12 2ZM12 9v5M12 17h.01',
  close: 'M18 6 6 18M6 6l12 12',
  eye: 'M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  spinner: 'M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8',
  star: 'M12 2l3 7 7 .5-5.3 4.9L18 22l-6-4-6 4 1.3-7.6L2 9.5 9 9l3-7Z',
  news: 'M4 4h13a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4ZM4 4v13a3 3 0 0 0 3 3M8 8h8M8 12h8M8 16h4M17 8v9',
};

export default function Icon({ name, size = 18, className = '', strokeWidth = 2, ...rest }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d={d} />
    </svg>
  );
}
