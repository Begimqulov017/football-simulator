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
  getPlayerAssistWeight,
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
import { rand, setSeed, clearSeed } from '../utils/rng';
import { simulatePenaltyShootoutDetailed } from '../utils/tournamentEngine';
import {
  RATING_BASE, RATING_EVENTS, rollPasses, performanceToRating, emptyPerf, cleanSheetBonus,
} from '../utils/sofaRating';
import MatchTablo from './MatchTablo';
import EventLog from './EventLog';
import SegmentedTabs from './match/SegmentedTabs';
import PitchCard from './match/PitchCard';
import StatsCard from './match/StatsCard';
import RatingsCard from './match/RatingsCard';
import RatingBadge from './match/RatingBadge';

// ---- VAQT DINAMIKASI (Phase 2) ----
// Oddiy o'yin: 1 soniya = 1 daqiqa.
// Xavfli vaziyat / gol: simulyatsiya 0.3x tezlikka tushadi (1 daqiqa ~3.3 soniya),
// shunda foydalanuvchi sharhni bemalol o'qiy oladi.
// Quick Play: sokin daqiqalar ko'rsatilmasdan o'tkazib yuboriladi, faqat xavfli
// hujumlar, zarbalar va gollar 0.3x tezlikda namoyish etiladi.
const NORMAL_TICK_MS = 1000;
const SLOWMO_FACTOR = 0.3;
const SLOWMO_TICK_MS = Math.round(NORMAL_TICK_MS / SLOWMO_FACTOR); // ~3333ms
const QUICK_QUIET_MS = 8;
const SPEED_FINISH = 8;

const emptyStats = () => ({
  shots: 0, sot: 0, saves: 0, bigChances: 0, offsides: 0, fouls: 0, corners: 0, tackles: 0,
});

// seed — IXTIYORIY (3-band). Berilsa, o'yin butunlay DETERMINISTIK bo'ladi:
// bir xil teamA/teamB/seed bilan boshlangan o'yin har doim AYNAN bir xil
// daqiqa-daqiqa hodisalar bilan tugaydi - umumiy dunyodagi o'yinni istalgan
// foydalanuvchi bir xil ko'rishi va "qayta tomosha" qilish uchun kerak.
// Berilmasa (masalan Tezkor O'yin/eski Turnir), avvalgidek haqiqiy tasodifiy
// bo'lib qoladi.
// shootoutOnDraw — IXTIYORIY (3-band). true bo'lsa va 90+qo'shimcha daqiqada
// hisob teng bo'lsa, natija darhol e'lon qilinmaydi - avval penalti
// seriyasi ZARBA-ZARBA jonli ko'rsatiladi (avval bu butunlay fonda, jim
// hisoblanardi), keyin YAKUNIY (foydalanuvchi ko'rgan) natija bilan
// onFinish chaqiriladi. Berilmasa (ligada durang ruxsat etilgan holatlar),
// avvalgidek durang bilan tugaydi.
export default function LiveMatch({ teamA, teamB, onExit, onFinish, seed, shootoutOnDraw, competition }) {
  useEffect(() => {
    if (seed !== undefined && seed !== null) setSeed(seed);
    else clearSeed();
    return () => clearSeed(); // boshqa (seedsiz) o'yinlarga sirqib chiqmasin
  }, [seed]);

  // Penalti seriyasi holati: null = seriya yo'q/hali boshlanmagan.
  // { kicks, penA, penB, winner, revealed } - `revealed` necha zarba
  // hozircha ekranda ko'rsatilganini bildiradi (animatsiya uchun).
  const [shootout, setShootout] = useState(null);

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

  // Har bir o'yinchi uchun xom performance (pts, daqiqa, paslar). Reyting shundan hisoblanadi.
  const [perf, setPerf] = useState({});
  const [slowMo, setSlowMo] = useState(false);
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

  const playerRatings = useMemo(() => {
    const lookup = new Map([...teamA.squad, ...teamB.squad].map((p) => [p.id, p]));
    const idsA = new Set(teamA.squad.map((p) => p.id));
    const out = {};
    Object.keys(perf).forEach((id) => {
      const player = lookup.get(id) || lookup.get(Number(id)) || {};
      let pf = perf[id];
      if (isFinished) {
        const conceded = idsA.has(player.id) ? score.b : score.a;
        if (conceded === 0) pf = { ...pf, cleanSheetBonus: cleanSheetBonus(player, pf.minutes) };
      }
      out[id] = performanceToRating(pf, player);
    });
    return out;
  }, [perf, isFinished, score, teamA, teamB]);

  const getRating = (id) => (playerRatings[id] !== undefined ? playerRatings[id] : RATING_BASE);

  const addPts = (id, amount) => {
    if (!amount) return;
    setPerf((prev) => {
      const cur = prev[id] || emptyPerf();
      return { ...prev, [id]: { ...cur, pts: cur.pts + amount } };
    });
  };
  const rate = (player, key, arg) => {
    if (!player || player.id === undefined) return;
    addPts(player.id, RATING_EVENTS[key](player, arg));
  };
  const rateTeam = (players, key) => {
    setPerf((prev) => {
      const next = { ...prev };
      (players || []).forEach((p) => {
        const amt = RATING_EVENTS[key](p);
        if (!amt) return;
        const cur = next[p.id] || emptyPerf();
        next[p.id] = { ...cur, pts: cur.pts + amt };
      });
      return next;
    });
  };
  // Gol bo'lganda: gol urgan jamoa o'yinchilari biroz +, o'tkazib yuborganlar -,
  // darvozabon va himoyachilar alohida jazolanadi.
  const applyGoalTeamEffects = (scoringPlayers, concedingPlayers) => {
    rateTeam(scoringPlayers, 'TEAM_GOAL_FOR');
    rateTeam(concedingPlayers, 'TEAM_GOAL_AGAINST');
    (concedingPlayers || []).forEach((p) => {
      rate(p, p.pos === 'GK' ? 'GOAL_CONCEDED_GK' : 'GOAL_CONCEDED_DEF');
    });
  };
  const pickCreator = (attackers, excludeId) => {
    const pool = (attackers || []).filter((p) => p.id !== excludeId && p.pos !== 'GK');
    if (!pool.length) return null;
    const w = pool.map((p) => getPlayerAssistWeight(p));
    const total = w.reduce((a, b) => a + b, 0);
    let r = rand() * total;
    for (let i = 0; i < pool.length; i += 1) {
      if (r <= w[i]) return pool[i];
      r -= w[i];
    }
    return pool[0];
  };

  // Har daqiqada: o'yin vaqti + paslar (aniq/xato) yig'iladi. rand() updater ICHIDA
  // chaqirilmaydi (StrictMode / seed determinizmi uchun) — avval hisoblanadi.
  const applyMinuteTick = (playersA, playersB, shareA) => {
    const ovrA = calculateTeamOvr(playersA);
    const ovrB = calculateTeamOvr(playersB);
    const clampP = (v) => Math.max(0.92, Math.min(1.08, v));
    const rolls = [];
    playersA.forEach((p) => rolls.push({ id: p.id, ...rollPasses(p, shareA, clampP(1 + (ovrB - ovrA) / 150)) }));
    playersB.forEach((p) => rolls.push({ id: p.id, ...rollPasses(p, 1 - shareA, clampP(1 + (ovrA - ovrB) / 150)) }));
    setPerf((prev) => {
      const next = { ...prev };
      rolls.forEach(({ id, att, ok }) => {
        const cur = next[id] || emptyPerf();
        next[id] = { ...cur, minutes: cur.minutes + 1, passAtt: cur.passAtt + att, passOk: cur.passOk + ok };
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

  const applyAttackOutcome = (side, teamKey, outcome, minute, opts = {}) => {
    if (!outcome) return null;
    const isBig = opts.isBig !== false;
    const bigInc = isBig ? 1 : 0;
    // Katta imkoniyat zarbaga olib kelgan bo'lsa — yaratuvchi (key pass) ballanadi
    const creditKeyPass = (shooter) => {
      if (isBig && rand() < 0.65) {
        const c = pickCreator(opts.attackers, shooter.id);
        if (c) rate(c, 'KEY_PASS');
      }
    };

    switch (outcome.result) {
      case 'OFFSIDE': {
        bumpMatchStat(teamKey, { offsides: 1 });
        rate(outcome.scorer, 'OFFSIDE');
        const c = commentaryOffside(outcome.scorer.name);
        setMatchEvents((prev) => [...prev, { minute, side, icon: '❌', text: c.text, sub: c.sub }]);
        return { tickerText: `❌ ${outcome.scorer.name} ofsaydda qolib ketdi`, priority: 3 };
      }
      case 'OWN_GOAL': {
        setScore((s) => ({ ...s, [teamKey]: s[teamKey] + 1 }));
        rate(outcome.player, 'OWN_GOAL');
        applyGoalTeamEffects(opts.attackers, opts.defenders);
        bumpPlayerEvent(outcome.player.id, { ownGoal: 1 });
        setMatchEvents((prev) => [...prev, {
          minute, side, icon: '⚽', text: `GOL! (Avtogol)`, sub: `O'z darvozasiga: ${outcome.player.name}`,
        }]);
        return { tickerText: `⚽ Avtogol! ${outcome.player.name}`, priority: 5 };
      }
      case 'PENALTY_GOAL': {
        setScore((s) => ({ ...s, [teamKey]: s[teamKey] + 1 }));
        bumpMatchStat(teamKey, { shots: 1, sot: 1, bigChances: bigInc });
        rate(outcome.scorer, 'PENALTY_GOAL');
        bumpPlayerEvent(outcome.scorer.id, { goals: 1 });
        applyGoalTeamEffects(opts.attackers, opts.defenders);
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
        rate(outcome.scorer, 'PENALTY_MISSED');
        if (outcome.keeper) rate(outcome.keeper, 'SAVE', true);
        const c = commentaryPenaltyMissed(outcome.scorer.name, outcome.keeper?.name);
        setMatchEvents((prev) => [...prev, { minute, side, icon: '🥅', text: c.text, sub: c.sub }]);
        return { tickerText: `🥅 ${outcome.scorer.name} penaltini otkazib yubordi!`, priority: 4 };
      }
      case 'SAVED': {
        const opponentKey = teamKey === 'a' ? 'b' : 'a';
        bumpMatchStat(teamKey, { shots: 1, sot: 1, bigChances: bigInc });
        bumpMatchStat(opponentKey, { saves: 1 });
        rate(outcome.scorer, 'SHOT_ON_TARGET');
        creditKeyPass(outcome.scorer);
        if (outcome.keeper) {
          rate(outcome.keeper, 'SAVE', isBig);
          bumpPlayerEvent(outcome.keeper.id, { saves: 1 });
        }
        return outcome.keeper
          ? { tickerText: tickerSave(outcome.keeper.name, outcome.scorer.name), priority: isBig ? 4 : 2 }
          : null;
      }
      case 'MISSED': {
        bumpMatchStat(teamKey, { shots: 1, bigChances: isBig ? bigInc : 0 });
        rate(outcome.scorer, isBig ? 'BIG_CHANCE_MISSED' : 'SHOT_OFF_TARGET');
        creditKeyPass(outcome.scorer);
        return { tickerText: isBig ? tickerBigMiss(outcome.scorer.name) : tickerMiss(outcome.scorer.name), priority: isBig ? 4 : 1 };
      }
      case 'GOAL': {
        setScore((s) => ({ ...s, [teamKey]: s[teamKey] + 1 }));
        bumpMatchStat(teamKey, { shots: 1, sot: 1, bigChances: bigInc });
        rate(outcome.scorer, 'GOAL');
        bumpPlayerEvent(outcome.scorer.id, { goals: 1 });
        applyGoalTeamEffects(opts.attackers, opts.defenders);
        if (outcome.assister) {
          rate(outcome.assister, 'ASSIST');
          bumpPlayerEvent(outcome.assister.id, { assists: 1 });
        }
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

  // Natijaga "zarba" va "xavfli vaziyat" bayroqlarini qo'shadi (tezlik boshqaruvi uchun).
  const handleAttackOutcome = (side, teamKey, outcome, minute, opts = {}) => {
    const res = applyAttackOutcome(side, teamKey, outcome, minute, opts);
    if (!res || !outcome) return res;
    const isBig = opts.isBig !== false;
    const isShot = ['GOAL', 'SAVED', 'MISSED', 'PENALTY_GOAL', 'PENALTY_MISSED', 'OWN_GOAL'].includes(outcome.result);
    const isGoal = ['GOAL', 'PENALTY_GOAL', 'OWN_GOAL'].includes(outcome.result);
    return { ...res, shot: isShot, danger: isGoal || (isShot && isBig) };
  };

  useEffect(() => {
    const initAdded = Math.floor(rand() * 6) + 1;
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
      const roll = rand() * 100;

      setCurrentPlayersA((prev) => prev.map((p) => ({
        ...p,
        stamina: Math.max(30, (p.stamina || 100) - (rand() * 0.4 + 0.4)),
      })));
      setCurrentPlayersB((prev) => prev.map((p) => ({
        ...p,
        stamina: Math.max(30, (p.stamina || 100) - (rand() * 0.4 + 0.4)),
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
      let sawShot = false;
      let sawDanger = false;
      const noteTicker = (result) => {
        if (!result) return;
        if (result.shot) sawShot = true;
        if (result.danger) sawDanger = true;
        if (!tickerBest || result.priority > tickerBest.priority) tickerBest = result;
      };

      if (roll < chanceA) {
        const outcome = resolveAttackOutcome(st.currentPlayersA, st.currentPlayersB);
        noteTicker(handleAttackOutcome('left', 'a', outcome, nextTime, { isBig: true, attackers: st.currentPlayersA, defenders: st.currentPlayersB }));
      } else if (roll > 100 - chanceB) {
        const outcome = resolveAttackOutcome(st.currentPlayersB, st.currentPlayersA);
        noteTicker(handleAttackOutcome('right', 'b', outcome, nextTime, { isBig: true, attackers: st.currentPlayersB, defenders: st.currentPlayersA }));
      }

      const rollRegA = rand() * 100;
      if (rollRegA < regChanceA) {
        const outcome = resolveRegularShot(st.currentPlayersA, st.currentPlayersB);
        noteTicker(handleAttackOutcome('left', 'a', outcome, nextTime, { isBig: false, attackers: st.currentPlayersA, defenders: st.currentPlayersB }));
      }
      const rollRegB = rand() * 100;
      if (rollRegB < regChanceB) {
        const outcome = resolveRegularShot(st.currentPlayersB, st.currentPlayersA);
        noteTicker(handleAttackOutcome('right', 'b', outcome, nextTime, { isBig: false, attackers: st.currentPlayersB, defenders: st.currentPlayersA }));
      }

      if (rollOffside(st.currentPlayersA)) bumpMatchStat('a', { offsides: 1 });
      if (rollOffside(st.currentPlayersB)) bumpMatchStat('b', { offsides: 1 });

      const possWeightA = getPossessionWeight(st.currentPlayersA);
      const possWeightB = getPossessionWeight(st.currentPlayersB);
      const aHasBall = rand() < possWeightA / ((possWeightA + possWeightB) || 1);
      setPossessionMin((prev) => ({
        a: prev.a + (aHasBall ? 1 : 0),
        b: prev.b + (aHasBall ? 0 : 1),
      }));

      const defendingPlayers = aHasBall ? st.currentPlayersB : st.currentPlayersA;
      const attackingPlayers = aHasBall ? st.currentPlayersA : st.currentPlayersB;
      const { tackle, corner } = rollBackgroundStats(attackingPlayers, defendingPlayers);
      if (tackle) {
        bumpMatchStat(aHasBall ? 'b' : 'a', { tackles: 1 });
        const tacklers = defendingPlayers.filter((p) => ['CB', 'LB', 'RB', 'CDM', 'CM'].includes(p.pos));
        if (tacklers.length) rate(tacklers[Math.floor(rand() * tacklers.length)], 'TACKLE_WON');
        if (rand() < 0.25) {
          const defenders = defendingPlayers.filter((p) => ['CB', 'LB', 'RB', 'CDM'].includes(p.pos));
          const attackers = attackingPlayers.filter((p) => ['ST', 'CF', 'SS', 'LW', 'RW', 'CAM'].includes(p.pos));
          if (defenders.length && attackers.length) {
            const d = defenders[Math.floor(rand() * defenders.length)];
            const a = attackers[Math.floor(rand() * attackers.length)];
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
        bumpMatchStat('a', { fouls: 1 }); rate(plainFoulA, 'FOUL');
        const victimB = st.currentPlayersB.find((p) => ['ST', 'CF', 'LW', 'RW', 'CAM'].includes(p.pos)) || st.currentPlayersB[0];
        noteTicker({ tickerText: tickerFreeKick(st.teamB.name, victimB?.name || 'raqib'), priority: 1 });
      }
      const plainFoulB = checkPlainFoul(st.currentPlayersB);
      if (plainFoulB) {
        bumpMatchStat('b', { fouls: 1 }); rate(plainFoulB, 'FOUL');
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
          rate(eventA.player, 'YELLOW');
          bumpPlayerEvent(eventA.player.id, { yellow: true });
          bumpMatchStat('a', { fouls: 1 });
          setMatchEvents((prev) => [...prev, { minute: nextTime, side: 'left', icon: '🟨', text: `Sariq: ${eventA.player.name}` }]);
          noteTicker({ tickerText: tickerCard(st.teamB.name, eventA.victim?.name, eventA.player.name, false), priority: 4 });
        } else if (eventA.type === 'RED_FROM_YELLOW' || eventA.type === 'DIRECT_RED') {
          setCurrentPlayersA((prev) => prev.filter((p) => p.id !== eventA.player.id));
          setOffPitchA((prev) => [...prev, eventA.player.id]);
          setRedCardsA((r) => r + 1);
          rate(eventA.player, 'RED');
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
          rate(eventB.player, 'YELLOW');
          bumpPlayerEvent(eventB.player.id, { yellow: true });
          bumpMatchStat('b', { fouls: 1 });
          setMatchEvents((prev) => [...prev, { minute: nextTime, side: 'right', icon: '🟨', text: `Sariq: ${eventB.player.name}` }]);
          noteTicker({ tickerText: tickerCard(st.teamA.name, eventB.victim?.name, eventB.player.name, false), priority: 4 });
        } else if (eventB.type === 'RED_FROM_YELLOW' || eventB.type === 'DIRECT_RED') {
          setCurrentPlayersB((prev) => prev.filter((p) => p.id !== eventB.player.id));
          setOffPitchB((prev) => [...prev, eventB.player.id]);
          setRedCardsB((r) => r + 1);
          rate(eventB.player, 'RED');
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
        if (rand() < 0.4) {
          const pool = attackingPlayers.filter((p) => ['ST', 'CF', 'SS', 'LW', 'RW', 'CAM', 'RM', 'LM'].includes(p.pos));
          const carrier = pool.length ? pool[Math.floor(rand() * pool.length)] : null;
          const markerP = carrier ? defendingPlayers.find((p) => ['CB', 'LB', 'RB', 'CDM'].includes(p.pos)) : null;
          setLiveTicker(carrier ? tickerAttackBuildup(teamName, carrier.name, markerP?.name) : tickerPossession(teamName));
        } else {
          setLiveTicker(tickerPossession(teamName));
        }
      }

      applyMinuteTick(st.currentPlayersA, st.currentPlayersB, possWeightA / ((possWeightA + possWeightB) || 1));

      setMatchTime(nextTime);

      // Gol, xavfli imkoniyat yoki qizil kartochka = "xavfli vaziyat". Quick Play'da
      // oddiy zarbalar ham ko'rsatiladi; sokin daqiqalar deyarli bir zumda o'tadi.
      const isDanger = sawDanger || !!(tickerBest && tickerBest.priority >= 5);
      const slow = speedMode === 'quick' ? (isDanger || sawShot) : isDanger;
      let nextDelay;
      if (isFinishing) {
        nextDelay = SPEED_FINISH;
      } else if (slow) {
        nextDelay = SLOWMO_TICK_MS;
      } else {
        nextDelay = speedMode === 'quick' ? QUICK_QUIET_MS : NORMAL_TICK_MS;
      }
      setSlowMo(!isFinishing && slow);
      scheduleNext(nextDelay);
    }

    if (!isPaused && !isFinished) {
      const initialDelay = isFinishing ? SPEED_FINISH : (speedMode === 'quick' ? QUICK_QUIET_MS : NORMAL_TICK_MS);
      scheduleNext(initialDelay);
    }

    return () => { cancelled = true; clearTimeout(timeoutId); };
  }, [isPaused, isFinished, speedMode, isFinishing]);

  useEffect(() => {
    if (isFinished) { setIsFinishing(false); setSlowMo(false); }
  }, [isFinished]);

  const shootoutNeeded = !!(shootoutOnDraw && isFinished && score.a === score.b);

  // Penalti seriyasi hisoblanadi (bir marta) - o'yin tugagach, hisob teng
  // bo'lsa. Seed o'rnatilgan bo'lsa (umumiy dunyo o'yini), bu hisoblash ham
  // takrorlanuvchan - xuddi shu o'yin qayta ochilsa aynan shu seriya chiqadi.
  useEffect(() => {
    if (shootoutNeeded && !shootout) {
      setShootout({ ...simulatePenaltyShootoutDetailed(teamA, teamB), revealed: 0 });
    }
  }, [shootoutNeeded, shootout, teamA, teamB]);

  // Zarbalar birma-bir (har 650ms) ochiladi - fondagi "jim" hisoblash o'rniga
  // foydalanuvchi har bir zarbani jonli kuzatadi.
  useEffect(() => {
    if (!shootout || shootout.revealed >= shootout.kicks.length) return;
    const t = setTimeout(() => {
      setShootout((s) => (s ? { ...s, revealed: s.revealed + 1 } : s));
    }, 650);
    return () => clearTimeout(t);
  }, [shootout]);

  // Penalti kerak bo'lmagan (yoki durang ruxsat etilgan) holatda - avvalgidek darhol.
  useEffect(() => {
    if (isFinished && onFinish && !shootoutNeeded && !finishedNotifiedRef.current) {
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
  }, [isFinished, onFinish, score, matchEvents, playerRatings, shootoutNeeded]);

  // Penalti seriyasi to'liq ko'rsatilgach, foydalanuvchi "Davom etish"
  // bosgandan keyin chaqiriladi (pastdagi render bo'limida tugma bor).
  const finishAfterShootout = () => {
    if (finishedNotifiedRef.current || !shootout || !onFinish) return;
    finishedNotifiedRef.current = true;
    onFinish({
      scoreA: score.a,
      scoreB: score.b,
      matchEvents,
      goalEvents: goalEventsRef.current,
      playerRatings,
      playerEventsMap,
      penA: shootout.penA,
      penB: shootout.penB,
      penWinner: shootout.winner,
      penKicks: shootout.kicks,
    });
  };

  const toggleSpeed = () => {
    if (isFinishing) return;
    setSpeedMode((prev) => (prev === 'quick' ? 'normal' : 'quick'));
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

  const findHistoricPlayer = (team, id) => team.squad.find((p) => p.id === id);

  // Jamoa bo'yicha pas statistikasi va reyting qatorlari
  const { rowsA, rowsB, passA, passB } = useMemo(() => {
    const build = (team) => {
      const ids = new Set(team.squad.map((p) => p.id));
      let att = 0;
      let ok = 0;
      const rows = [];
      Object.keys(perf).forEach((key) => {
        const pf = perf[key];
        const player = team.squad.find((p) => String(p.id) === key);
        if (!player || !ids.has(player.id)) return;
        att += pf.passAtt;
        ok += pf.passOk;
        const ev = playerEventsMap[player.id] || {};
        rows.push({
          id: player.id, name: player.name, pos: player.pos, rating: playerRatings[key] ?? RATING_BASE,
          minutes: pf.minutes, passAtt: pf.passAtt, passOk: pf.passOk,
          goals: ev.goals || 0, assists: ev.assists || 0, saves: ev.saves || 0,
        });
      });
      rows.sort((x, y) => y.rating - x.rating);
      return { rows, att, ok };
    };
    const a = build(teamA);
    const b = build(teamB);
    return { rowsA: a.rows, rowsB: b.rows, passA: a, passB: b };
  }, [perf, playerRatings, playerEventsMap, teamA, teamB]);

  const motm = useMemo(() => {
    const all = [...rowsA, ...rowsB];
    if (!all.length) return null;
    const best = all.reduce((m, r) => (r.rating > m.rating ? r : m), all[0]);
    return { name: best.name, rating: best.rating };
  }, [rowsA, rowsB]);

  const accPct = (t) => (t.att ? Math.round((t.ok / t.att) * 100) : 0);

  const statRows = [
    { label: 'Ball egaligi', a: possPctA, b: possPctB, suffix: '%', highlight: true },
    { label: 'Zarbalar', a: matchStats.a.shots, b: matchStats.b.shots },
    { label: 'Aniq zarbalar', a: matchStats.a.sot, b: matchStats.b.sot },
    { label: 'Katta imkoniyat', a: matchStats.a.bigChances, b: matchStats.b.bigChances },
    { label: 'Seyvlar', a: matchStats.a.saves, b: matchStats.b.saves },
    { label: 'Paslar', a: passA.att, b: passB.att },
    { label: 'Pas aniqligi', a: accPct(passA), b: accPct(passB), suffix: '%' },
    { label: 'Burchak zarbasi', a: matchStats.a.corners, b: matchStats.b.corners },
    { label: 'Ofsaydlar', a: matchStats.a.offsides, b: matchStats.b.offsides },
    { label: 'Tacklelar', a: matchStats.a.tackles, b: matchStats.b.tackles },
    { label: 'Foullar', a: matchStats.a.fouls, b: matchStats.b.fouls },
    { label: 'Sariq kartochka', a: yellowA, b: yellowB },
    { label: 'Qizil kartochka', a: redCardsA, b: redCardsB },
    { label: 'Almashtirishlar', a: subsCountA, b: subsCountB },
    { label: 'OVR', a: currentOvrA, b: currentOvrB },
  ];

  const TABS = [
    { key: 'summary', label: 'Summary' },
    { key: 'lineups', label: 'Lineups' },
    { key: 'stats', label: 'Stats' },
    { key: 'ratings', label: 'Ratings' },
  ];

  const penA = shootout ? shootout.kicks.slice(0, shootout.revealed).filter((k) => k.side === 'a' && k.scored).length : 0;
  const penB = shootout ? shootout.kicks.slice(0, shootout.revealed).filter((k) => k.side === 'b' && k.scored).length : 0;

  return (
    <div className="font-sans text-ink bg-surface rounded-card p-3 sm:p-5 flex flex-col gap-4 w-full max-w-3xl mx-auto">
      {isFinished && onExit && (
        <button
          type="button"
          onClick={onExit}
          className="self-start text-sm font-bold text-ink-soft hover:text-ink bg-surface-card border border-surface-line rounded-control px-3 py-1.5 shadow-soft transition-colors"
        >
          ⬅ Chiqish
        </button>
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
        slowMo={slowMo}
        redCardsA={redCardsA}
        redCardsB={redCardsB}
        liveTicker={liveTicker}
        competition={competition}
        onTogglePause={() => setIsPaused(!isPaused)}
        onToggleSpeed={toggleSpeed}
        onFinish={finishMatch}
      />

      <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PitchCard
            team={teamA} formation={formationA} slots={slotsA} tone="accent"
            getRating={getRating} playerEventsMap={playerEventsMap}
            bench={benchA} offPitch={offPitchA} findPlayer={findHistoricPlayer}
          />
          <PitchCard
            team={teamB} formation={formationB} slots={slotsB} tone="brand"
            getRating={getRating} playerEventsMap={playerEventsMap}
            bench={benchB} offPitch={offPitchB} findPlayer={findHistoricPlayer}
          />
        </div>
      )}

      {activeTab === 'stats' && <StatsCard teamA={teamA} teamB={teamB} rows={statRows} />}

      {activeTab === 'ratings' && (
        <RatingsCard teamA={teamA} teamB={teamB} rowsA={rowsA} rowsB={rowsB} motm={motm} isFinished={isFinished} />
      )}

      {shootout && (
        <section className="bg-surface-card border border-surface-line rounded-card shadow-soft p-5 text-center">
          <div className="text-xs font-extrabold uppercase tracking-wide text-ink-muted">⚽ Penalti seriyasi</div>
          <div className="text-4xl font-black tabular-nums my-2">{penA} <span className="text-ink-subtle">-</span> {penB}</div>
          <div className="flex justify-center gap-1.5 flex-wrap mb-3">
            {shootout.kicks.slice(0, shootout.revealed).map((k, i) => (
              <span
                key={i}
                title={`${k.kicker?.name || '?'} (${k.side === 'a' ? teamA.name : teamB.name})`}
                className={`w-6 h-6 rounded-full text-xs font-extrabold text-white flex items-center justify-center motion-safe:animate-fs-pop ${k.scored ? 'bg-brand' : 'bg-red-500'}`}
              >
                {k.scored ? '✓' : '✗'}
              </span>
            ))}
          </div>
          {shootout.revealed < shootout.kicks.length ? (
            <div className="text-sm text-ink-muted">
              {(() => {
                const next = shootout.kicks[shootout.revealed];
                return next ? `Zarba: ${next.kicker?.name || '?'} (${next.side === 'a' ? teamA.name : teamB.name})` : '';
              })()}
            </div>
          ) : (
            <>
              <div className="text-sm text-ink-soft mb-3">
                G'olib: <b>{shootout.winner === 'a' ? teamA.name : teamB.name}</b> ({shootout.penA} - {shootout.penB})
              </div>
              <button
                type="button"
                onClick={finishAfterShootout}
                className="bg-brand hover:bg-brand-dark text-white font-bold text-sm rounded-control border-0 cursor-pointer px-4 py-2 transition-colors"
              >
                Davom etish →
              </button>
            </>
          )}
        </section>
      )}

      {isFinished && motm && (
        <div className="flex items-center justify-center gap-3 bg-surface-card border border-surface-line rounded-card shadow-soft px-4 py-3 text-sm">
          <span>🏅 O'yinning eng yaxshi o'yinchisi:</span>
          <b>{motm.name}</b>
          <RatingBadge value={motm.rating} size="md" />
        </div>
      )}

      {isFinished && onExit && (
        <button
          type="button"
          onClick={onExit}
          className="bg-surface-card hover:bg-surface-muted border border-surface-line text-ink font-bold text-sm rounded-control px-4 py-2.5 shadow-soft transition-colors"
        >
          ⬅ Chiqish
        </button>
      )}
    </div>
  );
}
