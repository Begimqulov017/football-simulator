import React, { useState, useMemo } from 'react';
import {
  getAllCustomizedTeams, transferPlayer, addPlayerToTeam, saveCustomTeam, deleteCustomTeam,
  loadCustomTeams, isCustomizationEnabled, setCustomizationEnabled,
} from '../utils/customization';
import TransferMarket from '../components/TransferMarket';
import CreatePlayerForm from '../components/CreatePlayerForm';
import CreateClubForm from '../components/CreateClubForm';

export default function Customization({ builtInTeams }) {
  const [tab, setTab] = useState('transfers'); // 'transfers' | 'create-player' | 'create-club'
  const [refreshKey, setRefreshKey] = useState(0);
  const [enabled, setEnabled] = useState(() => isCustomizationEnabled());

  // Bu sahifaning o'zi HAR DOIM to'liq tahrirlangan holatni ko'rsatadi —
  // global toggle faqat o'yin/turnir simulyatsiyasiga ta'sir qiladi.
  const effectiveTeams = useMemo(() => getAllCustomizedTeams(builtInTeams), [builtInTeams, refreshKey]);
  const customTeamIds = useMemo(() => new Set(loadCustomTeams().map((t) => t.id)), [refreshKey]);

  const forceRefresh = () => setRefreshKey((k) => k + 1);

  const handleToggleEnabled = () => {
    const next = !enabled;
    setCustomizationEnabled(next);
    setEnabled(next);
  };

  const handleTransfer = (playerId, fromTeamId, toTeamId) => {
    const byId = {};
    effectiveTeams.forEach((t) => { byId[t.id] = t; });
    transferPlayer(playerId, fromTeamId, toTeamId, byId);
    forceRefresh();
  };

  const handleCreatePlayer = (teamId, player) => {
    addPlayerToTeam(teamId, player);
    forceRefresh();
  };

  const handleCreateClub = (club) => {
    saveCustomTeam(club);
    forceRefresh();
  };

  const handleDeleteClub = (teamId) => {
    deleteCustomTeam(teamId);
    forceRefresh();
  };

  return (
    <div className="card">
      <div className="column-title title-a" style={{ marginBottom: '12px' }}>🛠️ Customization</div>

      <div className="flex items-center justify-between gap-3 mb-4 p-3 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700">
        <div>
          <div className="text-sm font-bold text-slate-50">
            Customization ta'sirini {enabled ? 'yoqilgan' : 'o\'chirilgan'}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {enabled
              ? "Barcha transfer, yangi o'yinchi va klublaringiz simulyatsiyada qo'llanadi."
              : "O'yin original (built-in) tarkiblar bilan davom etadi. Ma'lumotlaringiz saqlangan, faqat ishlatilmayapti."}
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={handleToggleEnabled}
          className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 ${
            enabled ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-slate-700'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
              enabled ? 'translate-x-8' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="match-tabs" style={{ marginBottom: '14px' }}>
        <button className={`match-tab-btn ${tab === 'transfers' ? 'active' : ''}`} onClick={() => setTab('transfers')}>🔁 Transferlar</button>
        <button className={`match-tab-btn ${tab === 'create-player' ? 'active' : ''}`} onClick={() => setTab('create-player')}>➕ O'yinchi</button>
        <button className={`match-tab-btn ${tab === 'create-club' ? 'active' : ''}`} onClick={() => setTab('create-club')}>🏟️ Klub</button>
      </div>

      {tab === 'transfers' && (
        <TransferMarket teams={effectiveTeams} onTransfer={handleTransfer} />
      )}

      {tab === 'create-player' && (
        <CreatePlayerForm teams={effectiveTeams} onCreate={handleCreatePlayer} />
      )}

      {tab === 'create-club' && (
        <CreateClubForm
          customTeams={effectiveTeams.filter((t) => customTeamIds.has(t.id))}
          onCreate={handleCreateClub}
          onDelete={handleDeleteClub}
        />
      )}
    </div>
  );
}
