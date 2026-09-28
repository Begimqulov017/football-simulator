import React from 'react';
import { Navigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

// 11-BOSQICH: bu sahifa ilgari player.career.standings/schedule (mahalliy,
// serverning haqiqiy umumiy dunyosidan mustaqil, hech qachon yangilanmaydigan
// nusxa) asosida ishlardi. Endi o'z liganizni ko'rish bilan BOSHQA istalgan
// ligani ko'rish AYNAN BIR XIL, haqiqiy (server) ma'lumotdan foydalanadi -
// shuning uchun bu yerda alohida kod yozish o'rniga to'g'ridan-to'g'ri
// LeagueBrowsePage'ga (o'z ligangiz bilan) yo'naltiramiz.
export default function LeaguePage() {
  const { player } = useGame();
  if (!player) return null;
  return <Navigate to={`/leagues/${player.club.leagueId}`} replace />;
}
