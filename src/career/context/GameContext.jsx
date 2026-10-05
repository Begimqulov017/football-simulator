import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { removePlayerFromClubRoster, joinClubRoster, updatePlayerInClubRoster } from '../data/clubRosterStore';
import { INITIAL_TEAMS } from '../../data/teamsData';
import { advanceOneDay, addDays, applyWorldState, computeContractOffer, buildSeasonSchedule, initStandings, setupSeasonCups } from '../utils/season';
import { LEAGUES } from '../../data/leaguesData';
import { saveCareerToServer, loadCareerFromServer, ackMatchResult, fetchLeagueState } from '../utils/careerApi';
import { mergeServerHonours } from '../utils/honoursSync';
import { displayRating } from '../utils/statCalc';
import { appendNews, buildTransferNews, buildAdminNews } from '../utils/newsGenerator';

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

// Transferlar tarixiga yozuv qo'shadi (Admin -> Players Stats'da ko'rinadi)
// PHASE 10 — state consistency yordamchilari.
// Admin karyerani tahrirlaganda server { rev, patch } yozadi. Patch'ni lokal
// holat ustiga qo'llaymiz (mijozning yangi o'yinlari saqlanib qoladi, faqat admin
// o'zgartirgan maydonlar almashadi).
function applyAdminPatch(prev, patch) {
  if (!prev || !patch) return prev;
  return { ...prev, ...(patch.player || {}), career: { ...prev.career, ...(patch.career || {}) } };
}
// Majburiy yangiliklar feed'ga bir marta (id bo'yicha) qo'shiladi
function mergeForcedNews(prev, forcedNews) {
  if (!prev?.career || !forcedNews?.length) return prev;
  const next = appendNews(prev.career.newsFeed, buildAdminNews(forcedNews, prev));
  if (next === (prev.career.newsFeed || [])) return prev;
  return { ...prev, career: { ...prev.career, newsFeed: next } };
}

const withTransferEntry = (career, entry) => ({ ...career, transferHistory: [...(career.transferHistory || []), entry].slice(-30) });

export function GameProvider({ children, username }) {
  const [player, setPlayer] = useState(() => loadLocalSave(username));
  const [ready, setReady] = useState(false);
  const [worldDate, setWorldDate] = useState(null);
  const [pendingWorldMatch, setPendingWorldMatch] = useState(null);
  const worldDateRef = useRef(null);
  const pendingRef = useRef(null);
  const saveTimer = useRef(null);
  const firstLoad = useRef(true);
  const ackRevRef = useRef(0); // mijoz ko'rgan oxirgi admin-tahrir versiyasi
  // Serverda bu akkaunt uchun karyera BORLIGI tasdiqlanganmi (yuklashda topildi yoki saqlash muvaffaqiyatli bo'ldi).
  // Yangi yaratilgan, hali saqlanmagan karyerani poll "serverda yo'q" deb o'chirib yubormasligi uchun.
  const savedOnServerRef = useRef(false);

  // Ilova ochilganda avval serverdan (markazlashgan, boshqa qurilmadagi eng
  // so'nggi holat) tortib olishga urinamiz; topilmasa shu qurilmadagi mahalliy
  // saqlanmada davom etamiz.
  useEffect(() => {
    let cancelled = false;
    firstLoad.current = true;
    setReady(false);
    (async () => {
      const { player: serverPlayer, worldDate: wd, confirmed, pendingWorldMatch: pwm, adminEdit, forcedNews } = await loadCareerFromServer();
      if (cancelled) return;
      if (confirmed) {
        // Server o'ylagan karyera allaqachon admin tahririni o'z ichiga oladi —
        // faqat versiyani eslab qolamiz (patch qayta qo'llanmaydi).
        ackRevRef.current = adminEdit?.rev || 0;
        savedOnServerRef.current = !!serverPlayer;
        // The server gave an authoritative answer - trust it completely,
        // even when it's null. Falling back to a stale local save here is
        // exactly what let a wiped or never-existing career keep showing up
        // (e.g. after an admin "Wipe Data", or on a fresh MongoDB-backed
        // deploy with an old browser cache still lying around).
        setPlayer(mergeForcedNews(serverPlayer, forcedNews));
        persistLocalSave(username, serverPlayer);
        setPendingWorldMatch(pwm);
        if (serverPlayer) syncWorldState();
      } else {
        // Could not reach the server (offline, cold start, invalid session)
        // - fall back to whatever this device has cached so play can
        // continue rather than losing everything on a blip.
        setPlayer(loadLocalSave(username));
      }
      if (wd) setWorldDate(wd);
      firstLoad.current = false;
      setReady(true);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  // Umumiy dunyo admin tomonidan istalgan vaqt oldinga surilishi mumkin -
  // ilova ochiq turganda ham yangi natijani ko'rish uchun vaqti-vaqti bilan
  // serverdan tekshirib turamiz (har 20 soniyada).
  useEffect(() => {
    const interval = setInterval(async () => {
      if (firstLoad.current) return;
      const { player: serverPlayer, worldDate: wd, confirmed, pendingWorldMatch: pwm, adminEdit, forcedNews } = await loadCareerFromServer();
      if (wd) setWorldDate(wd);
      setPendingWorldMatch(pwm);
      if (confirmed) syncWorldState();
      // Admin karyerani tahrirlagan bo'lsa — patch'ni qo'llaymiz va versiyani tasdiqlaymiz
      if (confirmed && adminEdit && adminEdit.rev > ackRevRef.current) {
        ackRevRef.current = adminEdit.rev;
        if (adminEdit.patch) setPlayer((prev) => applyAdminPatch(prev, adminEdit.patch));
      }
      if (confirmed && forcedNews?.length) setPlayer((prev) => mergeForcedNews(prev, forcedNews));
      if (confirmed && !serverPlayer) {
        // The account no longer has a career on the server (e.g. an admin
        // ran "Wipe Data" while this tab was open) - clear it here too
        // instead of leaving a now-fictional career on screen.
        // LEKIN: karyera hali serverga HECH QACHON saqlanmagan bo'lsa (yangi yaratilgan, saqlash
        // yo'lda yoki rad etilgan) uni o'chirmaymiz - aks holda forma qaytib qolardi.
        if (!savedOnServerRef.current) return;
        savedOnServerRef.current = false;
        setPlayer(null);
        persistLocalSave(username, null);
        return;
      }
      if (confirmed && serverPlayer) savedOnServerRef.current = true;
      if (serverPlayer?.career?.lastMatchResult && !serverPlayer.career.lastMatchResult.seenAt) {
        setPlayer((prev) => (prev ? { ...prev, career: { ...prev.career, lastMatchResult: serverPlayer.career.lastMatchResult } } : prev));
      }
      // Server yozadigan maydonlar (mavsum mukofotlari, terma jamoa caps/kubogi,
      // kubok satrlari) - sahifani qayta ochmasdan ham Profile'da ko'rinsin va
      // keyingi avto-saqlash ularni serverdan o'chirib yubormasin.
      if (serverPlayer) setPlayer((prev) => mergeServerHonours(prev, serverPlayer));
      // 6-BAND: 15+ kun kutilgan o'yin serverda avtomatik hal qilinganda,
      // server foydalanuvchining career.messages'iga yangi xabar qo'shadi -
      // lekin bu poll faqat lastMatchResult'ni ko'chirardi, shuning uchun
      // o'sha xabar hech qachon MessagesPage'da ko'rinmasdi. Endi serverda
      // bor, lekin lokal ro'yxatda yo'q xabarlar (id bo'yicha) qo'shib qo'yiladi.
      const serverMessages = serverPlayer?.career?.messages;
      if (Array.isArray(serverMessages) && serverMessages.length) {
        setPlayer((prev) => {
          if (!prev) return prev;
          const localIds = new Set((prev.career.messages || []).map((m) => m.id));
          const newOnes = serverMessages.filter((m) => !localIds.has(m.id));
          if (!newOnes.length) return prev;
          return { ...prev, career: { ...prev.career, messages: [...prev.career.messages, ...newOnes] } };
        });
      }
    }, 20000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Har bir o'zgarishda: darhol mahalliy (localStorage), va bir oz kechikish
  // bilan serverga (debounce) — tarmoq so'rovlarini kamaytirish uchun.
  useEffect(() => {
    persistLocalSave(username, player);
    if (firstLoad.current) return; // serverdan endi kelgan holatni darhol qaytarib yubormaymiz
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveCareerToServer(player, ackRevRef.current).then((r) => {
        if (r && r.ok) {
          savedOnServerRef.current = true;
          if (r.ackRev) ackRevRef.current = r.ackRev; // wipe'dan keyingi yangi karyera qabul qilindi
          return;
        }
        // Server rad etdi: admin shu orada karyerani tahrirlagan yoki wipe qilgan.
        if (r && r.conflict && r.adminEdit) {
          ackRevRef.current = r.adminEdit.rev;
          if (r.adminEdit.patch) {
            // Tahrir: patch'ni qo'llaymiz — o'zgargan `player` yangi saqlashni o'zi ishga tushiradi.
            setPlayer((prev) => applyAdminPatch(prev, r.adminEdit.patch));
          } else {
            // Wipe: bu ESKI karyera (yangisi bo'lsa server qabul qilgan bo'lardi) - uni qaytarib
            // yozmaymiz, sahifa boshlang'ich formaga qaytadi.
            savedOnServerRef.current = false;
            setPlayer(null);
            persistLocalSave(username, null);
          }
        }
      }).catch(() => {});
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
      ovr: displayRating(player.overall),
      tier: player.club.tier
    });
  }, [displayRating(player?.overall), player?.club?.tier, player?.club?.id, player?.id, player?.name, player?.surname, player?.position]); // eslint-disable-line react-hooks/exhaustive-deps

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
  // PHASE 11 - YAGONA SIMULATSIYA. Liga/kubok natijalari FAQAT serverdagi umumiy dunyoda hisoblanadi
  // (admin kunni o'tkazadi). Klient lokal o'yin simulyatsiya QILMAYDI: u faqat shaxsiy kunlik ishlarni
  // (mashg'ulot, maosh, jarohat, xabarlar) bajaradi va o'z o'yinini serverdagi kutilayotgan (pending)
  // matchdan LiveMatch orqali o'ynaydi.
  worldDateRef.current = worldDate;
  pendingRef.current = pendingWorldMatch;
  const tomorrow = player?.career?.gameDate ? addDays(player.career.gameDate, 1) : null;
  // Dunyo hali boshlanmagan bo'lsa (admin birinchi kunni o'tkazmagan) - dunyo sanasi = boshlang'ich kundan oldingi kun.
  const effectiveWorldDate = worldDate || (player?.career?.gameDate || null);
  // Siz adminga yetib oldingiz: keyingi kun dunyo sanasidan keyin.
  const waitingForAdmin = !!(tomorrow && effectiveWorldDate && tomorrow > effectiveWorldDate);
  // Keyingi kunda sizning o'yiningiz bor va u o'ynalishini kutmoqda.
  const matchdayNext = !!(pendingWorldMatch && tomorrow && pendingWorldMatch.date && pendingWorldMatch.date <= tomorrow);

  const nextDay = useCallback(() => {
    setPlayer((prev) => {
      if (!prev) return prev;
      const t = addDays(prev.career.gameDate, 1);
      const wd = worldDateRef.current || prev.career.gameDate;
      if (t > wd) return prev; // adminni kutish
      const pw = pendingRef.current;
      if (pw && pw.date && pw.date <= t) return prev; // avval o'z o'yiningizni o'ynang
      return advanceOneDay(prev);
    });
  }, []);

  // Serverdagi liga/kubok holatini karyeraga ko'chiradi (yagona haqiqat manbai).
  const syncWorldState = useCallback(async () => {
    try {
      const r = await fetchLeagueState();
      if (!r || !r.ok) return null;
      if (r.worldDate) setWorldDate(r.worldDate);
      if (r.state) setPlayer((prev) => applyWorldState(prev, r.state));
      return r;
    } catch (e) { return null; }
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
      const offer = computeContractOffer(prev);
      const message = {
        id: `msg_${Date.now()}`,
        type: 'contract',
        date: prev.career.gameDate,
        from: prev.club.name,
        subject: 'New contract offer',
        body: `Based on your recent form, ${prev.club.name} are offering a new ${offer.years}-year deal at $${offer.wage.toLocaleString()}/week (currently $${(prev.career.weeklyWage || 0).toLocaleString()}/week).`,
        read: false,
        resolved: false,
        offer
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
          ...withTransferEntry(prev.career, { type: 'renewal', date: prev.career.gameDate, from: prev.club?.name || null, fromLogo: prev.club?.logo || null, to: prev.club?.name || null, toLogo: prev.club?.logo || null, wage: msg.offer.wage, years: msg.offer.years || 4 }),
          weeklyWage: msg.offer.wage,
          contract: { yearsTotal: msg.offer.years || 4, signedDay: prev.career.day },
          contractTalksOpened: false,
          contractFailedNegotiations: 0,
          messages: prev.career.messages.map((m) => (m.id === messageId ? { ...m, resolved: true, read: true, outcome: 'accepted' } : m))
        }
      };
    });
  }, []);

  // Accepting a transfer offer moves the player into the shared/global
  // roster of the new club (top XI or bench, worked out fresh there) and
  // pulls them out of the old club's roster. If this is a free-agent
  // signing, the player also joins that club's LEAGUE (fresh schedule/
  // standings/cups), since a free agent might land anywhere, not just a
  // club in their old league.
  const acceptTransferOffer = useCallback((messageId) => {
    setPlayer((prev) => {
      if (!prev) return prev;
      const msg = prev.career.messages.find((m) => m.id === messageId);
      if (!msg || msg.resolved || !msg.offer) return prev;
      const newTeam = INITIAL_TEAMS.find((t) => t.id === msg.offer.teamId);
      if (!newTeam) return prev;

      if (prev.club?.id) removePlayerFromClubRoster(prev.club.id, prev.id);
      const tier = joinClubRoster(newTeam, {
        id: prev.id, name: `${prev.name} ${prev.surname}`, pos: prev.position, ovr: displayRating(prev.overall),
        stats: prev.mainStats, nationality: prev.nationality
      });

      const resolvedMessages = prev.career.messages.map((m) => (m.id === messageId ? { ...m, resolved: true, read: true, outcome: 'accepted' } : m));

      if (msg.offer.freeAgentSigning) {
        // Signing as a free agent - could be a different league entirely,
        // so the whole season needs regenerating for the new club.
        const league = LEAGUES.find((l) => l.id === msg.offer.leagueId) || LEAGUES.find((l) => l.teamIds.includes(newTeam.id));
        const startDate = prev.career.gameDate;
        const schedule = buildSeasonSchedule(league, startDate);
        const { domesticCup, continentalCup } = setupSeasonCups(prev, league, startDate, schedule);
        return {
          ...prev,
          club: { id: newTeam.id, name: newTeam.name, logo: newTeam.logo, leagueId: league.id, leagueName: league.name, flag: newTeam.flag, country: league.country, tier },
          career: {
            ...withTransferEntry(prev.career, { type: 'free', date: prev.career.gameDate, from: prev.club?.name || null, fromLogo: prev.club?.logo || null, to: newTeam.name, toLogo: newTeam.logo, wage: msg.offer.wage, years: msg.offer.years || 4 }),
            weeklyWage: msg.offer.wage,
            contract: { yearsTotal: msg.offer.years || 4, signedDay: prev.career.day },
            contractTalksOpened: false,
            contractFailedNegotiations: 0,
            freeAgent: false,
            schedule, standings: initStandings(league.teamIds), topScorers: {},
            domesticCup, continentalCup,
            messages: resolvedMessages
          }
        };
      }

      return {
        ...prev,
        club: { ...prev.club, id: newTeam.id, name: newTeam.name, logo: newTeam.logo, tier },
        career: {
          ...withTransferEntry(prev.career, { type: 'transfer', date: prev.career.gameDate, from: prev.club?.name || null, fromLogo: prev.club?.logo || null, to: newTeam.name, toLogo: newTeam.logo, wage: msg.offer.wage }),
          weeklyWage: msg.offer.wage,
          messages: resolvedMessages
        }
      };
    });
  }, []);

  // ---------------------------------------------------------------------
  // PHASE 8 — Interactive Transfer Negotiation
  // ---------------------------------------------------------------------
  // Har bir klub bo'yicha muzokara holatini (turn, thread, draft...) saqlaydi.
  // Shu tufayli modal yopilsa ham, sahifa yangilansa ham muzokara qolgan
  // joyidan davom etadi. Eski yopilgan muzokaralar 40 tadan oshsa tozalanadi.
  const saveNegotiation = useCallback((teamId, negotiation) => {
    setPlayer((prev) => {
      if (!prev) return prev;
      const all = { ...(prev.career.negotiations || {}), [teamId]: negotiation };
      const keys = Object.keys(all);
      if (keys.length > 40) {
        const live = ['offer', 'counter', 'final', 'accepted'];
        keys
          .filter((k) => !live.includes(all[k].stage))
          .sort((a, b) => (all[a].closedDay || 0) - (all[b].closedDay || 0))
          .slice(0, keys.length - 40)
          .forEach((k) => { delete all[k]; });
      }
      return { ...prev, career: { ...prev.career, negotiations: all } };
    });
  }, []);

  // Muzokarada kelishilgan transferni rasmiylashtiradi: klub/ligasi, maosh,
  // shartnoma (rol + release clause bilan), transfer tarixi, dunyo transfer
  // lentasi, yangilik va xabar. Boshqa liga bo'lsa mavsum yangidan quriladi
  // (xuddi erkin agent shartnomasidagi kabi).
  const completeNegotiatedTransfer = useCallback((deal) => {
    setPlayer((prev) => {
      if (!prev) return prev;
      const newTeam = INITIAL_TEAMS.find((t) => t.id === deal.teamId);
      const league = LEAGUES.find((l) => l.teamIds.includes(deal.teamId));
      if (!newTeam || !league || prev.club?.id === newTeam.id || !deal.terms) return prev;

      const { wage, years, role, clause } = deal.terms;
      const fee = deal.fee || 0;
      const wasFree = !!prev.career.freeAgent;
      const oldName = prev.club?.name || null;
      const oldLogo = prev.club?.logo || null;

      if (prev.club?.id) removePlayerFromClubRoster(prev.club.id, prev.id);
      const naturalTier = joinClubRoster(newTeam, {
        id: prev.id, name: `${prev.name} ${prev.surname}`, pos: prev.position, ovr: displayRating(prev.overall),
        stats: prev.mainStats, nationality: prev.nationality
      });
      const tier = role === 'star' || role === 'key' ? 'starter' : naturalTier;
      if (tier !== naturalTier) updatePlayerInClubRoster(newTeam.id, prev.id, { tier });

      const sameLeague = league.id === prev.club?.leagueId;
      let club;
      let seasonPatch = {};
      if (sameLeague) {
        club = { ...prev.club, id: newTeam.id, name: newTeam.name, logo: newTeam.logo, tier, role };
      } else {
        const startDate = prev.career.gameDate;
        const schedule = buildSeasonSchedule(league, startDate);
        const { domesticCup, continentalCup } = setupSeasonCups(prev, league, startDate, schedule);
        club = {
          id: newTeam.id, name: newTeam.name, logo: newTeam.logo, leagueId: league.id, leagueName: league.name,
          flag: newTeam.flag || league.flag, country: league.country, tier, role
        };
        seasonPatch = { schedule, standings: initStandings(league.teamIds), topScorers: {}, domesticCup, continentalCup };
      }

      const date = prev.career.gameDate;
      const historyEntry = {
        id: `tr_${Date.now()}`, type: wasFree ? 'free' : 'transfer', date,
        from: oldName, fromLogo: oldLogo, to: newTeam.name, toLogo: newTeam.logo,
        wage, years, role, releaseClause: clause ?? null, fee, turns: deal.turns || 1,
        leagueName: league.name, ovr: displayRating(prev.overall)
      };
      const logEntry = {
        id: `transfer_${Date.now()}`, date, playerName: `${prev.name} ${prev.surname}`, playerPos: prev.position,
        ovr: displayRating(prev.overall), fromClub: oldName || 'Free agent', fromLogo: oldLogo || '🆓',
        toClub: newTeam.name, toLogo: newTeam.logo, fee, isUser: true
      };

      const live = ['offer', 'counter', 'final', 'accepted'];
      const negotiations = Object.fromEntries(
        Object.entries(prev.career.negotiations || {}).map(([k, n]) => [
          k, live.includes(n.stage) ? { ...n, stage: k === newTeam.id ? 'signed' : 'withdrawn', closedDay: prev.career.day } : n
        ])
      );

      const welcome = {
        id: `msg_${Date.now()}`, type: 'club', date, from: newTeam.name, subject: `Welcome to ${newTeam.name}!`,
        body: `Your move${oldName ? ` from ${oldName}` : ''} is official${fee > 0 ? ` (fee: $${fee.toFixed(1)}M)` : ' (free transfer)'}. You'll play as ${role === 'star' ? 'a Star Player' : role === 'key' ? 'a Key Player' : role === 'rotation' ? 'a Rotation player' : 'a Prospect'} on a ${years}-year deal worth $${wage.toLocaleString()}/week${clause != null ? `, release clause $${clause}M` : ''}.`,
        read: false, resolved: true
      };
      const messages = prev.career.messages
        .map((m) => (deal.messageId && m.id === deal.messageId ? { ...m, resolved: true, read: true, outcome: 'accepted' } : m))
        .concat(welcome);

      return {
        ...prev,
        club,
        career: {
          ...withTransferEntry(prev.career, historyEntry),
          ...seasonPatch,
          weeklyWage: wage,
          contract: { yearsTotal: years, signedDay: prev.career.day, role, releaseClause: clause ?? null },
          contractTalksOpened: false,
          contractFailedNegotiations: 0,
          freeAgent: false,
          negotiations,
          transferLog: [...(prev.career.transferLog || []), logEntry].slice(-150),
          newsFeed: appendNews(prev.career.newsFeed, buildTransferNews([logEntry], prev.career.day)),
          messages
        }
      };
    });
  }, []);

  const declineOffer = useCallback((messageId) => {
    setPlayer((prev) => {
      if (!prev) return prev;
      const msg = prev.career.messages.find((m) => m.id === messageId);
      const wasContractTalk = msg?.type === 'contract';
      const failedCount = (prev.career.contractFailedNegotiations || 0) + (wasContractTalk ? 1 : 0);
      const forcedFreeAgent = wasContractTalk && failedCount >= 5;
      return {
        ...prev,
        career: {
          ...prev.career,
          contractFailedNegotiations: failedCount,
          freeAgent: forcedFreeAgent ? true : prev.career.freeAgent,
          contract: forcedFreeAgent ? null : prev.career.contract,
          messages: [
            ...prev.career.messages.map((m) => (m.id === messageId ? { ...m, resolved: true, read: true, outcome: 'declined' } : m)),
            ...(forcedFreeAgent ? [{
              id: `msg_${Date.now()}`, type: 'club', date: prev.career.gameDate, from: prev.club.name,
              subject: 'Released',
              body: `After ${failedCount} failed rounds of contract talks, ${prev.club.name} have decided to let you go. You're now a free agent.`,
              read: false, resolved: true
            }] : [])
          ]
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

  const hasUnwatchedResult = !!(player?.career?.lastMatchResult && !player.career.lastMatchResult.seenAt);

  const acknowledgeResult = useCallback(async () => {
    setPlayer((prev) => {
      if (!prev?.career?.lastMatchResult) return prev;
      return { ...prev, career: { ...prev.career, lastMatchResult: { ...prev.career.lastMatchResult, seenAt: new Date().toISOString() } } };
    });
    await ackMatchResult().catch(() => {});
  }, []);

  // Foydalanuvchi natijani yuborgandan keyin 20 soniya kutmasdan, DARHOL
  // "hozir pending o'yin bormi" holatini yangilash uchun (WorldMatchPage
  // natija yuborilgach shuni chaqiradi).
  const refreshPendingWorldMatch = useCallback(async () => {
    const { pendingWorldMatch: pwm } = await loadCareerFromServer();
    setPendingWorldMatch(pwm);
    await syncWorldState();
    return pwm;
  }, [syncWorldState]);

  const value = {
    player, ready, createPlayer, updatePlayer, nextDay, resetSave,
    matchdayNext, waitingForAdmin, syncWorldState,
    worldDate, hasUnwatchedResult, acknowledgeResult,
    pendingWorldMatch, refreshPendingWorldMatch,
    markMessageRead, requestNewContract, acceptContractOffer, acceptTransferOffer, declineOffer,
    saveNegotiation, completeNegotiatedTransfer,
    purchasePerk
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside a GameProvider');
  return ctx;
}
