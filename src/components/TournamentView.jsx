import React, { useState, useEffect, useRef } from 'react';
import {
  computeStandings, simulateAllFixtures, simulateNextRound, advanceGroupsToKnockout,
  simulateKnockoutRound, simulateThirdPlaceMatch, getTournamentAwards, getTeamOfTournament,
  advanceCLLeagueToPlayoff, simulateCLPlayoffRound, registerLiveMatchStats,
  resolveTie, finalizeKnockoutRoundIfComplete, finalizeCLPlayoffIfComplete,
} from '../utils/tournamentEngine';
import LiveMatch from './LiveMatch';

const AUTO_PLAY_DELAY = 900;

function StandingsTable({ standings, teamsById, advanceCount }) {
  return (
    <table className="standings-table">
      <thead>
        <tr>
          <th>#</th><th>Jamoa</th><th>O</th><th>G</th><th>D</th><th>M</th><th>GF</th><th>GA</th><th>GD</th><th>X</th>
        </tr>
      </thead>
      <tbody>
        {standings.map((s, idx) => {
          const qualified = advanceCount && idx < advanceCount;
          // Zebra-chiziqlar oddiy juft/toq klass sifatida qo'llanadi (Tailwind
          // even:/odd: pseudo-klasslari emas) — chunki :nth-child tanlagichi
          // specificity jihatidan `.standings-qualified` dan ustun kelib, uni
          // bosib ketishi mumkin edi. Bu yerda ikkalasi ham bir xil (0,1,0)
          // specificity'da, shuning uchun index.css'dagi `.standings-qualified`
          // (bu Tailwind utilitylardan keyin yoziladi) yashil ajratishni saqlab qoladi.
          const zebra = idx % 2 === 0 ? 'bg-slate-900/50' : 'bg-slate-800/50';
          return (
            <tr key={s.id} className={`${zebra} ${qualified ? 'standings-qualified' : ''}`}>
              <td>{idx + 1}</td>
              <td className="standings-team">{teamsById[s.id]?.logo} {teamsById[s.id]?.name}</td>
              <td>{s.played}</td><td>{s.won}</td><td>{s.draw}</td><td>{s.lost}</td>
              <td>{s.gf}</td><td>{s.ga}</td><td>{s.gd}</td><td><b>{s.points}</b></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ScorerLine({ events }) {
  if (!events || events.length === 0) return null;
  return (
    <div className="fixture-scorers">
      {events.map((ev, i) => (
        <span key={i} className={`scorer-tag ${ev.teamKey === 'a' ? 'scorer-a' : 'scorer-b'}`}>
          ⚽ {ev.scorerName} {ev.minute}'{ev.assisterName ? ` (${ev.assisterName})` : ''}
        </span>
      ))}
    </div>
  );
}

function FixtureRoundNav({ rounds, activeRound, setActiveRound }) {
  if (rounds.length <= 1) return null;
  const idx = rounds.indexOf(activeRound);
  return (
    <div className="round-nav">
      <button className="round-nav-btn" disabled={idx <= 0} onClick={() => setActiveRound(rounds[idx - 1])}>‹</button>
      <span className="round-nav-label">{activeRound}-tur</span>
      <button className="round-nav-btn" disabled={idx >= rounds.length - 1} onClick={() => setActiveRound(rounds[idx + 1])}>›</button>
    </div>
  );
}

function FixtureList({ fixtures, teamsById, onPlay }) {
  const rounds = [...new Set(fixtures.map((f) => f.round))].sort((a, b) => a - b);
  const [activeRound, setActiveRound] = useState(rounds[0]);
  useEffect(() => {
    const lastPlayedRound = [...fixtures].reverse().find((f) => f.scoreHome != null)?.round;
    if (lastPlayedRound && rounds.includes(lastPlayedRound)) setActiveRound(lastPlayedRound);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixtures.length, fixtures.filter((f) => f.scoreHome != null).length]);

  const shown = fixtures.filter((f) => f.round === activeRound);

  return (
    <div className="fixture-list">
      <FixtureRoundNav rounds={rounds} activeRound={activeRound} setActiveRound={setActiveRound} />
      {shown.map((f, i) => (
        <div key={i} className="fixture-block">
          <div className="fixture-row">
            <span>{teamsById[f.home]?.logo} {teamsById[f.home]?.name}</span>
            {f.scoreHome != null ? (
              <span className="fixture-score">{f.scoreHome} - {f.scoreAway}</span>
            ) : onPlay ? (
              <button className="fixture-play-btn" onClick={() => onPlay(f)}>▶ Oynash</button>
            ) : (
              <span className="fixture-score">vs</span>
            )}
            <span>{teamsById[f.away]?.logo} {teamsById[f.away]?.name}</span>
          </div>
          <ScorerLine events={f.events} />
        </div>
      ))}
    </div>
  );
}

function KnockoutFixture({ fixture, teamsById, twoLegged, onPlayLeg }) {
  if (!fixture) return null;
  const homeT = teamsById[fixture.home];
  const awayT = fixture.away ? teamsById[fixture.away] : null;

  if (!awayT) {
    return <div className="ko-fixture ko-bye">{homeT?.logo} {homeT?.name} — bye (avtomatik o'tdi)</div>;
  }

  const needsLeg1 = !fixture.winnerId && !fixture.leg1;
  const needsLeg2 = !fixture.winnerId && twoLegged && !!fixture.leg1 && !fixture.leg2;

  return (
    <div className={`ko-fixture ${fixture.winnerId ? 'ko-done' : ''}`}>
      <div className="ko-fixture-main">
        <div className="ko-team">
          {fixture.winnerId === fixture.home && <span className="ko-winner-mark">🏆</span>}
          {homeT?.logo} {homeT?.name}
        </div>
        <div className="ko-score">
          {fixture.leg1
            ? twoLegged && fixture.leg2
              ? `${fixture.leg1.scoreHome}-${fixture.leg1.scoreAway} / ${fixture.leg2.scoreHome}-${fixture.leg2.scoreAway} (${fixture.aggA}-${fixture.aggB})${fixture.penA != null ? ` [p: ${fixture.penA}-${fixture.penB}]` : ''}`
              : `${fixture.leg1.scoreHome}-${fixture.leg1.scoreAway}${fixture.penA != null ? ` [p: ${fixture.penA}-${fixture.penB}]` : ''}`
            : 'vs'}
        </div>
        <div className="ko-team">
          {fixture.winnerId === fixture.away && <span className="ko-winner-mark">🏆</span>}
          {awayT?.logo} {awayT?.name}
        </div>
      </div>
      {fixture.leg1 && <ScorerLine events={fixture.leg1.events} />}
      {fixture.leg2 && <ScorerLine events={fixture.leg2.events} />}
      {onPlayLeg && needsLeg1 && (
        <button
          className="fixture-play-btn"
          style={{ marginTop: '8px', alignSelf: 'center' }}
          onClick={() => onPlayLeg(fixture, 1)}
        >
          ▶ {twoLegged ? "1-o'yinni O'ynash" : "O'ynash"}
        </button>
      )}
      {onPlayLeg && needsLeg2 && (
        <button
          className="fixture-play-btn"
          style={{ marginTop: '8px', alignSelf: 'center' }}
          onClick={() => onPlayLeg(fixture, 2)}
        >
          ▶ 2-o'yinni O'ynash (qaytar)
        </button>
      )}
    </div>
  );
}

const LEADERBOARD_VIEWS = ['jadval', 'bombardir', 'assist', 'kartochka', 'best'];
const LEADERBOARD_LABELS = {
  jadval: '📊 Jadval', bombardir: '⚽ Bombardirlar', assist: '🎯 Assistlar',
  kartochka: '🟨 Kartochkalar', best: '🏅 Eng yaxshi o\'yinchi',
};

function ExpandableLeaderboard({ tournament, teamsById }) {
  const [view, setView] = useState('jadval');
  const stats = Object.values(tournament.playerStats || {});

  const cycle = (dir) => {
    const idx = LEADERBOARD_VIEWS.indexOf(view);
    const next = (idx + dir + LEADERBOARD_VIEWS.length) % LEADERBOARD_VIEWS.length;
    setView(LEADERBOARD_VIEWS[next]);
  };

  if (view === 'jadval') {
    return (
      <div className="leaderboard-toggle">
        <button className="round-nav-btn" onClick={() => cycle(1)}>›</button>
      </div>
    );
  }

  let rows = [];
  if (view === 'bombardir') rows = [...stats].filter((s) => s.goals > 0).sort((a, b) => b.goals - a.goals).slice(0, 10);
  else if (view === 'assist') rows = [...stats].filter((s) => s.assists > 0).sort((a, b) => b.assists - a.assists).slice(0, 10);
  else if (view === 'kartochka') rows = [...stats].filter((s) => s.yellow > 0 || s.red > 0).sort((a, b) => (b.yellow + b.red * 3) - (a.yellow + a.red * 3)).slice(0, 10);
  else if (view === 'best') rows = [...stats].filter((s) => s.appearances > 0).sort((a, b) => (b.ratingSum / b.appearances) - (a.ratingSum / a.appearances)).slice(0, 10);

  return (
    <div className="leaderboard-panel">
      <div className="leaderboard-header">
        <button className="round-nav-btn" onClick={() => cycle(-1)}>‹</button>
        <span>{LEADERBOARD_LABELS[view]}</span>
        <button className="round-nav-btn" onClick={() => cycle(1)}>›</button>
      </div>
      {rows.length === 0 && <div className="no-results">Hali ma'lumot yo'q</div>}
      {rows.map((s, i) => (
        <div key={s.id} className="leaderboard-row">
          <span>{i + 1}. {s.name} <span className="lb-team">({teamsById[s.teamId]?.name})</span></span>
          <span>
            {view === 'bombardir' && `${s.goals} gol`}
            {view === 'assist' && `${s.assists} assist`}
            {view === 'kartochka' && `🟨${s.yellow} 🟥${s.red}`}
            {view === 'best' && `${(s.ratingSum / s.appearances).toFixed(2)}`}
          </span>
        </div>
      ))}
    </div>
  );
}

function AwardsPanel({ tournament, teamsById }) {
  const awards = getTournamentAwards(tournament);
  if (!awards || (!awards.topScorer && !awards.topAssist && !awards.mvp)) return null;

  return (
    <div className="awards-panel">
      <div className="squad-header" style={{ marginBottom: '8px' }}>🏅 Turnir Sovrinlari</div>
      {awards.topScorer && (
        <div className="award-row">
          <span>⚽ Top Bombardir</span>
          <span><b>{awards.topScorer.name}</b> ({teamsById[awards.topScorer.teamId]?.name}) — {awards.topScorer.goals} gol</span>
        </div>
      )}
      {awards.topAssist && (
        <div className="award-row">
          <span>🎯 Top Assist</span>
          <span><b>{awards.topAssist.name}</b> ({teamsById[awards.topAssist.teamId]?.name}) — {awards.topAssist.assists} assist</span>
        </div>
      )}
      {awards.mvp && (
        <div className="award-row">
          <span>🏆 Turnirning Eng Yaxshi O'yinchisi</span>
          <span><b>{awards.mvp.name}</b> ({teamsById[awards.mvp.teamId]?.name}) — o'rtacha {(awards.mvp.ratingSum / awards.mvp.appearances).toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

function TeamOfTournament({ tournament, teamsById }) {
  const xi = getTeamOfTournament(tournament);
  if (!xi) return null;
  return (
    <div className="awards-panel" style={{ marginTop: '14px' }}>
      <div className="squad-header" style={{ marginBottom: '8px' }}>🌟 Turnirning Eng Yaxshi 11tasi</div>
      {xi.map((p) => (
        <div key={p.id} className="award-row">
          <span><b className={`pos-tag`}>{p.pos}</b> {p.name} <span className="lb-team">({teamsById[p.teamId]?.name})</span></span>
          <span>{p.avgRating.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

export default function TournamentView({ tournament, teams, onUpdate, onBack, onDelete }) {
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [liveFixture, setLiveFixture] = useState(null); // { teamAObj, teamBObj, resolve }
  const autoPlayRef = useRef(false);
  const teamsById = {};
  teams.forEach((t) => { teamsById[t.id] = t; });

  const persist = (t) => onUpdate({ ...t });

  // Bitta fiksturani JONLI (Tezkor O'yindagi kabi) o'ynatadi. `resolve(result)` shu
  // fiksturaning maqomini (score/leg) yangilaydi va turnirni saqlaydi.
  // `opts.shootoutOnDraw` — true bo'lsa, hisob teng tugasa LiveMatch penalti
  // seriyasini JONLI ko'rsatadi (3-band); shu holatda `result.penA/penB/
  // penWinner` ham keladi va `resolve` shularni bracketga yozishi kerak.
  const playFixtureLive = (homeId, awayId, resolve, opts) => {
    setLiveFixture({ teamAObj: teamsById[homeId], teamBObj: teamsById[awayId], resolve, shootoutOnDraw: !!opts?.shootoutOnDraw });
  };

  // Jonli o'yin tugagach chaqiriladi: fikstura/bracket holatini yozadi va turnirni
  // saqlaydi, LEKIN oynani darhol yopmaydi — foydalanuvchi natijani (MOTM, statistika)
  // ko'rib, keyin "⬅ Chiqish" tugmasini bosgach turnir holatiga qaytadi (handleLiveExit).
  const handleLiveFinish = (result) => {
    if (!liveFixture) return;
    const t = JSON.parse(JSON.stringify(tournament));
    liveFixture.resolve(t, result, liveFixture.teamAObj, liveFixture.teamBObj);
    registerLiveMatchStats(t, liveFixture.teamAObj, liveFixture.teamBObj, result.playerRatings, result.playerEventsMap);
    persist(t);
  };

  const handleLiveExit = () => setLiveFixture(null);

  const isRoundRobin = tournament.format === 'round_robin';
  const isKnockout = tournament.format === 'knockout';
  const isGroupFormat = tournament.format === 'group_knockout';
  const isCL = tournament.format === 'champions_league';

  const inKnockoutPhase = (isKnockout && tournament.bracket) || (isGroupFormat && tournament.phase === 'knockout') || (isCL && tournament.clPhase === 'knockout');

  const isFullyDone = () => tournament.status === 'completed';

  // ============================================================
  // JONLI (LiveMatch) BITTA FIKSTURANI O'YNASH — har bir format uchun
  // ============================================================

  // LIGA (round robin)
  const handlePlayRoundRobinFixture = (f) => {
    playFixtureLive(f.home, f.away, (t, result) => {
      const fixture = t.fixtures.find(
        (x) => x.round === f.round && x.home === f.home && x.away === f.away && x.scoreHome == null
      );
      if (!fixture) return;
      fixture.scoreHome = result.scoreA;
      fixture.scoreAway = result.scoreB;
      fixture.events = result.goalEvents || [];
      const allPlayed = t.fixtures.every((x) => x.scoreHome != null);
      if (allPlayed) {
        const standings = computeStandings(t.teamIds, t.fixtures);
        t.status = 'completed';
        t.champion = standings[0]?.id;
      }
    });
  };

  // GURUH BOSQICHI (group_knockout)
  const handlePlayGroupFixture = (groupIdx, f) => {
    playFixtureLive(f.home, f.away, (t, result) => {
      const group = t.groups[groupIdx];
      if (!group) return;
      const fixture = group.fixtures.find(
        (x) => x.round === f.round && x.home === f.home && x.away === f.away && x.scoreHome == null
      );
      if (!fixture) return;
      fixture.scoreHome = result.scoreA;
      fixture.scoreAway = result.scoreB;
      fixture.events = result.goalEvents || [];
      const allDone = t.groups.every((gr) => gr.fixtures.every((x) => x.scoreHome != null));
      if (allDone) advanceGroupsToKnockout(t, teamsById);
    });
  };

  // CHAMPIONS LEAGUE — liga fazasi
  const handlePlayCLLeagueFixture = (f) => {
    playFixtureLive(f.home, f.away, (t, result) => {
      const fixture = t.leagueFixtures.find(
        (x) => x.round === f.round && x.home === f.home && x.away === f.away && x.scoreHome == null
      );
      if (!fixture) return;
      fixture.scoreHome = result.scoreA;
      fixture.scoreAway = result.scoreB;
      fixture.events = result.goalEvents || [];
      const allDone = t.leagueFixtures.every((x) => x.scoreHome != null);
      if (allDone) advanceCLLeagueToPlayoff(t);
    });
  };

  // CHAMPIONS LEAGUE — pley-off (har doim 2 legli)
  const handlePlayCLPlayoffLeg = (fixture, legNumber) => {
    const hostId = legNumber === 1 ? fixture.home : fixture.away;
    const guestId = legNumber === 1 ? fixture.away : fixture.home;
    playFixtureLive(hostId, guestId, (t, result) => {
      const target = t.playoffBracket.find(
        (x) => x.home === fixture.home && x.away === fixture.away && !x.winnerId
      );
      if (!target) return;
      if (legNumber === 1) {
        target.leg1 = { scoreHome: result.scoreA, scoreAway: result.scoreB, events: result.goalEvents || [] };
      } else {
        target.leg2 = { scoreHome: result.scoreB, scoreAway: result.scoreA, events: result.goalEvents || [] };
      }
      if (target.leg1 && target.leg2) {
        const tie = resolveTie(target, teamsById);
        target.winnerId = tie.winnerId;
        target.aggA = tie.aggA; target.aggB = tie.aggB;
        target.penA = tie.penA; target.penB = tie.penB;
      }
      finalizeCLPlayoffIfComplete(t);
    });
  };

  // PLEY-OFF DARAXTI (knockout, group_knockout va CL knockout fazalarining barchasi
  // shu bracket strukturasidan foydalanadi)
  const handlePlayKnockoutLeg = (fixture, legNumber, useTwoLegged) => {
    const hostId = legNumber === 1 ? fixture.home : fixture.away;
    const guestId = legNumber === 1 ? fixture.away : fixture.home;
    // Faqat BIR TURLI (single-leg) o'yinda oldindan bilib bo'ladi: durang =
    // penalti kerak. Ikki turli o'yinlarda YIG'INDI hisobi kerak (leg2ning
    // o'zi teng bo'lishi shart emas), shuning uchun ular hozircha avvalgidek
    // (resolveTie ichida, ko'rinmasdan) hal qilinadi - bu YANGI xatolik emas,
    // shunchaki ko'rinadigan animatsiya hali shu holatga yoyilmagan.
    const showLiveShootout = !useTwoLegged;
    playFixtureLive(hostId, guestId, (t, result) => {
      const rounds = t.bracket.rounds;
      const currentRound = rounds[rounds.length - 1];
      const target = currentRound.find(
        (x) => x.home === fixture.home && x.away === fixture.away && !x.winnerId
      );
      if (!target) return;
      if (legNumber === 1) {
        target.leg1 = { scoreHome: result.scoreA, scoreAway: result.scoreB, events: result.goalEvents || [] };
      } else {
        target.leg2 = { scoreHome: result.scoreB, scoreAway: result.scoreA, events: result.goalEvents || [] };
      }
      if (target.leg1 && (!useTwoLegged || target.leg2)) {
        const precomputed = showLiveShootout && result.penA != null
          ? { penA: result.penA, penB: result.penB, winner: result.penWinner }
          : undefined;
        const tie = resolveTie(target, teamsById, precomputed);
        target.winnerId = tie.winnerId;
        target.aggA = tie.aggA; target.aggB = tie.aggB;
        target.penA = tie.penA; target.penB = tie.penB;
      }
      finalizeKnockoutRoundIfComplete(t);
    }, { shootoutOnDraw: showLiveShootout });
  };

  const stepOnce = () => {
    if (isRoundRobin) {
      const t = { ...tournament, fixtures: tournament.fixtures.map((f) => ({ ...f })) };
      const played = simulateNextRound(t.fixtures, teamsById, t);
      if (played == null) return false;
      const standings = computeStandings(t.teamIds, t.fixtures);
      const allPlayed = t.fixtures.every((f) => f.scoreHome != null);
      if (allPlayed) { t.status = 'completed'; t.champion = standings[0]?.id; }
      persist(t);
      return !allPlayed;
    }

    if (isGroupFormat && tournament.phase === 'groups') {
      const t = { ...tournament, groups: tournament.groups.map((g) => ({ ...g, fixtures: g.fixtures.map((f) => ({ ...f })) })) };
      const g = t.groups.find((gr) => gr.fixtures.some((f) => f.scoreHome == null));
      if (g) simulateNextRound(g.fixtures, teamsById, t);
      const allDone = t.groups.every((gr) => gr.fixtures.every((f) => f.scoreHome != null));
      if (allDone) advanceGroupsToKnockout(t, teamsById);
      persist(t);
      return true;
    }

    if (isCL && tournament.clPhase === 'league') {
      const t = { ...tournament, leagueFixtures: tournament.leagueFixtures.map((f) => ({ ...f })) };
      const played = simulateNextRound(t.leagueFixtures, teamsById, t);
      const allDone = t.leagueFixtures.every((f) => f.scoreHome != null);
      if (allDone) advanceCLLeagueToPlayoff(t);
      persist(t);
      return played != null;
    }

    if (isCL && tournament.clPhase === 'playoff') {
      const t = { ...tournament, playoffBracket: tournament.playoffBracket.map((f) => ({ ...f })) };
      simulateCLPlayoffRound(t, teamsById);
      persist(t);
      return true;
    }

    if (inKnockoutPhase) {
      if (tournament.status === 'completed') return false;
      const t = { ...tournament, bracket: { rounds: tournament.bracket.rounds.map((r) => r.map((f) => ({ ...f }))) } };
      simulateKnockoutRound(t, teamsById);
      persist(t);
      return t.status !== 'completed';
    }

    return false;
  };

  const handleFinishInstantly = () => {
    if (isRoundRobin) {
      const t = { ...tournament, fixtures: tournament.fixtures.map((f) => ({ ...f })) };
      simulateAllFixtures(t.fixtures, teamsById, t);
      const standings = computeStandings(t.teamIds, t.fixtures);
      t.status = 'completed'; t.champion = standings[0]?.id;
      persist(t);
      return;
    }
    if (isGroupFormat && tournament.phase === 'groups') {
      const t = { ...tournament, groups: tournament.groups.map((g) => ({ ...g, fixtures: g.fixtures.map((f) => ({ ...f })) })) };
      t.groups.forEach((g) => simulateAllFixtures(g.fixtures, teamsById, t));
      advanceGroupsToKnockout(t, teamsById);
      let guard = 0;
      while (t.status !== 'completed' && guard < 10) { simulateKnockoutRound(t, teamsById); guard++; }
      persist(t);
      return;
    }
    if (isCL) {
      const t = { ...tournament, leagueFixtures: (tournament.leagueFixtures || []).map((f) => ({ ...f })) };
      if (t.clPhase === 'league') {
        simulateAllFixtures(t.leagueFixtures, teamsById, t);
        advanceCLLeagueToPlayoff(t);
      }
      if (t.clPhase === 'playoff') { simulateCLPlayoffRound(t, teamsById); }
      let guard = 0;
      while (t.status !== 'completed' && guard < 10) { simulateKnockoutRound(t, teamsById); guard++; }
      persist(t);
      return;
    }
    if (inKnockoutPhase) {
      const t = { ...tournament, bracket: { rounds: tournament.bracket.rounds.map((r) => r.map((f) => ({ ...f }))) } };
      let guard = 0;
      while (t.status !== 'completed' && guard < 10) { simulateKnockoutRound(t, teamsById); guard++; }
      persist(t);
    }
  };

  const handleThirdPlace = () => {
    const t = { ...tournament, thirdPlaceMatch: { ...tournament.thirdPlaceMatch } };
    simulateThirdPlaceMatch(t, teamsById);
    persist(t);
  };

  const toggleAutoPlay = () => {
    autoPlayRef.current = !isAutoPlaying;
    setIsAutoPlaying(!isAutoPlaying);
  };

  useEffect(() => {
    if (!isAutoPlaying) return undefined;
    let cancelled = false;
    const loop = () => {
      if (cancelled || !autoPlayRef.current) return;
      const canContinue = stepOnce();
      if (!canContinue || isFullyDone()) {
        setIsAutoPlaying(false);
        autoPlayRef.current = false;
        return;
      }
      setTimeout(loop, AUTO_PLAY_DELAY);
    };
    const id = setTimeout(loop, AUTO_PLAY_DELAY);
    return () => { cancelled = true; clearTimeout(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoPlaying]);

  const done = isFullyDone();

  // Fikstura "▶ O'ynash" tugmasi bosilganda — LiveMatch'ni Tezkor O'yindagi kabi
  // to'liq ekranli tarzda ko'rsatamiz (ikkala jamoa fikstura bo'yicha avtomatik
  // tanlangan). O'yin tugagach foydalanuvchi natijani ko'radi, so'ng "⬅ Chiqish"
  // bosilgach turnir holatiga (fikstura ro'yxati/jadval, yangilangan hisob bilan) qaytadi.
  if (liveFixture) {
    return (
      <LiveMatch
        teamA={liveFixture.teamAObj}
        teamB={liveFixture.teamBObj}
        onExit={handleLiveExit}
        onFinish={handleLiveFinish}
        shootoutOnDraw={liveFixture.shootoutOnDraw}
      />
    );
  }

  return (
    <div className="card">
      <div className="tournament-header">
        <button className="secondary-btn" onClick={onBack}>⬅ Orqaga</button>
        <div className="tournament-title">🏆 {tournament.name}</div>
        <button className="danger-btn" onClick={() => onDelete(tournament.id)}>🗑 O'chirish</button>
      </div>

      {tournament.champion && (
        <div className="motm-banner" style={{ marginBottom: '14px' }}>
          🏆 Chempion: <b>{teamsById[tournament.champion]?.logo} {teamsById[tournament.champion]?.name}</b>
        </div>
      )}

      <AwardsPanel tournament={tournament} teamsById={teamsById} />
      {done && <TeamOfTournament tournament={tournament} teamsById={teamsById} />}

      {!done && (
        <div className="tournament-play-controls">
          <button className="secondary-btn" onClick={stepOnce} disabled={isAutoPlaying}>▶ Keyingi Turni O'ynash</button>
          <button className={`secondary-btn ${isAutoPlaying ? 'format-btn-active' : ''}`} onClick={toggleAutoPlay}>
            {isAutoPlaying ? '⏸ Pauza' : '⏩ Avto-O\'ynash'}
          </button>
          <button className="action-btn" onClick={handleFinishInstantly} disabled={isAutoPlaying}>⏭ Darhol Yakunlash</button>
        </div>
      )}

      {isRoundRobin && (
        <>
          <ExpandableLeaderboard tournament={tournament} teamsById={teamsById} />
          <StandingsTable standings={computeStandings(tournament.teamIds, tournament.fixtures)} teamsById={teamsById} />
          <div className="squad-header" style={{ marginTop: '16px' }}>Fiksturalar</div>
          <FixtureList
            fixtures={tournament.fixtures}
            teamsById={teamsById}
            onPlay={isAutoPlaying ? undefined : handlePlayRoundRobinFixture}
          />
        </>
      )}

      {isGroupFormat && tournament.phase === 'groups' && (
        <GroupsView
          tournament={tournament}
          teamsById={teamsById}
          onPlayFixture={isAutoPlaying ? undefined : handlePlayGroupFixture}
        />
      )}

      {isCL && tournament.clPhase === 'league' && (
        <>
          <ExpandableLeaderboard tournament={tournament} teamsById={teamsById} />
          <StandingsTable
            standings={computeStandings(tournament.teamIds, tournament.leagueFixtures)}
            teamsById={teamsById}
            advanceCount={tournament.clDirectSlots}
          />
          <div className="format-hint" style={{ marginTop: '6px' }}>
            Yashil chiziqdan yuqorisi ({tournament.clDirectSlots} ta) to'g'ridan-to'g'ri chorak finalga chiqadi.
            Keyingi {tournament.clPlayoffSlots} ta pley-offga tushadi.
          </div>
          <div className="squad-header" style={{ marginTop: '16px' }}>Liga fazasi o'yinlari</div>
          <FixtureList
            fixtures={tournament.leagueFixtures}
            teamsById={teamsById}
            onPlay={isAutoPlaying ? undefined : handlePlayCLLeagueFixture}
          />
        </>
      )}

      {isCL && tournament.clPhase === 'playoff' && (
        <>
          <div className="squad-header" style={{ marginTop: '8px' }}>Pley-off (2 o'yinlik, chorak final uchun)</div>
          {tournament.playoffBracket.map((f, i) => (
            <KnockoutFixture
              key={i}
              fixture={f}
              teamsById={teamsById}
              twoLegged
              onPlayLeg={isAutoPlaying ? undefined : handlePlayCLPlayoffLeg}
            />
          ))}
        </>
      )}

      {inKnockoutPhase && tournament.bracket && (
        <>
          <div className="squad-header" style={{ marginTop: '8px' }}>Pley-off</div>
          {tournament.bracket.rounds.map((round, ri) => {
            const isCurrentRound = ri === tournament.bracket.rounds.length - 1;
            const twoLegged = tournament.knockoutTwoLegged && round.length > 1;
            return (
              <div key={ri} className="ko-round">
                <div className="ko-round-label">
                  {round.length === 1 ? 'FINAL' : round.length === 2 ? 'Yarim final' : round.length === 4 ? 'Chorak final' : `${round.length}-lik bosqich`}
                </div>
                {round.map((f, fi) => (
                  <KnockoutFixture
                    key={fi}
                    fixture={f}
                    teamsById={teamsById}
                    twoLegged={twoLegged}
                    onPlayLeg={isCurrentRound && !isAutoPlaying ? (fixture, legNum) => handlePlayKnockoutLeg(fixture, legNum, twoLegged) : undefined}
                  />
                ))}
              </div>
            );
          })}

          {tournament.thirdPlaceMatch && (
            <div className="ko-round">
              <div className="ko-round-label">3-o'rin uchun</div>
              <KnockoutFixture fixture={tournament.thirdPlaceMatch} teamsById={teamsById} twoLegged={false} />
            </div>
          )}

          {tournament.thirdPlaceMatch && !tournament.thirdPlaceMatch.winnerId && (
            <button className="secondary-btn" style={{ marginTop: '8px' }} onClick={handleThirdPlace}>
              🥉 3-o'rin O'yinini Simulyatsiya Qilish
            </button>
          )}
        </>
      )}
    </div>
  );
}

function GroupsView({ tournament, teamsById, onPlayFixture }) {
  const [activeGroupIdx, setActiveGroupIdx] = useState(0);
  return (
    <>
      <ExpandableLeaderboard tournament={tournament} teamsById={teamsById} />
      <div className="group-tabs">
        {tournament.groups.map((g, idx) => (
          <button key={g.name} className={`group-tab ${activeGroupIdx === idx ? 'group-tab-active' : ''}`} onClick={() => setActiveGroupIdx(idx)}>
            {g.name}-guruh
          </button>
        ))}
      </div>
      <StandingsTable
        standings={computeStandings(tournament.groups[activeGroupIdx].teamIds, tournament.groups[activeGroupIdx].fixtures)}
        teamsById={teamsById}
        advanceCount={tournament.advancePerGroup}
      />
      <div className="squad-header" style={{ marginTop: '16px' }}>{tournament.groups[activeGroupIdx].name}-guruh fiksturalari</div>
      <FixtureList
        fixtures={tournament.groups[activeGroupIdx].fixtures}
        teamsById={teamsById}
        onPlay={onPlayFixture ? (f) => onPlayFixture(activeGroupIdx, f) : undefined}
      />
    </>
  );
}
