import React from 'react';
import { INITIAL_TEAMS } from '../../data/teamsData';
import { NATIONALITIES } from '../../data/leaguesData';

// Phase 5 — Leagues & Tournaments Dashboard uchun umumiy yordamchilar.

const LOGOS = new Map(INITIAL_TEAMS.map((t) => [t.id, t.logo]));
const FLAGS = new Map(NATIONALITIES.map((n) => [n.name, n.flag]));

export const clubLogo = (id) => LOGOS.get(id) || '⚽';
export const nationFlag = (name) => FLAGS.get(name) || '🏳️';

// Kontinental turnirlarda mavsum = boshlanish YILI (2026 -> "2026/27"),
// ligalarda esa mavsum = tartib raqami ("3-mavsum").
export const yearSeason = (y) => (y ? `${y}/${String(Number(y) + 1).slice(2)}` : '');
export const counterSeason = (n) => (n ? `${n}-mavsum` : '');

// history yozuvidan turnir kalitini topadi ("ucl_2026" -> "ucl")
export const keyOfHistory = (h) => h.key || String(h.id || '').replace(/_\d+$/, '');

// Pill ko'rinishidagi filtr tugmalari
export function Chips({ items, active, onChange, className = '' }) {
  return (
    <div className={`flex gap-2 flex-wrap ${className}`} role="tablist">
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          role="tab"
          aria-selected={active === it.key}
          disabled={it.disabled}
          onClick={() => onChange(it.key)}
          className={`font-sans text-xs font-bold rounded-full px-3 py-1.5 border cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            active === it.key ? 'bg-ink text-white border-ink' : 'bg-surface-card text-ink-soft border-surface-line hover:border-ink-subtle'
          }`}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

// Kichik rangli yorliq
export function Tag({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-surface-muted text-ink-soft border-surface-line',
    brand: 'bg-brand-tint text-brand-dark border-brand-soft',
    gold: 'bg-amber-50 text-amber-800 border-amber-200',
    accent: 'bg-accent-tint text-accent-dark border-accent-soft',
  };
  return <span className={`inline-block text-[10px] font-extrabold uppercase tracking-wide border rounded-full px-2 py-0.5 ${tones[tone]}`}>{children}</span>;
}
