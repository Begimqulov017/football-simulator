import React, { useState } from 'react';
import { setProAccess, deleteUser } from '../../utils/auth';
import {
  adminSetPassword, adminWipeUser, wipeAllData, fetchUsersTable, fetchUserStats,
  setUserRole, setUserSuspended, muteUser,
} from '../utils/careerApi';
import { Button, Badge } from '../../components/ui';
import { useFetch, Panel, Loading, ErrorBox, Empty, Stat, inputCls } from './adminUi';
import { TeamBadge } from '../../components/TeamLogo';

const ROLE_LABEL = { user: 'Foydalanuvchi', moderator: 'Moderator', admin: 'Admin' };

function Confirm({ text, confirmLabel, onConfirm, onCancel, danger = true, children }) {
  return (
    <div className={`motion-safe:animate-fs-fade-up mt-3 rounded-control border px-3 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 ${danger ? 'bg-red-50 border-red-200 text-red-700' : 'bg-accent-tint border-accent-soft text-accent-dark'}`}>
      <span className="font-semibold">{text}</span>
      {children}
      <span className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={onCancel}>Bekor qilish</Button>
        <Button size="sm" variant="primary" className={danger ? '!bg-red-600 hover:!bg-red-700' : ''} onClick={onConfirm}>{confirmLabel}</Button>
      </span>
    </div>
  );
}

// Bitta foydalanuvchining kengaytirilgan paneli: statistika + hisob vositalari
function UserDetail({ user, isSelf, run, busy }) {
  const stats = useFetch(() => fetchUserStats(user.username), [user.username, user.overall, user.goals]);
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState(null);
  const s = stats.data && stats.data.ok ? stats.data : null;

  return (
    <div className="bg-surface border-t border-surface-line px-4 py-4 flex flex-col gap-4">
      {stats.loading ? <Loading label="Statistika yuklanmoqda…" /> : stats.error ? <ErrorBox error={stats.error} onRetry={stats.reload} /> : !s?.hasCareer ? (
        <div className="text-xs text-ink-muted">Bu foydalanuvchi hali karyera boshlamagan.</div>
      ) : (
        <>
          <div className="text-sm">
            <span className="font-extrabold">{s.player.name}</span>
            <span className="text-ink-muted"> · {s.player.position} · {s.player.age} yosh · {s.player.club ? `${s.player.club.logo} ${s.player.club.name} (${s.player.club.leagueName})` : 'klubsiz'}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            <Stat label="OVR" value={s.player.overall} tone="brand" />
            <Stat label="Potensial" value={s.player.potential} />
            <Stat label="O'yinlar" value={s.career.appearances} />
            <Stat label="Gol" value={s.career.goals} />
            <Stat label="Assist" value={s.career.assists} />
            <Stat label="O'rt. reyting" value={s.career.avgRating ?? '—'} tone="accent" />
            <Stat label="Balans" value={`€${Number(s.career.money).toLocaleString('en-US')}`} />
            <Stat label="Jarohat" value={s.career.injuryDays ? `${s.career.injuryDays} kun` : 'yo\'q'} tone={s.career.injuryDays ? 'amber' : 'neutral'} />
          </div>
          <div className="text-xs text-ink-muted flex flex-wrap gap-x-5 gap-y-1">
            <span>So'nggi reytinglar: <b className="text-ink tabular-nums">{s.career.lastRatings.length ? s.career.lastRatings.join(' · ') : '—'}</b></span>
            <span>Kareradagi sana: <b className="text-ink">{s.career.gameDate || '—'}</b></span>
            <span>Kubok: <b className="text-ink">{s.career.trophies.length ? s.career.trophies.join(', ') : '—'}</b></span>
            <span>Oxirgi saqlash: <b className="text-ink">{s.lastSavedAt ? new Date(s.lastSavedAt).toLocaleString() : '—'}</b></span>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-3 items-end">
        <Button size="sm" variant={user.canAccessPro ? 'secondary' : 'primary'} disabled={busy || user.role === 'admin'}
          onClick={() => run(() => setProAccess(user.username, !user.canAccessPro), user.canAccessPro ? 'Premium olib tashlandi' : 'Premium berildi')}>
          {user.canAccessPro ? 'Premiumni olib tashlash' : '⭐ Premium berish'}
        </Button>
        <div className="flex gap-2">
          <input type="password" className={`${inputCls} flex-1 min-w-0`} placeholder="Yangi parol (kamida 4 belgi)" value={pw} onChange={(e) => setPw(e.target.value)} aria-label={`${user.username} uchun yangi parol`} />
          <Button size="sm" variant="accent" disabled={busy || pw.length < 4} onClick={() => run(async () => { const r = await adminSetPassword(user.username, pw); if (r.ok) setPw(''); return r; }, "Parol o'zgartirildi")}>Saqlash</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" disabled={busy} onClick={() => setConfirm('wipe')}>🧹 Wipe Data (karyerani nolga)</Button>
        {!isSelf && user.role !== 'admin' && <Button size="sm" variant="ghost" className="!text-red-600" disabled={busy} onClick={() => setConfirm('delete')}>Akkauntni o'chirish</Button>}
      </div>
      {confirm === 'wipe' && <Confirm text={`${user.username} karyerasi butunlay o'chiriladi (akkaunt qoladi).`} confirmLabel="Ha, nolga tushirish" onCancel={() => setConfirm(null)} onConfirm={() => { setConfirm(null); run(() => adminWipeUser(user.username), 'Karyera nolga tushirildi'); }} />}
      {confirm === 'delete' && <Confirm text={`${user.username} akkaunti butunlay o'chiriladi.`} confirmLabel="Ha, o'chirish" onCancel={() => setConfirm(null)} onConfirm={() => { setConfirm(null); run(() => deleteUser(user.username), "Akkaunt o'chirildi"); }} />}
    </div>
  );
}

export default function UsersTab({ currentUser }) {
  const { loading, data, error, reload } = useFetch(fetchUsersTable, []);
  const [open, setOpen] = useState(null);       // statistikasi ochiq username
  const [pending, setPending] = useState(null); // { username, kind: 'suspend', reason }
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(false);
  const [globalConfirm, setGlobalConfirm] = useState(false);
  const flash = (text, kind = 'ok') => { setToast({ text, kind }); setTimeout(() => setToast(null), 4000); };

  const run = async (fn, okMsg) => {
    setBusy(true);
    try {
      const r = await fn();
      const ok = r === true || r?.ok;
      flash(ok ? okMsg : (r?.error || 'Amal bajarilmadi'), ok ? 'ok' : 'err');
      if (ok) await reload();
    } catch (e) { flash(e.message || 'Xatolik', 'err'); }
    setBusy(false);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const users = data.users || [];
  const me = currentUser?.username;

  return (
    <div className="flex flex-col gap-4">
      {toast && <div role="status" className={`motion-safe:animate-fs-fade-up rounded-control border px-4 py-2.5 text-sm font-semibold ${toast.kind === 'ok' ? 'bg-brand-tint border-brand-soft text-brand-dark' : 'bg-red-50 border-red-200 text-red-700'}`}>{toast.text}</div>}

      <Panel title={`Foydalanuvchilar (${users.length})`} action={<button type="button" onClick={reload} className="text-xs font-bold text-accent-dark bg-transparent border-0 cursor-pointer font-sans">Yangilash</button>} className="!p-0 overflow-hidden">
        {users.length === 0 ? <Empty>Foydalanuvchi yo'q.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[860px]">
              <thead>
                <tr className="text-left text-[11px] text-ink-muted bg-surface border-y border-surface-line">
                  <th className="px-4 py-2 font-bold">Foydalanuvchi</th><th className="font-bold">Rol</th><th className="font-bold">Holat</th>
                  <th className="font-bold">Karyera</th><th className="font-bold text-center">O'/G/A</th><th className="px-4 font-bold text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.username === me;
                  const locked = isSelf; // o'z rolini o'zgartirib bo'lmaydi; asosiy adminni server himoya qiladi
                  return (
                    <React.Fragment key={u.username}>
                      <tr className={`border-b border-surface-line align-middle ${u.suspended ? 'bg-red-50/50' : ''}`}>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-surface border border-surface-line flex items-center justify-center font-black text-ink-soft text-xs">{u.username[0].toUpperCase()}</span>
                            <div>
                              <div className="font-extrabold text-ink leading-tight">{u.username}{isSelf && <span className="text-ink-subtle font-semibold"> (siz)</span>}</div>
                              <div className="text-[11px] text-ink-muted">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <select className={`${inputCls} !py-1 !px-2 text-xs`} value={u.role} disabled={busy || locked}
                            aria-label={`${u.username} roli`}
                            onChange={(e) => run(() => setUserRole(u.username, e.target.value), `${u.username}: rol "${ROLE_LABEL[e.target.value]}" qilindi (qayta kirishi kerak)`)}>
                            {Object.entries(ROLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                          </select>
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            {u.suspended && <Badge className="!bg-red-50 !text-red-700 !border-red-200">To'xtatilgan</Badge>}
                            {u.muted && <Badge className="!bg-amber-50 !text-amber-800 !border-amber-200">Mute{u.muted.forever ? '' : ` · ${new Date(u.muted.until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</Badge>}
                            {u.canAccessPro && <Badge tone="brand">⭐ Premium</Badge>}
                            {!u.suspended && !u.muted && !u.canAccessPro && <Badge>Oddiy</Badge>}
                          </div>
                        </td>
                        <td className="text-xs">{u.hasCareer ? <><span className="mr-1"><TeamBadge value={u.club?.logo} size={16} /></span><b>{u.name}</b> <span className="text-ink-muted">· {u.position} · OVR {u.overall}</span></> : <span className="text-ink-muted">Karyera yo'q</span>}</td>
                        <td className="text-center tabular-nums text-xs">{u.hasCareer ? `${u.appearances}/${u.goals}/${u.assists}` : '—'}</td>
                        <td className="px-4">
                          <div className="flex flex-wrap justify-end gap-1.5">
                            <Button size="sm" variant="secondary" onClick={() => setOpen(open === u.username ? null : u.username)} aria-expanded={open === u.username}>{open === u.username ? 'Yopish' : 'Statistika'}</Button>
                            {u.muted
                              ? <Button size="sm" variant="secondary" disabled={busy} onClick={() => run(() => muteUser(u.username, { unmute: true }), `${u.username} unmute qilindi`)}>Unmute</Button>
                              : !isSelf && u.role !== 'admin' && (
                                <select className={`${inputCls} !py-1 !px-2 text-xs w-[86px]`} value="" disabled={busy} aria-label={`${u.username}ni mute qilish`}
                                  onChange={(e) => { const v = e.target.value; if (v) run(() => muteUser(u.username, v === 'forever' ? { forever: true, reason: 'Admin qarori' } : { minutes: Number(v), reason: 'Admin qarori' }), `${u.username} mute qilindi`); }}>
                                  <option value="">Mute…</option><option value="10">10 daq</option><option value="60">1 soat</option><option value="1440">24 soat</option><option value="forever">Doimiy</option>
                                </select>
                              )}
                            {u.suspended
                              ? <Button size="sm" variant="primary" disabled={busy} onClick={() => run(() => setUserSuspended(u.username, false), `${u.username} tiklandi`)}>Tiklash</Button>
                              : !isSelf && u.role !== 'admin' && <Button size="sm" variant="ghost" className="!text-red-600" disabled={busy} onClick={() => setPending({ username: u.username, reason: '' })}>To'xtatish</Button>}
                          </div>
                        </td>
                      </tr>
                      {pending?.username === u.username && (
                        <tr><td colSpan={6} className="px-4 pb-3">
                          <Confirm text={`${u.username} akkaunti to'xtatiladi va tizimdan chiqariladi.`} confirmLabel="To'xtatish" onCancel={() => setPending(null)}
                            onConfirm={() => { const reason = pending.reason; setPending(null); run(() => setUserSuspended(u.username, true, reason), `${u.username} to'xtatildi`); }}>
                            <input className={`${inputCls} !py-1 flex-1 min-w-[160px]`} placeholder="Sabab (ixtiyoriy)" value={pending.reason} onChange={(e) => setPending({ ...pending, reason: e.target.value })} aria-label="To'xtatish sababi" />
                          </Confirm>
                        </td></tr>
                      )}
                      {open === u.username && <tr><td colSpan={6} className="p-0"><UserDetail user={u} isSelf={isSelf} run={run} busy={busy} /></td></tr>}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title="Xavfli zona">
        <div className="text-xs text-ink-muted mb-3">Butun serverdagi barcha akkauntlar, karyeralar, chat, yangiliklar va dunyo ma'lumotlari (ligalar, turnirlar) nolga tushiriladi. Faqat sizning admin akkauntingiz qoladi.</div>
        <Button size="sm" variant="secondary" className="!text-red-600 !border-red-200" onClick={() => setGlobalConfirm(true)}>🧨 Barcha ma'lumotlarni o'chirish (Wipe All)</Button>
        {globalConfirm && <Confirm text="Bu amalni ortga qaytarib bo'lmaydi. Davom etamizmi?" confirmLabel="Ha, hammasini o'chirish" onCancel={() => setGlobalConfirm(false)} onConfirm={async () => { setGlobalConfirm(false); const r = await wipeAllData(); flash(r?.ok ? "Barcha ma'lumotlar tozalandi" : (r?.error || 'Xatolik'), r?.ok ? 'ok' : 'err'); reload(); }} />}
      </Panel>
    </div>
  );
}
