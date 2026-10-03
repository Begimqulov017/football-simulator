import React from 'react';
import Panel from './Panel';
import { chemistryLabel, CAT_COLOR, CAT_SHORT, getSurname } from './squadUtils';

function scoreColor(s) {
  if (s >= 90) return '#059669';
  if (s >= 75) return '#10B981';
  if (s >= 60) return '#D97706';
  return '#DC2626';
}

function Ring({ value }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  return (
    <svg width="104" height="104" viewBox="0 0 104 104" role="img" aria-label={`Team chemistry ${value} out of 100`}>
      <circle cx="52" cy="52" r={r} fill="none" stroke="#E2E8F0" strokeWidth="9" />
      <circle
        cx="52" cy="52" r={r} fill="none" stroke={scoreColor(value)} strokeWidth="9" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform="rotate(-90 52 52)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text x="52" y="58" textAnchor="middle" fontSize="26" fontWeight="800" fill="#0F172A">{value}</text>
    </svg>
  );
}

export default function ChemistryWidget({ chemistry }) {
  const { overall, lines, issues, avgOvr } = chemistry;
  return (
    <Panel title="Team chemistry">
      <div className="flex items-center gap-4">
        <Ring value={overall} />
        <div className="min-w-0">
          <div className="text-base font-extrabold" style={{ color: scoreColor(overall) }}>{chemistryLabel(overall)}</div>
          <div className="text-xs text-ink-muted">Starting XI average OVR</div>
          <div className="text-xl font-extrabold text-ink tabular-nums">{avgOvr || '-'}</div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        {lines.map((l) => (
          <div key={l.cat} className="flex items-center gap-2.5">
            <span className="w-9 text-[11px] font-extrabold" style={{ color: CAT_COLOR[l.cat] }}>{CAT_SHORT[l.cat]}</span>
            <span className="flex-1 h-2 rounded-full bg-surface-line overflow-hidden">
              <span className="block h-full rounded-full" style={{ width: `${l.score}%`, background: scoreColor(l.score), transition: 'width 0.6s ease' }} />
            </span>
            <span className="w-14 text-right text-[11px] text-ink-muted tabular-nums">{l.score} · {l.avgOvr}</span>
          </div>
        ))}
        <div className="text-[11px] text-ink-muted">Each line: chemistry score · average OVR</div>
      </div>

      {issues.length > 0 && (
        <div className="mt-3 rounded-control bg-rose-50 border border-rose-200 px-3 py-2">
          <div className="text-xs font-bold text-rose-700 mb-1">Players out of their usual role</div>
          <ul className="m-0 pl-4 text-xs text-rose-800">
            {issues.map((i) => (
              <li key={i.id}>
                {getSurname(i.name)} ({i.pos}) plays {CAT_SHORT[i.category]}{i.kind === 'cover' ? ', can cover' : ', no cover position'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}
