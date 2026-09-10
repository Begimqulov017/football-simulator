import React, { useState, useMemo } from 'react';
import { getRatingTier, RATING_TIER_CLASSES, RATING_TIER_LABELS } from '../utils/ratingTier';

const OUTFIELD_POSITIONS = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF', 'SS'];

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

export default function CreatePlayerForm({ teams, onCreate }) {
  const [name, setName] = useState('');
  const [pos, setPos] = useState('ST');
  const [ovr, setOvr] = useState(75);
  const [teamId, setTeamId] = useState('');
  const isGK = pos === 'GK';

  const [statVals, setStatVals] = useState({
    pac: 70, sho: 70, pas: 70, dri: 70, def: 70, phy: 70,
    div: 70, han: 70, kic: 70, ref: 70, spd: 40, gkpos: 70,
  });

  const sortedTeams = useMemo(() => [...teams].sort((a, b) => a.name.localeCompare(b.name)), [teams]);

  const setStat = (key, val) => setStatVals((prev) => ({ ...prev, [key]: Math.max(1, Math.min(99, Number(val) || 0)) }));

  const canCreate = name.trim().length > 1 && teamId;

  const handleSubmit = () => {
    if (!canCreate) return;
    const id = `${slug(name)}_${Date.now().toString(36).slice(-4)}`;
    const stats = isGK
      ? { div: statVals.div, han: statVals.han, kic: statVals.kic, ref: statVals.ref, spd: statVals.spd, pos: statVals.gkpos }
      : { pac: statVals.pac, sho: statVals.sho, pas: statVals.pas, dri: statVals.dri, def: statVals.def, phy: statVals.phy };
    onCreate(teamId, { id, name: name.trim(), pos, ovr: Math.round(ovr), stats });
    setName('');
  };

  return (
    <div>
      <div className="squad-header" style={{ marginBottom: '6px' }}>Ism-familiya</div>
      <input className="search-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: Aziz Karimov" />

      <div className="squad-header" style={{ marginTop: '14px', marginBottom: '6px' }}>Pozitsiya</div>
      <select className="search-input" value={pos} onChange={(e) => setPos(e.target.value)}>
        {OUTFIELD_POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>

      <div className="squad-header" style={{ marginTop: '14px', marginBottom: '6px' }}>Umumiy reyting (OVR): {ovr}</div>
      <input type="range" min={50} max={95} value={ovr} onChange={(e) => setOvr(+e.target.value)} className="ovr-slider" />

      <div className="mt-3 mb-2 flex items-center gap-3">
        <span
          className={`flex flex-col items-center justify-center w-16 h-20 rounded-lg border-2 font-black shadow-lg shrink-0 ${RATING_TIER_CLASSES[getRatingTier(ovr)]}`}
        >
          <span className="text-xl leading-none">{ovr}</span>
          <span className="text-[10px] uppercase tracking-wide mt-1">{pos}</span>
        </span>
        <div className="text-left">
          <div className="text-slate-50 text-sm font-bold">{name.trim() || "Yangi o'yinchi"}</div>
          <div className="text-amber-300 text-xs font-semibold mt-0.5">{RATING_TIER_LABELS[getRatingTier(ovr)]} daraja</div>
        </div>
      </div>

      <div className="squad-header" style={{ marginTop: '14px', marginBottom: '6px' }}>Statistikalar</div>
      <div className="stat-grid">
        {isGK ? (
          <>
            <StatField label="Diving (div)" value={statVals.div} onChange={(v) => setStat('div', v)} />
            <StatField label="Handling (han)" value={statVals.han} onChange={(v) => setStat('han', v)} />
            <StatField label="Kicking (kic)" value={statVals.kic} onChange={(v) => setStat('kic', v)} />
            <StatField label="Reflexes (ref)" value={statVals.ref} onChange={(v) => setStat('ref', v)} />
            <StatField label="Tezlik (spd)" value={statVals.spd} onChange={(v) => setStat('spd', v)} />
            <StatField label="Positioning (pos)" value={statVals.gkpos} onChange={(v) => setStat('gkpos', v)} />
          </>
        ) : (
          <>
            <StatField label="Tezlik (pac)" value={statVals.pac} onChange={(v) => setStat('pac', v)} />
            <StatField label="Zarba (sho)" value={statVals.sho} onChange={(v) => setStat('sho', v)} />
            <StatField label="Pas (pas)" value={statVals.pas} onChange={(v) => setStat('pas', v)} />
            <StatField label="Dribbling (dri)" value={statVals.dri} onChange={(v) => setStat('dri', v)} />
            <StatField label="Himoya (def)" value={statVals.def} onChange={(v) => setStat('def', v)} />
            <StatField label="Jismoniy (phy)" value={statVals.phy} onChange={(v) => setStat('phy', v)} />
          </>
        )}
      </div>

      <div className="squad-header" style={{ marginTop: '14px', marginBottom: '6px' }}>Qaysi klubga qo'shiladi?</div>
      <select className="search-input" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
        <option value="">— Klubni tanlang —</option>
        {sortedTeams.map((t) => <option key={t.id} value={t.id}>{t.logo} {t.name}</option>)}
      </select>

      <button className="action-btn" disabled={!canCreate} onClick={handleSubmit} style={{ marginTop: '16px' }}>
        ➕ O'yinchini Yaratish
      </button>
    </div>
  );
}

function StatField({ label, value, onChange }) {
  return (
    <div className="stat-field">
      <span>{label}</span>
      <input type="number" min={1} max={99} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
