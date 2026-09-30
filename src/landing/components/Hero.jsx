import React from 'react';
import { Badge } from '../../components/ui';

// Sahifa markazidagi asosiy sarlavha (Hero).
export default function Hero() {
  return (
    <div className="text-center flex flex-col items-center motion-safe:animate-fs-fade-up">
      <Badge tone="brand" className="mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-brand" />
        Futbol simulyatsiyasi platformasi
      </Badge>

      <h1
        aria-label="FOOTBALL-SIMULATOR"
        className="m-0 font-black tracking-tight leading-[1.05] text-ink text-[clamp(2.4rem,11vw,3.4rem)] sm:text-[clamp(2.25rem,6.4vw,5.25rem)]"
      >
        <span aria-hidden="true">
          FOOTBALL-
          <wbr />
          <span className="bg-gradient-to-r from-brand via-brand-dark to-accent bg-clip-text text-transparent">
            SIMULATOR
          </span>
        </span>
      </h1>

      <p className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-ink-muted">
        Bir zumda o'yin simulyatsiya qiling yoki o'z futbol karyerangizni noldan quring.
        Qaysi yo'nalishni tanlaysiz?
      </p>
    </div>
  );
}
