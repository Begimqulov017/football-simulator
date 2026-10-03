import React from 'react';
import Panel from './Panel';
import { FORMATIONS } from '../../utils/formations';
import { DEFAULT_TACTICS, tacticalOutput } from './squadUtils';

function Slider({ id, label, left, right, value, onChange, hint }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <label htmlFor={id} className="text-xs font-bold text-ink-soft">{label}</label>
        <span className="text-xs font-extrabold text-ink tabular-nums">{value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
        style={{ accentColor: '#10B981' }}
      />
      <div className="flex justify-between text-[11px] text-ink-muted -mt-0.5">
        <span>{left}</span>
        <span>{right}</span>
      </div>
      {hint && <div className="text-[11px] text-ink-muted mt-0.5">{hint}</div>}
    </div>
  );
}

function mindsetName(v) {
  if (v < 20) return 'Park the bus';
  if (v < 40) return 'Defensive';
  if (v < 60) return 'Balanced';
  if (v < 80) return 'Attacking';
  return 'All-out attack';
}

export default function TacticsPanel({ tactics, formation, onChange }) {
  const set = (patch) => onChange({ ...tactics, ...patch });
  const out = tacticalOutput(formation, tactics);
  const fmt = (n) => n.toFixed(2);

  return (
    <Panel
      title="Tactics"
      aside={
        <button
          type="button"
          onClick={() => onChange({ ...DEFAULT_TACTICS })}
          className="px-2.5 py-1 rounded-lg text-xs font-bold border border-surface-line bg-white text-ink-muted hover:bg-surface-muted cursor-pointer"
        >
          Reset
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="club-formation" className="block text-xs font-bold text-ink-soft mb-1">Formation</label>
          <select
            id="club-formation"
            value={formation.name}
            onChange={(e) => set({ formation: e.target.value, auto: false })}
            className="w-full px-3 py-2 rounded-control border border-surface-line bg-white text-sm font-semibold text-ink"
          >
            {FORMATIONS.map((f) => <option key={f.name} value={f.name}>{f.label}</option>)}
          </select>
          <label className="flex items-center gap-2 mt-2 text-xs text-ink-soft cursor-pointer">
            <input type="checkbox" checked={tactics.auto} onChange={(e) => set({ auto: e.target.checked })} style={{ accentColor: '#10B981' }} />
            Pick the formation for me based on the mindset
          </label>
        </div>

        <Slider
          id="club-mindset"
          label={`Mindset: ${mindsetName(tactics.mindset)}`}
          left="Defensive"
          right="Attacking"
          value={tactics.mindset}
          onChange={(v) => set({ mindset: v })}
        />
        <Slider id="club-pressing" label="Pressing" left="Low block" right="High press" value={tactics.pressing} onChange={(v) => set({ pressing: v })} />
        <Slider id="club-width" label="Width" left="Narrow" right="Wide" value={tactics.width} onChange={(v) => set({ width: v })} />
        <Slider id="club-tempo" label="Tempo" left="Patient" right="Direct" value={tactics.tempo} onChange={(v) => set({ tempo: v })} />

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-control bg-surface border border-surface-line px-3 py-2">
            <div className="text-[11px] font-bold text-ink-muted">Attack output</div>
            <div className="text-lg font-extrabold text-rose-600 tabular-nums">×{fmt(out.attack)}</div>
          </div>
          <div className="rounded-control bg-surface border border-surface-line px-3 py-2">
            <div className="text-[11px] font-bold text-ink-muted">Defensive solidity</div>
            <div className="text-lg font-extrabold text-accent-dark tabular-nums">×{fmt(out.defence)}</div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
