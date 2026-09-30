import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAwards } from '../utils/careerApi';

const SEEN_KEY = (playerId) => `fs_awards_seen_${playerId}`;

// Home'da: yangi mavsum mukofotlari e'lon qilingan bo'lsa (hali ko'rilmagan) banner chiqadi.
export default function AwardsBanner({ player }) {
  const navigate = useNavigate();
  const [latest, setLatest] = useState(null);
  useEffect(() => {
    let alive = true;
    fetchAwards(player.club.leagueId).then((r) => {
      if (!alive || !r.ok || !r.awards?.length) return;
      let seen = 0;
      try { seen = Number(localStorage.getItem(SEEN_KEY(player.id)) || 0); } catch (e) { /* e'tiborsiz */ }
      if (r.awards[0].season > seen) setLatest(r.awards[0]);
    }).catch(() => {});
    return () => { alive = false; };
  }, [player.id, player.club.leagueId]);

  if (!latest) return null;
  const won = (player.career.awards || []).filter((a) => a.season === latest.season);
  return (
    <button
      type="button"
      onClick={() => navigate('/awards')}
      className="motion-safe:animate-fs-fade-up w-full text-left cursor-pointer font-sans rounded-card border border-amber-200 bg-gradient-to-r from-amber-50 to-white px-5 py-4 flex items-center justify-between gap-3 mb-4 shadow-soft"
    >
      <span className="flex items-center gap-3">
        <span className="text-3xl">🏆</span>
        <span>
          <span className="block text-sm font-extrabold text-amber-900">{latest.season}-mavsum mukofotlari e'lon qilindi!</span>
          <span className="block text-xs text-amber-800">{won.length ? `Siz ${won.length} ta mukofot yutdingiz — marosimni ko'ring` : "Oltin to'p, Oltin batinka va mavsum tarkibi"}</span>
        </span>
      </span>
      <span className="text-xs font-extrabold text-amber-800 whitespace-nowrap">Ko'rish →</span>
    </button>
  );
}
