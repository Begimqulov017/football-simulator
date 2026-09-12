import React, { useState } from 'react';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';
import {
  MAIN_STAT_LABELS, TRAINING_FOCUS, SUB_STAT_WEIGHTS,
  computeTrainingGain, clampStat, calcMainStats, calcOVR, calcGoalkeeperOVR
} from '../utils/statCalc';

const FOCUS_TONES = { HIGH_RISK: 'badge-red', BALANCED: 'badge-gold', LIGHT: 'badge-green' };

export default function TrainingPage() {
  const { player, updatePlayer } = useGame();
  const [selected, setSelected] = useState([]);
  const [focus, setFocus] = useState('BALANCED');

  if (!player) return null;

  const statKeys = Object.keys(player.mainStats);
  const isGk = player.position === 'GK';
  const trainedToday = player.career.trainingDate === player.career.gameDate;
  const injured = !!player.career.injury;

  const toggleStat = (key) => {
    setSelected((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= 3) return prev;
      return [...prev, key];
    });
  };

  const canTrain = selected.length === 3 && !trainedToday && !injured;

  const handleTrain = () => {
    if (!canTrain) return;
    updatePlayer((prev) => {
      const gain = computeTrainingGain(focus, prev.age, prev.potential, prev.overall);
      const bonus = prev.career.perks?.fitnessTrainer ? gain * 0.25 : 0;
      const totalGain = gain + bonus;
      const newSubStats = { ...prev.subStats };

      selected.forEach((key) => {
        if (isGk) {
          newSubStats[key] = clampStat((newSubStats[key] || 0) + totalGain);
        } else {
          Object.keys(SUB_STAT_WEIGHTS[key] || {}).forEach((subKey) => {
            newSubStats[subKey] = clampStat((newSubStats[subKey] || 0) + totalGain);
          });
        }
      });

      const newMainStats = isGk ? newSubStats : calcMainStats(newSubStats);
      const newOvr = isGk ? calcGoalkeeperOVR(newSubStats) : calcOVR(prev.position, newMainStats);

      const focusDef = TRAINING_FOCUS[focus];
      let injury = prev.career.injury;
      if (!injury && Math.random() < focusDef.injuryRisk) {
        injury = { daysLeft: Math.floor(Math.random() * 8) + 3, description: 'Training injury' };
      }

      return {
        overall: Math.min(newOvr, prev.potential),
        subStats: newSubStats,
        mainStats: newMainStats,
        career: {
          ...prev.career,
          trainingDate: prev.career.gameDate,
          stamina: clampStat(prev.career.stamina - focusDef.staminaCost, 0, 100),
          injury
        }
      };
    });
    setSelected([]);
  };

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Training</h1>
          <div className="sub">Pick exactly 3 stats to focus on and a training intensity.</div>
        </div>
        <span className={`badge ${trainedToday ? 'badge-green' : 'badge-gold'}`}>
          {injured ? 'Injured' : trainedToday ? 'Trained Today' : 'Ready'}
        </span>
      </div>

      {injured && (
        <div className="card" style={{ marginBottom: 18, borderColor: 'rgba(255,59,87,0.4)' }}>
          <div className="card-title">INJURED</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {player.career.injury.description} - back in {player.career.injury.daysLeft} day(s). No training or matches until then.
          </p>
        </div>
      )}

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-title">CHOOSE 3 STATS ({selected.length}/3)</div>
        <div className="grid grid-3">
          {statKeys.map((key) => (
            <div
              key={key}
              className={`roll-slot${selected.includes(key) ? ' done' : ''}`}
              style={{ cursor: injured ? 'not-allowed' : 'pointer', opacity: injured ? 0.5 : 1 }}
              onClick={() => !injured && toggleStat(key)}
            >
              <div className="roll-label">{MAIN_STAT_LABELS[key] || key.toUpperCase()}</div>
              <div className="roll-value">{Math.round(player.mainStats[key])}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-title">TRAINING FOCUS</div>
        <div className="grid grid-3">
          {Object.values(TRAINING_FOCUS).map((m) => (
            <div
              key={m.id}
              className="result-card"
              style={{ cursor: 'pointer', border: focus === m.id ? '2px solid var(--accent-gold)' : undefined }}
              onClick={() => setFocus(m.id)}
            >
              <span className={`badge ${FOCUS_TONES[m.id]}`}>{m.label}</span>
              <div className="value" style={{ marginTop: 10, fontSize: 15 }}>Gain x{m.statGain}</div>
              <div className="label">Stamina -{m.staminaCost} · Injury {(m.injuryRisk * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <button className="btn btn-primary btn-block" disabled={!canTrain} onClick={handleTrain}>
          {trainedToday ? 'Already trained today' : 'Train'}
        </button>
      </div>

      <div className="card">
        <div className="card-title">HOW GROWTH WORKS</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
          Gains aren't a flat number - they scale with your training intensity, your age
          (17-23 trains at 150%, 24-29 prime at 100%, 30+ slows down a lot), and how much
          room is left before your Potential ({player.potential}) - the closer you get, the
          slower it climbs. A Fitness Trainer from the Money page adds +25% to every session.
          Bad match performances and injuries can knock Potential down; great games in your
          prime years (24-29) can push it back up.
        </p>
      </div>
    </AppShell>
  );
}
