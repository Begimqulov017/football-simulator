import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { buildStartingStats } from '../utils/playerGen';
import Stepper from './components/Stepper';
import NegotiateModal from './components/NegotiateModal';
import CreateStep from './steps/CreateStep';
import WheelStep from './steps/WheelStep';
import { buildNewPlayer } from './onboardingUtils';

// Pensiyaga chiqqan o'yinchining "merosi" (RetirementPage yozadi)
const LEGACY_KEY = 'footballSimulator.legacyCareer';
function readLegacyCareer() {
  try {
    const raw = sessionStorage.getItem(LEGACY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

// Phase 3 — Football Career boshlanishi: 1) O'yinchi yaratish 2) Klub g'ildiragi 3) Muzokara.
export default function OnboardingFlow() {
  const navigate = useNavigate();
  const { createPlayer } = useGame();
  const [legacy] = useState(() => readLegacyCareer());

  const [step, setStep] = useState('create');
  const [form, setForm] = useState(() => ({
    name: '', surname: legacy ? `${legacy.surname} Jr.` : '', nickname: '', number: '',
    position: '', nationality: '', birthMonth: 1, birthDay: 1,
  }));
  const [deal, setDeal] = useState(null); // { clubResult, rating, potential, naturalTier, stats, ovr }

  const openNegotiation = (data) => {
    const stats = buildStartingStats(form.position, data.rating);
    setDeal({ ...data, stats, ovr: stats.ovr });
  };

  const finish = (contract) => {
    const player = buildNewPlayer({
      form, clubResult: deal.clubResult, rating: deal.rating, potential: deal.potential,
      contract, legacy, stats: deal.stats,
    });
    createPlayer(player);
    if (legacy) sessionStorage.removeItem(LEGACY_KEY);
    navigate('/home', { replace: true });
  };

  // Nickname bo'sh bo'lsa, familiya ishlatiladi (kartada ko'rinishi uchun)
  const cardForm = { ...form, nickname: form.nickname || form.surname };

  return (
    <div className="min-h-screen font-sans text-ink bg-surface relative overflow-x-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-[24rem] h-[24rem] rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute -top-20 -right-24 w-[22rem] h-[22rem] rounded-full bg-accent/10 blur-3xl" />
      </div>
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6">
        <Stepper current={step} />
        <div key={step} className="motion-safe:animate-fs-fade-up">
          {step === 'create' && (
            <CreateStep form={cardForm} setForm={setForm} legacy={legacy} onNext={() => setStep('wheel')} />
          )}
          {step === 'wheel' && (
            <WheelStep form={cardForm} onBack={() => setStep('create')} onAccepted={openNegotiation} />
          )}
        </div>
      </div>

      {deal && <NegotiateModal ctx={deal} onClose={() => setDeal(null)} onSigned={finish} />}
    </div>
  );
}
