import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { rollFirstRating, rollPotential, rollClub, buildStartingStats } from '../utils/playerGen';
import { NATIONALITIES } from '../../data/leaguesData';
import { joinClubRoster, previewClubTier } from '../data/clubRosterStore';
import { buildSeasonSchedule, initStandings, computeStartingWage, setupSeasonCups, rollContractLength } from '../utils/season';

const SPIN_MS = 900;

const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST'];

export default function StartPage() {
  const navigate = useNavigate();
  const { createPlayer } = useGame();

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [number, setNumber] = useState('');
  const [position, setPosition] = useState('');
  const [nationality, setNationality] = useState('');

  const [rating, setRating] = useState(null);
  const [potential, setPotential] = useState(null);
  const [clubResult, setClubResult] = useState(null);
  const [spinning, setSpinning] = useState({ rating: false, potential: false, club: false });

  const spin = (key, roll, setter) => {
    if (spinning[key]) return;
    setSpinning((s) => ({ ...s, [key]: true }));
    let ticks = 0;
    const interval = setInterval(() => {
      setter(roll.preview());
      ticks += 1;
      if (ticks > 8) {
        clearInterval(interval);
        setter(roll.final());
        setSpinning((s) => ({ ...s, [key]: false }));
      }
    }, SPIN_MS / 9);
  };

  const spinRating = () =>
    spin('rating', {
      preview: () => Math.floor(Math.random() * 30) + 60,
      final: () => rollFirstRating()
    }, setRating);

  const spinPotential = () => {
    if (rating === null) return;
    spin('potential', {
      preview: () => Math.floor(Math.random() * 30) + 65,
      final: () => rollPotential(rating).potential
    }, setPotential);
  };

  const spinClub = () => {
    if (!nationality) return;
    spin('club', {
      preview: () => ({ team: { name: '...', logo: '🌀' }, league: { name: '...' } }),
      final: () => rollClub(nationality)
    }, setClubResult);
  };

  // Live "starter or bench" hint, computed against the shared/global roster
  // of whoever's already at that club - doesn't write anything until Start.
  const tierPreview = useMemo(() => {
    if (!clubResult || rating === null || clubResult.team?.name?.includes('...')) return null;
    return previewClubTier(clubResult.team, rating);
  }, [clubResult, rating]);

  const canStart =
    name.trim() && surname.trim() && number.toString().trim() && position && nationality &&
    rating !== null && potential !== null && clubResult && !clubResult.team?.name?.includes('...') &&
    !spinning.rating && !spinning.potential && !spinning.club;

  const handleStart = () => {
    if (!canStart) return;
    const { subStats, mainStats, ovr } = buildStartingStats(position, rating);
    const playerId = `player_${Date.now()}`;

    // Add this player into the club's shared/global squad list (top 11 or
    // bench, decided against whoever else is already there) so anyone else
    // at this club - now or later - sees them in the roster too.
    const tier = joinClubRoster(clubResult.team, {
      id: playerId,
      name: `${name.trim()} ${surname.trim()}`,
      pos: position,
      ovr,
      stats: mainStats,
      nationality
    });

    const schedule = buildSeasonSchedule(clubResult.league, '2026-08-01');
    const standings = initStandings(clubResult.league.teamIds);
    const weeklyWage = computeStartingWage(ovr, tier, clubResult.league.id);
    const { domesticCup } = setupSeasonCups(
      { id: playerId, club: { id: clubResult.team.id, leagueId: clubResult.league.id }, career: {} },
      clubResult.league, '2026-08-01', schedule
    );

    const player = {
      id: playerId,
      name: name.trim(),
      surname: surname.trim(),
      number: Number(number),
      position,
      nationality,
      age: 17,
      createdAt: new Date().toISOString(),
      firstRating: rating,
      potential,
      overall: ovr,
      mainStats,
      subStats,
      club: {
        id: clubResult.team.id,
        name: clubResult.team.name,
        logo: clubResult.team.logo,
        leagueId: clubResult.league.id,
        leagueName: clubResult.league.name,
        country: clubResult.league.country,
        flag: clubResult.league.flag,
        tier
      },
      career: {
        // One day BEFORE kickoff: prepareNextDay always advances by exactly
        // one day before checking the schedule, so starting here means the
        // very first "Next Day" press correctly lands on 1 Aug (Round 1) -
        // starting ON 1 Aug itself would skip Round 1 forever.
        gameDate: '2026-07-31',
        day: 1,
        lastAgeUpDay: 1,
        growthUsedThisYear: 0,
        money: 1000,
        weeklyWage,
        contract: { yearsTotal: rollContractLength(clubResult.league.id), signedDay: 1 },
        contractTalksOpened: false,
        contractFailedNegotiations: 0,
        freeAgent: false,
        form: 'Average',
        stamina: 100,
        trophies: [],
        domesticCup,
        continentalCup: null,
        qualifiedContinentalNextSeason: null,
        goals: 0,
        assists: 0,
        appearances: 0,
        matchRatings: [],
        trainingDate: null,
        injury: null,
        perks: { fitnessTrainer: false, physio: false, agent: false, boots: 'none' },
        messages: [{
          id: `msg_${Date.now()}`,
          type: 'club',
          date: '2026-08-01',
          from: clubResult.team.name,
          subject: `Welcome to ${clubResult.team.name}!`,
          body: `Congratulations on your move to ${clubResult.team.name}. You'll be joining the squad as a ${tier === 'starter' ? 'starting XI player' : 'bench player'}. The season kicks off on 1 August 2026 - hit the training ground and get ready.`,
          read: false,
          resolved: true
        }],
        schedule,
        standings,
        topScorers: {}
      }
    };
    createPlayer(player);
    navigate('/home', { replace: true });
  };

  return (
    <div className="start-shell">
      <div className="card start-card">
        <h1>Create a Player</h1>
        <p className="tagline">Build your pro and spin your way into the league.</p>

        <div className="grid grid-3" style={{ marginBottom: 14 }}>
          <div className="field">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alisher" />
          </div>
          <div className="field">
            <label>Surname</label>
            <input value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="e.g. Nomozov" />
          </div>
          <div className="field">
            <label>Number</label>
            <input
              type="number"
              min="1"
              max="99"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="e.g. 9"
            />
          </div>
        </div>

        <div className="grid grid-2" style={{ marginBottom: 20 }}>
          <div className="field">
            <label>Position</label>
            <select value={position} onChange={(e) => setPosition(e.target.value)}>
              <option value="" disabled>Select position</option>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Nationality</label>
            <select
              value={nationality}
              onChange={(e) => {
                setNationality(e.target.value);
                // Nationality changed after a club was already rolled -
                // clear it so the boost applies to the next spin.
                if (clubResult) setClubResult(null);
              }}
            >
              <option value="" disabled>Select nationality</option>
              {NATIONALITIES.map((n) => (
                <option key={n.name} value={n.name}>{n.flag} {n.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="roll-grid">
          <div className={`roll-slot${rating !== null ? ' done' : ''}${spinning.rating ? ' spinning' : ''}`} onClick={spinRating}>
            <div className="roll-label">FIRST RATING</div>
            <div className="roll-value">{rating ?? 'Spin'}</div>
          </div>
          <div
            className={`roll-slot${clubResult ? ' done' : ''}${spinning.club ? ' spinning' : ''}`}
            onClick={spinClub}
            style={{ opacity: nationality ? 1 : 0.5, pointerEvents: nationality ? 'auto' : 'none' }}
          >
            <div className="roll-label">FIRST CLUB</div>
            <div className="roll-value">{clubResult ? clubResult.team.name : 'Spin'}</div>
          </div>
          <div
            className={`roll-slot${potential !== null ? ' done' : ''}${spinning.potential ? ' spinning' : ''}`}
            onClick={spinPotential}
            style={{ opacity: rating === null ? 0.5 : 1, pointerEvents: rating === null ? 'none' : 'auto' }}
          >
            <div className="roll-label">FIRST POTENTIAL</div>
            <div className="roll-value">{potential ?? 'Spin'}</div>
          </div>
        </div>
        {!nationality && (
          <p className="tagline" style={{ marginTop: -8, marginBottom: 20 }}>
            Pick a nationality first - your first club roll leans toward clubs from your home country.
          </p>
        )}

        <div className="result-grid">
          <div className="result-card">
            <div className="logo">{clubResult ? clubResult.team.logo : '❔'}</div>
            <div className="value" style={{ fontSize: 13 }}>{clubResult ? clubResult.league.name : 'First Club Logo'}</div>
            <div className="label">{clubResult ? clubResult.league.country : ''}</div>
          </div>
          <div className="result-card green">
            <div className="value">{rating ?? '--'}</div>
            <div className="label">First Rating</div>
          </div>
          <div className="result-card gold">
            <div className="value">{potential ?? '--'}</div>
            <div className="label">First Potential</div>
          </div>
        </div>

        {tierPreview && (
          <div className={`badge ${tierPreview === 'starter' ? 'badge-gold' : ''}`} style={{ display: 'block', textAlign: 'center', marginBottom: 16 }}>
            {tierPreview === 'starter' ? '⭐ You will start in the Starting XI' : '🪑 You will start on the Bench'}
          </div>
        )}

        <button className="btn btn-primary btn-block" disabled={!canStart} onClick={handleStart}>
          Start Game!
        </button>
      </div>
    </div>
  );
}
