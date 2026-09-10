import React, { useState } from 'react';

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

export default function CreateClubForm({ customTeams, onCreate, onDelete }) {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('⚽');

  const canCreate = name.trim().length > 1;

  const handleSubmit = () => {
    if (!canCreate) return;
    const id = `custom_${slug(name)}_${Date.now().toString(36).slice(-4)}`;
    onCreate({ id, name: name.trim(), logo: logo.trim() || '⚽', squad: [] });
    setName('');
  };

  return (
    <div>
      <div className="squad-header" style={{ marginBottom: '6px' }}>Klub nomi</div>
      <input className="search-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: FC Do'stlik" />

      <div className="squad-header" style={{ marginTop: '14px', marginBottom: '6px' }}>Logotip (emoji)</div>
      <input className="search-input" value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="⚽ 🦁 🐺 ⭐ va h.k." maxLength={4} />

      <button className="action-btn" disabled={!canCreate} onClick={handleSubmit} style={{ marginTop: '16px' }}>
        🏟️ Klubni Yaratish
      </button>

      <div className="format-hint" style={{ marginTop: '10px' }}>
        Yangi klub bo'sh tarkib bilan yaratiladi — "O'yinchi" bo'limida yangi futbolchi yarating yoki "Transferlar"
        orqali boshqa klublardan o'yinchi ko'chiring (kamida 11 nafar bo'lishi kerak).
      </div>

      {customTeams.length > 0 && (
        <>
          <div className="squad-header" style={{ marginTop: '20px', marginBottom: '8px' }}>
            Mavjud custom klublar ({customTeams.length})
          </div>
          <div className="tournament-list">
            {customTeams.map((t) => (
              <div key={t.id} className="tournament-list-item" style={{ cursor: 'default' }}>
                <div>
                  <div className="tournament-item-name">{t.logo} {t.name}</div>
                  <div className="tournament-item-meta">{t.squad.length} nafar o'yinchi</div>
                </div>
                <button className="danger-btn" onClick={() => onDelete(t.id)}>🗑</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
