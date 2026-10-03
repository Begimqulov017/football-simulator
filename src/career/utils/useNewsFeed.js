// ---------------------------------------------------------------------------
// useNewsFeed - Home banner va News sahifasi uchun yagona manba.
//  - feed:      barcha yangiliklar (yangisi birinchi)
//  - featured:  oxirgi FEATURE_DAYS o'yin kuni ichidagi yangiliklar (priority bo'yicha)
//  - Serverdan kelgan mukofotlar (Ballon d'Or, Golden Boot, Team of the
//    Season/Year) ham shu yerda bir marta career.newsFeed ga yoziladi.
// ---------------------------------------------------------------------------
import { useEffect, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { fetchAwards } from './careerApi';
import { appendNews, buildAwardsNews, FEATURE_DAYS } from './newsGenerator';

const ARCHIVE_DAY = -9999; // featured bo'lmaydigan (arxiv) yangiliklar uchun

export function isFeatured(item, currentDay) {
  if (item.day == null) return false;
  const age = currentDay - item.day;
  return age >= 0 && age <= FEATURE_DAYS;
}

export function useNewsFeed(player) {
  const { updatePlayer } = useGame();
  const leagueId = player?.club?.leagueId;
  const playerId = player?.id;

  // Server mukofotlarini bir marta (liga o'zgarganda qayta) feed'ga qo'shamiz
  useEffect(() => {
    if (!playerId || !leagueId) return undefined;
    let alive = true;
    fetchAwards(leagueId).then((r) => {
      if (!alive || !r?.ok || !r.awards?.length) return;
      updatePlayer((prev) => {
        const items = buildAwardsNews(r.awards, prev).map((n) => ({
          ...n,
          day: n.fresh ? prev.career.day : ARCHIVE_DAY,
          date: n.date || prev.career.gameDate,
        }));
        const next = appendNews(prev.career.newsFeed, items);
        if (next === (prev.career.newsFeed || [])) return {};
        return { career: { ...prev.career, newsFeed: next } };
      });
    }).catch(() => {});
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId, leagueId]);

  const raw = player?.career?.newsFeed;
  const day = player?.career?.day || 0;

  return useMemo(() => {
    const feed = [...(raw || [])].sort((a, b) => ((a.date || '') < (b.date || '') ? 1 : (a.date || '') > (b.date || '') ? -1 : b.priority - a.priority));
    const featured = feed
      .filter((n) => isFeatured(n, day))
      .sort((a, b) => b.priority - a.priority || ((a.date || '') < (b.date || '') ? 1 : -1))
      .slice(0, 8);
    return { feed, featured, day };
  }, [raw, day]);
}
