import React from 'react';

// Juda yengil dekorativ fon: ikkita xira gradient dog' va maydon chiziqlari.
// pointer-events yo'q, mazmunga xalaqit bermaydi.
export default function BackgroundDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-32 -left-24 w-[26rem] h-[26rem] rounded-full bg-brand/15 blur-3xl motion-safe:animate-fs-float" />
      <div
        className="absolute -top-20 -right-24 w-[24rem] h-[24rem] rounded-full bg-accent/15 blur-3xl motion-safe:animate-fs-float"
        style={{ animationDelay: '-3s' }}
      />
      <svg
        className="absolute left-1/2 top-16 -translate-x-1/2 w-[70rem] max-w-none text-ink opacity-[0.035]"
        viewBox="0 0 800 400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="20" y="20" width="760" height="360" rx="8" />
        <line x1="400" y1="20" x2="400" y2="380" />
        <circle cx="400" cy="200" r="60" />
        <rect x="20" y="120" width="110" height="160" />
        <rect x="670" y="120" width="110" height="160" />
      </svg>
    </div>
  );
}
