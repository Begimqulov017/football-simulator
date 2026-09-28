import React, { useState } from 'react';
import AppShell from '../components/AppShell';
import NotStarted from '../components/NotStarted';
import { useGame } from '../context/GameContext';

const TABS = [
  { id: 'staff', label: 'Xodimlar va murabbiylar' },
  { id: 'gear', label: 'Jihozlar' },
  { id: 'clubs', label: 'Klub egaligi' }
];

const STAFF = [
  { key: 'fitnessTrainer', name: 'Fitnes murabbiyi', effect: '+25% training natijasi', price: 25000 },
  { key: 'physio', name: 'Fizioterapevt', effect: 'Kuch-quvvat va jarohatdan tezroq tiklanish', price: 30000 },
  { key: 'agent', name: 'Agent', effect: 'Kattaroq klublardan takliflarni ochadi', price: 50000 }
];

const GEAR = [
  { key: 'boots', value: 'pro', name: 'Pro butsalar', effect: "O'yinda +1 stat", price: 8000 },
  { key: 'boots', value: 'elite', name: 'Elite butsalar', effect: "O'yinda +2 stat", price: 20000 }
];

export default function MoneyPage() {
  const [tab, setTab] = useState('staff');
  const { player, purchasePerk, requestNewContract } = useGame();
  if (!player) return null;

  const { money, weeklyWage, perks } = player.career;
  const hasPendingContract = player.career.messages.some((m) => m.type === 'contract' && !m.resolved);
  const daysSinceAsk = player.career.day - (player.career.lastContractRequestDay || 0);
  const onCooldown = !hasPendingContract && daysSinceAsk < 20;
  const contractDisabled = hasPendingContract || onCooldown;

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Pul va byudjet</h1>
          <div className="sub">Balans ${money.toLocaleString()} · Haftalik maosh ${weeklyWage.toLocaleString()}</div>
        </div>
        <button className="btn btn-primary" disabled={contractDisabled} onClick={requestNewContract}>
          {hasPendingContract ? 'Taklif kutilmoqda...' : onCooldown ? `Yana ${20 - daysSinceAsk} kun kuting` : "Yangi kontrakt so'rash"}
        </button>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              className="btn"
              onClick={() => setTab(t.id)}
              style={{ background: tab === t.id ? 'var(--glass-fill-strong)' : undefined }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'staff' && STAFF.map((s) => {
          const owned = perks?.[s.key];
          return (
            <div key={s.name} className="list-row">
              <div>
                <div>{s.name}</div>
                <div className="sub" style={{ fontSize: 12 }}>{s.effect}</div>
              </div>
              <button
                className="btn"
                disabled={owned || money < s.price}
                onClick={() => purchasePerk(s.key, s.price, true)}
              >
                {owned ? "Sotib olingan" : `$${s.price.toLocaleString()}`}
              </button>
            </div>
          );
        })}

        {tab === 'gear' && GEAR.map((g) => {
          const owned = perks?.boots === g.value;
          return (
            <div key={g.name} className="list-row">
              <div>
                <div>{g.name}</div>
                <div className="sub" style={{ fontSize: 12 }}>{g.effect}</div>
              </div>
              <button
                className="btn"
                disabled={owned || money < g.price}
                onClick={() => purchasePerk('boots', g.price, g.value)}
              >
                {owned ? 'Kiyilgan' : `$${g.price.toLocaleString()}`}
              </button>
            </div>
          );
        })}

        {tab === 'clubs' && (
          <NotStarted icon="🏟️" title="Klub egaligi keyinroq" desc="Yetarli mablag' to'plaganingizdan so'ng klub sotib olishingiz mumkin bo'ladi." />
        )}
      </div>
    </AppShell>
  );
}
