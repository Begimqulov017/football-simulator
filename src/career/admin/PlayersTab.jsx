import React, { useMemo, useState } from 'react';
import RatingBadge from '../../components/match/RatingBadge';
import { fetchAdminPlayers } from '../utils/careerApi';
import { useFetch, Panel, Loading, ErrorBox, Empty, Stat, inputCls } from './adminUi';
import { displayRating } from '../utils/statCalc';

const SORTS = {
  goals: { label: 'Gollar', get: (p) => p.goals },
  assists: { label: 'Assistlar', get: (p) => p.assists },
  rating: { label: 'Reyting', get: (p) => p.avgRating ?? 0 },
  overall: { label: 'OVR', get: (p) => p.overall ?? 0 },
  apps: { label: "O'yinlar", get: (p) => p.appearances },
};
const TYPE_LABEL = { signing: 'Birinchi shartnoma', transfer: 'Transfer', free: 'Erkin agent', renewal: 'Shartnoma yangilash' };
const TYPE_TONE = { signing: 'bg-brand-tint text-brand-dark', transfer: 'bg-accent-tint text-accent-dark', free: 'bg-amber-50 text-amber-700', renewal: 'bg-surface-muted text-ink-soft' };

function TransferHistory({ list }) {
  if (!list.length) return <div className="text-xs text-ink-muted">Transferlar tarixi bo'sh.</div>;
  return (
    <ol className="list-none m-0 p-0 flex flex-col gap-2">
      {[...list].reverse().map((t, i) => (
        <li key={i} className="flex items-center gap-3 text-xs bg-surface rounded-control border border-surface-line px-3 py-2">
          <span className={`shrink-0 rounded-full px-2 py-0.5 font-extrabold text-[10px] ${TYPE_TONE[t.type] || TYPE_TONE.renewal}`}>{TYPE_LABEL[t.type] || t.type}</span>
          <span className="flex-1 min-w-0 truncate font-semibold text-ink">
            {t.from && t.from !== t.to ? <>{t.fromLogo} {t.from} <span className="text-ink-subtle">→</span> </> : null}{t.toLogo} {t.to}
          </span>
          <span className="tabular-nums text-ink-muted shrink-0">${(t.wage || 0).toLocaleString()}/h</span>
          <span className="tabular-nums text-ink-subtle shrink-0">{t.date}</span>
        </li>
      ))}
    </ol>
  );
}

export default function PlayersTab() {
  const { loading, data, error, reload } = useFetch(fetchAdminPlayers, []);
  const [sort, setSort] = useState('goals');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);

  const rows = useMemo(() => {
    const list = (data?.players || []).filter((p) => p.hasCareer);
    const s = q.trim().toLowerCase();
    const filtered = s ? list.filter((p) => `${p.username} ${p.name} ${p.club?.name || ''}`.toLowerCase().includes(s)) : list;
    return [...filtered].sort((a, b) => SORTS[sort].get(b) - SORTS[sort].get(a));
  }, [data, sort, q]);

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const all = (data.players || []).filter((p) => p.hasCareer);
  const totalGoals = all.reduce((a, p) => a + p.goals, 0);
  const totalAssists = all.reduce((a, p) => a + p.assists, 0);
  const rated = all.filter((p) => p.avgRating != null);
  const avgAll = rated.length ? rated.reduce((a, p) => a + p.avgRating, 0) / rated.length : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Faol o'yinchilar" value={all.length} tone="brand" />
        <Stat label="Jami gollar" value={totalGoals} />
        <Stat label="Jami assistlar" value={totalAssists} />
        <Stat label="O'rtacha reyting" value={avgAll ? avgAll.toFixed(2) : '—'} tone="accent" />
      </div>

      <Panel
        title="Barcha o'yinchilar statistikasi"
        action={
          <div className="flex flex-wrap gap-2">
            <input className={inputCls} placeholder="Qidirish…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Qidirish" />
            <select className={inputCls} value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Saralash">
              {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>Saralash: {v.label}</option>)}
            </select>
          </div>
        }
      >
        {rows.length === 0 ? <Empty>Hozircha karyerasi bor o'yinchi yo'q.</Empty> : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm border-collapse min-w-[720px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-ink-muted text-left">
                  <th className="px-2 py-2">#</th><th className="px-2">O'yinchi</th><th className="px-2">Klub</th>
                  <th className="px-2 text-center">OVR/POT</th><th className="px-2 text-center">O'yin</th>
                  <th className="px-2 text-center">Gol</th><th className="px-2 text-center">Assist</th><th className="px-2 text-center">Reyting</th><th />
                </tr>
              </thead>
              <tbody>
                {rows.map((p, i) => (
                  <React.Fragment key={p.username}>
                    <tr className="border-t border-surface-line hover:bg-surface cursor-pointer" onClick={() => setOpen(open === p.username ? null : p.username)}>
                      <td className="px-2 py-2.5 text-ink-muted font-bold">{i + 1}</td>
                      <td className="px-2">
                        <div className="font-bold text-ink">{p.name} <span className="text-ink-subtle font-semibold text-xs">{p.position}</span></div>
                        <div className="text-[11px] text-ink-muted">@{p.username}{p.isAdmin ? ' · admin' : ''}</div>
                      </td>
                      <td className="px-2 whitespace-nowrap">{p.club?.logo} {p.club?.name || <span className="text-ink-muted">Erkin agent</span>}</td>
                      <td className="px-2 text-center tabular-nums">{displayRating(p.overall)}<span className="text-ink-subtle">/{p.potential}</span></td>
                      <td className="px-2 text-center tabular-nums">{p.appearances}</td>
                      <td className="px-2 text-center tabular-nums font-extrabold">{p.goals}</td>
                      <td className="px-2 text-center tabular-nums font-extrabold">{p.assists}</td>
                      <td className="px-2 text-center">{p.avgRating != null ? <RatingBadge value={p.avgRating} /> : '—'}</td>
                      <td className="px-2 text-ink-muted">{open === p.username ? '▲' : '▼'}</td>
                    </tr>
                    {open === p.username && (
                      <tr className="bg-surface/60">
                        <td colSpan={9} className="px-3 py-4">
                          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
                            <div className="grid grid-cols-2 gap-2 content-start">
                              <Stat label="Yosh" value={p.age} />
                              <Stat label="Forma raqami" value={`#${p.number ?? '—'}`} />
                              <Stat label="Maosh/hafta" value={`$${(p.weeklyWage || 0).toLocaleString()}`} tone="brand" />
                              <Stat label="Balans" value={`$${(p.money || 0).toLocaleString()}`} />
                              <Stat label="Shartnoma" value={p.contractYears ? `${p.contractYears} yil` : '—'} />
                              <Stat label="Jarohat" value={p.injury ? `${p.injury} kun` : 'yo\'q'} tone={p.injury ? 'amber' : 'neutral'} />
                              {p.international && <Stat label={`${p.international.country} terma`} value={`${p.international.caps}/${p.international.goals}`} tone="accent" />}
                              <Stat label="Kubok" value={p.trophies.length} tone="amber" />
                            </div>
                            <div>
                              <div className="text-xs font-extrabold uppercase tracking-wide text-ink-muted mb-2">Transferlar tarixi</div>
                              <TransferHistory list={p.transferHistory} />
                              {p.lastRatings.length > 0 && (
                                <div className="mt-3 flex items-center gap-1.5 flex-wrap text-xs text-ink-muted">So'nggi reytinglar: {p.lastRatings.map((r, k) => <RatingBadge key={k} value={r} size="sm" />)}</div>
                              )}
                              {p.trophies.length > 0 && <div className="mt-3 text-xs text-ink-soft">🏆 {p.trophies.join(' · ')}</div>}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
