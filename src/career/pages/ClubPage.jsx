import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';
import { INITIAL_TEAMS } from '../../data/teamsData';
import { getMergedSquad } from '../data/clubRosterStore';
import { getPlayerFixtures } from '../utils/season';
import { fetchClubRoster } from '../utils/careerApi';

function initials(fullName) {
  return fullName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

// Real position groups, used to lay the squad out like an actual formation
// (attackers up top, goalkeeper at the very bottom) instead of just slicing
// the top-11-by-OVR regardless of what position everyone actually plays -
// that used to be able to drop an attacker into the "goalkeeper" slot.
const GROUP_OF_POS = {
  GK: 'GK',
  CB: 'DEF', LB: 'DEF', RB: 'DEF',
  CDM: 'MID', CM: 'MID', CAM: 'MID', LM: 'MID', RM: 'MID',
  ST: 'ATT', LW: 'ATT', RW: 'ATT'
};
const GROUP_SLOTS = { ATT: 3, MID: 3, DEF: 4, GK: 1 };
const GROUP_ORDER = ['ATT', 'MID', 'DEF', 'GK']; // rendered top-to-bottom

function buildFormation(squad) {
  const byGroup = { ATT: [], MID: [], DEF: [], GK: [] };
  squad.forEach((p) => {
    const g = GROUP_OF_POS[p.pos] || 'MID';
    byGroup[g].push(p);
  });
  Object.values(byGroup).forEach((list) => list.sort((a, b) => (b.ovr || 0) - (a.ovr || 0)));

  const starters = [];
  GROUP_ORDER.forEach((g) => starters.push(...byGroup[g].slice(0, GROUP_SLOTS[g])));

  // If a squad is short on a particular line (e.g. no natural backup GK),
  // top the XI back up to 11 with the next-best remaining players so the
  // display never looks emptier than it needs to.
  const usedIds = new Set(starters.map((p) => p.id));
  const leftovers = squad.filter((p) => !usedIds.has(p.id)).sort((a, b) => (b.ovr || 0) - (a.ovr || 0));
  while (starters.length < 11 && leftovers.length) starters.push(leftovers.shift());

  const starterIds = new Set(starters.map((p) => p.id));
  const bench = squad.filter((p) => !starterIds.has(p.id)).sort((a, b) => (b.ovr || 0) - (a.ovr || 0));

  const rows = GROUP_ORDER.map((g) => starters.filter((p) => (GROUP_OF_POS[p.pos] || 'MID') === g));
  return { rows, bench };
}

export default function ClubPage() {
  const { player } = useGame();
  const navigate = useNavigate();
  const [remoteTeammates, setRemoteTeammates] = useState([]);

  // Real (server-shared) teammates - if a friend logged in on another
  // device/browser has also joined this exact club, they show up here too,
  // not just built-in NPC squad members.
  useEffect(() => {
    if (!player) return;
    let cancelled = false;
    fetchClubRoster(player.club.id).then((res) => {
      if (!cancelled && res.ok) {
        setRemoteTeammates(res.players.filter((p) => !p.isYou).map((p) => ({
          id: `user:${p.username}`, name: `${p.name} (${p.username})`, pos: p.position, ovr: p.overall, isUser: true, isRemote: true
        })));
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.club?.id]);

  if (!player) return null;

  const team = INITIAL_TEAMS.find((t) => t.id === player.club.id);
  // Built-in squad + every human-created player (anyone, from any save on
  // this browser, OR any other real logged-in user on the server) who has
  // ever joined this club. The current player's own entry is always
  // overridden with their LIVE overall/position/tier so this never
  // shows a stale snapshot from whenever they first joined.
  const squad = [
    ...(team ? getMergedSquad(team) : []).map((p) =>
      p.id === player.id
        ? { ...p, name: `${player.name} ${player.surname}`, pos: player.position, ovr: player.overall }
        : p
    ),
    ...remoteTeammates
  ];
  const { rows, bench } = buildFormation(squad);

  const cardStyle = (p) => ({
    width: 64, height: 64, borderRadius: 14,
    background: 'var(--glass-fill)',
    border: p.id === player.id ? '2px solid var(--accent-gold)' : '1px solid var(--glass-border)',
    boxShadow: p.id === player.id ? '0 0 0 3px rgba(255, 200, 60, 0.15)' : 'none',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-display)', position: 'relative'
  });

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>{player.club.name}</h1>
          <div className="sub">{player.club.flag} {player.club.leagueName}</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">SQUAD</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {rows.map((row, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                {row.map((p) => (
                  <div
                    key={p.id}
                    title={`${p.name} · ${p.pos} · OVR ${p.ovr ?? '-'}${p.isUser ? ' · Player-created' : ''}${p.id === player.id ? ' (You)' : ''}`}
                    style={cardStyle(p)}
                  >
                    <span style={{ fontSize: 13 }}>{initials(p.name)}</span>
                    <span style={{ fontSize: 10, color: 'var(--accent-gold)' }}>{p.ovr ?? '-'}</span>
                    {p.isUser && (
                      <span style={{ position: 'absolute', top: -6, right: -6, fontSize: 11 }}>
                        {p.id === player.id ? '⭐' : '👤'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="grid" style={{ gap: 18 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="card-title">CLUB NAME AND LOGO</div>
            <div style={{ fontSize: 44 }}>{player.club.logo}</div>
            <div style={{ fontFamily: 'var(--font-display)', marginTop: 6 }}>{player.club.name}</div>
          </div>

          <div className="card">
            <div className="card-title">BENCH PLAYERS</div>
            <div style={{ maxHeight: 220, overflowY: 'auto' }}>
              {bench.map((p) => (
                <div
                  key={p.id}
                  className="list-row"
                  style={p.id === player.id ? { color: 'var(--accent-gold)' } : undefined}
                >
                  <span>{p.name}{p.isUser && p.id !== player.id ? ' 👤' : ''}{p.id === player.id ? ' ⭐ (You)' : ''}</span>
                  <span className="badge">{p.pos} · {p.ovr ?? '-'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">TROPHIES</div>
            {(!player.career.trophies || player.career.trophies.length === 0) ? (
              <div className="sub" style={{ padding: 8 }}>No trophies won at this club yet.</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[...player.career.trophies].reverse().map((t, i) => (
                  <span key={i} className="badge badge-gold" title={`${t.name} (${t.year})`}>
                    {t.icon || '🏆'} {t.year}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="card"
            onClick={() => navigate('/games')}
            style={{ textAlign: 'left', cursor: 'pointer', width: '100%' }}
          >
            <div className="card-title">NEXT THREE GAMES <span className="sub" style={{ float: 'right' }}>See full schedule →</span></div>
            {getPlayerFixtures(player).filter((f) => !f.played).slice(0, 3).map((f) => (
              <div key={f.round} className="list-row">
                <span>{f.opponentLogo} {f.isHome ? 'vs' : '@'} {f.opponent}</span>
                <span className="badge">{f.date}</span>
              </div>
            ))}
            {getPlayerFixtures(player).filter((f) => !f.played).length === 0 && (
              <div className="sub" style={{ padding: 8 }}>Season complete - new fixtures coming soon.</div>
            )}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
