import React, { useEffect, useState } from 'react';
import { Button, Badge } from '../../components/ui';
import { fetchLeagues, fetchFixtures, createFixture, deleteFixture } from '../utils/careerApi';
import { useFetch, Panel, Loading, ErrorBox, Empty, inputCls } from './adminUi';

// Qo'lda fixture yaratish: tanlangan ligada ikki jamoa o'rtasida, kelajakdagi bo'sh
// sanaga bitta o'yin qo'shiladi. O'yin oddiy liga turi sifatida o'ynaladi (jadvalga
// ta'sir qiladi) va dunyo kalendari surilganda avtomatik hal qilinadi.
export default function FixturesTab() {
  const leagues = useFetch(fetchLeagues, []);
  const [leagueId, setLeagueId] = useState('');
  const [form, setForm] = useState({ homeId: '', awayId: '', date: '' });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!leagueId && leagues.data?.leagues?.length) setLeagueId(leagues.data.leagues[0].id); }, [leagues.data, leagueId]);
  const fx = useFetch(() => (leagueId ? fetchFixtures(leagueId) : Promise.resolve(null)), [leagueId]);
  useEffect(() => { setForm({ homeId: '', awayId: '', date: '' }); setMsg(null); }, [leagueId]);

  if (leagues.loading) return <Loading />;
  if (leagues.error) return <ErrorBox error={leagues.error} onRetry={leagues.reload} />;
  const d = fx.data && fx.data.ok ? fx.data : null;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const valid = form.homeId && form.awayId && form.homeId !== form.awayId && form.date;

  const create = async () => {
    setBusy(true); setMsg(null);
    const r = await createFixture({ leagueId, ...form });
    setBusy(false);
    if (!r.ok) { setMsg({ kind: 'err', text: r.error || 'Yaratilmadi' }); return; }
    setMsg({ kind: 'ok', text: `Fixture yaratildi: ${r.date} (tur ${r.round})` });
    setForm({ homeId: '', awayId: '', date: '' });
    fx.reload();
  };
  const remove = async (round) => {
    const r = await deleteFixture(leagueId, round);
    setMsg(r.ok ? { kind: 'ok', text: "Fixture o'chirildi" } : { kind: 'err', text: r.error || "O'chirilmadi" });
    fx.reload();
  };

  return (
    <div className="flex flex-col gap-4">
      <select className={`${inputCls} self-start`} value={leagueId} onChange={(e) => setLeagueId(e.target.value)} aria-label="Liga">
        {leagues.data.leagues.map((l) => <option key={l.id} value={l.id}>{l.flag} {l.name}</option>)}
      </select>

      {fx.loading && <Loading />}
      {fx.error && <ErrorBox error={fx.error} onRetry={fx.reload} />}

      {d && (
        <>
          <Panel title="Yangi fixture">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-3 items-end">
              <label className="flex flex-col gap-1 text-[11px] font-bold text-ink-muted">Uy egasi
                <select className={inputCls} value={form.homeId} onChange={set('homeId')}>
                  <option value="">Tanlang…</option>
                  {d.teams.map((t) => <option key={t.id} value={t.id} disabled={t.id === form.awayId}>{t.logo} {t.name}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-[11px] font-bold text-ink-muted">Mehmon
                <select className={inputCls} value={form.awayId} onChange={set('awayId')}>
                  <option value="">Tanlang…</option>
                  {d.teams.map((t) => <option key={t.id} value={t.id} disabled={t.id === form.homeId}>{t.logo} {t.name}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-[11px] font-bold text-ink-muted">Sana
                <input type="date" className={inputCls} value={form.date} min={d.worldDate || undefined} max={d.lastDate || undefined} onChange={set('date')} />
              </label>
              <Button size="md" variant="primary" disabled={!valid || busy} onClick={create}>Yaratish</Button>
            </div>
            <div className="text-[11px] text-ink-muted mt-2">Dunyo sanasi: {d.worldDate || '—'} · mavsum oxiri: {d.lastDate || '—'}. Kun boshiga bitta tur; sana band bo'lsa server rad etadi.</div>
            {msg && <div role="status" className={`mt-3 rounded-control border px-3 py-2 text-xs font-semibold ${msg.kind === 'ok' ? 'bg-brand-tint border-brand-soft text-brand-dark' : 'bg-red-50 border-red-200 text-red-700'}`}>{msg.text}</div>}
          </Panel>

          <Panel title={`Yaqin turlar (${d.upcoming.length})`}>
            {d.upcoming.length === 0 ? <Empty>Kutilayotgan tur yo'q.</Empty> : (
              <ul className="list-none m-0 p-0 flex flex-col divide-y divide-surface-line">
                {d.upcoming.map((r) => (
                  <li key={r.round} className="py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                    <span className="tabular-nums text-ink-muted w-24 shrink-0">{r.date}</span>
                    <span className="text-xs text-ink-muted w-14 shrink-0">Tur {r.round}</span>
                    <span className="flex-1 min-w-[200px] font-semibold">
                      {r.matches.length === 1
                        ? <>{r.matches[0].home.logo} {r.matches[0].home.name} <span className="text-ink-subtle font-normal">vs</span> {r.matches[0].away.name} {r.matches[0].away.logo}</>
                        : <span className="text-ink-soft font-normal">{r.matches.length} ta o'yin</span>}
                    </span>
                    {r.custom && <Badge tone="accent">Admin fixture</Badge>}
                    {r.matches.some((m) => m.pending) && <Badge tone="brand">Kutmoqda</Badge>}
                    {r.custom && !r.matches.some((m) => m.pending) && <Button size="sm" variant="ghost" className="!text-red-600" onClick={() => remove(r.round)}>O'chirish</Button>}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}
