import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { fetchWorld } from '../utils/careerApi';
import { INITIAL_TEAMS } from '../../data/teamsData';
import LiveMatch from '../../components/LiveMatch';

// 5-BAND: o'tgan o'yinni AYNAN shu (server bergan) seed va o'sha paytdagi
// tarkib (world.squads + m.humanEntries) bilan qayta o'ynatadi - shuning
// uchun natija HAR DOIM asl yozilgan hisob bilan bir xil chiqadi (bu
// "qayta tomosha", yangi natija emas - shuning uchun oxirida hech narsa
// serverga yozilmaydi).
//
// BILIB QO'YILGAN CHEKLOV: agar shu ligada mavsum almashgan bo'lsa (squadlar
// qarigan/yangilangan), joriy `world.squads` endi o'sha paytdagi tarkibdan
// FARQLI bo'lishi mumkin - bu holda qayta tomosha aniq bo'lmasligi mumkin.
// Bu joriy mavsum ichidagi o'yinlar uchun muammo emas (squadlar mavsum
// davomida o'zgarmaydi).
export default function MatchReplayPage() {
  const { leagueId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const match = location.state?.match;
  const [squads, setSquads] = useState(null);

  useEffect(() => {
    if (!match) return;
    let cancelled = false;
    fetchWorld(leagueId, { includeSquads: true }).then((res) => {
      if (cancelled || !res.ok) return;
      setSquads(res.world.squads);
    });
    return () => { cancelled = true; };
  }, [leagueId, match]);

  if (!match) {
    // To'g'ridan-to'g'ri havola/refresh orqali kelingan - kerakli tafsilot
    // yo'q, liganing o'zi sahifasiga qaytaramiz.
    navigate(`/leagues/${leagueId}`, { replace: true });
    return null;
  }

  if (!squads) return null;

  const homeTeamStatic = INITIAL_TEAMS.find((t) => t.id === match.home);
  const awayTeamStatic = INITIAL_TEAMS.find((t) => t.id === match.away);
  const homeHuman = (match.humanEntries || []).filter((h) => h.side === 'home');
  const awayHuman = (match.humanEntries || []).filter((h) => h.side === 'away');

  const teamA = {
    id: match.home, name: homeTeamStatic?.name || match.home, logo: homeTeamStatic?.logo,
    squad: [...(squads[match.home] || []), ...homeHuman.map((h) => ({ ...h, stamina: 100 }))],
  };
  const teamB = {
    id: match.away, name: awayTeamStatic?.name || match.away, logo: awayTeamStatic?.logo,
    squad: [...(squads[match.away] || []), ...awayHuman.map((h) => ({ ...h, stamina: 100 }))],
  };

  return (
    <LiveMatch
      teamA={teamA}
      teamB={teamB}
      seed={match.seed}
      onFinish={() => {}}
      onExit={() => navigate(`/leagues/${leagueId}`, { replace: true })}
    />
  );
}
