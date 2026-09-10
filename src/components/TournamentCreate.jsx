import React, { useState, useMemo } from 'react';
import { FORMAT_INFO, CHAMPIONS_LEAGUE_PRESET } from '../utils/tournamentEngine';

export default function TournamentCreate({ teams, onCreate, onCancel }) {
  const [name, setName] = useState('');
  const [format, setFormat] = useState('round_robin');
  const [isDouble, setIsDouble] = useState(true);
  const [thirdPlacePlayoff, setThirdPlacePlayoff] = useState(true);
  const [knockoutTwoLegged, setKnockoutTwoLegged] = useState(false);
  const [groupsCount, setGroupsCount] = useState(2);
  const [teamsPerGroup, setTeamsPerGroup] = useState(4);
  const [advancePerGroup, setAdvancePerGroup] = useState(2);
  const [groupDouble, setGroupDouble] = useState(false);
  const [selectedTeamIds, setSelectedTeamIds] = useState([]);
  const [search, setSearch] = useState('');

  const isCL = format === 'champions_league';

  const requiredTeams = useMemo(() => {
    if (format === 'group_knockout') return groupsCount * teamsPerGroup;
    if (isCL) return 16;
    return null; // round_robin/knockout — erkin (min/max oralig'ida)
  }, [format, isCL, groupsCount, teamsPerGroup]);

  const sortedTeams = useMemo(() => [...teams].sort((a, b) => a.name.localeCompare(b.name)), [teams]);
  const visibleTeams = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedTeams;
    return sortedTeams.filter((t) => t.name.toLowerCase().includes(q));
  }, [sortedTeams, search]);

  const toggleTeam = (id) => {
    setSelectedTeamIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (requiredTeams && prev.length >= requiredTeams) return prev; // limitdan oshmaydi
      return [...prev, id];
    });
  };

  const info = FORMAT_INFO[format];
  const countOk = requiredTeams
    ? selectedTeamIds.length === requiredTeams
    : selectedTeamIds.length >= info.minTeams && selectedTeamIds.length <= info.maxTeams
      && (format !== 'knockout' || (selectedTeamIds.length & (selectedTeamIds.length - 1)) === 0); // knockout -> 2ning darajasi

  const canCreate = name.trim().length > 0 && countOk;

  const handleCreate = () => {
    if (!canCreate) return;
    if (isCL) {
      onCreate({
        name: name.trim(),
        format,
        ...CHAMPIONS_LEAGUE_PRESET,
        teamIds: selectedTeamIds,
      });
      return;
    }
    onCreate({
      name: name.trim(),
      format,
      isDouble,
      thirdPlacePlayoff,
      knockoutTwoLegged,
      groupsCount,
      teamsPerGroup,
      advancePerGroup,
      groupDouble,
      teamIds: selectedTeamIds,
    });
  };

  return (
    <div className="card">
      <div className="column-title title-a" style={{ marginBottom: '12px' }}>➕ Yangi Turnir Yaratish</div>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Turnir nomi (masalan: 'Do'stlar Ligasi')"
        className="search-input"
        style={{ marginBottom: '14px' }}
      />

      <div className="squad-header" style={{ marginBottom: '8px' }}>Turnir turi</div>
      <div className="format-options">
        {Object.entries(FORMAT_INFO).map(([key, fi]) => (
          <button
            key={key}
            onClick={() => setFormat(key)}
            className={`format-btn ${format === key ? 'format-btn-active' : ''}`}
          >
            {fi.label}
          </button>
        ))}
      </div>

      {/* ROUND ROBIN sozlamalari */}
      {format === 'round_robin' && (
        <label className="toggle-row">
          <input type="checkbox" checked={isDouble} onChange={(e) => setIsDouble(e.target.checked)} />
          Har jamoa bir-biri bilan 2 marta (uy/mehmon) o'ynaydi
        </label>
      )}

      {/* KNOCKOUT sozlamalari */}
      {format === 'knockout' && (
        <>
          <label className="toggle-row">
            <input type="checkbox" checked={knockoutTwoLegged} onChange={(e) => setKnockoutTwoLegged(e.target.checked)} />
            Har bosqich 2 o'yin (jami hisob) — final baribir 1 o'yin
          </label>
          <label className="toggle-row">
            <input type="checkbox" checked={thirdPlacePlayoff} onChange={(e) => setThirdPlacePlayoff(e.target.checked)} />
            3-o'rin uchun o'yin (yarim finalda yutqazganlar o'rtasida)
          </label>
          <div className="format-hint">Jamoalar soni 2 ning darajasi bo'lishi kerak: 4, 8, 16 yoki 32</div>
        </>
      )}

      {/* GROUP + KNOCKOUT sozlamalari */}
      {format === 'group_knockout' && (
        <div className="group-settings">
          <div className="group-field">
            <span>Guruhlar soni:</span>
            <input type="number" min={2} max={16} value={groupsCount} onChange={(e) => setGroupsCount(Math.max(2, +e.target.value || 2))} />
          </div>
          <div className="group-field">
            <span>Har guruhda nechta jamoa:</span>
            <input type="number" min={3} max={6} value={teamsPerGroup} onChange={(e) => setTeamsPerGroup(Math.max(3, +e.target.value || 3))} />
          </div>
          <div className="group-field">
            <span>Har guruhdan nechta jamoa chiqadi:</span>
            <input type="number" min={1} max={teamsPerGroup - 1} value={advancePerGroup} onChange={(e) => setAdvancePerGroup(Math.max(1, +e.target.value || 1))} />
          </div>
          <label className="toggle-row">
            <input type="checkbox" checked={groupDouble} onChange={(e) => setGroupDouble(e.target.checked)} />
            Guruh ichida 2 marta (uy/mehmon) o'ynaladi
          </label>
          <label className="toggle-row">
            <input type="checkbox" checked={knockoutTwoLegged} onChange={(e) => setKnockoutTwoLegged(e.target.checked)} />
            Pley-offda har bosqich 2 o'yin — final baribir 1 o'yin
          </label>
          <label className="toggle-row">
            <input type="checkbox" checked={thirdPlacePlayoff} onChange={(e) => setThirdPlacePlayoff(e.target.checked)} />
            3-o'rin uchun o'yin
          </label>
          <div className="format-hint">
            Jami kerakli jamoalar: {groupsCount * teamsPerGroup} ta ({groupsCount} guruh × {teamsPerGroup})
          </div>
        </div>
      )}

      {/* CHAMPIONS LEAGUE — haqiqiy format: yagona liga fazasi + pley-off */}
      {isCL && (
        <div className="group-settings">
          <div className="format-hint">
            Haqiqiy CL formati: 16 jamoa BITTA umumiy liga jadvalida har biri {CHAMPIONS_LEAGUE_PRESET.leaguePhaseGames} ta turli
            raqib bilan o'ynaydi. Top {CHAMPIONS_LEAGUE_PRESET.clDirectSlots} jamoa to'g'ridan-to'g'ri chorak finalga chiqadi,
            keyingi {CHAMPIONS_LEAGUE_PRESET.clPlayoffSlots} jamoa 2 o'yinlik pley-offda kurashib, g'oliblari chorak finalning
            qolgan joylarini egallaydi. 3-o'rin o'yini yo'q.
          </div>
        </div>
      )}

      <div className="squad-header" style={{ marginTop: '16px', marginBottom: '8px' }}>
        Jamoalarni tanlang ({selectedTeamIds.length}{requiredTeams ? `/${requiredTeams}` : ''})
      </div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 Jamoa qidirish..."
        className="search-input"
        style={{ marginBottom: '8px' }}
      />
      <div className="team-list-scroll" style={{ maxHeight: '260px' }}>
        {visibleTeams.map((t) => {
          const checked = selectedTeamIds.includes(t.id);
          return (
            <button
              key={t.id}
              onClick={() => toggleTeam(t.id)}
              className={`team-btn ${checked ? 'selected-a' : ''}`}
              style={{ marginBottom: '6px' }}
            >
              <span>{t.logo} {t.name}</span>
              {checked && <span className="rating-badge">✓</span>}
            </button>
          );
        })}
      </div>

      <div className="tournament-actions">
        <button className="secondary-btn" onClick={onCancel}>⬅ Bekor qilish</button>
        <button className="action-btn" disabled={!canCreate} onClick={handleCreate}>🏆 Turnirni Yaratish</button>
      </div>
    </div>
  );
}
