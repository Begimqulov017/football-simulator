import React, { useCallback, useEffect, useRef, useState } from 'react';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';
import useAnimatedNumber from '../utils/useAnimatedNumber';
import {
  MAIN_STAT_LABELS, SUB_STAT_LABELS, TRAINING_FOCUS,
  simulateTrainingSession, yearlyOvrCap,
  displayRating, formatPrecise, formatDelta
} from '../utils/statCalc';

// ---------------------------------------------------------------------------
// PHASE 7 - High-Precision Training Engine
//   * Training page shows exact 2-decimal values (72.12 OVR). Every other
//     screen uses displayRating() (72.50 -> 73, 72.49 -> 72).
//   * The session maths lives in statCalc.simulateTrainingSession (pure,
//     testable); this page only picks stats, calls it, and animates results.
// ---------------------------------------------------------------------------

const FOCUS_TONES = { HIGH_RISK: 'badge-red', BALANCED: 'badge-gold', LIGHT: 'badge-green' };
const TOAST_MS = 4500;
const TOAST_DELAY_MS = 700; // let the counters finish ticking before popping toasts

const TRAINING_CSS = `
.tp-bar-track { height: 8px; border-radius: 999px; background: var(--glass-fill-strong, rgba(148,163,184,.18)); overflow: hidden; }
.tp-bar-fill { height: 100%; border-radius: 999px; transition: width 900ms cubic-bezier(.22,1,.36,1); }
.tp-bar-green { background: linear-gradient(90deg, var(--accent-green-dim, #16a34a), var(--accent-green, #22c55e)); }
.tp-bar-gold { background: linear-gradient(90deg, var(--accent-gold-dim, #d97706), var(--accent-gold, #f59e0b)); }
.tp-num { font-variant-numeric: tabular-nums; }
.tp-chip {
  display: inline-block; margin-top: 6px; padding: 2px 8px; border-radius: 999px;
  font-size: 12px; font-weight: 700; color: var(--accent-green, #22c55e);
  border: 1px solid rgba(34,197,94,.4); background: rgba(34,197,94,.1);
  animation: tp-pop 420ms cubic-bezier(.34,1.56,.64,1) both;
}
.tp-sub-line { font-size: 11px; color: var(--text-secondary, #a8b0c4); margin-top: 4px; }
.tp-toasts { position: fixed; top: 18px; right: 18px; z-index: 1000; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
.tp-toast {
  pointer-events: auto; cursor: pointer; min-width: 220px; max-width: 320px; padding: 12px 14px;
  border-radius: var(--radius-md, 16px); border: 1px solid var(--glass-border-strong, rgba(148,163,184,.3));
  background: var(--bg-panel, #16213c); color: var(--text-primary, #eef2fb);
  box-shadow: var(--shadow-card, 0 8px 30px rgba(0,0,0,.35));
  animation: tp-toast-in 380ms cubic-bezier(.34,1.56,.64,1) both;
}
.tp-toast.levelup { border-color: var(--accent-gold, #f59e0b); box-shadow: 0 0 24px rgba(245,158,11,.35); }
.tp-toast.statup { border-color: var(--accent-green, #22c55e); }
.tp-toast.injury { border-color: var(--accent-red, #ef4444); }
.tp-toast .t-title { font-family: var(--font-display, inherit); font-weight: 700; font-size: 14px; letter-spacing: .04em; }
.tp-toast .t-body { font-size: 12px; color: var(--text-secondary, #a8b0c4); margin-top: 2px; }
@keyframes tp-pop { from { opacity: 0; transform: translateY(6px) scale(.8); } to { opacity: 1; transform: none; } }
@keyframes tp-toast-in { from { opacity: 0; transform: translateX(40px) scale(.9); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .tp-bar-fill { transition: none; }
  .tp-chip, .tp-toast { animation: none; }
}
`;

// Ticking counter. `from` lets a freshly-mounted chip count up from 0.
function AnimatedValue({ value, decimals = 2, signed = false, from, duration }) {
  const v = useAnimatedNumber(value, { from, duration });
  return <span className="tp-num">{signed ? formatDelta(v, decimals) : formatPrecise(v, decimals)}</span>;
}

// Progress bar that fills smoothly from 0 on mount and from its old width on change.
function AnimatedBar({ pct, tone = 'green' }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(Math.max(0, Math.min(100, pct))));
    return () => cancelAnimationFrame(id);
  }, [pct]);
  return (
    <div className="tp-bar-track">
      <div className={`tp-bar-fill tp-bar-${tone}`} style={{ width: `${width}%` }} />
    </div>
  );
}

function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="tp-toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`tp-toast ${t.kind}`} onClick={() => onDismiss(t.id)}>
          <div className="t-title">{t.title}</div>
          {t.body && <div className="t-body">{t.body}</div>}
        </div>
      ))}
    </div>
  );
}

export default function TrainingPage() {
  const { player, updatePlayer } = useGame();
  const [selected, setSelected] = useState([]);
  const [focus, setFocus] = useState('BALANCED');
  const [toasts, setToasts] = useState([]);
  const [freshAt, setFreshAt] = useState(null); // set when a session was just run on THIS visit
  const timers = useRef([]);
  const toastSeq = useRef(0);

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const later = useCallback((fn, ms) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((toast) => {
    toastSeq.current += 1;
    const id = toastSeq.current;
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
    later(() => dismissToast(id), TOAST_MS);
  }, [later, dismissToast]);

  if (!player) return null;

  const statKeys = Object.keys(player.mainStats);
  const isGk = player.position === 'GK';
  const trainedToday = player.career.trainingDate === player.career.gameDate;
  const injured = !!player.career.injury;
  const last = player.career.lastTraining || null;
  const showChips = !!last && last.date === player.career.gameDate;

  const cap = yearlyOvrCap(player.age);
  const used = player.career.growthUsedThisYear || 0;
  const growthPct = cap > 0 ? (used / cap) * 100 : 100;
  const baseOvr = typeof player.firstRating === 'number' ? Math.min(player.firstRating, player.overall) : player.overall;
  const potentialPct = player.potential - baseOvr > 0 ? ((player.overall - baseOvr) / (player.potential - baseOvr)) * 100 : 100;

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

    // The session is computed OUTSIDE the state updater: random rolls inside an
    // updater would re-roll whenever React double-invokes it (StrictMode) and
    // the breakdown we show must be exactly what was applied.
    const { patch, report } = simulateTrainingSession({ player, selected, focusId: focus });
    updatePlayer(() => patch);
    setSelected([]);
    setFreshAt(Date.now());

    later(() => {
      const oldOvr = displayRating(report.ovrBefore);
      const newOvr = displayRating(report.ovrAfter);
      let celebrated = false;

      if (newOvr > oldOvr) {
        celebrated = true;
        pushToast({ kind: 'levelup', title: 'LEVEL UP!', body: `OVR ${oldOvr} → ${newOvr}  (${formatPrecise(report.ovrAfter)} exact)` });
      }
      Object.entries(report.stats).forEach(([key, s]) => {
        const a = displayRating(s.before);
        const b = displayRating(s.after);
        if (b > a) {
          celebrated = true;
          pushToast({ kind: 'statup', title: `${MAIN_STAT_LABELS[key] || key.toUpperCase()} UP`, body: `${a} → ${b}  (${formatDelta(s.delta)})` });
        }
      });
      if (!celebrated) {
        pushToast({ kind: 'statup', title: 'Session complete', body: `${formatDelta(report.ovrDelta)} OVR · ${formatPrecise(report.ovrAfter)} total` });
      }
      if (report.injury) {
        pushToast({ kind: 'injury', title: 'Training injury', body: `Out for ${report.injury.daysLeft} day(s).` });
      }
    }, TOAST_DELAY_MS);
  };

  return (
    <AppShell>
      <style>{TRAINING_CSS}</style>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

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
        <div className="card-title">PROGRESS</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 700, color: 'var(--accent-gold)' }}>
            <AnimatedValue value={player.overall} />
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text-secondary)' }}>OVR</span>
          <span className="sub" style={{ marginLeft: 'auto' }}>POT {player.potential}</span>
        </div>

        <div style={{ marginTop: 14 }}>
          <div className="list-row" style={{ fontSize: 12, marginBottom: 6 }}>
            <span>Yearly growth allowance</span>
            <span className="tp-num">{formatPrecise(used)} / {formatPrecise(cap)}</span>
          </div>
          <AnimatedBar pct={growthPct} tone="gold" />
        </div>
        <div style={{ marginTop: 14 }}>
          <div className="list-row" style={{ fontSize: 12, marginBottom: 6 }}>
            <span>Journey to Potential</span>
            <span className="tp-num">{Math.round(Math.max(0, Math.min(100, potentialPct)))}%</span>
          </div>
          <AnimatedBar pct={potentialPct} tone="green" />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-title">CHOOSE 3 STATS ({selected.length}/3)</div>
        <div className="grid grid-3">
          {statKeys.map((key) => {
            const gain = showChips ? last.stats?.[key] : null;
            return (
              <div
                key={key}
                className={`roll-slot${selected.includes(key) ? ' done' : ''}`}
                style={{ cursor: injured ? 'not-allowed' : 'pointer', opacity: injured ? 0.5 : 1 }}
                onClick={() => !injured && toggleStat(key)}
              >
                <div className="roll-label">{MAIN_STAT_LABELS[key] || key.toUpperCase()}</div>
                <div className="roll-value"><AnimatedValue value={player.mainStats[key]} /></div>
                {gain && (
                  <span className="tp-chip" key={freshAt || 'static'}>
                    <AnimatedValue value={gain.delta} signed from={freshAt ? 0 : undefined} />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {last && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="card-title">{showChips ? "TODAY'S SESSION" : 'LAST SESSION'} · BREAKDOWN</div>
          <div className="list-row">
            <span>Overall</span>
            <span className="tp-num">
              {formatPrecise(last.ovrBefore)} → {formatPrecise(last.ovrAfter)}{' '}
              <b style={{ color: 'var(--accent-green)' }}>
                <AnimatedValue value={last.ovrDelta} signed from={freshAt ? 0 : undefined} />
              </b>
            </span>
          </div>
          {Object.entries(last.stats || {}).map(([key, s]) => (
            <div key={key} style={{ padding: '8px 0', borderTop: '1px solid var(--glass-border, rgba(148,163,184,.18))' }}>
              <div className="list-row" style={{ border: 'none', padding: 0 }}>
                <span>{MAIN_STAT_LABELS[key] || key.toUpperCase()}</span>
                <span className="tp-num">
                  {formatPrecise(s.before)} → {formatPrecise(s.after)}{' '}
                  <b style={{ color: 'var(--accent-green)' }}>
                    <AnimatedValue value={s.delta} signed from={freshAt ? 0 : undefined} />
                  </b>
                </span>
              </div>
              {!isGk && (
                <div className="tp-sub-line">
                  {s.subs.map((sub, i) => (
                    <span key={sub.key}>
                      {i > 0 ? ' · ' : ''}{SUB_STAT_LABELS[sub.key] || sub.key} {formatDelta(sub.delta)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {last.capReached && (
            <p className="sub" style={{ marginTop: 10 }}>
              Yearly growth allowance was already used up, so this session added no OVR. It resets on your next birthday.
            </p>
          )}
          {!last.capReached && last.capped && (
            <p className="sub" style={{ marginTop: 10 }}>
              This session was scaled down to fit what was left of this year's growth allowance.
            </p>
          )}
        </div>
      )}

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
          slower it climbs. Each chosen stat (and each attribute inside it) rolls its own gain,
          so sessions look like +0.12 / +0.08 / +0.25 rather than one flat number. Ratings are
          tracked to two decimals here; everywhere else they round naturally (72.50 shows as 73,
          72.49 as 72). Real development takes years: your OVR can only
          rise by up to <b>{formatPrecise(cap)} points this year</b> (you've used{' '}
          {formatPrecise(used)} of it so far) - younger players get a
          bigger yearly allowance than veterans, so reaching your Potential is a season-by-season
          climb, not a two-week grind. A Fitness Trainer from the Money page adds +25% to every
          session. Bad match performances and injuries can knock Potential down; great games in
          your prime years (24-29) can push it back up.
        </p>
      </div>
    </AppShell>
  );
}
