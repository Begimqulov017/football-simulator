import React from 'react';
import { NATIONALITIES } from '../../../data/leaguesData';
import { Button } from '../../../components/ui';
import Field, { inputCls } from '../components/Field';
import PlayerCard from '../components/PlayerCard';
import { MONTHS, POSITIONS, BIRTH_YEAR, daysInMonth } from '../onboardingUtils';

export default function CreateStep({ form, setForm, legacy, onNext }) {
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const maxDay = daysInMonth(Number(form.birthMonth));
  const valid =
    form.name.trim() && form.surname.trim() && form.number !== '' &&
    Number(form.number) >= 1 && Number(form.number) <= 99 &&
    form.position && form.nationality && form.birthMonth && form.birthDay;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
      <div className="bg-surface-card border border-surface-line rounded-card shadow-soft p-5 sm:p-7 flex flex-col gap-5">
        <div>
          <div className="text-2xl font-black tracking-tight text-ink">O'yinchi yaratish</div>
          <p className="mt-1 text-sm text-ink-muted">Karyerangiz boshlanishi uchun ma'lumotlarni to'ldiring.</p>
        </div>

        {legacy && (
          <div className="rounded-control bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold px-3 py-2">
            🏆 Oilaviy meros: {legacy.surname} ({legacy.retiredAge} yoshda nafaqaga chiqqan) qoldirgan ${legacy.money.toLocaleString()} sizga o'tadi.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Ism (Name)">
            <input className={inputCls} value={form.name} onChange={set('name')} placeholder="masalan, Alisher" maxLength={20} />
          </Field>
          <Field label="Familiya (Surname)">
            <input className={inputCls} value={form.surname} onChange={set('surname')} placeholder="masalan, Nomozov" maxLength={24} />
          </Field>
          <Field label="Nickname" hint="Formaning orqasiga shu yoziladi">
            <input className={`${inputCls} uppercase`} value={form.nickname} onChange={set('nickname')} placeholder="NOMOZOV" maxLength={14} />
          </Field>
          <Field label="Forma raqami" hint="1 dan 99 gacha">
            <input className={inputCls} type="number" min="1" max="99" value={form.number} onChange={set('number')} placeholder="9" />
          </Field>
        </div>

        <div>
          <div className="text-xs font-bold text-ink-soft mb-1.5">Tug'ilgan kun</div>
          <div className="grid grid-cols-3 gap-3">
            <select
              className={inputCls}
              value={form.birthMonth}
              onChange={(e) => {
                const m = Number(e.target.value);
                setForm((f) => ({ ...f, birthMonth: m, birthDay: Math.min(Number(f.birthDay), daysInMonth(m)) }));
              }}
            >
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select className={inputCls} value={form.birthDay} onChange={(e) => setForm((f) => ({ ...f, birthDay: Number(e.target.value) }))}>
              {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <input className={inputCls} value={BIRTH_YEAR} disabled aria-label="Yil" />
          </div>
          <div className="text-[11px] text-ink-muted mt-1.5">Yil avtomatik {BIRTH_YEAR} qilib belgilanadi — faqat oy va kunni tanlang.</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Pozitsiya">
            <select className={inputCls} value={form.position} onChange={set('position')}>
              <option value="" disabled>Tanlang</option>
              {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Millat" hint="Birinchi klub taklifiga ta'sir qiladi">
            <select className={inputCls} value={form.nationality} onChange={set('nationality')}>
              <option value="" disabled>Tanlang</option>
              {NATIONALITIES.map((n) => <option key={n.name} value={n.name}>{n.flag} {n.name}</option>)}
            </select>
          </Field>
        </div>

        <Button variant="primary" size="lg" disabled={!valid} onClick={onNext} className="w-full">
          Keyingisi: klub tanlash →
        </Button>
      </div>

      <div className="lg:sticky lg:top-6">
        <PlayerCard player={form} club={null} rating={null} potential={null} />
      </div>
    </div>
  );
}
