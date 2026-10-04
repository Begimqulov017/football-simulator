import React, { useState } from 'react';
import { Button, Badge } from '../../components/ui';
import { fetchAdminNews, forceNews, deleteAdminNews, fetchUsersTable } from '../utils/careerApi';
import { useFetch, Panel, Loading, ErrorBox, Empty, inputCls } from './adminUi';

const KINDS = [['info', "📢 E'lon"], ['breaking', '🚨 Shoshilinch'], ['transfer', '💸 Transfer'], ['award', '🏆 Mukofot']];

// Yangilikni majburlash: yozilgan xabar tanlangan foydalanuvchi(lar)ning News lentasiga
// (va Home bannerga — 8-10 priority bilan) tushadi. Har bir foydalanuvchi uni bir marta oladi.
export default function NewsTab() {
  const list = useFetch(fetchAdminNews, []);
  const users = useFetch(fetchUsersTable, []);
  const [form, setForm] = useState({ headline: '', summary: '', kind: 'info', username: '', pinned: false });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const send = async () => {
    setBusy(true); setMsg(null);
    const r = await forceNews(form);
    setBusy(false);
    if (!r.ok) { setMsg({ kind: 'err', text: r.error || 'Yuborilmadi' }); return; }
    setMsg({ kind: 'ok', text: form.username ? `${form.username} uchun yangilik yuborildi` : "Barcha foydalanuvchilar uchun yangilik yuborildi" });
    setForm((f) => ({ ...f, headline: '', summary: '' }));
    list.reload();
  };
  const remove = async (id) => {
    const r = await deleteAdminNews(id);
    setMsg(r.ok ? { kind: 'ok', text: "Yangilik o'chirildi (hali olmaganlarga yetib bormaydi)" } : { kind: 'err', text: r.error || "O'chirilmadi" });
    list.reload();
  };

  return (
    <div className="flex flex-col gap-4">
      <Panel title="Yangi yangilik">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-[11px] font-bold text-ink-muted md:col-span-2">Sarlavha
            <input className={inputCls} maxLength={140} value={form.headline} onChange={set('headline')} placeholder="Masalan: Transfer oynasi 3 kundan so'ng yopiladi" />
          </label>
          <label className="flex flex-col gap-1 text-[11px] font-bold text-ink-muted md:col-span-2">Matn
            <textarea className={`${inputCls} min-h-[84px] resize-y`} maxLength={400} value={form.summary} onChange={set('summary')} placeholder="Qisqa tavsif (bo'sh qolsa sarlavha ishlatiladi)" />
          </label>
          <label className="flex flex-col gap-1 text-[11px] font-bold text-ink-muted">Turi
            <select className={inputCls} value={form.kind} onChange={set('kind')}>{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          </label>
          <label className="flex flex-col gap-1 text-[11px] font-bold text-ink-muted">Kimga
            <select className={inputCls} value={form.username} onChange={set('username')}>
              <option value="">Hammaga</option>
              {(users.data?.users || []).map((u) => <option key={u.username} value={u.username}>{u.username}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-ink-soft cursor-pointer">
            <input type="checkbox" checked={form.pinned} onChange={set('pinned')} className="w-4 h-4" /> Home bannerda birinchi ko'rsatish
          </label>
          <div className="flex md:justify-end"><Button size="md" variant="primary" disabled={busy || form.headline.trim().length < 4} onClick={send}>Yuborish</Button></div>
        </div>
        {msg && <div role="status" className={`mt-3 rounded-control border px-3 py-2 text-xs font-semibold ${msg.kind === 'ok' ? 'bg-brand-tint border-brand-soft text-brand-dark' : 'bg-red-50 border-red-200 text-red-700'}`}>{msg.text}</div>}
      </Panel>

      <Panel title={`Yuborilgan yangiliklar (${list.data?.items?.length || 0})`}>
        {list.loading ? <Loading /> : list.error ? <ErrorBox error={list.error} onRetry={list.reload} /> : (list.data.items.length === 0 ? <Empty>Hali majburiy yangilik yuborilmagan.</Empty> : (
          <ul className="list-none m-0 p-0 divide-y divide-surface-line">
            {list.data.items.map((n) => (
              <li key={n.id} className="py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-lg" aria-hidden>{n.icon}</span>
                <div className="flex-1 min-w-[200px]">
                  <div className="text-sm font-bold text-ink">{n.headline}</div>
                  <div className="text-[11px] text-ink-muted">{new Date(n.createdAt).toLocaleString()} · {n.by}</div>
                </div>
                <Badge tone={n.target ? 'accent' : 'neutral'}>{n.target ? `@${n.target}` : 'Hammaga'}</Badge>
                {n.pinned && <Badge tone="brand">Banner</Badge>}
                <Button size="sm" variant="ghost" className="!text-red-600" onClick={() => remove(n.id)}>O'chirish</Button>
              </li>
            ))}
          </ul>
        ))}
      </Panel>
    </div>
  );
}
