import React from 'react';
import { Navigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

// 11-BOSQICH: bu sahifa ilgari mahalliy (endi muzlab qolgan) jadvalga
// asoslangan edi va "Play" tugmasi endi ishlamaydigan /play-match'ga olib
// borardi. O'yinchining barcha o'yinlari (o'tgan/kelayotgan) allaqachon
// LeagueBrowsePage'da (haqiqiy server ma'lumoti bilan, kubok bilan birga)
// to'liq ko'rinadi - shuning uchun shunchaki o'sha yerga yo'naltiramiz.
export default function GamesPage() {
  const { player } = useGame();
  if (!player) return null;
  return <Navigate to={`/leagues/${player.club.leagueId}`} replace />;
}
