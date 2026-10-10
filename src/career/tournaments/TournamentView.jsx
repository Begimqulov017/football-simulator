import React, { useMemo, useState } from 'react';
import { NATIONALITIES } from '../../data/leaguesData';
import SegmentedTabs from '../../components/match/SegmentedTabs';
import { TeamBadge } from '../../components/TeamLogo';

// Chempionlar Ligasi / Yevropa Ligasi (mode="club") va Jahon Chempionati / Yevro va h.k.
// (mode="nation") uchun umumiy ko'rinish: guruhlar, pley-off setkasi, natijalar, top butsi.
// Klub rejimida logotip, terma jamoa rejimida DAVLAT BAYROQLARI ko'rsatiladi (Phase 5).
const FALLBACK_FLAGS = new Map(NATIONALITIES.map((n) => [n.name, n.flag]));

function useEntity(comp, mode) {
  return useMemo(() => {
    const flags = new Map(FALLBACK_FLAGS);
    if (mode === 'nation') {
      [...(comp.results || comp.recentResults || [])].forEach((m) => {
        if (m.homeFlag) flags.set(m.home, m.homeFlag);
        if (m.awayFlag) flags.set(m.away, m.awayFlag);
      });
      (comp.knockout || []).forEach((r) => r.ties.forEach((t) => {
        if (t.homeFlag) flags.set(t.home, t.homeFlag);
        if (t.awayFlag) flags.set(t.away, t.awayFlag);
      }));
    }
    return (id) => {
      if (mode === 'club') {
        const c = comp.clubs?.[id];
        return { name: c?.name || id, badge: c?.logo || '⚽' };
      }
      return { name: id, badge: flags.get(id) || '🏳️' };
    };
  }, [comp, mode]);
}

function GroupCard({ group, ent, mode }) {
  const rows = Object.values(group.table || {}).sort((a, b) => (b.pts - a.pts) || ((b.gf - b.ga) - (a.gf - a.ga)) || (b.gf - a.gf));
  return (
    <div className="bg-surface-card border border-surface-line rounded-card shadow-soft overflow-hidden min-w-0">
      <div className="px-3 py-2 bg-surface-muted border-b border-surface-line text-xs font-extrabold text-ink-soft">Group {group.name}</div>
      <table className="w-full text-[11px] border-collapse table-fixed">
        <thead>
          <tr className="text-ink-muted"><th className="text-left font-bold px-3 py-1.5">Jamoa</th><th className="font-bold w-7">O</th><th className="font-bold w-11">G'-M</th><th className="font-bold w-11">Och.</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const e = ent(mode === 'club' ? r.id : r.country);
            return (
              <tr key={mode === 'club' ? r.id : r.country} className={i < 2 ? 'bg-brand-tint/60' : ''}>
                <td className="px-3 py-1.5 font-semibold text-ink truncate"><span className="mr-1.5"><TeamBadge value={e.badge} size={16} /></span>{e.name}</td>
                <td className="text-center tabular-nums text-ink-soft">{r.played}</td>
                <td className="text-center tabular-nums text-ink-soft">{r.gf}-{r.ga}</td>
                <td className="text-center font-extrabold tabular-nums text-ink">{r.pts}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Bracket({ knockout, ent }) {
  if (!knockout || knockout.length === 0) return <div className="text-sm text-ink-muted py-6 text-center">Pley-off bosqichi hali boshlanmagan.</div>;
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {knockout.filter(Boolean).map((round) => (
        <div key={round.label} className="min-w-[210px] flex-1 flex flex-col gap-2">
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-ink-muted">{round.label}</div>
          {round.ties.map((t, i) => {
            const h = ent(t.home); const a = ent(t.away);
            const row = (side, e, g) => (
              <div className={`flex items-center justify-between gap-2 px-2.5 py-1.5 ${t.winner === side ? 'font-extrabold text-ink' : 'text-ink-muted'}`}>
                <span className="truncate text-xs"><span className="mr-1.5"><TeamBadge value={e.badge} size={16} /></span>{e.name}</span>
                <span className="text-xs tabular-nums">{g}{t.penalties && t.winner === side ? ' ★' : ''}</span>
              </div>
            );
            return (
              <div key={i} className="bg-surface-card border border-surface-line rounded-control shadow-soft divide-y divide-surface-line">
                {row(t.home, h, t.golA)}
                {row(t.away, a, t.golB)}
                {t.penalties && <div className="px-2.5 py-1 text-[10px] text-ink-muted">Penalti: {t.penalties.a}-{t.penalties.b}</div>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Results({ results, ent }) {
  const list = [...(results || [])].reverse().slice(0, 24);
  if (!list.length) return <div className="text-sm text-ink-muted py-6 text-center">Hali o'yinlar bo'lmagan.</div>;
  return (
    <div className="flex flex-col gap-1.5">
      {list.map((m, i) => {
        const h = ent(m.home); const a = ent(m.away);
        return (
          <div key={i} className="flex items-center gap-2 bg-surface rounded-control border border-surface-line px-3 py-2 text-xs">
            <span className="w-24 shrink-0 text-[10px] font-bold text-ink-muted truncate">{m.stage}</span>
            <span className="flex-1 text-right truncate font-semibold">{h.name} <TeamBadge value={h.badge} size={16} /></span>
            <span className="w-14 text-center font-black tabular-nums text-ink">{m.golA}-{m.golB}</span>
            <span className="flex-1 truncate font-semibold"><TeamBadge value={a.badge} size={16} /> {a.name}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function TournamentView({ comp, mode = 'club' }) {
  const [tab, setTab] = useState('groups');
  const ent = useEntity(comp, mode);
  const scorers = Array.isArray(comp.topScorers) ? comp.topScorers : Object.values(comp.topScorers || {}).sort((a, b) => b.goals - a.goals).slice(0, 10);
  const winner = comp.winner ? ent(comp.winner) : null;
  const results = comp.results || comp.recentResults || [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-lg font-black text-ink">{comp.name} {comp.season ? `${comp.season}/${String(comp.season + 1).slice(2)}` : comp.year || ''}</div>
          <div className="text-xs text-ink-muted">{comp.size} jamoa · {comp.finished ? 'Yakunlangan' : 'Davom etmoqda'}</div>
        </div>
        {winner && <div className="text-sm font-extrabold bg-amber-50 border border-amber-200 text-amber-800 rounded-full px-3 py-1">🏆 {winner.badge} {winner.name}</div>}
      </div>
      <SegmentedTabs
        tabs={[{ key: 'groups', label: 'Guruhlar' }, { key: 'knockout', label: 'Pley-off' }, { key: 'results', label: 'Natijalar' }, { key: 'scorers', label: 'Top butsi' }]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'groups' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {(comp.groups || []).map((g) => <GroupCard key={g.name} group={g} ent={ent} mode={mode} />)}
        </div>
      )}
      {tab === 'knockout' && <Bracket knockout={comp.knockout} ent={ent} />}
      {tab === 'results' && <Results results={results} ent={ent} />}
      {tab === 'scorers' && (
        <div className="flex flex-col gap-1.5">
          {scorers.length === 0 && <div className="text-sm text-ink-muted py-6 text-center">Gollar hali urilmagan.</div>}
          {scorers.map((s, i) => (
            <div key={s.id || s.name + i} className="flex items-center gap-3 bg-surface rounded-control border border-surface-line px-3 py-2 text-sm">
              <span className="w-6 text-center font-extrabold text-ink-muted">{i + 1}</span>
              <span className="flex-1 font-bold truncate">{s.name}</span>
              <span className="text-xs text-ink-muted truncate">{s.team || s.teamName || ''}</span>
              <span className="font-black tabular-nums">{s.goals}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
