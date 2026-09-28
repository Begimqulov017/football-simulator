import React, { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';
import { fetchWorld } from '../utils/careerApi';

const TABS = ['Bombardirlar', 'Assistchilar', 'Kartochkalar', 'Reyting'];

// 11-BOSQICH: bu sahifa endi player.career.topScorers (mahalliy, hech qachon
// yangilanmaydigan) o'rniga /api/world/:leagueId orqali HAQIQIY, umumiy
// dunyodagi bombardirlar ro'yxatini ko'rsatadi.
export default function TopScorersPage() {
  const { player } = useGame();
  const [tab, setTab] = useState(0);
  const [world, setWorld] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!player?.club?.leagueId) return;
    let alive = true;
    fetchWorld(player.club.leagueId).then((res) => {
      if (!alive) return;
      setWorld(res.world);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [player?.club?.leagueId]);

  if (!player) return null;

  const scorers = Object.values(world?.topScorers || {}).sort((a, b) => b.goals - a.goals).slice(0, 15);

  return (
    <AppShell>
      <div className="page-header"><h1>Top</h1></div>
      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {TABS.map((t, i) => (
            <button
              key={t}
              className="btn"
              onClick={() => setTab(i)}
              style={tab === i ? { background: 'var(--glass-fill-strong)' } : undefined}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="sub" style={{ padding: 12 }}>Yuklanmoqda...</div>
      ) : tab === 0 ? (
        <div className="card">
          <div className="card-title">BOMBARDIRLAR - {player.club.leagueName}</div>
          {scorers.length === 0 && <div className="sub" style={{ padding: 12 }}>Hali gol urilmagan.</div>}
          {scorers.map((s, i) => (
            <div
              key={s.id}
              className="list-row"
              style={s.id === player.id ? { color: 'var(--accent-gold)', fontWeight: 600 } : undefined}
            >
              <span>{i + 1}. {s.name}{s.id === player.id ? ' (Siz)' : ''} <span className="sub" style={{ fontSize: 12 }}>· {s.teamName}</span></span>
              <span className="badge badge-gold">{s.goals}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="sub" style={{ padding: 12 }}>
            {TABS[tab]} reytingi hali kuzatilmayapti - tez orada qo'shiladi.
          </div>
        </div>
      )}
    </AppShell>
  );
}
