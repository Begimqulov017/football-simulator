import React from 'react';
import TopBar from './components/TopBar';
import Hero from './components/Hero';
import SectionCard from './components/SectionCard';
import BackgroundDecor from './components/BackgroundDecor';
import BrandMark from './components/BrandMark';
import { SECTIONS } from './data/sections';

// Phase 1 — Landing sahifa (Clean Light UI).
// Props avvalgi StartPage bilan bir xil, shuning uchun App.jsx logikasi o'zgarmaydi.
export default function LandingPage({
  currentUser,
  onOpenMatchSimulator,
  onOpenProSimulator, // Football Career
  onGoLogin,
  onGoRegister,
  onLogout,
}) {
  const handlers = { match: onOpenMatchSimulator, career: onOpenProSimulator };

  return (
    <div className="relative min-h-screen flex flex-col font-sans text-ink bg-surface overflow-x-hidden">
      <BackgroundDecor />

      <div className="relative z-10 flex flex-col flex-1">
        <TopBar currentUser={currentUser} onGoLogin={onGoLogin} onGoRegister={onGoRegister} onLogout={onLogout} />

        <main className="flex-1 w-full max-w-6xl mx-auto flex flex-col items-center justify-center gap-10 sm:gap-14 px-4 sm:px-6 py-10 sm:py-14">
          <Hero />

          <section aria-label="Bo'limlar" className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {SECTIONS.map((section, i) => (
              <SectionCard
                key={section.key}
                section={section}
                delayMs={150 + i * 120}
                onClick={handlers[section.key]}
              />
            ))}
          </section>
        </main>

        <footer className="w-full max-w-6xl mx-auto flex items-center justify-center gap-2 px-4 py-6 text-xs font-medium text-ink-subtle">
          <BrandMark size={20} />
          Football-Simulator © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
