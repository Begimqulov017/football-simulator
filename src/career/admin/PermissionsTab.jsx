import React, { useState } from 'react';
import { getAllUsers, setProAccess, deleteUser } from '../../utils/auth';
import { adminSetPassword, adminWipeUser, wipeAllData } from '../utils/careerApi';
import { Button, Badge } from '../../components/ui';
import { useFetch, Panel, Loading, ErrorBox, Empty, inputCls } from './adminUi';

function Confirm({ text, confirmLabel, onConfirm, onCancel, danger = true }) {
  return (
    <div className={`motion-safe:animate-fs-fade-up mt-3 rounded-control border px-3 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 ${danger ? 'bg-red-50 border-red-200 text-red-700' : 'bg-accent-tint border-accent-soft text-accent-dark'}`}>
      <span className="font-semibold">{text}</span>
      <span className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={onCancel}>Bekor qilish</Button>
        <Button size="sm" variant={danger ? 'primary' : 'accent'} className={danger ? '!bg-red-600 hover:!bg-red-700' : ''} onClick={onConfirm}>{confirmLabel}</Button>
      </span>
    </div>
  );
}

function UserCard({ user, isSelf, onChanged, toast }) {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState(null); // 'wipe' | 'delete'
  const [busy, setBusy] = useState(false);

  const run = async (fn, okMsg) => {
    setBusy(true);
    try {
      const r = await fn();
      const ok = r === true || r?.ok;
      toast(ok ? okMsg : (r?.error || 'Amal bajarilmadi'), ok ? 'ok' : 'err');
      if (ok) onChanged();
    } catch (e) { toast(e.message || 'Xatolik', 'err'); }
    setBusy(false); setConfirm(null);
  };

  return (
    <div className="bg-surface rounded-card border border-surface-line p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-full bg-surface-card border border-surface-line flex items-center justify-center font-black text-ink-soft">{user.username[0].toUpperCase()}</span>
          <div>
            <div className="font-extrabold text-ink text-sm">{user.username}{isSelf && <span className="text-ink-subtle font-semibold"> (siz)</span>}</div>
            <div className="text-[11px] text-ink-muted">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}</div>
          </div>
        </div>
        <div className="flex gap-1.5">
          {user.isAdmin && <Badge tone="accent">Admin</Badge>}
          <Badge tone={user.canAccessPro ? 'brand' : 'neutral'}>{user.canAccessPro ? '⭐ Premium' : 'Oddiy'}</Badge>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-3 items-end">
        <Button
          size="sm"
          variant={user.canAccessPro ? 'secondary' : 'primary'}
          disabled={busy || user.isAdmin}
          onClick={() => run(() => setProAccess(user.username, !user.canAccessPro), user.canAccessPro ? 'Premium olib tashlandi' : 'Premium berildi')}
        >
          {user.canAccessPro ? 'Premiumni olib tashlash' : '⭐ Premium berish'}
        </Button>
        <div className="flex gap-2">
          <input type="password" className={`${inputCls} flex-1 min-w-0`} placeholder="Yangi parol (kamida 4 belgi)" value={pw} onChange={(e) => setPw(e.target.value)} aria-label={`${user.username} uchun yangi parol`} />
          <Button size="sm" variant="accent" disabled={busy || pw.length < 4} onClick={() => run(async () => { const r = await adminSetPassword(user.username, pw); if (r.ok) setPw(''); return r; }, "Parol o'zgartirildi")}>Saqlash</Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" disabled={busy} onClick={() => setConfirm('wipe')}>🧹 Wipe Data (karyerani nolga)</Button>
        {!user.isAdmin && <Button size="sm" variant="ghost" className="!text-red-600" disabled={busy} onClick={() => setConfirm('delete')}>Akkauntni o'chirish</Button>}
      </div>
      {confirm === 'wipe' && <Confirm text={`${user.username} karyerasi butunlay o'chiriladi (akkaunt qoladi).`} confirmLabel="Ha, nolga tushirish" onCancel={() => setConfirm(null)} onConfirm={() => run(() => adminWipeUser(user.username), "Karyera nolga tushirildi")} />}
      {confirm === 'delete' && <Confirm text={`${user.username} akkaunti butunlay o'chiriladi.`} confirmLabel="Ha, o'chirish" onCancel={() => setConfirm(null)} onConfirm={() => run(() => deleteUser(user.username), "Akkaunt o'chirildi")} />}
    </div>
  );
}

export default function PermissionsTab({ currentUser }) {
  const { loading, data, error, reload } = useFetch(async () => ({ ok: true, users: await getAllUsers() }), []);
  const [toast, setToast] = useState(null);
  const [globalConfirm, setGlobalConfirm] = useState(false);
  const showToast = (msg, kind) => { setToast({ msg, kind }); setTimeout(() => setToast(null), 3500); };

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const users = data.users || [];

  return (
    <div className="flex flex-col gap-4">
      {toast && (
        <div role="status" className={`motion-safe:animate-fs-fade-up rounded-control border px-4 py-2.5 text-sm font-semibold ${toast.kind === 'ok' ? 'bg-brand-tint border-brand-soft text-brand-dark' : 'bg-red-50 border-red-200 text-red-700'}`}>{toast.msg}</div>
      )}
      <Panel title={`Foydalanuvchilar ruxsatlari (${users.length})`}>
        {users.length === 0 ? <Empty>Foydalanuvchi yo'q.</Empty> : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {users.map((u) => <UserCard key={u.username} user={u} isSelf={u.username === currentUser?.username} onChanged={reload} toast={showToast} />)}
          </div>
        )}
      </Panel>
      <Panel title="Xavfli zona">
        <div className="text-xs text-ink-muted mb-3">Butun serverdagi barcha akkauntlar, karyeralar va dunyo ma'lumotlari (ligalar, turnirlar) nolga tushiriladi. Faqat sizning admin akkauntingiz qoladi.</div>
        <Button size="sm" variant="secondary" className="!text-red-600 !border-red-200" onClick={() => setGlobalConfirm(true)}>🧨 Barcha ma'lumotlarni o'chirish (Wipe All)</Button>
        {globalConfirm && <Confirm text="Bu amalni ortga qaytarib bo'lmaydi. Davom etamizmi?" confirmLabel="Ha, hammasini o'chirish" onCancel={() => setGlobalConfirm(false)} onConfirm={async () => { const r = await wipeAllData(); setGlobalConfirm(false); showToast(r?.ok ? "Barcha ma'lumotlar tozalandi" : (r?.error || 'Xatolik'), r?.ok ? 'ok' : 'err'); reload(); }} />}
      </Panel>
    </div>
  );
}
