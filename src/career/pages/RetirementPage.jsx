import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const LEGACY_KEY = 'footballSimulator.legacyCareer';

// 8-BAND: majburiy pensiya bosqichi. `player.career.retired` true
// bo'lganda RequirePlayer foydalanuvchini shu sahifaga yuboradi (boshqa
// hech qanday sahifa - HomePage, Training va h.k. - ochilmaydi, chunki
// karyera "muzlatilgan"). Bu yerda: yakuniy statistikasi ko'rsatiladi,
// va "<Familiya> Jr." sifatida yangi karyera boshlash taklif qilinadi -
// pul (retirementLegacy.money) merosga o'tadi.
export default function RetirementPage() {
  const { player, resetSave } = useGame();
  const navigate = useNavigate();

  const career = player?.career || {};
  const legacy = career.retirementLegacy || { money: 0, surname: player?.surname, retiredAge: player?.age };
  const trophies = career.trophies || [];
  const ratings = career.matchRatings || [];
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2) : '—';

  const startLegacyCareer = () => {
    try {
      sessionStorage.setItem(LEGACY_KEY, JSON.stringify({
        surname: legacy.surname, money: legacy.money, retiredAge: legacy.retiredAge,
      }));
    } catch (e) { /* sessionStorage unavailable - Jr. career just starts with default money */ }
    resetSave();
    navigate('/start', { replace: true });
  };

  return (
    <div className="start-shell">
      <div className="card start-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
        <h1>Retirement</h1>
        <p className="tagline">
          At {legacy.retiredAge}, {player?.name} {player?.surname} has hung up the boots.
        </p>

        <div className="grid grid-3" style={{ margin: '20px 0', gap: 12 }}>
          <div className="field" style={{ textAlign: 'center' }}>
            <label>Appearances</label>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{career.appearances || 0}</div>
          </div>
          <div className="field" style={{ textAlign: 'center' }}>
            <label>Goals</label>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{career.goals || 0}</div>
          </div>
          <div className="field" style={{ textAlign: 'center' }}>
            <label>Assists</label>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{career.assists || 0}</div>
          </div>
          <div className="field" style={{ textAlign: 'center' }}>
            <label>Avg. Rating</label>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{avgRating}</div>
          </div>
          <div className="field" style={{ textAlign: 'center' }}>
            <label>Trophies</label>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{trophies.length}</div>
          </div>
          <div className="field" style={{ textAlign: 'center' }}>
            <label>Final Wealth</label>
            <div style={{ fontSize: 22, fontWeight: 700 }}>${(legacy.money || 0).toLocaleString()}</div>
          </div>
        </div>

        <p className="tagline" style={{ marginBottom: 16 }}>
          The family name continues - start again as {legacy.surname} Jr., inheriting everything earned this career.
        </p>
        <button className="next-day-btn" onClick={startLegacyCareer}>
          ▶ Start as {legacy.surname} Jr.
        </button>
      </div>
    </div>
  );
}
