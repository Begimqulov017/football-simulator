import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { removePlayerFromClubRoster, joinClubRoster, updatePlayerInClubRoster } from '../data/clubRosterStore';
import { INITIAL_TEAMS } from '../data/teamsData';
import { advanceOneDay, prepareNextDay, isMatchdayNext, computeContractOffer } from '../utils/season';
import { saveCareerToServer, loadCareerFromServer } from '../utils/careerApi';

const GameContext = createContext(null);

// Har bir login qilingan foydalanuvchi o'z karyerasini saqlaydi (bitta
// qurilmada bir nechta do'st o'zining hisobi bilan kirsa, bir-birining
// saqlanmasini bosib qo'ymasligi uchun username bilan kalitlanadi).
function storageKeyFor(username) {
  return `fpcs_save_v1__${username || 'guest'}`;
}

function loadLocalSave(username) {
  try {
    const raw = localStorage.getItem(storageKeyFor(username));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load save', err);
    return null;
  }
}

function persistLocalSave(username, player) {
  try {
    if (player) {
      localStorage.setItem(storageKeyFor(username), JSON.stringify(player));
    } else {
      localStorage.removeItem(storageKeyFor(username));
    }
  } catch (err) {
    console.error('Failed to persist save', err);
  }
}

export function GameProvider({ children, username }) {
  const [player, setPlayer] = useState(() => loadLocalSave(username));
  const [ready, setReady] = useState(false);
  const saveTimer = useRef(null);
  const firstLoad = useRef(true);

  // Ilova ochilganda avval serverdan (markazlashgan, boshqa qurilmadagi eng
  // so'nggi holat) tortib olishga urinamiz; topilmasa shu qurilmadagi mahalliy
  // saqlanmada davom etamiz.
  useEffect(() => {
    let cancelled = false;
    firstLoad.current = true;
    setReady(false);
    (async () => {
      const serverPlayer = await loadCareerFromServer();
      if (cancelled) return;
      if (serverPlayer) {
        setPlayer(serverPlayer);
        persistLocalSave(username, serverPlayer);
      } else {
        setPlayer(loadLocalSave(username));
      }
      firstLoad.current = false;
      setReady(true);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  // Har bir o'zgarishda: darhol mahalliy (localStorage), va bir oz kechikish
  // bilan serverga (debounce) — tarmoq so'rovlarini kamaytirish uchun.
  useEffect(() => {
    persistLocalSave(username, player);
    if (firstLoad.current) return; // serverdan endi kelgan holatni darhol qaytarib yubormaymiz
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveCareerToServer(player).catch(() => {});
    }, 1200);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  // Keeps this player's entry in the shared/global club roster (used by the
  // Club page's squad grid, and by tier promotion/relegation checks) in sync
  // with their live OVR/name/position/tier - otherwise it would keep showing
  // whatever they had the day they joined, forever.
  useEffect(() => {
    if (!player) return;
    updatePlayerInClubRoster(player.club.id, player.id, {
      name: `${player.name} ${player.surname}`,
      pos: player.position,
      ovr: player.overall,
      tier: player.club.tier
    });
  }, [player?.overall, player?.club?.tier, player?.club?.id, player?.id, player?.name, player?.surname, player?.position]); // eslint-disable-line react-hooks/exhaustive-deps

  const createPlayer = useCallback((newPlayer) => {
    setPlayer(newPlayer);
  }, []);

  const updatePlayer = useCallback((updater) => {
    setPlayer((prev) => (prev ? { ...prev, ...updater(prev) } : prev));
  }, []);

  // Advances the in-game calendar by one day. When the new date lands on a
  // scheduled matchday, the whole league's round is simulated (results,
  // table, top scorers, the player's own match stats, messages, wages,
  // injuries) via the season engine. This is only used for QUIET days now -
  // matchdays go through prepareMatchday/commitMatchday below instead, so
  // the outcome can be played back before it's applied.
  const nextDay = useCallback(() => {
    setPlayer((prev) => (prev ? advanceOneDay(prev) : prev));
  }, []);

  const matchdayNext = useMemo(() => isMatchdayNext(player), [player]);

  // Computes (once) the full result of the upcoming matchday - both the
  // final next-player state AND a compact summary of just the player's own
  // match (matchInfo) for the live playback screen. Calling this again for
  // the same in-game date reuses the already-computed result instead of
  // re-rolling the outcome (the RNG only runs once per matchday).
  const pendingMatchdayRef = useRef(null);
  const [pendingMatchday, setPendingMatchdayState] = useState(null);

  const prepareMatchday = useCallback(() => {
    if (!player) return null;
    const cached = pendingMatchdayRef.current;
    if (cached && cached.forDate === player.career.gameDate) return cached;
    const { nextPlayer, matchInfo } = prepareNextDay(player);
    const record = { nextPlayer, matchInfo, forDate: player.career.gameDate };
    pendingMatchdayRef.current = record;
    setPendingMatchdayState(record);
    return record;
  }, [player]);

  const commitMatchday = useCallback(() => {
    const record = pendingMatchdayRef.current;
    setPlayer((prev) => {
      if (!record || !prev || record.forDate !== prev.career.gameDate) return prev;
      return record.nextPlayer;
    });
    pendingMatchdayRef.current = null;
    setPendingMatchdayState(null);
  }, []);

  const markMessageRead = useCallback((messageId) => {
    setPlayer((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        career: {
          ...prev.career,
          messages: prev.career.messages.map((m) => (m.id === messageId ? { ...m, read: true } : m))
        }
      };
    });
  }, []);

  // Player-requested wage renegotiation with the current club, based on
  // recent form and overall growth since their First Rating.
  const requestNewContract = useCallback(() => {
    setPlayer((prev) => {
      if (!prev) return prev;
      const hasPending = prev.career.messages.some((m) => m.type === 'contract' && !m.resolved);
      if (hasPending) return prev;
      const offerWage = computeContractOffer(prev);
      const message = {
        id: `msg_${Date.now()}`,
        type: 'contract',
        date: prev.career.gameDate,
        from: prev.club.name,
        subject: 'New contract offer',
        body: `Based on your recent form, ${prev.club.name} are offering a new deal at $${offerWage.toLocaleString()}/week (currently $${(prev.career.weeklyWage || 0).toLocaleString()}/week).`,
        read: false,
        resolved: false,
        offer: { wage: offerWage }
      };
      return { ...prev, career: { ...prev.career, messages: [...prev.career.messages, message] } };
    });
  }, []);

  const acceptContractOffer = useCallback((messageId) => {
    setPlayer((prev) => {
      if (!prev) return prev;
      const msg = prev.career.messages.find((m) => m.id === messageId);
      if (!msg || msg.resolved) return prev;
      return {
        ...prev,
        career: {
          ...prev.career,
          weeklyWage: msg.offer.wage,
          messages: prev.career.messages.map((m) => (m.id === messageId ? { ...m, resolved: true, read: true, outcome: 'accepted' } : m))
        }
      };
    });
  }, []);

  // Accepting a transfer offer moves the player into the shared/global
  // roster of the new club (top XI or bench, worked out fresh there) and
  // pulls them out of the old club's roster - the rest of the league
  // schedule/table stay valid since offers only ever come from clubs in the
  // same league.
  const acceptTransferOffer = useCallback((messageId) => {
    setPlayer((prev) => {
      if (!prev) return prev;
      const msg = prev.career.messages.find((m) => m.id === messageId);
      if (!msg || msg.resolved || !msg.offer) return prev;
      const newTeam = INITIAL_TEAMS.find((t) => t.id === msg.offer.teamId);
      if (!newTeam) return prev;

      removePlayerFromClubRoster(prev.club.id, prev.id);
      const tier = joinClubRoster(newTeam, {
        id: prev.id, name: `${prev.name} ${prev.surname}`, pos: prev.position, ovr: prev.overall,
        stats: prev.mainStats, nationality: prev.nationality
      });

      return {
        ...prev,
        club: { ...prev.club, id: newTeam.id, name: newTeam.name, logo: newTeam.logo, tier },
        career: {
          ...prev.career,
          weeklyWage: msg.offer.wage,
          messages: prev.career.messages.map((m) => (m.id === messageId ? { ...m, resolved: true, read: true, outcome: 'accepted' } : m))
        }
      };
    });
  }, []);

  const declineOffer = useCallback((messageId) => {
    setPlayer((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        career: {
          ...prev.career,
          messages: prev.career.messages.map((m) => (m.id === messageId ? { ...m, resolved: true, read: true, outcome: 'declined' } : m))
        }
      };
    });
  }, []);

  // Buys a Money-page perk if the player can afford it: fitness trainer
  // (bigger training gains), physio (faster stamina/injury recovery), agent
  // (flavor - bigger clubs notice you), or a boots tier (small match boost).
  const purchasePerk = useCallback((key, cost, value = true) => {
    setPlayer((prev) => {
      if (!prev || (prev.career.money || 0) < cost) return prev;
      return {
        ...prev,
        career: {
          ...prev.career,
          money: prev.career.money - cost,
          perks: { ...prev.career.perks, [key]: value }
        }
      };
    });
  }, []);

  const resetSave = useCallback(() => {
    // Pull this player out of the shared/global club roster too, so a
    // retired/reset career doesn't keep occupying a squad slot forever.
    setPlayer((prev) => {
      if (prev?.club?.id) removePlayerFromClubRoster(prev.club.id, prev.id);
      return null;
    });
    saveCareerToServer(null).catch(() => {});
  }, []);

  const value = {
    player, ready, createPlayer, updatePlayer, nextDay, resetSave,
    matchdayNext, pendingMatchday, prepareMatchday, commitMatchday,
    markMessageRead, requestNewContract, acceptContractOffer, acceptTransferOffer, declineOffer,
    purchasePerk
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside a GameProvider');
  return ctx;
}
