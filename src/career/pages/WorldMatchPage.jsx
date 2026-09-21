import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';
import { fetchPendingMatchDetail, submitMatchResult } from '../utils/careerApi';
import LiveMatch from '../../components/LiveMatch';

// 4-BAND: bu sahifa umumiy dunyodagi foydalanuvchining O'Z o'yinini
// avvalgi "server darhol hal qiladi, statistikani taxmin qiladi" usuli
// o'rniga HAQIQIY quick-play dvijogi (LiveMatch, Match Simulator/Turnirda
// ishlatiladigan AYNAN shu dvijok) orqali o'ynatadi. Server bergan `seed`
// bilan boshlangani uchun natija haqiqiy statistikaga (OVR/pozitsiya)
// asoslangan - "userning o'zi uchun bo'lganday" emas, umumiy qoidalar bilan.
export default function WorldMatchPage() {
  const { player, refreshPendingWorldMatch, updatePlayer } = useGame();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPendingMatchDetail().then((d) => {
      if (cancelled) return;
      if (!d) {
        // Boshqa qurilma/vaqt oynasida allaqachon o'ynalgan yoki avtomatik
        // hal qilingan bo'lishi mumkin - shunchaki uy sahifasiga qaytamiz.
        navigate('/home', { replace: true });
        return;
      }
      setDetail(d);
    }).catch(() => { if (!cancelled) setError("O'yin ma'lumotini yuklab bo'lmadi."); });
    return () => { cancelled = true; };
  }, [navigate]);

  // Insonning o'z o'yinchisini (career player) LiveMatch tushunadigan
  // squad-a'zosi shakliga o'tkazadi - engine.js FAQAT id/name/pos/ovr/stamina
  // maydonlariga qaraydi (mainStats'ga tegmaydi), shuning uchun shu
  // to'rttasi kifoya.
  const myEntry = useMemo(() => (player ? {
    id: player.id, name: `${player.name} ${player.surname}`,
    pos: player.position, ovr: player.overall, stamina: 100, isHuman: true,
  } : null), [player]);

  const handleFinish = useCallback(async (result) => {
    if (!detail || !myEntry || submitting) return;
    setSubmitting(true);
    const myEvents = result.playerEventsMap?.[myEntry.id] || { goals: 0, assists: 0, injured: false };
    const myRating = result.playerRatings?.[myEntry.id];
    const myGoals = myEvents.goals || 0;
    const myAssists = myEvents.assists || 0;
    const myInjured = !!myEvents.injured;
    const myInjuryDays = myInjured ? Math.floor(Math.random() * 10) + 3 : 0;
    // 7-BAND: kubokda durang bo'lishi mumkin emas. `shootoutOnDraw` (3-band)
    // yoqilgan bo'lsa, LiveMatch durang holatda penalti seriyasini JONLI
    // ko'rsatadi va natijada `penWinner` ('a'=uy, 'b'=mehmon) keladi - shu
    // g'olib klub ID'sini serverga yuboramiz, aks holda server hisobni
    // (90-daqiqalik, hali ham teng) taqqoslab, ADOLATSIZ ravishda uy
    // jamoasini g'olib deb belgilagan bo'lardi.
    const penWinnerClubId = result.penWinner
      ? (result.penWinner === 'a' ? detail.home.id : detail.away.id)
      : null;
    try {
      await submitMatchResult({
        leagueId: detail.leagueId,
        round: detail.round,
        scoreA: result.scoreA,
        scoreB: result.scoreB,
        myGoals, myAssists,
        myRating: typeof myRating === 'number' ? myRating : null,
        myMinutes: 90,
        myInjured,
        myInjuryDays,
        penWinnerClubId,
      });
      // Server allaqachon shu qiymatlarni yozib qo'ydi - lokal holatni ham
      // BIR XIL o'sish (increment) bilan yangilaymiz, aks holda foydalanuvchi
      // keyingi to'liq yuklashgacha (yoki 20s pollinggacha) eski
      // sonlarni ko'rib turaverardi.
      updatePlayer((prev) => ({
        career: {
          ...prev.career,
          appearances: (prev.career.appearances || 0) + 1,
          goals: (prev.career.goals || 0) + myGoals,
          assists: (prev.career.assists || 0) + myAssists,
          matchRatings: [...(prev.career.matchRatings || []), typeof myRating === 'number' ? myRating : 6.0].slice(-10),
          injury: myInjured ? { daysLeft: myInjuryDays, description: 'Match injury' } : prev.career.injury,
        },
      }));
    } finally {
      await refreshPendingWorldMatch();
      navigate('/home', { replace: true });
    }
  }, [detail, myEntry, submitting, refreshPendingWorldMatch, updatePlayer, navigate]);

  const handleExit = useCallback(() => {
    // O'yin hali "pending" holatida qoladi - foydalanuvchi keyinroq qaytib
    // o'ynashi mumkin, hech narsa yo'qolmaydi.
    navigate('/home', { replace: true });
  }, [navigate]);

  if (error) {
    return (
      <AppShell>
        <div className="card" style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ marginBottom: 12 }}>{error}</div>
          <button className="btn" onClick={() => navigate('/home', { replace: true })}>← Uy sahifasiga qaytish</button>
        </div>
      </AppShell>
    );
  }

  if (!detail || !myEntry) {
    return (
      <AppShell>
        <div className="sub" style={{ padding: 12 }}>Yuklanmoqda...</div>
      </AppShell>
    );
  }

  // Insonning o'zini mos klubning world squadiga qo'shamiz - selectBestXI/
  // pickAutoFormation (formations.js) OVR bo'yicha eng kuchli 11 nafarni
  // avtomatik tanlaydi, shuning uchun bu shunchaki "havza"ga qo'shish.
  const teamA = {
    id: detail.home.id, name: detail.home.name, logo: detail.home.logo,
    squad: detail.isHome ? [...detail.home.squad, myEntry] : detail.home.squad,
  };
  const teamB = {
    id: detail.away.id, name: detail.away.name, logo: detail.away.logo,
    squad: !detail.isHome ? [...detail.away.squad, myEntry] : detail.away.squad,
  };

  return (
    <LiveMatch
      teamA={teamA}
      teamB={teamB}
      seed={detail.seed}
      shootoutOnDraw={detail.competition === 'cup'}
      onFinish={handleFinish}
      onExit={handleExit}
    />
  );
}
