import React, { useState, useEffect } from 'react';
import { INITIAL_TEAMS } from '../data/teamsData';
import TeamSelect from '../components/TeamSelect';
import LiveMatch from '../components/LiveMatch';
import Tournament from './Tournament';
import Customization from './Customization';
import { getEffectiveTeams } from '../utils/customization';
import { calculatePreMatchChances } from '../utils/engine';

export default function Home({ onExitToStart }) {
  const [activeMenu, setActiveMenu] = useState('quick-match');
  const [teams, setTeams] = useState(() => getEffectiveTeams(INITIAL_TEAMS));

  useEffect(() => {
    setTeams(getEffectiveTeams(INITIAL_TEAMS));
  }, [activeMenu]);

  const [teamA, setTeamA] = useState(null);
  const [teamB, setTeamB] = useState(null);
  const [isMatchStarted, setIsMatchStarted] = useState(false);

  const chances = calculatePreMatchChances(teamA, null, teamB, null, 0, 0);

  const startMatch = () => {
    if (!teamA || !teamB) return;
    setIsMatchStarted(true);
  };

  const resetAll = () => {
    setTeamA(null);
    setTeamB(null);
    setIsMatchStarted(false);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo sidebar-logo-row">
          <button className="sidebar-back-btn" onClick={onExitToStart} title="Bosh sahifaga qaytish">⬅</button>
          <span>MENU</span>
        </div>
        <nav className="sidebar-nav">
          <div
            className={`sidebar-item ${activeMenu === 'tournament' ? 'active' : ''}`}
            onClick={() => setActiveMenu('tournament')}
          >
            🏆 Turnirlar
          </div>
          <div
            className={`sidebar-item ${activeMenu === 'quick-match' ? 'active' : ''}`}
            onClick={() => setActiveMenu('quick-match')}
          >
            🎮 Tezkor O'yin
          </div>
          <div
            className={`sidebar-item ${activeMenu === 'customization' ? 'active' : ''}`}
            onClick={() => setActiveMenu('customization')}
          >
            🛠️ Customization
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <h1 className="title">MATCH SIMULATOR PRO</h1>
        <p className="subtitle">Real-Time Advanced Engine</p>

        {activeMenu === 'tournament' ? (
          <Tournament teams={teams} />
        ) : activeMenu === 'customization' ? (
          <Customization builtInTeams={INITIAL_TEAMS} />
        ) : !isMatchStarted ? (
          <TeamSelect
            teams={teams}
            teamA={teamA}
            teamB={teamB}
            setTeamA={setTeamA}
            setTeamB={setTeamB}
            chances={chances}
            onStart={startMatch}
          />
        ) : (
          <LiveMatch teamA={teamA} teamB={teamB} onExit={resetAll} />
        )}
      </main>
    </div>
  );
}
