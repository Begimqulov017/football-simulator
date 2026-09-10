import React, { useState, useMemo } from 'react';
import { calculateDisplayTeamOvr } from '../utils/engine';

// Jamoalarni alifbo harfi bo'yicha guruhlaydi — A, B, C... sarlavhalari bilan
function groupByLetter(list) {
  const groups = [];
  let currentLetter = null;
  let currentGroup = null;
  list.forEach((t) => {
    const letter = t.name.charAt(0).toUpperCase();
    if (letter !== currentLetter) {
      currentLetter = letter;
      currentGroup = { letter, teams: [] };
      groups.push(currentGroup);
    }
    currentGroup.teams.push(t);
  });
  return groups;
}

function TeamPicker({ label, labelClass, teams, selected, otherSelected, onSelect, btnClass }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const sortedTeams = useMemo(() => [...teams].sort((a, b) => a.name.localeCompare(b.name)), [teams]);
  const visibleTeams = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedTeams;
    return sortedTeams.filter((t) => t.name.toLowerCase().includes(q));
  }, [sortedTeams, query]);
  const grouped = useMemo(() => groupByLetter(visibleTeams), [visibleTeams]);

  const handlePick = (t) => {
    onSelect(t);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="team-picker">
      <div className={`column-title ${labelClass}`}>{label}</div>

      {selected && !isOpen ? (
        <div className={`selected-team-card ${btnClass}`}>
          <span>{selected.logo} {selected.name}</span>
          <span className="rating-badge">OVR {calculateDisplayTeamOvr(selected.squad)}</span>
          <button className="change-team-btn" onClick={() => setIsOpen(true)}>O'zgartirish</button>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="🔍 Jamoa qidirish..."
            className="search-input"
            autoFocus={isOpen && !!selected}
          />

          {isOpen && (
            <div className="autocomplete-dropdown">
              {visibleTeams.length === 0 && <div className="no-results">Hech qanday jamoa topilmadi</div>}
              {grouped.map((group) => (
                <div key={group.letter}>
                  <div className="letter-header">{group.letter}</div>
                  {group.teams.map((t) => (
                    <button
                      key={t.id}
                      disabled={otherSelected?.id === t.id}
                      onClick={() => handlePick(t)}
                      className="autocomplete-item"
                    >
                      <span>{t.logo} {t.name}</span>
                      <span className="rating-badge">OVR {calculateDisplayTeamOvr(t.squad)}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function TeamSelect({ teams, teamA, teamB, setTeamA, setTeamB, chances, onStart }) {
  return (
    <div className="card">
      <TeamPicker
        label="1-Jamoa (Uy)"
        labelClass="title-a"
        teams={teams}
        selected={teamA}
        otherSelected={teamB}
        onSelect={setTeamA}
        btnClass="selected-a"
      />

      <TeamPicker
        label="2-Jamoa (Safar)"
        labelClass="title-b"
        teams={teams}
        selected={teamB}
        otherSelected={teamA}
        onSelect={setTeamB}
        btnClass="selected-b"
      />

      {/* CHANCES BAR */}
      {teamA && teamB && (
        <div className="prob-box">
          <div className="prob-title">🎯 Gʻalaba Qozonish Imkoniyati</div>
          <div className="prob-stats">
            <div><span className="stat-num text-a">{chances.winA}%</span><span className="stat-team">{teamA.name}</span></div>
            <div><span className="stat-num text-draw">{chances.draw}%</span><span className="stat-team">Durang</span></div>
            <div><span className="stat-num text-b">{chances.winB}%</span><span className="stat-team">{teamB.name}</span></div>
          </div>
          <div className="bar-container">
            <div className="bar-a" style={{ width: `${chances.winA}%` }}></div>
            <div className="bar-draw" style={{ width: `${chances.draw}%` }}></div>
            <div className="bar-b" style={{ width: `${chances.winB}%` }}></div>
          </div>
        </div>
      )}

      <button disabled={!teamA || !teamB} onClick={onStart} className="action-btn">
        ⚡ Simulyatsiyani Boshlash
      </button>
    </div>
  );
}
