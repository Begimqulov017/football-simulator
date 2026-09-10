import React, { useState, useEffect } from 'react';
import { initializeTournament, FORMAT_INFO } from '../utils/tournamentEngine';
import TournamentCreate from '../components/TournamentCreate';
import TournamentView from '../components/TournamentView';

const STORAGE_KEY = 'match_simulator_tournaments';

function loadTournaments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTournaments(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // saqlashda xatolik bo'lsa e'tiborsiz qoldiramiz — o'yin baribir davom etadi
  }
}

export default function Tournament({ teams }) {
  const [tournaments, setTournaments] = useState([]);
  const [view, setView] = useState('hub'); // 'hub' | 'create' | 'view'
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    setTournaments(loadTournaments());
  }, []);

  const persist = (list) => {
    setTournaments(list);
    saveTournaments(list);
  };

  const handleCreate = (config) => {
    const t = initializeTournament(config);
    const next = [t, ...tournaments];
    persist(next);
    setActiveId(t.id);
    setView('view');
  };

  const handleUpdate = (updatedT) => {
    const next = tournaments.map((t) => (t.id === updatedT.id ? updatedT : t));
    persist(next);
  };

  const handleDelete = (id) => {
    const next = tournaments.filter((t) => t.id !== id);
    persist(next);
    setView('hub');
    setActiveId(null);
  };

  const activeTournament = tournaments.find((t) => t.id === activeId);

  if (view === 'create') {
    return <TournamentCreate teams={teams} onCreate={handleCreate} onCancel={() => setView('hub')} />;
  }

  if (view === 'view' && activeTournament) {
    return (
      <TournamentView
        tournament={activeTournament}
        teams={teams}
        onUpdate={handleUpdate}
        onBack={() => setView('hub')}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div className="card">
      <div className="column-title title-a" style={{ marginBottom: '14px' }}>🏆 Turnirlar</div>

      <button className="action-btn" onClick={() => setView('create')} style={{ marginBottom: '18px' }}>
        ➕ Yangi Turnir Yaratish
      </button>

      <div className="squad-header" style={{ marginBottom: '10px' }}>📂 Mening Turnirlarim ({tournaments.length})</div>

      {tournaments.length === 0 && (
        <div className="no-results">Hali turnir yaratilmagan. Yuqoridagi tugmani bosing!</div>
      )}

      <div className="tournament-list">
        {tournaments.map((t) => (
          <button
            key={t.id}
            className="tournament-list-item"
            onClick={() => { setActiveId(t.id); setView('view'); }}
          >
            <div>
              <div className="tournament-item-name">{t.name}</div>
              <div className="tournament-item-meta">
                {FORMAT_INFO[t.format]?.label} • {t.teamIds.length} jamoa • {t.status === 'completed' ? '✅ Tugagan' : '🔴 Davom etmoqda'}
              </div>
            </div>
            <span className="rating-badge">{t.status === 'completed' ? '🏆' : '▶'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
