import React, { useEffect, useState } from 'react';
import SegmentedTabs from '../../components/match/SegmentedTabs';
import TournamentView from '../tournaments/TournamentView';
import {
  fetchLeagues, fetchAdminLeague, fetchContinental, fetchInternational, fetchSimLog,
} from '../utils/careerApi';
import { useFetch, Panel, Loading, ErrorBox, Empty, inputCls } from './adminUi';
import { TeamBadge } from '../../components/TeamLogo';

function LeagueBrowser() {
  const leagues = useFetch(fetchLeagues, []);
  const [leagueId, setLeagueId] = useState('');
  useEffect(() => {
    if (!leagueId && leagues.data?.leagues?.length) setLeagueId(leagues.data.leagues[0].id);
  }, [leagues.data, leagueId]);
  const detail = useFetch(() => (leagueId ? fetchAdminLeague(leagueId) : Promise.resolve(null)), [leagueId]);

  if (leagues.loading) return <Loading />;
  if (leagues.error) return <ErrorBox error={leagues.error} onRetry={leagues.reload} />;
  const d = detail.data;
  return (
    <div className="flex flex-col gap-4">
      <select className={`${inputCls} self-start`} value={leagueId} onChange={(e) => setLeagueId(e.target.value)} aria-label="Liga">
        {leagues.data.leagues.map((l) => <option key={l.id} value={l.id}>{l.flag} {l.name}</option>)}
      </select>
      {detail.loading && <Loading />}
      {detail.error && <ErrorBox error={detail.error} onRetry={detail.reload} />}
      {d && d.ok && (
        <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-4">
          <Panel title={`${d.league.name} · jadval (${d.league.gameDate || ''})`}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[420px]">
                <thead><tr className="text-ink-muted text-left"><th className="py-1.5 px-1">#</th><th>Klub</th><th className="text-center">O</th><th className="text-center">G</th><th className="text-center">D</th><th className="text-center">M</th><th className="text-center">Gol</th><th className="text-center px-2">Ochko</th></tr></thead>
                <tbody>
                  {d.table.map((r) => (
                    <tr key={r.id} className="border-t border-surface-line">
                      <td className="py-1.5 px-1 font-bold text-ink-muted">{r.pos}</td>
                      <td className="font-semibold text-ink whitespace-nowrap"><TeamBadge value={r.logo} size={16} /> {r.name}</td>
                      <td className="text-center tabular-nums">{r.played}</td><td className="text-center tabular-nums">{r.win}</td>
                      <td className="text-center tabular-nums">{r.draw}</td><td className="text-center tabular-nums">{r.loss}</td>
                      <td className="text-center tabular-nums">{r.gf}-{r.ga}</td><td className="text-center px-2 font-extrabold tabular-nums">{r.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
          <div className="flex flex-col gap-4">
            <Panel title="So'nggi turlar natijalari">
              {d.rounds.length === 0 ? <Empty>Hali o'yinlar bo'lmagan.</Empty> : d.rounds.map((r) => (
                <div key={r.round} className="mb-3 last:mb-0">
                  <div className="text-[11px] font-extrabold uppercase text-ink-muted mb-1">{r.round}-tur · {r.date}</div>
                  <div className="flex flex-col gap-1">
                    {r.matches.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="flex-1 text-right truncate">{m.home} <TeamBadge value={m.homeLogo} size={16} /></span>
                        <span className={`w-12 text-center font-black tabular-nums ${m.pending ? 'text-amber-600' : ''}`}>{m.pending ? 'kutmoqda' : `${m.golA}-${m.golB}`}</span>
                        <span className="flex-1 truncate"><TeamBadge value={m.awayLogo} size={16} /> {m.away}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </Panel>
            <Panel title="Top butsi">
              {d.scorers.length === 0 ? <Empty>Gol yo'q.</Empty> : d.scorers.map((s, i) => (
                <div key={s.id || i} className="flex items-center gap-2 text-xs py-1 border-t first:border-t-0 border-surface-line">
                  <span className="w-5 font-bold text-ink-muted">{i + 1}</span><span className="flex-1 font-semibold truncate">{s.name}</span>
                  <span className="text-ink-muted truncate">{s.teamName || s.team || ''}</span><span className="font-black tabular-nums">{s.goals}</span>
                </div>
              ))}
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}

function CompetitionList({ fetcher, pick, mode, emptyText }) {
  const { loading, data, error, reload } = useFetch(fetcher, []);
  const [idx, setIdx] = useState(0);
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const list = pick(data);
  const history = data.history || [];
  return (
    <div className="flex flex-col gap-4">
      {list.length === 0 ? <Panel><Empty>{emptyText}</Empty></Panel> : (
        <Panel>
          {list.length > 1 && (
            <div className="mb-4"><SegmentedTabs tabs={list.map((c, i) => ({ key: String(i), label: c.short || c.name }))} active={String(idx)} onChange={(k) => setIdx(Number(k))} /></div>
          )}
          <TournamentView comp={list[Math.min(idx, list.length - 1)]} mode={mode} />
        </Panel>
      )}
      <Panel title="G'oliblar tarixi">
        {history.length === 0 ? <Empty>Hali tugagan turnir yo'q.</Empty> : history.map((h) => (
          <div key={h.id || `${h.name}${h.year}`} className="flex items-center justify-between gap-3 text-sm py-2 border-t first:border-t-0 border-surface-line">
            <span className="font-semibold text-ink-soft">{h.name} {h.season ? `${h.season}/${String(h.season + 1).slice(2)}` : h.year}</span>
            <span className="font-extrabold">🏆 {h.winner?.logo || h.winner?.flag || ''} {h.winner?.name || (typeof h.winner === 'string' ? h.winner : '')}</span>
          </div>
        ))}
      </Panel>
    </div>
  );
}

function SimHistory() {
  const { loading, data, error, reload } = useFetch(fetchSimLog, []);
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const log = data.log || [];
  return (
    <Panel title="Simulyatsiya tarixi (oxirgi 80 ta kun)" action={<button type="button" onClick={reload} className="text-xs font-bold text-accent-dark bg-transparent border-0 cursor-pointer font-sans">Yangilash</button>}>
      {log.length === 0 ? <Empty>Admin hali kunni o'tkazmagan.</Empty> : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse min-w-[560px]">
            <thead><tr className="text-left text-ink-muted"><th className="py-1.5">Sana</th><th>Hal qilindi</th><th>Kutmoqda</th><th>Tadbirlar</th><th>Kim</th></tr></thead>
            <tbody>
              {log.map((e, i) => (
                <tr key={i} className="border-t border-surface-line align-top">
                  <td className="py-1.5 font-bold tabular-nums whitespace-nowrap">{e.date}</td>
                  <td className="tabular-nums">{e.resolved}{e.autoResolved ? ` (+${e.autoResolved} avto)` : ''}</td>
                  <td className="tabular-nums">{e.pendingAfter}</td>
                  <td className="text-ink-soft">{[...(e.rollovers || []).map((r) => `Mavsum: ${r}`), ...(e.international || []), ...(e.continental || [])].join(' · ') || '—'}</td>
                  <td className="text-ink-muted">{e.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

const SUB = [
  { key: 'leagues', label: 'Ligalar' },
  { key: 'ucl', label: 'Champions League' },
  { key: 'uel', label: 'Europa League' },
  { key: 'acl', label: 'AFC Champions League' },
  { key: 'intl', label: 'Xalqaro turnirlar' },
  { key: 'sim', label: 'Simulyatsiya tarixi' },
];

export default function LeaguesTab() {
  const [sub, setSub] = useState('leagues');
  return (
    <div className="flex flex-col gap-4">
      <SegmentedTabs tabs={SUB} active={sub} onChange={setSub} />
      {sub === 'leagues' && <LeagueBrowser />}
      {sub === 'ucl' && <CompetitionList key="ucl" fetcher={fetchContinental} pick={(d) => d.active.filter((c) => c.key === 'ucl')} mode="club" emptyText="Chempionlar Ligasi mavsum boshida (1-sentabrdan) avtomatik yaratiladi. Adminda kunlarni o'tkazing." />}
      {sub === 'uel' && <CompetitionList key="uel" fetcher={fetchContinental} pick={(d) => d.active.filter((c) => c.key === 'uel')} mode="club" emptyText="Yevropa Ligasi mavsum boshida (1-sentabrdan) avtomatik yaratiladi." />}
      {sub === 'acl' && <CompetitionList key="acl" fetcher={fetchContinental} pick={(d) => d.active.filter((c) => c.key === 'acl')} mode="club" emptyText="AFC Champions League mavsum boshida (1-sentabrdan) avtomatik yaratiladi." />}
      {sub === 'intl' && <CompetitionList key="intl" fetcher={fetchInternational} pick={(d) => d.tournaments} mode="nation" emptyText="Hozir faol xalqaro turnir yo'q (Jahon Chempionati, Yevro va h.k. kalendar bo'yicha boshlanadi)." />}
      {sub === 'sim' && <SimHistory />}
    </div>
  );
}
