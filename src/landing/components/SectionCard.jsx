import React from 'react';
import Icon from '../../components/Icon';
import { Badge } from '../../components/ui';

// Ton (brand / accent) bo'yicha rang sxemalari — to'liq statik klass nomlari
// (Tailwind JIT dinamik yig'ilgan klasslarni ko'rmaydi).
const TONES = {
  brand: {
    icon: 'bg-brand-tint text-brand-dark group-hover:bg-brand group-hover:text-white',
    border: 'hover:border-brand',
    glow: 'group-hover:shadow-glow-brand',
    bar: 'from-brand to-brand-dark',
    dot: 'text-brand',
    cta: 'text-brand-dark',
    ring: 'focus-visible:ring-brand',
  },
  accent: {
    icon: 'bg-accent-tint text-accent-dark group-hover:bg-accent group-hover:text-white',
    border: 'hover:border-accent',
    glow: 'group-hover:shadow-glow-accent',
    bar: 'from-accent to-accent-dark',
    dot: 'text-accent',
    cta: 'text-accent-dark',
    ring: 'focus-visible:ring-accent',
  },
};

// Katta, interaktiv bo'lim kartasi (butun karta bosiladi).
export default function SectionCard({ section, onClick, delayMs = 0 }) {
  const t = TONES[section.tone] || TONES.brand;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ animationDelay: `${delayMs}ms` }}
      className={[
        'group relative overflow-hidden text-left w-full',
        'bg-surface-card border border-surface-line rounded-card shadow-soft p-6 sm:p-8',
        'flex flex-col gap-5 cursor-pointer',
        'transition-all duration-300 ease-out',
        'motion-safe:hover:-translate-y-1.5 hover:shadow-lift',
        'motion-safe:animate-fs-fade-up',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        t.border,
        t.glow,
        t.ring,
      ].join(' ')}
    >
      {/* Yuqoridagi rangli chiziq — hover'da kengayadi */}
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-1 origin-left bg-gradient-to-r ${t.bar} scale-x-[0.18] group-hover:scale-x-100 transition-transform duration-500 ease-out`}
      />

      <div className="flex items-start justify-between gap-3">
        <span
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 motion-safe:group-hover:scale-105 motion-safe:group-hover:-rotate-3 ${t.icon}`}
        >
          <Icon name={section.icon} size={28} strokeWidth={1.8} />
        </span>
        <Badge tone={section.tone}>{section.tag}</Badge>
      </div>

      <div>
        <h2 className="m-0 text-2xl sm:text-[1.7rem] font-extrabold tracking-tight text-ink">{section.title}</h2>
        <p className="mt-2 mb-0 text-[0.95rem] leading-relaxed text-ink-muted">{section.description}</p>
      </div>

      <ul className="list-none m-0 p-0 flex flex-col gap-2">
        {section.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm font-medium text-ink-soft">
            <Icon name="check" size={15} strokeWidth={2.6} className={t.dot} />
            {f}
          </li>
        ))}
      </ul>

      <span className={`mt-auto pt-1 inline-flex items-center gap-2 text-sm font-bold ${t.cta}`}>
        {section.cta}
        <Icon
          name="arrow"
          size={17}
          strokeWidth={2.4}
          className="transition-transform duration-300 motion-safe:group-hover:translate-x-1.5"
        />
      </span>
    </button>
  );
}
