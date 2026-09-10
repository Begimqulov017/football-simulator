import React, { useState, useMemo } from 'react';
import { getRatingTier, RATING_TIER_CLASSES, RATING_TIER_LABELS } from '../utils/ratingTier';

export default function TransferMarket({ teams, onTransfer }) {
  const [fromTeamId, setFromTeamId] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [toTeamId, setToTeamId] = useState('');

  const sortedTeams = useMemo(() => [...teams].sort((a, b) => a.name.localeCompare(b.name)), [teams]);
  const fromTeam = teams.find((t) => t.id === fromTeamId);
  const player = fromTeam?.squad.find((p) => p.id === playerId);

  const canTransfer = fromTeamId && playerId && toTeamId && toTeamId !== fromTeamId;

  const handleSubmit = () => {
    if (!canTransfer) return;
    onTransfer(playerId, fromTeamId, toTeamId);
    setPlayerId('');
  };

  return (
    <div>
      <div className="squad-header" style={{ marginBottom: '6px' }}>1. Qaysi klubdan?</div>
      <select
        className="search-input"
        value={fromTeamId}
        onChange={(e) => { setFromTeamId(e.target.value); setPlayerId(''); }}
      >
        <option value="">— Klubni tanlang —</option>
        {sortedTeams.map((t) => (
          <option key={t.id} value={t.id}>{t.logo} {t.name}</option>
        ))}
      </select>

      {fromTeam && (
        <>
          <div className="squad-header" style={{ marginTop: '14px', marginBottom: '6px' }}>2. Qaysi o'yinchi?</div>
          <select className="search-input" value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
            <option value="">— O'yinchini tanlang —</option>
            {[...fromTeam.squad].sort((a, b) => a.name.localeCompare(b.name)).map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.pos}, OVR {p.ovr})</option>
            ))}
          </select>
        </>
      )}

      {player && (
        <>
          <div className="squad-header" style={{ marginTop: '14px', marginBottom: '6px' }}>3. Qaysi klubga?</div>
          <select className="search-input" value={toTeamId} onChange={(e) => setToTeamId(e.target.value)}>
            <option value="">— Yangi klubni tanlang —</option>
            {sortedTeams.filter((t) => t.id !== fromTeamId).map((t) => (
              <option key={t.id} value={t.id}>{t.logo} {t.name}</option>
            ))}
          </select>
        </>
      )}

      {player && toTeamId && (
        <div className="mt-4 flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-900/80 backdrop-blur-md p-4">
          <span
            className={`flex flex-col items-center justify-center w-16 h-20 rounded-lg border-2 font-black shadow-lg shrink-0 ${RATING_TIER_CLASSES[getRatingTier(player.ovr)]}`}
          >
            <span className="text-xl leading-none">{player.ovr}</span>
            <span className="text-[10px] uppercase tracking-wide mt-1">{player.pos}</span>
          </span>
          <div className="text-left text-sm">
            <div className="font-bold text-slate-50">{player.name}</div>
            <div className="text-xs text-amber-300 font-semibold mt-0.5">{RATING_TIER_LABELS[getRatingTier(player.ovr)]} daraja</div>
            <div className="text-slate-400 text-xs mt-1">
              {fromTeam.logo} {fromTeam.name} ➡ {teams.find((t) => t.id === toTeamId)?.logo} {teams.find((t) => t.id === toTeamId)?.name}
            </div>
          </div>
        </div>
      )}

      <button className="action-btn" disabled={!canTransfer} onClick={handleSubmit} style={{ marginTop: '14px' }}>
        🔁 Transferni Amalga Oshirish
      </button>

      <div className="format-hint" style={{ marginTop: '10px' }}>
        Eslatma: transferlar faqat shu brauzerda saqlanadi. O'yinchining bali/statistikasi o'zgarmaydi — faqat klubi almashadi.
      </div>
    </div>
  );
}
