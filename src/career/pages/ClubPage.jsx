import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';
import { INITIAL_TEAMS } from '../../data/teamsData';
import { getMergedSquad } from '../data/clubRosterStore';
import { getPlayerFixtures } from '../utils/season';
import { fetchClubRoster } from '../utils/careerApi';
import { displayRating } from '../utils/statCalc';
import { buildHonours } from '../utils/honours';

import Panel from '../club/Panel';
import TacticalPitch from '../club/TacticalPitch';
import BenchPanel from '../club/BenchPanel';
import SquadTable from '../club/SquadTable';
import TacticsPanel from '../club/TacticsPanel';
import ChemistryWidget from '../club/ChemistryWidget';
import TrophyCase from '../club/TrophyCase';
import {
  DEFAULT_TACTICS, loadTactics, saveTactics, formationByName, suggestFormation,
  buildLineup, computeChemistry, cleanName, catOf, CAT_COLOR, CAT_SHORT,
} from '../club/squadUtils';

function NameModeToggle({ value, onChange }) {
  const opt = (id, label) => (
    <button
      key={id}
      type="button"
      onClick={() => onChange(id)}
      aria-pressed={value === id}
      className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
        value === id ? 'bg-brand-tint border-brand text-brand-dark' : 'bg-white border-surface-line text-ink-muted hover:bg-surface-muted'
      }`}
    >
      {label}
    </button>
  );
  return <div className="flex gap-1" role="group" aria-label="Name display">{opt('surname', 'Surname')}{opt('full', 'Full name')}</div>;
}

const FIT_TEXT = {
  natural: 'Natural position',
  cover: 'Covering through an alternative position',
  out: 'Out of position',
};

export default function ClubPage() {
  const { player } = useGame();
  const navigate = useNavigate();
  const [remoteTeammates, setRemoteTeammates] = useState([]);
  const [tactics, setTactics] = useState(() => (player ? loadTactics(player.id) : { ...DEFAULT_TACTICS }));
  const [nameMode, setNameMode] = useState('surname');
  const [selectedId, setSelectedId] = useState(null);

  // Real (server-shared) teammates - if a friend logged in on another
  // device/browser has also joined this exact club, they show up here too,
  // not just built-in NPC squad members.
  useEffect(() => {
    if (!player) return;
    let cancelled = false;
    fetchClubRoster(player.club.id).then((res) => {
      if (!cancelled && res.ok) {
        setRemoteTeammates(res.players.filter((p) => !p.isYou).map((p) => ({
          id: `user:${p.username}`, name: `${p.name} (${p.username})`, pos: p.position, ovr: displayRating(p.overall), isUser: true, isRemote: true
        })));
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.club?.id]);

  // Tactics are stored per player, so reload them if the active save changes.
  useEffect(() => {
    if (player) setTactics(loadTactics(player.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.id]);

  const updateTactics = (next) => {
    setTactics(next);
    if (player) saveTactics(player.id, next);
  };

  // Built-in squad + every human-created player (anyone, from any save on
  // this browser, OR any other real logged-in user on the server) who has
  // ever joined this club. The current player's own entry is always
  // overridden with their LIVE overall/position so this never shows a stale
  // snapshot from whenever they first joined.
  const squad = useMemo(() => {
    if (!player) return [];
    const team = INITIAL_TEAMS.find((t) => t.id === player.club.id);
    return [
      ...(team ? getMergedSquad(team) : []).map((p) =>
        p.id === player.id
          ? { ...p, name: `${player.name} ${player.surname}`, pos: player.position, ovr: displayRating(player.overall) }
          : p
      ),
      ...remoteTeammates,
    ];
  }, [player, remoteTeammates]);

  const formation = useMemo(
    () => (tactics.auto ? suggestFormation(squad, tactics.mindset) : formationByName(tactics.formation)),
    [squad, tactics.auto, tactics.mindset, tactics.formation]
  );
  const lineup = useMemo(() => buildLineup(squad, formation), [squad, formation]);
  const chemistry = useMemo(() => computeChemistry(lineup.slots), [lineup.slots]);
  const starterIds = useMemo(() => new Set(lineup.slots.map((s) => s.player.id)), [lineup.slots]);

  if (!player) return null;

  const selected = squad.find((p) => p.id === selectedId) || null;
  const selectedSlot = lineup.slots.find((s) => s.player.id === selectedId) || null;
  const upcoming = getPlayerFixtures(player).filter((f) => !f.played);
  const toggleSelect = (id) => setSelectedId((cur) => (cur === id ? null : id));
  // Club cabinet: klub + terma jamoa kubogi (individual mukofotlar Profile > Honours'da).
  // Server satrlari ham to'g'ri o'qiladi (buildHonours hamma formatni birlashtiradi).
  const cabinetTrophies = buildHonours(player)
    .filter((h) => h.kind !== 'individual')
    .map((h) => ({ name: h.title, year: h.year, icon: h.icon }));

  return (
    <AppShell>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-white border border-surface-line shadow-soft text-3xl" aria-hidden="true">{player.club.logo}</span>
          <div>
            <h1>{player.club.name}</h1>
            <div className="sub">{player.club.flag} {player.club.leagueName}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_370px]" style={{ alignItems: 'start' }}>
        {/* ---------- left: pitch, selection, bench, squad ---------- */}
        <div className="flex flex-col gap-5 min-w-0">
          <Panel
            title={`Starting XI · ${formation.name}`}
            aside={<NameModeToggle value={nameMode} onChange={setNameMode} />}
          >
            <TacticalPitch
              slots={lineup.slots}
              emptySlots={lineup.emptySlots}
              myId={player.id}
              selectedId={selectedId}
              nameMode={nameMode}
              onSelect={toggleSelect}
            />

            <div className="mt-3 min-h-[44px] rounded-control border border-surface-line bg-surface px-3 py-2 text-sm">
              {selected ? (
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="font-bold text-ink">
                    {cleanName(selected.name)}
                    {selected.id === player.id && <span className="ml-1.5 text-xs text-brand-dark">You</span>}
                  </span>
                  <span className="text-xs text-ink-muted">
                    <span className="font-bold" style={{ color: CAT_COLOR[catOf(selected.pos)] }}>{selected.pos} · {CAT_SHORT[catOf(selected.pos)]}</span>
                    {' · '}OVR {selected.ovr ?? '-'}
                    {' · '}{selectedSlot ? `Starting, ${FIT_TEXT[selectedSlot.kind].toLowerCase()}` : 'On the bench'}
                  </span>
                </div>
              ) : (
                <span className="text-ink-muted">Select a player on the pitch, bench or table to see their details.</span>
              )}
            </div>
          </Panel>

          <BenchPanel bench={lineup.bench} myId={player.id} selectedId={selectedId} nameMode={nameMode} onSelect={toggleSelect} />
          <SquadTable squad={squad} starterIds={starterIds} myId={player.id} selectedId={selectedId} onSelect={toggleSelect} />
        </div>

        {/* ---------- right: tactics, chemistry, trophies, fixtures ---------- */}
        <div className="flex flex-col gap-5 min-w-0">
          <TacticsPanel tactics={tactics} formation={formation} onChange={updateTactics} />
          <ChemistryWidget chemistry={chemistry} />
          <TrophyCase trophies={cabinetTrophies} />

          <button
            type="button"
            onClick={() => navigate('/games')}
            className="text-left cursor-pointer w-full bg-surface-card border border-surface-line rounded-card shadow-soft p-4 sm:p-5"
          >
            <span className="flex items-center justify-between gap-3 mb-3">
              <span className="text-sm font-extrabold text-ink">Next three games</span>
              <span className="text-xs font-bold text-accent-dark">Full schedule →</span>
            </span>
            {upcoming.slice(0, 3).map((f) => (
              <span key={f.round} className="flex items-center justify-between gap-3 py-2 border-t border-surface-line text-sm text-ink">
                <span className="truncate">{f.opponentLogo} {f.isHome ? 'vs' : '@'} {f.opponent}</span>
                <span className="shrink-0 text-xs font-bold text-ink-muted">{f.date}</span>
              </span>
            ))}
            {upcoming.length === 0 && (
              <span className="block text-sm text-ink-muted">Season complete. New fixtures arrive with the next season.</span>
            )}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
