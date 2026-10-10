import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui';
import {
  fetchLeagues, fetchFixtures, fetchSquad, editSquadPlayer, resetSquadPlayer, resetUserRating, fetchAdminPlayers, editUserCareer,
} from '../utils/careerApi';
import { useFetch, Panel, Loading, ErrorBox, Empty, inputCls } from './adminUi';

const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];

function Note({ msg }) {
  if (!msg) return null;
  return <div role="status" className={`rounded-control border px-3 py-2 text-xs font-semibold ${msg.kind === 'ok' ? 'bg-brand-tint border-brand-soft text-brand-dark' : 'bg-red-50 border-red-200 text-red-700'}`}>{msg.text}</div>;
}

// ---- NPC jamoa tarkibi (liga dunyosidagi squad) ----
function SquadEditor() {
  const leagues = useFetch(fetchLeagues, []);
  const [leagueId, setLeagueId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [msg, setMsg] = useState(null);
  const [drafts, setDrafts] = useState({});   // playerId -> { ovr, age, pos }

  useEffect(() => { if (!leagueId && leagues.data?.leagues?.length) setLeagueId(leagues.data.leagues[0].id); }, [leagues.data, leagueId]);
  const teams = useFetch(() => (leagueId ? fetchFixtures(leagueId) : Promise.resolve(null)), [leagueId]);
  useEffect(() => { setTeamId(''); }, [leagueId]);
  useEffect(() => { if (!teamId && teams.data?.teams?.length) setTeamId(teams.data.teams[0].id); }, [teams.data, teamId]);
  const squad = useFetch(() => (leagueId && teamId ? fetchSquad(leagueId, teamId) : Promise.resolve(null)), [leagueId, teamId]);
  useEffect(() => { setDrafts({}); setMsg(null); }, [leagueId, teamId]);

  if (leagues.loading) return <Loading />;
  if (leagues.error) return <ErrorBox error={leagues.error} onRetry={leagues.reload} />;
  const list = squad.data && squad.data.ok ? squad.data.squad : [];

  const setDraft = (id, k, v) => setDrafts((d) => ({ ...d, [id]: { ...(d[id] || {}), [k]: v } }));
  const save = async (p) => {
    const dr = drafts[p.id];
    if (!dr) return;
    const r = await editSquadPlayer(leagueId, teamId, p.id, dr);
    setMsg(r.ok ? { kind: 'ok', text: `${r.player.name} saqlandi (OVR ${r.player.ovr})` } : { kind: 'err', text: r.error || 'Saqlanmadi' });
    if (r.ok) { setDrafts((d) => { const n = { ...d }; delete n[p.id]; return n; }); squad.reload(); }
  };

  const resetNpc = async (p) => {
    const r = await resetSquadPlayer(leagueId, teamId, p.id);
    setMsg(r.ok ? { kind: 'ok', text: `${r.player.name} asl holatiga qaytarildi (OVR ${r.player.ovr})` } : { kind: 'err', text: r.error || 'Qaytarilmadi' });
    if (r.ok) squad.reload();
  };

  return (
    <Panel title="Jamoa tarkibi (NPC futbolchilar)">
      <div className="flex flex-wrap gap-2 mb-3">
        <select className={inputCls} value={leagueId} onChange={(e) => setLeagueId(e.target.value)} aria-label="Liga">
          {leagues.data.leagues.map((l) => <option key={l.id} value={l.id}>{l.flag} {l.name}</option>)}
        </select>
        <select className={inputCls} value={teamId} onChange={(e) => setTeamId(e.target.value)} aria-label="Jamoa">
          {(teams.data?.teams || []).map((t) => <option key={t.id} value={t.id}>{t.logo} {t.name}</option>)}
        </select>
      </div>
      <Note msg={msg} />
      {squad.loading ? <Loading /> : squad.error ? <ErrorBox error={squad.error} onRetry={squad.reload} /> : list.length === 0 ? <Empty>Tarkib bo'sh.</Empty> : (
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-xs border-collapse min-w-[560px]">
            <thead><tr className="text-left text-ink-muted"><th className="py-1.5">O'yinchi</th><th>Poz.</th><th className="w-20">OVR</th><th className="w-20">Yosh</th><th /></tr></thead>
            <tbody>
              {list.map((p) => {
                const dr = drafts[p.id] || {};
                return (
                  <tr key={p.id} className="border-t border-surface-line">
                    <td className="py-1.5 font-semibold">{p.name}</td>
                    <td>
                      <select className={`${inputCls} !py-1 !px-2`} value={dr.pos ?? p.pos} onChange={(e) => setDraft(p.id, 'pos', e.target.value)} aria-label={`${p.name} pozitsiyasi`}>
                        {[...new Set([p.pos, ...POSITIONS])].map((x) => <option key={x} value={x}>{x}</option>)}
                      </select>
                    </td>
                    <td><input type="number" min={40} max={99} className={`${inputCls} !py-1 !px-2 w-16 tabular-nums`} value={dr.ovr ?? p.ovr} onChange={(e) => setDraft(p.id, 'ovr', e.target.value)} aria-label={`${p.name} OVR`} /></td>
                    <td><input type="number" min={15} max={45} className={`${inputCls} !py-1 !px-2 w-16 tabular-nums`} value={dr.age ?? p.age ?? ''} onChange={(e) => setDraft(p.id, 'age', e.target.value)} aria-label={`${p.name} yoshi`} /></td>
                    <td className="text-right whitespace-nowrap">
                      {drafts[p.id] && <Button size="sm" variant="accent" onClick={() => save(p)}>Saqlash</Button>}
                      {p.edited && !drafts[p.id] && <Button size="sm" variant="ghost" onClick={() => resetNpc(p)}>↩ Asl holatga</Button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

// ---- Haqiqiy foydalanuvchi karyerasi ----
const FIELDS = [
  ['overall', 'OVR', 40, 99], ['potential', 'Potensial', 40, 99], ['age', 'Yosh', 15, 45], ['number', 'Raqam', 1, 99],
  ['goals', 'Gollar', 0, 5000], ['assists', 'Assistlar', 0, 5000], ['appearances', "O'yinlar", 0, 5000],
  ['money', 'Balans (€)', 0, 1e12], ['weeklyWage', 'Haftalik maosh (€)', 0, 5e7], ['injuryDays', 'Jarohat (kun)', 0, 365],
];

function UserCareerEditor() {
  const { loading, data, error, reload } = useFetch(fetchAdminPlayers, []);
  const [username, setUsername] = useState('');
  const [draft, setDraft] = useState({});
  const [msg, setMsg] = useState(null);

  const players = (data?.players || []).filter((p) => p.hasCareer);
  useEffect(() => { if (!username && players.length) setUsername(players[0].username); }, [players, username]);
  useEffect(() => { setDraft({}); setMsg(null); }, [username]);

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const p = players.find((x) => x.username === username);
  const current = p ? { overall: p.overall, potential: p.potential, age: p.age, number: p.number, goals: p.goals, assists: p.assists, appearances: p.appearances, money: p.money, weeklyWage: p.weeklyWage, injuryDays: p.injury, position: p.position } : {};
  const changed = Object.keys(draft).length > 0;

  const save = async () => {
    const r = await editUserCareer(username, draft);
    if (r.ok) {
      setMsg({ kind: 'ok', text: `${username} karyerasi yangilandi. Foydalanuvchi ilovasi bir necha soniyada buni ko'radi.` });
      setDraft({}); reload();
    } else setMsg({ kind: 'err', text: r.error || 'Saqlanmadi' });
  };

  const resetRating = async () => {
    const r = await resetUserRating(username);
    if (r.ok) { setMsg({ kind: 'ok', text: `${username} reytingi va statlari asl holatiga (OVR ${r.overall}) qaytarildi.` }); reload(); }
    else setMsg({ kind: 'err', text: r.error || 'Qaytarilmadi' });
  };

  return (
    <Panel title="O'yinchi karyerasi va statistikasi">
      {players.length === 0 ? <Empty>Karyera boshlagan foydalanuvchi yo'q.</Empty> : (
        <div className="flex flex-col gap-3">
          <select className={`${inputCls} self-start`} value={username} onChange={(e) => setUsername(e.target.value)} aria-label="Foydalanuvchi">
            {players.map((x) => <option key={x.username} value={x.username}>{x.username} — {x.name}</option>)}
          </select>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className="flex flex-col gap-1 text-[11px] font-bold text-ink-muted">Pozitsiya
              <select className={inputCls} value={draft.position ?? current.position ?? ''} onChange={(e) => setDraft((d) => ({ ...d, position: e.target.value }))}>
                {[...new Set([current.position, ...POSITIONS].filter(Boolean))].map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </label>
            {FIELDS.map(([k, label, lo, hi]) => (
              <label key={k} className="flex flex-col gap-1 text-[11px] font-bold text-ink-muted">{label}
                <input type="number" min={lo} max={hi} className={`${inputCls} tabular-nums`} value={draft[k] ?? current[k] ?? ''} onChange={(e) => setDraft((d) => ({ ...d, [k]: e.target.value }))} />
              </label>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" variant="accent" disabled={!changed} onClick={save}>O'zgarishlarni saqlash</Button>
            {changed && <Button size="sm" variant="ghost" onClick={() => setDraft({})}>Bekor qilish</Button>}
            <Button size="sm" variant="secondary" onClick={resetRating}>↩ Reytingni asl holatga qaytarish</Button>
            <span className="text-[11px] text-ink-muted">Server chegaralarni o'zi tekshiradi. Foydalanuvchi ochiq bo'lsa, tahrir 20 soniya ichida unga yetib boradi va uning eski nusxasi ustidan yozilmaydi.</span>
          </div>
          <Note msg={msg} />
        </div>
      )}
    </Panel>
  );
}

export default function RosterTab() {
  return (
    <div className="flex flex-col gap-4">
      <UserCareerEditor />
      <SquadEditor />
    </div>
  );
}
