import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Badge } from '../../components/ui';
import Icon from '../../components/Icon';
import { advanceWorldDay, fetchCalendar, setAutoSim, runAutoSimNow } from '../utils/careerApi';
import { Panel, inputCls } from './adminUi';

const CHUNK = 31;          // serverning bitta so'rovdagi maksimumi
const MAX_MANUAL_DAYS = 365;

const fmtLeft = (ms) => {
  if (ms == null) return '—';
  const s = Math.max(0, Math.round(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

// MASTER CALENDAR — butun dunyo kalendarini boshqaradigan YAGONA joy.
// Qo'lda (+1 / +X kun) ham, avtomatik rejim ham serverdagi bitta advanceDays()
// funksiyasidan o'tadi, shuning uchun natija har doim bir xil mantiqda hisoblanadi.
export default function MasterCalendar({ onAdvanced }) {
  const [cal, setCal] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);   // { done, total }
  const [msg, setMsg] = useState(null);
  const [xDays, setXDays] = useState(7);
  const [form, setForm] = useState({ intervalMinutes: 60, daysPerTick: 1 });
  const [dirty, setDirty] = useState(false);
  const [now, setNow] = useState(Date.now());
  const skew = useRef(0);                           // server vaqti - mijoz vaqti
  const lastDate = useRef(null);
  const cancel = useRef(false);
  const busyRef = useRef(false);
  const dirtyRef = useRef(false);

  const load = useCallback(async () => {
    try {
      const d = await fetchCalendar();
      if (!d.ok) { setError(d.error || 'Kalendarni yuklab bo\'lmadi'); return; }
      setError(null);
      skew.current = new Date(d.serverTime).getTime() - Date.now();
      setCal(d);
      // Avto-rejim fonda kunni surgan bo'lsa (bu panel bosmagan) — qolgan tablar ham yangilansin
      if (lastDate.current && d.worldDate !== lastDate.current && !busyRef.current) onAdvanced();
      lastDate.current = d.worldDate;
      if (!dirtyRef.current) setForm({ intervalMinutes: d.auto.intervalMinutes, daysPerTick: d.auto.daysPerTick });
    } catch (e) { setError(e.message || 'Tarmoq xatosi'); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { dirtyRef.current = dirty; }, [dirty]);
  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, [load]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  // Bitta, ikkala tugma uchun umumiy yo'l: kunlarni 31 talik bo'laklarga bo'lib o'tkazadi
  const advance = async (total) => {
    const days = Math.max(1, Math.min(MAX_MANUAL_DAYS, Math.round(Number(total)) || 1));
    busyRef.current = true; setBusy(true); cancel.current = false; setMsg(null);
    const agg = { days: 0, resolved: 0, pending: 0, events: 0, error: null };
    try {
      while (agg.days < days && !cancel.current) {
        const step = Math.min(CHUNK, days - agg.days);
        setProgress({ done: agg.days, total: days });
        const r = await advanceWorldDay(step);
        if (!r.ok) { agg.error = r.error || 'Xatolik'; break; }
        agg.days += r.days; agg.resolved += r.resolvedMatches; agg.pending = r.pendingNow;
        agg.events += (r.continentalEvents || []).length + (r.internationalEvents || []).length;
      }
    } catch (e) { agg.error = e.message; }
    setProgress(null);
    setMsg(agg.error
      ? { kind: 'err', text: `${agg.days} kun o'tdi, so'ng xato: ${agg.error}` }
      : { kind: 'ok', text: `${agg.days} kun o'tdi · ${agg.resolved} o'yin hal qilindi · ${agg.pending} ta kutmoqda${agg.events ? ` · ${agg.events} xalqaro/kontinental tadbir` : ''}${cancel.current ? ' (to\'xtatildi)' : ''}` });
    busyRef.current = false; setBusy(false);
    await load();
    onAdvanced();
  };

  const saveAuto = async (patch) => {
    const r = await setAutoSim({ ...form, ...patch });
    if (!r.ok) { setMsg({ kind: 'err', text: r.error || 'Saqlanmadi' }); return; }
    setDirty(false); dirtyRef.current = false;
    setMsg({ kind: 'ok', text: r.auto.enabled ? `Avtomatik rejim yoqildi: har ${r.auto.intervalMinutes} daqiqada ${r.auto.daysPerTick} kun` : (patch.enabled === false ? "Avtomatik rejim o'chirildi" : 'Sozlama saqlandi') });
    await load();
  };

  const runNow = async () => {
    busyRef.current = true; setBusy(true);
    const r = await runAutoSimNow();
    setMsg(r.ok ? { kind: 'ok', text: `Tick bajarildi: ${r.result.days} kun · ${r.result.resolvedMatches} o'yin` } : { kind: 'err', text: r.error || 'Xatolik' });
    busyRef.current = false; setBusy(false);
    await load(); onAdvanced();
  };

  const auto = cal?.auto;
  const nextMs = auto?.enabled && auto.nextRunAt ? new Date(auto.nextRunAt).getTime() - (now + skew.current) : null;
  const num = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setDirty(true); };

  return (
    <Panel className="!p-0 overflow-hidden">
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-control bg-accent-tint border border-accent-soft flex items-center justify-center text-accent-dark"><Icon name="calendar" size={22} /></span>
          <div>
            <div className="text-xs font-bold text-ink-muted">Master Calendar · dunyo sanasi</div>
            <div className="text-2xl font-black tabular-nums leading-tight">{cal?.worldDate || (error ? '—' : 'Yuklanmoqda…')}</div>
            {cal && <div className="text-xs text-ink-muted mt-0.5">{cal.pending} ta o'yin o'yinchini kutmoqda</div>}
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <Button size="sm" variant="primary" disabled={busy || !cal} onClick={() => advance(1)}>+1 kun</Button>
          <div className="flex items-end gap-1.5">
            <label className="flex flex-col gap-1 text-[11px] font-bold text-ink-muted">
              Kunlar soni
              <input type="number" min={1} max={MAX_MANUAL_DAYS} className={`${inputCls} w-24 !py-1.5`} value={xDays} onChange={(e) => setXDays(e.target.value)} disabled={busy} />
            </label>
            <Button size="sm" variant="secondary" disabled={busy || !cal || !(Number(xDays) >= 1)} onClick={() => advance(xDays)}>O'tkazish</Button>
          </div>
          {busy && progress && <Button size="sm" variant="ghost" onClick={() => { cancel.current = true; }}>To'xtatish</Button>}
        </div>
      </div>

      {progress && (
        <div className="px-4 sm:px-5 pb-3">
          <div className="h-1.5 rounded-full bg-surface-muted overflow-hidden"><div className="h-full bg-brand transition-all duration-300" style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }} /></div>
          <div className="text-[11px] text-ink-muted mt-1 tabular-nums">Simulyatsiya: {progress.done} / {progress.total} kun</div>
        </div>
      )}

      <div className="border-t border-surface-line bg-surface px-4 sm:px-5 py-3.5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="button" role="switch" aria-checked={!!auto?.enabled} disabled={!auto || busy || dirty}
          onClick={() => saveAuto({ enabled: !auto.enabled })}
          title={dirty ? "Avval sozlamani saqlang" : undefined}
          className="flex items-center gap-2.5 bg-transparent border-0 p-0 cursor-pointer font-sans text-sm font-bold text-ink disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className={`relative inline-block w-10 h-6 rounded-full transition-colors ${auto?.enabled ? 'bg-brand' : 'bg-surface-line'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-soft transition-transform ${auto?.enabled ? 'translate-x-4' : ''}`} />
          </span>
          Avtomatik rejim
        </button>

        <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          har
          <input type="number" min={1} max={1440} className={`${inputCls} w-20 !py-1.5`} value={form.intervalMinutes} onChange={num('intervalMinutes')} aria-label="Daqiqa oralig'i" />
          daqiqada
          <input type="number" min={1} max={7} className={`${inputCls} w-16 !py-1.5`} value={form.daysPerTick} onChange={num('daysPerTick')} aria-label="Har tickda kunlar" />
          kun
          {dirty && <Button size="sm" variant="accent" onClick={() => saveAuto({})}>Saqlash</Button>}
        </div>

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {auto?.enabled ? <Badge tone="brand">Keyingi tick: {fmtLeft(nextMs)}</Badge> : <Badge>O'chiq</Badge>}
          {auto?.runs > 0 && <span className="text-[11px] text-ink-muted">{auto.runs} ta tick{auto.lastSummary ? ` · oxirgisi: ${auto.lastSummary}` : ''}</span>}
          <Button size="sm" variant="ghost" disabled={busy || !cal} onClick={runNow}>Hozir bajarish</Button>
        </div>
      </div>

      {(error || msg) && (
        <div className={`px-4 sm:px-5 py-2.5 text-xs font-semibold border-t ${error || msg?.kind === 'err' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-brand-tint border-brand-soft text-brand-dark'}`} role="status">
          {error || msg.text}
        </div>
      )}
    </Panel>
  );
}
