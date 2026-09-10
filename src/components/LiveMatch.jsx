import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  calculatePreMatchChances,
  calculateLiveChances,
  calculateDisplayTeamOvr,
  calculateTeamOvr,
  getPosCategory,
  resolveAttackOutcome,
  resolveRegularShot,
  getPossessionWeight,
  rollBackgroundStats,
  rollOffside,
  checkPlainFoul,
  checkInjuryEvent,
  checkRandomMatchEvent,
  getMinuteMicroDelta,
  commentaryGoal,
  commentaryOffside,
  commentaryPenaltyGoal,
  commentaryPenaltyMissed,
  tickerSave,
  tickerMiss,
  tickerCorner,
  tickerBigMiss,
  tickerPossession,
  tickerAttackBuildup,
  tickerFreeKick,
  tickerCard,
  tickerCleanTackle,
} from '../utils/engine';
import { pickAutoFormation, buildPitchSlots, getMatchupModifier, selectBestXI } from '../utils/formations';
import MatchTablo from './MatchTablo';
import EventLog from './EventLog';

const QUIET_NORMAL = 350;
const NOTABLE_NORMAL = 1900;
const QUIET_FAST = 70;
const NOTABLE_FAST = 550;
const SPEED_FINISH = 8;

const DEFAULT_RATING = 6.5;

const emptyStats = () => ({
  shots: 0, sot: 0, saves: 0, bigChances: 0, offsides: 0, fouls: 0, corners: 0, tackles: 0,
});

// teamA/teamB — allaqachon tanlangan ikkita jamoa (Tezkor O'yinda TeamSelect orqali,
// Turnirda esa avtomatik raqiblar). onExit — "Chiqish" bosilganda chaqiriladi.
// onFinish(result) — o'yin tugaganda (score/statistika bilan) ixtiyoriy chaqiriladi,
// masalan Turnir fiksturasiga natijani yozib qo'yish uchun.
export default function LiveMatch({ teamA, teamB, onExit, onFinish }) {
  const [isPaused, setIsPaused] = useState(false);
  const [matchTime, setMatchTime] = useState(0);
  const [addedTime, setAddedTime] = useState(0);
  const [score, setScore] = useState({ a: 0, b: 0 });
  const [matchEvents, setMatchEvents] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  const [speedMode, setSpeedMode] = useState('normal');
  const [isFinishing, setIsFinishing] = useState(false);

  const [currentPlayersA, setCurrentPlayersA] = useState([]);
  const [currentPlayersB, setCurrentPlayersB] = useState([]);
  const [benchA, setBenchA] = useState([]);
  const [benchB, setBenchB] = useState([]);
  const [offPitchA, setOffPitchA] = useState([]);
  const [offPitchB, setOffPitchB] = useState([]);

  const [yellowCards, setYellowCards] = useState([]);
  const [redCardsA, setRedCardsA] = useState(0);
  const [redCardsB, setRedCardsB] = useState(0);

  const [subsCountA, setSubsCountA] = useState(0);
  const [subsCountB, setSubsCountB] = useState(0);

  const [isRiskA, setIsRiskA] = useState(false);
  const [isRiskB, setIsRiskB] = useState(false);

  const [playerRatings, setPlayerRatings] = useState({});
  const [playerEventsMap, setPlayerEventsMap] = useState({});
  const [matchStats, setMatchStats] = useState({ a: emptyStats(), b: emptyStats() });
  const [possessionMin, setPossessionMin] = useState({ a: 0, b: 0 });

  const [formationA, setFormationA] = useState(null);
  const [formationB, setFormationB] = useState(null);
  const [liveTicker, setLiveTicker] = useState('');

  const stateRef = useRef();
  stateRef.current = {
    teamA, teamB, currentPlayersA, currentPlayersB, benchA, benchB,
    yellowCards, redCardsA, redCardsB, subsCountA, subsCountB, score,
    isRiskA, isRiskB, addedTime, matchTime,
  };

  const formationARef = useRef(null);
  const formationBRef = useRef(null);
  const finishedNotifiedRef = useRef(false);
  // Turnir fiksturasi (ScorerLine/tez simulyatsiya) bilan bir xil formatdagi
  // gol voqealari — { minute, teamKey, scorerId, scorerName, assisterId, assisterName, type }.
  // Faqat GOAL/PENALTY_GOAL uchun yoziladi — bu instant-simulyatsiya (`tournamentEngine.js`)
  // bilan bir xil xulq (avtogollar u yerda ham fixture.events ga yozilmaydi).
  const goalEventsRef = useRef([]);

  const baseChances = calculatePreMatchChances(teamA, currentPlayersA, teamB, currentPlayersB, redCardsA, redCardsB);
  const liveChances = calculateLiveChances(baseChances, score, matchTime, isRiskA, isRiskB);

  const slotsA = useMemo(
    () => (formationA ? buildPitchSlots(currentPlayersA, formationA) : []),
    [currentPlayersA, formationA]
  );
  const slotsB = useMemo(
    () => (formationB ? buildPitchSlots(currentPlayersB, formationB) : []),
    [currentPlayersB, formationB]
  );

  const getRating = (id) => (playerRatings[id] !== undefined ? playerRatings[id] : DEFAULT_RATING);
  const ratingClass = (v) => (v >= 7 ? 'rating-high' : v >= 6 ? 'rating-mid' : 'rating-low');

  const adjustRating = (id, delta) => {
    setPlayerRatings((prev) => {
      const current = prev[id] !== undefined ? prev[id] : DEFAULT_RATING;
      const next = Math.max(4.0, Math.min(10.0, current + delta));
      return { ...prev, [id]: Math.round(next * 100) / 100 };
    });
  };

  const applyMicroDeltas = (playersA, playersB) => {
    setPlayerRatings((prev) => {
      const next = { ...prev };
      [...playersA, ...playersB].forEach((p) => {
        const d = getMinuteMicroDelta(p);
        if (d === 0) return;
        const current = next[p.id] !== undefined ? next[p.id] : DEFAULT_RATING;
        next[p.id] = Math.round(Math.max(4.0, Math.min(10.0, current + d)) * 100) / 100;
      });
      return next;
    });
  };

  const bumpPlayerEvent = (id, patch) => {
    setPlayerEventsMap((prev) => {
      const cur = prev[id] || { goals: 0, assists: 0, yellow: false, red: false, injured: false };
      const next = { ...cur };
      Object.entries(patch).forEach(([k, v]) => {
        next[k] = typeof v === 'number' ? (next[k] || 0) + v : v;
      });
      return { ...prev, [id]: next };
    });
  };

  const bumpMatchStat = (teamKey, patch) => {
    setMatchStats((prev) => {
      const cur = prev[teamKey];
      const next = { ...cur };
      Object.entries(patch).forEach(([k, v]) => { next[k] = (next[k] || 0) + v; });
      return { ...prev, [teamKey]: next };
    });
  };

  const handleAttackOutcome = (side, teamKey, outcome, minute, opts = {}) => {
    if (!outcome) return null;
    const isBig = opts.isBig !== false;
    const bigInc = isBig ? 1 : 0;

    switch (outcome.result) {
      case 'OFFSIDE': {
        bumpMatchStat(teamKey, { offsides: 1 });
        const c = commentaryOffside(outcome.scorer.name);
        setMatchEvents((prev) => [...prev, { minute, side, icon: '❌', text: c.text, sub: c.sub }]);
        return { tickerText: `❌ ${outcome.scorer.name} ofsaydda qolib ketdi`, priority: 3 };
      }
      case 'OWN_GOAL': {
        setScore((s) => ({ ...s, [teamKey]: s[teamKey] + 1 }));
        adjustRating(outcome.player.id, -0.5);
        bumpPlayerEvent(outcome.player.id, { ownGoal: 1 });
        setMatchEvents((prev) => [...prev, {
          minute, side, icon: '⚽', text: `GOL! (Avtogol)`, sub: `O'z darvozasiga: ${outcome.player.name}`,
        }]);
        return { tickerText: `⚽ Avtogol! ${outcome.player.name}`, priority: 5 };
      }
      case 'PENALTY_GOAL': {
        setScore((s) => ({ ...s, [teamKey]: s[teamKey] + 1 }));
        bumpMatchStat(teamKey, { shots: 1, sot: 1, bigChances: bigInc });
        adjustRating(outcome.scorer.id, 0.6);
        bumpPlayerEvent(outcome.scorer.id, { goals: 1 });
        if (outcome.keeper) adjustRating(outcome.keeper.id, -0.15);
        const c = commentaryPenaltyGoal(outcome.scorer.name);
        setMatchEvents((prev) => [...prev, { minute, side, icon: '⚽', text: c.text, sub: c.sub }]);
        goalEventsRef.current = [...goalEventsRef.current, {
          minute, teamKey, scorerId: outcome.scorer.id, scorerName: outcome.scorer.name,
          assisterId: null, assisterName: null, type: 'PENALTY_GOAL',
        }];
        return { tickerText: `⚽ GOOOL! ${outcome.scorer.name} (Penalti)`, priority: 5 };
      }
      case 'PENALTY_MISSED': {
        bumpMatchStat(teamKey, { shots: 1, bigChances: bigInc });
        adjustRating(outcome.scorer.id, -0.35);
        if (outcome.keeper) adjustRating(outcome.keeper.id, 0.3);
        const c = commentaryPenaltyMissed(outcome.scorer.name, outcome.keeper?.name);
        setMatchEvents((prev) => [...prev, { minute, side, icon: '🥅', text: c.text, sub: c.sub }]);
        return { tickerText: `🥅 ${outcome.scorer.name} penaltini otkazib yubordi!`, priority: 4 };
      }
      case 'SAVED': {
        const opponentKey = teamKey === 'a' ? 'b' : 'a';
        bumpMatchStat(teamKey, { shots: 1, sot: 1, bigChances: bigInc });
        bumpMatchStat(opponentKey, { saves: 1 });
        adjustRating(outcome.scorer.id, -0.05);
        if (outcome.keeper) {
          adjustRating(outcome.keeper.id, 0.15);
          bumpPlayerEvent(outcome.keeper.id, { saves: 1 });
        }
        return outcome.keeper
          ? { tickerText: tickerSave(outcome.keeper.name, outcome.scorer.name), priority: isBig ? 4 : 2 }
          : null;
      }
      case 'MISSED': {
        bumpMatchStat(teamKey, { shots: 1, bigChances: isBig ? bigInc : 0 });
        adjustRating(outcome.scorer.id, -0.03);
        return { tickerText: isBig ? tickerBigMiss(outcome.scorer.name) : tickerMiss(outcome.scorer.name), priority: isBig ? 4 : 1 };
      }
      case 'GOAL': {
        setScore((s) => ({ ...s, [teamKey]: s[teamKey] + 1 }));
        bumpMatchStat(teamKey, { shots: 1, sot: 1, bigChances: bigInc });
        adjustRating(outcome.scorer.id, 0.5);
        bumpPlayerEvent(outcome.scorer.id, { goals: 1 });
        if (outcome.assister) {
          adjustRating(outcome.assister.id, 0.3);
          bumpPlayerEvent(outcome.assister.id, { assists: 1 });
        }
        if (outcome.keeper) adjustRating(outcome.keeper.id, -0.2);
        const c = commentaryGoal(outcome.scorer.name, outcome.assister?.name);
        setMatchEvents((prev) => [...prev, { minute, side, icon: '⚽', text: c.text, sub: c.sub }]);
        goalEventsRef.current = [...goalEventsRef.current, {
          minute, teamKey, scorerId: outcome.scorer.id, scorerName: outcome.scorer.name,
          assisterId: outcome.assister?.id || null, assisterName: outcome.assister?.name || null, type: 'GOAL',
        }];
        return { tickerText: `⚽ GOOOL! ${outcome.scorer.name}`, priority: 5 };
      }
      default:
        return null;
    }
  };

  useEffect(() => {
    const initAdded = Math.floor(Math.random() * 6) + 1;
    setAddedTime(initAdded);

    const fullSquadA = teamA.squad.map((p) => ({ ...p, stamina: 100 }));
    const fullSquadB = teamB.squad.map((p) => ({ ...p, stamina: 100 }));

    const initOvrA = calculateDisplayTeamOvr(fullSquadA);
    const initOvrB = calculateDisplayTeamOvr(fullSquadB);
    const initFormA = pickAutoFormation(fullSquadA, null, initOvrA - initOvrB);
    const initFormB = pickAutoFormation(fullSquadB, initFormA, initOvrB - initOvrA);
    setFormationA(initFormA);
    setFormationB(initFormB);
    formationARef.current = initFormA;
    formationBRef.current = initFormB;

    const { startingXI: playersA, bench: benchPoolA } = selectBestXI(fullSquadA, initFormA);
    const { startingXI: playersB, bench: benchPoolB } = selectBestXI(fullSquadB, initFormB);
    setCurrentPlayersA(playersA);
    setCurrentPlayersB(playersB);
    setBenchA(benchPoolA);
    setBenchB(benchPoolB);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let timeoutId;
    let cancelled = false;

    const scheduleNext = (delay) => {
      if (cancelled) return;
      timeoutId = setTimeout(runTick, delay);
    };

    function runTick() {
      if (cancelled) return;
      const st = stateRef.current;
      const matchEnd = 90 + (st.addedTime || 0);

      if (st.matchTime >= matchEnd) {
        setIsFinished(true);
        return;
      }

      const nextTime = st.matchTime + 1;
      const rand = Math.random() * 100;

      setCurrentPlayersA((prev) => prev.map((p) => ({
        ...p,
        stamina: Math.max(30, (p.stamina || 100) - (Math.random() * 0.4 + 0.4)),
      })));
      setCurrentPlayersB((prev) => prev.map((p) => ({
        ...p,
        stamina: Math.max(30, (p.stamina || 100) - (Math.random() * 0.4 + 0.4)),
      })));

      const liveOvrA = calculateTeamOvr(st.currentPlayersA) - st.redCardsA * 6;
      const liveOvrB = calculateTeamOvr(st.currentPlayersB) - st.redCardsB * 6;
      const newFormA = pickAutoFormation(st.currentPlayersA, formationBRef.current, liveOvrA - liveOvrB);
      const newFormB = pickAutoFormation(st.currentPlayersB, formationARef.current, liveOvrB - liveOvrA);
      const matchupA = getMatchupModifier(newFormA, newFormB);
      const matchupB = getMatchupModifier(newFormB, newFormA);
      formationARef.current = newFormA;
      formationBRef.current = newFormB;
      setFormationA(newFormA);
      setFormationB(newFormB);

      const freshChances = calculatePreMatchChances(
        st.teamA, st.currentPlayersA, st.teamB, st.currentPlayersB, st.redCardsA, st.redCardsB
      );

      let chanceA = (freshChances.winA / 90) * 2.5;
      let chanceB = (freshChances.winB / 90) * 2.5;
      let regChanceA = (freshChances.winA / 90) * 15;
      let regChanceB = (freshChances.winB / 90) * 15;

      if (st.isRiskA) { chanceA *= 1.35; chanceB *= 1.4; regChanceA *= 1.2; regChanceB *= 1.25; }
      if (st.isRiskB) { chanceB *= 1.35; chanceA *= 1.4; regChanceB *= 1.2; regChanceA *= 1.25; }

      const formRatioA = (newFormA.attack * matchupA.attackMod) / (newFormB.defense * matchupB.defenseMod);
      const formRatioB = (newFormB.attack * matchupB.attackMod) / (newFormA.defense * matchupA.defenseMod);
      chanceA *= formRatioA;
      chanceB *= formRatioB;
      regChanceA *= formRatioA;
      regChanceB *= formRatioB;

      let tickerBest = null;
      const noteTicker = (result) => {
        if (result && (!tickerBest || result.priority > tickerBest.priority)) tickerBest = result;
      };

      if (rand < chanceA) {
        const outcome = resolveAttackOutcome(st.currentPlayersA, st.currentPlayersB);
        noteTicker(handleAttackOutcome('left', 'a', outcome, nextTime, { isBig: true }));
      } else if (rand > 100 - chanceB) {
        const outcome = resolveAttackOutcome(st.currentPlayersB, st.currentPlayersA);
        noteTicker(handleAttackOutcome('right', 'b', outcome, nextTime, { isBig: true }));
      }

      const randRegA = Math.random() * 100;
      if (randRegA < regChanceA) {
        const outcome = resolveRegularShot(st.currentPlayersA, st.currentPlayersB);
        noteTicker(handleAttackOutcome('left', 'a', outcome, nextTime, { isBig: false }));
      }
      const randRegB = Math.random() * 100;
      if (randRegB < regChanceB) {
        const outcome = resolveRegularShot(st.currentPlayersB, st.currentPlayersA);
        noteTicker(handleAttackOutcome('right', 'b', outcome, nextTime, { isBig: false }));
      }

      if (rollOffside(st.currentPlayersA)) bumpMatchStat('a', { offsides: 1 });
      if (rollOffside(st.currentPlayersB)) bumpMatchStat('b', { offsides: 1 });

      const possWeightA = getPossessionWeight(st.currentPlayersA);
      const possWeightB = getPossessionWeight(st.currentPlayersB);
      const aHasBall = Math.random() < possWeightA / ((possWeightA + possWeightB) || 1);
      setPossessionMin((prev) => ({
        a: prev.a + (aHasBall ? 1 : 0),
        b: prev.b + (aHasBall ? 0 : 1),
      }));

      const defendingPlayers = aHasBall ? st.currentPlayersB : st.currentPlayersA;
      const attackingPlayers = aHasBall ? st.currentPlayersA : st.currentPlayersB;
      const { tackle, corner } = rollBackgroundStats(attackingPlayers, defendingPlayers);
      if (tackle) {
        bumpMatchStat(aHasBall ? 'b' : 'a', { tackles: 1 });
        if (Math.random() < 0.25) {
          const defenders = defendingPlayers.filter((p) => ['CB', 'LB', 'RB', 'CDM'].includes(p.pos));
          const attackers = attackingPlayers.filter((p) => ['ST', 'CF', 'SS', 'LW', 'RW', 'CAM'].includes(p.pos));
          if (defenders.length && attackers.length) {
            const d = defenders[Math.floor(Math.random() * defenders.length)];
            const a = attackers[Math.floor(Math.random() * attackers.length)];
            noteTicker({ tickerText: tickerCleanTackle(d.name, a.name), priority: 1 });
          }
        }
      }
      if (corner) {
        bumpMatchStat(aHasBall ? 'a' : 'b', { corners: 1 });
        noteTicker({ tickerText: tickerCorner(aHasBall ? st.teamA.name : st.teamB.name), priority: 2 });
      }

      const plainFoulA = checkPlainFoul(st.currentPlayersA);
      if (plainFoulA) {
        bumpMatchStat('a', { fouls: 1 }); adjustRating(plainFoulA.id, -0.05);
        const victimB = st.currentPlayersB.find((p) => ['ST', 'CF', 'LW', 'RW', 'CAM'].includes(p.pos)) || st.currentPlayersB[0];
        noteTicker({ tickerText: tickerFreeKick(st.teamB.name, victimB?.name || 'raqib'), priority: 1 });
      }
      const plainFoulB = checkPlainFoul(st.currentPlayersB);
      if (plainFoulB) {
        bumpMatchStat('b', { fouls: 1 }); adjustRating(plainFoulB.id, -0.05);
        const victimA = st.currentPlayersA.find((p) => ['ST', 'CF', 'LW', 'RW', 'CAM'].includes(p.pos)) || st.currentPlayersA[0];
        noteTicker({ tickerText: tickerFreeKick(st.teamA.name, victimA?.name || 'raqib'), priority: 1 });
      }

      const injuredA = checkInjuryEvent(st.currentPlayersA);
      if (injuredA && st.subsCountA < 5) {
        const cat = getPosCategory(injuredA.pos);
        const repl = st.benchA.find((p) => getPosCategory(p.pos) === cat) || st.benchA.find((p) => p.pos !== 'GK');
        if (repl) {
          const playerIn = { ...repl, stamina: 100 };
          setCurrentPlayersA((prev) => [...prev.filter((p) => p.id !== injuredA.id), playerIn]);
          setBenchA((prev) => prev.filter((p) => p.id !== repl.id));
          setOffPitchA((prev) => [...prev, injuredA.id]);
          setSubsCountA((s) => s + 1);
          bumpPlayerEvent(injuredA.id, { injured: true });
          setMatchEvents((prev) => [...prev, {
            minute: nextTime, side: 'left', icon: '🩹', text: `Jarohat! ${injuredA.name} maydonni tark etmoqda`,
            sub: `O'rniga: ${playerIn.name}`,
          }]);
          noteTicker({ tickerText: `🩹 ${injuredA.name} jarohat oldi, ${playerIn.name} bilan almashtirildi`, priority: 4 });
        }
      }
      const injuredB = checkInjuryEvent(st.currentPlayersB);
      if (injuredB && st.subsCountB < 5) {
        const cat = getPosCategory(injuredB.pos);
        const repl = st.benchB.find((p) => getPosCategory(p.pos) === cat) || st.benchB.find((p) => p.pos !== 'GK');
        if (repl) {
          const playerIn = { ...repl, stamina: 100 };
          setCurrentPlayersB((prev) => [...prev.filter((p) => p.id !== injuredB.id), playerIn]);
          setBenchB((prev) => prev.filter((p) => p.id !== repl.id));
          setOffPitchB((prev) => [...prev, injuredB.id]);
          setSubsCountB((s) => s + 1);
          bumpPlayerEvent(injuredB.id, { injured: true });
          setMatchEvents((prev) => [...prev, {
            minute: nextTime, side: 'right', icon: '🩹', text: `Jarohat! ${injuredB.name} maydonni tark etmoqda`,
            sub: `O'rniga: ${playerIn.name}`,
          }]);
          noteTicker({ tickerText: `🩹 ${injuredB.name} jarohat oldi, ${playerIn.name} bilan almashtirildi`, priority: 4 });
        }
      }

      const scoreDiffA = st.score.a - st.score.b;
      const eventA = checkRandomMatchEvent(
        st.teamA, st.currentPlayersA, st.benchA, st.yellowCards, st.redCardsA, nextTime, st.subsCountA, scoreDiffA, st.isRiskA, st.currentPlayersB
      );

      if (eventA) {
        if (eventA.type === 'YELLOW') {
          setYellowCards((prev) => [...prev, eventA.player.id]);
          adjustRating(eventA.player.id, -0.25);
          bumpPlayerEvent(eventA.player.id, { yellow: true });
          bumpMatchStat('a', { fouls: 1 });
          setMatchEvents((prev) => [...prev, { minute: nextTime, side: 'left', icon: '🟨', text: `Sariq: ${eventA.player.name}` }]);
          noteTicker({ tickerText: tickerCard(st.teamB.name, eventA.victim?.name, eventA.player.name, false), priority: 4 });
        } else if (eventA.type === 'RED_FROM_YELLOW' || eventA.type === 'DIRECT_RED') {
          setCurrentPlayersA((prev) => prev.filter((p) => p.id !== eventA.player.id));
          setOffPitchA((prev) => [...prev, eventA.player.id]);
          setRedCardsA((r) => r + 1);
          adjustRating(eventA.player.id, -1.0);
          bumpPlayerEvent(eventA.player.id, { red: true });
          bumpMatchStat('a', { fouls: 1 });
          setMatchEvents((prev) => [...prev, { minute: nextTime, side: 'left', icon: '🟥', text: `QIZIL! ${eventA.player.name}` }]);
          noteTicker({ tickerText: tickerCard(st.teamB.name, eventA.victim?.name, eventA.player.name, true), priority: 5 });
        } else if (eventA.type === 'SUBSTITUTION') {
          setCurrentPlayersA((prev) => [...prev.filter((p) => p.id !== eventA.playerOut.id), eventA.playerIn]);
          setBenchA((prev) => prev.filter((p) => p.id !== eventA.playerIn.id));
          setOffPitchA((prev) => [...prev, eventA.playerOut.id]);
          setSubsCountA((s) => s + 1);
          if (eventA.isRisk) setIsRiskA(true);
          setMatchEvents((prev) => [...prev, {
            minute: nextTime, side: 'left', icon: '🔄', text: 'Almashtirish',
            sub: `⬅️ ${eventA.playerOut.name} | ➡️ ${eventA.playerIn.name} ⚡100%`,
          }]);
          noteTicker({ tickerText: `🔄 Almashtirish: ${eventA.playerIn.name} kirdi`, priority: 3 });
        }
      }

      const scoreDiffB = st.score.b - st.score.a;
      const eventB = checkRandomMatchEvent(
        st.teamB, st.currentPlayersB, st.benchB, st.yellowCards, st.redCardsB, nextTime, st.subsCountB, scoreDiffB, st.isRiskB, st.currentPlayersA
      );

      if (eventB) {
        if (eventB.type === 'YELLOW') {
          setYellowCards((prev) => [...prev, eventB.player.id]);
          adjustRating(eventB.player.id, -0.25);
          bumpPlayerEvent(eventB.player.id, { yellow: true });
          bumpMatchStat('b', { fouls: 1 });
          setMatchEvents((prev) => [...prev, { minute: nextTime, side: 'right', icon: '🟨', text: `Sariq: ${eventB.player.name}` }]);
          noteTicker({ tickerText: tickerCard(st.teamA.name, eventB.victim?.name, eventB.player.name, false), priority: 4 });
        } else if (eventB.type === 'RED_FROM_YELLOW' || eventB.type === 'DIRECT_RED') {
          setCurrentPlayersB((prev) => prev.filter((p) => p.id !== eventB.player.id));
          setOffPitchB((prev) => [...prev, eventB.player.id]);
          setRedCardsB((r) => r + 1);
          adjustRating(eventB.player.id, -1.0);
          bumpPlayerEvent(eventB.player.id, { red: true });
          bumpMatchStat('b', { fouls: 1 });
          setMatchEvents((prev) => [...prev, { minute: nextTime, side: 'right', icon: '🟥', text: `QIZIL! ${eventB.player.name}` }]);
          noteTicker({ tickerText: tickerCard(st.teamA.name, eventB.victim?.name, eventB.player.name, true), priority: 5 });
        } else if (eventB.type === 'SUBSTITUTION') {
          setCurrentPlayersB((prev) => [...prev.filter((p) => p.id !== eventB.playerOut.id), eventB.playerIn]);
          setBenchB((prev) => prev.filter((p) => p.id !== eventB.playerIn.id));
          setOffPitchB((prev) => [...prev, eventB.playerOut.id]);
          setSubsCountB((s) => s + 1);
          if (eventB.isRisk) setIsRiskB(true);
          setMatchEvents((prev) => [...prev, {
            minute: nextTime, side: 'right', icon: '🔄', text: 'Almashtirish',
            sub: `⬅️ ${eventB.playerOut.name} | ➡️ ${eventB.playerIn.name} ⚡100%`,
          }]);
          noteTicker({ tickerText: `🔄 Almashtirish: ${eventB.playerIn.name} kirdi`, priority: 3 });
        }
      }

      if (tickerBest) {
        setLiveTicker(tickerBest.tickerText);
      } else if (nextTime % 2 === 0) {
        const teamName = aHasBall ? st.teamA.name : st.teamB.name;
        if (Math.random() < 0.4) {
          const pool = attackingPlayers.filter((p) => ['ST', 'CF', 'SS', 'LW', 'RW', 'CAM', 'RM', 'LM'].includes(p.pos));
          const carrier = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
          const markerP = carrier ? defendingPlayers.find((p) => ['CB', 'LB', 'RB', 'CDM'].includes(p.pos)) : null;
          setLiveTicker(carrier ? tickerAttackBuildup(teamName, carrier.name, markerP?.name) : tickerPossession(teamName));
        } else {
          setLiveTicker(tickerPossession(teamName));
        }
      }

      applyMicroDeltas(st.currentPlayersA, st.currentPlayersB);

      setMatchTime(nextTime);

      const isNotable = !!(tickerBest && tickerBest.priority >= 3);
      let nextDelay;
      if (isFinishing) {
        nextDelay = SPEED_FINISH;
      } else if (speedMode === 'fast') {
        nextDelay = isNotable ? NOTABLE_FAST : QUIET_FAST;
      } else {
        nextDelay = isNotable ? NOTABLE_NORMAL : QUIET_NORMAL;
      }
      scheduleNext(nextDelay);
    }

    if (!isPaused && !isFinished) {
      const initialDelay = isFinishing ? SPEED_FINISH : (speedMode === 'fast' ? QUIET_FAST : QUIET_NORMAL);
      scheduleNext(initialDelay);
    }

    return () => { cancelled = true; clearTimeout(timeoutId); };
  }, [isPaused, isFinished, speedMode, isFinishing]);

  useEffect(() => {
    if (isFinished) setIsFinishing(false);
  }, [isFinished]);

  useEffect(() => {
    if (isFinished && onFinish && !finishedNotifiedRef.current) {
      finishedNotifiedRef.current = true;
      onFinish({
        scoreA: score.a,
        scoreB: score.b,
        matchEvents,
        goalEvents: goalEventsRef.current,
        playerRatings,
        playerEventsMap,
      });
    }
  }, [isFinished, onFinish, score, matchEvents, playerRatings]);

  const toggleSpeed = () => {
    if (isFinishing) return;
    setSpeedMode((prev) => (prev === 'fast' ? 'normal' : 'fast'));
  };

  const finishMatch = () => {
    if (isFinished || isFinishing) return;
    setIsPaused(false);
    setIsFinishing(true);
  };

  const currentOvrA = calculateDisplayTeamOvr(currentPlayersA);
  const currentOvrB = calculateDisplayTeamOvr(currentPlayersB);

  const yellowA = matchEvents.filter((e) => e.side === 'left' && e.icon === '🟨').length;
  const yellowB = matchEvents.filter((e) => e.side === 'right' && e.icon === '🟨').length;

  const possTotal = possessionMin.a + possessionMin.b || 1;
  const possPctA = Math.round((possessionMin.a / possTotal) * 100);
  const possPctB = 100 - possPctA;

  const renderBadges = (id) => {
    const ev = playerEventsMap[id];
    if (!ev) return null;
    return (
      <span className="player-badges">
        {ev.goals > 0 && <span className="badge-pill badge-goal">⚽{ev.goals > 1 ? `×${ev.goals}` : ''}</span>}
        {ev.assists > 0 && <span className="badge-pill badge-assist">🅰️{ev.assists > 1 ? `×${ev.assists}` : ''}</span>}
        {ev.yellow && <span className="badge-pill badge-yellow">🟨</span>}
        {ev.red && <span className="badge-pill badge-red">🟥</span>}
        {ev.injured && <span className="badge-pill badge-injury">🩹</span>}
      </span>
    );
  };

  const findHistoricPlayer = (team, id) => team.squad.find((p) => p.id === id);

  const manOfMatch = useMemo(() => {
    if (!isFinished) return null;
    const ids = Object.keys(playerRatings);
    if (ids.length === 0) return null;
    let bestId = null;
    let bestVal = -1;
    ids.forEach((id) => {
      if (playerRatings[id] > bestVal) { bestVal = playerRatings[id]; bestId = id; }
    });
    if (!bestId) return null;
    const p = findHistoricPlayer(teamA, bestId) || findHistoricPlayer(teamB, bestId);
    return p ? { name: p.name, rating: bestVal } : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished, playerRatings]);

  return (
    <div className="match-screen">
      {isFinished && onExit && (
        <button className="live-exit-btn" onClick={onExit}>⬅ Chiqish</button>
      )}

      <MatchTablo
        teamA={teamA}
        teamB={teamB}
        score={score}
        matchTime={matchTime}
        addedTime={addedTime}
        isFinished={isFinished}
        isPaused={isPaused}
        isFinishing={isFinishing}
        speedMode={speedMode}
        redCardsA={redCardsA}
        redCardsB={redCardsB}
        liveTicker={liveTicker}
        onTogglePause={() => setIsPaused(!isPaused)}
        onToggleSpeed={toggleSpeed}
        onFinish={finishMatch}
      />

      <div className="match-tabs">
        <button className={`match-tab-btn ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>Summary</button>
        <button className={`match-tab-btn ${activeTab === 'lineups' ? 'active' : ''}`} onClick={() => setActiveTab('lineups')}>Lineups</button>
        <button className={`match-tab-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>Stats</button>
      </div>

      <div className="match-tab-panel">
        {activeTab === 'summary' && (
          <EventLog
            matchEvents={matchEvents}
            liveChances={liveChances}
            teamA={teamA}
            teamB={teamB}
            isRiskA={isRiskA}
            isRiskB={isRiskB}
          />
        )}

        {activeTab === 'lineups' && formationA && formationB && (
          <div>
            <div className="pitches-row">
              <div>
                <div className="pitch-col-title title-a">{teamA.name}</div>
                <div style={{ textAlign: 'center' }}>
                  <span className="formation-badge">{formationA.name}</span>
                </div>
                <div className="pitch">
                  {slotsA.map((s) => (
                    <div key={s.player.id} className="pitch-player" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
                      <div className={`pitch-shirt pos-bg-${s.category.toLowerCase()}`}>{s.player.pos}</div>
                      <span className={`pitch-rating ${ratingClass(getRating(s.player.id))}`}>{getRating(s.player.id).toFixed(1)}</span>
                      <span className="pitch-player-name">{s.player.name.split(' ').slice(-1)[0]}</span>
                      {renderBadges(s.player.id)}
                    </div>
                  ))}
                </div>
                {(benchA.length > 0 || offPitchA.length > 0) && (
                  <div className="bench-list">
                    <div className="squad-header" style={{ marginTop: '10px' }}>Zahira</div>
                    {benchA.map((p) => (
                      <div key={p.id} className="bench-item">{p.name} {renderBadges(p.id)}</div>
                    ))}
                    {offPitchA.map((id) => {
                      const p = findHistoricPlayer(teamA, id);
                      if (!p) return null;
                      return <div key={id} className="bench-item bench-item-off">{p.name} {renderBadges(id)}</div>;
                    })}
                  </div>
                )}
              </div>

              <div>
                <div className="pitch-col-title title-b">{teamB.name}</div>
                <div style={{ textAlign: 'center' }}>
                  <span className="formation-badge">{formationB.name}</span>
                </div>
                <div className="pitch">
                  {slotsB.map((s) => (
                    <div key={s.player.id} className="pitch-player" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
                      <div className={`pitch-shirt pos-bg-${s.category.toLowerCase()}`}>{s.player.pos}</div>
                      <span className={`pitch-rating ${ratingClass(getRating(s.player.id))}`}>{getRating(s.player.id).toFixed(1)}</span>
                      <span className="pitch-player-name">{s.player.name.split(' ').slice(-1)[0]}</span>
                      {renderBadges(s.player.id)}
                    </div>
                  ))}
                </div>
                {(benchB.length > 0 || offPitchB.length > 0) && (
                  <div className="bench-list">
                    <div className="squad-header" style={{ marginTop: '10px' }}>Zahira</div>
                    {benchB.map((p) => (
                      <div key={p.id} className="bench-item">{p.name} {renderBadges(p.id)}</div>
                    ))}
                    {offPitchB.map((id) => {
                      const p = findHistoricPlayer(teamB, id);
                      if (!p) return null;
                      return <div key={id} className="bench-item bench-item-off">{p.name} {renderBadges(id)}</div>;
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="stats-grid">
            <div className="stats-row">
              <span className="stats-val" style={{ color: '#38bdf8' }}>{possPctA}%</span>
              <span className="stats-label">Ball egaligi</span>
              <span className="stats-val" style={{ color: '#f43f5e' }}>{possPctB}%</span>
            </div>
            <div className="stats-row">
              <span className="stats-val" style={{ color: '#38bdf8' }}>{matchStats.a.shots}</span>
              <span className="stats-label">Zarbalar</span>
              <span className="stats-val" style={{ color: '#f43f5e' }}>{matchStats.b.shots}</span>
            </div>
            <div className="stats-row">
              <span className="stats-val" style={{ color: '#38bdf8' }}>{matchStats.a.sot}</span>
              <span className="stats-label">Aniq zarbalar</span>
              <span className="stats-val" style={{ color: '#f43f5e' }}>{matchStats.b.sot}</span>
            </div>
            <div className="stats-row">
              <span className="stats-val" style={{ color: '#38bdf8' }}>{matchStats.a.saves}</span>
              <span className="stats-label">Seyvlar</span>
              <span className="stats-val" style={{ color: '#f43f5e' }}>{matchStats.b.saves}</span>
            </div>
            <div className="stats-row">
              <span className="stats-val" style={{ color: '#38bdf8' }}>{matchStats.a.bigChances}</span>
              <span className="stats-label">Katta imkoniyat</span>
              <span className="stats-val" style={{ color: '#f43f5e' }}>{matchStats.b.bigChances}</span>
            </div>
            <div className="stats-row">
              <span className="stats-val" style={{ color: '#38bdf8' }}>{matchStats.a.corners}</span>
              <span className="stats-label">Burchak zarbasi</span>
              <span className="stats-val" style={{ color: '#f43f5e' }}>{matchStats.b.corners}</span>
            </div>
            <div className="stats-row">
              <span className="stats-val" style={{ color: '#38bdf8' }}>{matchStats.a.offsides}</span>
              <span className="stats-label">Ofsaydlar</span>
              <span className="stats-val" style={{ color: '#f43f5e' }}>{matchStats.b.offsides}</span>
            </div>
            <div className="stats-row">
              <span className="stats-val" style={{ color: '#38bdf8' }}>{matchStats.a.tackles}</span>
              <span className="stats-label">Tacklelar</span>
              <span className="stats-val" style={{ color: '#f43f5e' }}>{matchStats.b.tackles}</span>
            </div>
            <div className="stats-row">
              <span className="stats-val" style={{ color: '#38bdf8' }}>{matchStats.a.fouls}</span>
              <span className="stats-label">Foullar</span>
              <span className="stats-val" style={{ color: '#f43f5e' }}>{matchStats.b.fouls}</span>
            </div>
            <div className="stats-row">
              <span className="stats-val" style={{ color: '#38bdf8' }}>{currentOvrA}</span>
              <span className="stats-label">OVR</span>
              <span className="stats-val" style={{ color: '#f43f5e' }}>{currentOvrB}</span>
            </div>
            <div className="stats-row">
              <span className="stats-val" style={{ color: '#38bdf8' }}>🟨 {yellowA}</span>
              <span className="stats-label">Sariq kartochka</span>
              <span className="stats-val" style={{ color: '#f43f5e' }}>🟨 {yellowB}</span>
            </div>
            <div className="stats-row">
              <span className="stats-val" style={{ color: '#38bdf8' }}>🟥 {redCardsA}</span>
              <span className="stats-label">Qizil kartochka</span>
              <span className="stats-val" style={{ color: '#f43f5e' }}>🟥 {redCardsB}</span>
            </div>
            <div className="stats-row">
              <span className="stats-val" style={{ color: '#38bdf8' }}>🔄 {subsCountA}</span>
              <span className="stats-label">Almashtirishlar</span>
              <span className="stats-val" style={{ color: '#f43f5e' }}>🔄 {subsCountB}</span>
            </div>
            {formationA && formationB && (
              <div className="stats-row">
                <span className="stats-val" style={{ color: '#38bdf8' }}>{formationA.name}</span>
                <span className="stats-label">Taktika</span>
                <span className="stats-val" style={{ color: '#f43f5e' }}>{formationB.name}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {isFinished && manOfMatch && (
        <div className="motm-banner">
          🏅 O'yinning eng yaxshi o'yinchisi: <b>{manOfMatch.name}</b>
          <span className={`pitch-rating ${ratingClass(manOfMatch.rating)}`} style={{ marginLeft: '8px' }}>
            {manOfMatch.rating.toFixed(1)}
          </span>
        </div>
      )}

      {isFinished && onExit && (
        <button onClick={onExit} className="secondary-btn" style={{ marginTop: '16px' }}>
          ⬅ Chiqish
        </button>
      )}
    </div>
  );
}
