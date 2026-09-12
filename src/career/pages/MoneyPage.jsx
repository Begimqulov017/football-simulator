import React, { useState } from 'react';
import AppShell from '../components/AppShell';
import NotStarted from '../components/NotStarted';
import { useGame } from '../context/GameContext';

const TABS = [
  { id: 'staff', label: 'Staff & Coaches' },
  { id: 'gear', label: 'Equipment & Gear' },
  { id: 'clubs', label: 'Club Ownership' }
];

const STAFF = [
  { key: 'fitnessTrainer', name: 'Fitness Trainer', effect: '+25% training stat gains', price: 25000 },
  { key: 'physio', name: 'Physiotherapist', effect: 'Faster stamina & injury recovery', price: 30000 },
  { key: 'agent', name: 'Agent', effect: 'Unlocks offers from bigger clubs', price: 50000 }
];

const GEAR = [
  { key: 'boots', value: 'pro', name: 'Pro Boots', effect: '+1 stat in matches', price: 8000 },
  { key: 'boots', value: 'elite', name: 'Elite Boots', effect: '+2 stats in matches', price: 20000 }
];

export default function MoneyPage() {
  const [tab, setTab] = useState('staff');
  const { player, purchasePerk, requestNewContract } = useGame();
  if (!player) return null;

  const { money, weeklyWage, perks } = player.career;
  const hasPendingContract = player.career.messages.some((m) => m.type === 'contract' && !m.resolved);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Money & Budget</h1>
          <div className="sub">Balance ${money.toLocaleString()} · Weekly Wage ${weeklyWage.toLocaleString()}</div>
        </div>
        <button className="btn btn-primary" disabled={hasPendingContract} onClick={requestNewContract}>
          {hasPendingContract ? 'Offer pending...' : 'Request New Contract'}
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
                {owned ? 'Owned' : `$${s.price.toLocaleString()}`}
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
                {owned ? 'Equipped' : `$${g.price.toLocaleString()}`}
              </button>
            </div>
          );
        })}

        {tab === 'clubs' && (
          <NotStarted icon="🏟️" title="Club ownership coming later" desc="Buy clubs once you've built up enough career earnings." />
        )}
      </div>
    </AppShell>
  );
}
