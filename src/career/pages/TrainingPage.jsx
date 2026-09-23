import React, { useState, useRef, useEffect } from 'react';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';
import {
  MAIN_STAT_LABELS, TRAINING_FOCUS, SUB_STAT_WEIGHTS,
  computeTrainingGain, clampStat, calcMainStats, calcOVR, calcGoalkeeperOVR, yearlyOvrCap
} from '../utils/statCalc';

const FOCUS_TONES = { HIGH_RISK: 'badge-red', BALANCED: 'badge-gold', LIGHT: 'badge-green' };

export default function TrainingPage() {
  const { player, updatePlayer } = useGame();
  const [selected, setSelected] = useState([]);
  const [focus, setFocus] = useState('BALANCED');
  const [lastResult, setLastResult] = useState(null);
  const beforeSnapshot = useRef(null);

  // 8-BOSQICH: training bosilgach, o'zgarish (hatto 0.01 bo'lsa ham) shu
  // yerda darhol ko'rsatiladi - "bosaman-yu kuchaymaydi" degan taassurot
  // qolmasin deb.
  useEffect(() => {
    if (!beforeSnapshot.current || !player) return;
    const before = beforeSnapshot.current;
    const ovrDelta = Math.round((player.overall - before.overall) * 100) / 100;
    const statDeltas = before.keys.map((key) => ({
      key,
      delta: Math.round(((player.mainStats[key] || 0) - (before.mainStats[key] || 0)) * 100) / 100
    }));
    setLastResult({ ovrDelta, statDeltas });
    beforeSnapshot.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.overall]);

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
    const trainedKeys = [...selected];
    beforeSnapshot.current = { overall: player.overall, mainStats: { ...player.mainStats }, keys: trainedKeys };
    updatePlayer((prev) => {
      const gain = computeTrainingGain(focus, prev.age, prev.potential, prev.overall);
      const bonus = prev.career.perks?.fitnessTrainer ? gain * 0.25 : 0;
      const fullGain = gain + bonus;

      const applyGain = (amount) => {
        const stats = { ...prev.subStats };
        selected.forEach((key) => {
          if (isGk) {
            stats[key] = clampStat((stats[key] || 0) + amount);
          } else {
            Object.keys(SUB_STAT_WEIGHTS[key] || {}).forEach((subKey) => {
              stats[subKey] = clampStat((stats[subKey] || 0) + amount);
            });
          }
        });
        const mainStats = isGk ? stats : calcMainStats(stats);
        const ovr = isGk ? calcGoalkeeperOVR(stats) : calcOVR(prev.position, mainStats);
        return { stats, mainStats, ovr };
      };

      // 8-BOSQICH: avval bu yerda QATTIQ chegara bor edi - yillik limit
      // erta (masalan 1-oyda) tugasa, "remaining" 0 ga tushib, scale ham
      // ANIQ 0 bo'lib qolar, ya'ni qolgan ~11 oy davomida training
      // HECH QANDAY foyda bermas edi. Endi YUMSHOQ pasayish: limitga
      // yaqinlashgan/undan oshib ketgan sari o'sish juda sekinlashadi,
      // lekin HECH QACHON to'liq nolga tushmaydi - potentsialga qarab har
      // bir mashg'ulotda ozgina bo'lsa ham qo'shiladi.
      const preview = applyGain(fullGain);
      const cap = yearlyOvrCap(prev.age);
      const used = prev.career.growthUsedThisYear || 0;
      const overuse = Math.max(0, used) / Math.max(0.05, cap);
      const scale = Math.max(0.06, 1 / (1 + overuse * overuse * 2.2));

      const result = scale >= 0.999 ? preview : applyGain(fullGain * scale);
      const newOvr = Math.min(result.ovr, prev.potential);
      const actualDelta = Math.max(0, newOvr - prev.overall);

      const focusDef = TRAINING_FOCUS[focus];
      let injury = prev.career.injury;
      if (!injury && Math.random() < focusDef.injuryRisk) {
        injury = { daysLeft: Math.floor(Math.random() * 8) + 3, description: 'Mashg\'ulotdagi jarohat' };
      }

      return {
        overall: newOvr,
        subStats: result.stats,
        mainStats: result.mainStats,
        career: {
          ...prev.career,
          trainingDate: prev.career.gameDate,
          stamina: clampStat(prev.career.stamina - focusDef.staminaCost, 0, 100),
          growthUsedThisYear: used + actualDelta,
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
          <h1>Mashg'ulot</h1>
          <div className="sub">Aynan 3 ta statni va mashg'ulot intensivligini tanlang.</div>
        </div>
        <span className={`badge ${trainedToday ? 'badge-green' : 'badge-gold'}`}>
          {injured ? 'Jarohatlangan' : trainedToday ? 'Bugun mashq qilingan' : 'Tayyor'}
        </span>
      </div>

      {injured && (
        <div className="card" style={{ marginBottom: 18, borderColor: 'rgba(255,59,87,0.4)' }}>
          <div className="card-title">JAROHATLANGAN</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {player.career.injury.description} - {player.career.injury.daysLeft} kundan so'ng qaytadi. Shu vaqtgacha mashg'ulot yoki o'yin yo'q.
          </p>
        </div>
      )}

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-title">3 TA STATNI TANLANG ({selected.length}/3)</div>
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
        <div className="card-title">MASHG'ULOT INTENSIVLIGI</div>
        <div className="grid grid-3">
          {Object.values(TRAINING_FOCUS).map((m) => (
            <div
              key={m.id}
              className="result-card"
              style={{ cursor: 'pointer', border: focus === m.id ? '2px solid var(--accent-gold)' : undefined }}
              onClick={() => setFocus(m.id)}
            >
              <span className={`badge ${FOCUS_TONES[m.id]}`}>{m.label}</span>
              <div className="value" style={{ marginTop: 10, fontSize: 15 }}>Ko'paytma x{m.statGain}</div>
              <div className="label">Kuch-quvvat -{m.staminaCost} · Jarohat xavfi {(m.injuryRisk * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <button className="btn btn-primary btn-block" disabled={!canTrain} onClick={handleTrain}>
          {trainedToday ? 'Bugun allaqachon mashq qilingan' : 'Mashq qilish'}
        </button>
        {lastResult && (
          <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: 'var(--glass-fill)', fontSize: 13 }}>
            <div style={{ fontWeight: 700, color: lastResult.ovrDelta > 0 ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
              OVR {player.overall.toFixed(2)} ({lastResult.ovrDelta > 0 ? '+' : ''}{lastResult.ovrDelta.toFixed(2)})
            </div>
            <div className="sub" style={{ marginTop: 4 }}>
              {lastResult.statDeltas.map((s) => (
                <span key={s.key} style={{ marginRight: 10 }}>
                  {MAIN_STAT_LABELS[s.key] || s.key}: {s.delta > 0 ? '+' : ''}{s.delta.toFixed(2)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">O'SISH QANDAY ISHLAYDI</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
          O'sish qat'iy son emas - u mashg'ulot intensivligingizga, yoshingizga
          (17-23 yosh 150% tezlikda, 24-29 pray vaqti 100%, 30+ sekinlashadi) va
          Potentsialingizgacha ({player.potential}) qancha joy qolganiga bog'liq - qanchalik
          yaqinlashsangiz, o'sish shunchalik sekinlashadi. Bundan tashqari, haqiqiy rivojlanish
          yillar talab qiladi: OVR shu yilda ko'pi bilan <b>{yearlyOvrCap(player.age)} ball</b>gacha
          o'sishi mumkin (hozirgacha {(player.career.growthUsedThisYear || 0).toFixed(1)} ball
          ishlatgansiz) - yosh o'yinchilarga yillik limit kattaroq beriladi, shuning uchun
          Potentsialga yetish mavsumlar davomida bosqichma-bosqich sodir bo'ladi, 2 haftada emas.
          Pul sahifasidagi Fitnes murabbiyi har bir sessiyaga +25% qo'shadi. Yomon o'yinlar va
          jarohatlar Potentsialni pasaytirishi, pray yillaringizdagi (24-29) zo'r o'yinlar esa
          uni yana ko'tarishi mumkin.
        </p>
      </div>
    </AppShell>
  );
}
