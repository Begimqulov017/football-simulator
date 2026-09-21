import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { fetchWorld } from '../utils/careerApi';
import { computeStandingsTable } from '../utils/season';
import { INITIAL_TEAMS } from '../../data/teamsData';

const teamName = (id) => INITIAL_TEAMS.find((t) => t.id === id)?.name || id;
const teamLogo = (id) => INITIAL_TEAMS.find((t) => t.id === id)?.logo || '⚽';

// 2-BAND: istalgan foydalanuvchi istalgan liganing istalgan o'yiniga kirib
// natija/statistikani ko'ra olishi kerak. Bu sahifa /api/world/:leagueId
// orqali SHU umumiy dunyo (server tomonidan avtomatik hal qilingan)
// ma'lumotini o'qiydi - o'z ligangiz bo'lmasa ham ishlaydi, chunki bu
// endpoint har qanday login qilgan userga ochiq.
export default function LeagueBrowsePage() {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const [world, setWorld] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roundIdx, setRoundIdx] = useState(null);
  const [cupRoundIdx, setCupRoundIdx] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setRoundIdx(null);
    setCupRoundIdx(null);
    fetchWorld(leagueId).then((res) => {
      if (cancelled) return;
      setWorld(res.world);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [leagueId]);

  const table = useMemo(() => computeStandingsTable(world?.standings || {}), [world]);

  // world.schedule has EVERY round of the season (played and upcoming), not
  // just the last 20 like roundResultsLog - so any past or future fixture
  // for this league can be browsed, not only recent ones.
  const schedule = world?.schedule || [];
  const lastPlayedIdx = useMemo(() => {
    let idx = -1;
    schedule.forEach((r, i) => { if (r.matches.some((m) => m.played)) idx = i; });
    return idx;
  }, [schedule]);
  const activeIdx = roundIdx ?? (lastPlayedIdx >= 0 ? lastPlayedIdx : 0);
  const selectedRound = schedule[activeIdx];

  const cupRounds = world?.cup?.rounds || [];
  const activeCupIdx = cupRoundIdx ?? (cupRounds.length - 1);
  const selectedCupRound = cupRounds[activeCupIdx];

  if (loading) {
    return (
      <AppShell>
        <div className="sub" style={{ padding: 12 }}>Yuklanmoqda...</div>
      </AppShell>
    );
  }

  if (!world) {
    return (
      <AppShell>
        <div className="sub" style={{ padding: 12 }}>Liga topilmadi.</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>{world.leagueName}</h1>
          <div className="sub">Mavsum {world.season} · Kun {world.day} · {world.gameDate}</div>
        </div>
        <button className="btn" onClick={() => navigate('/leagues')}>← Barcha ligalar</button>
      </div>

      <div className="card">
        <div className="card-title">STANDINGS</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)', textAlign: 'left' }}>
                <th style={{ padding: '6px 8px' }}>#</th>
                <th style={{ padding: '6px 8px' }}>Club</th>
                <th style={{ padding: '6px 8px' }}>P</th>
                <th style={{ padding: '6px 8px' }}>W</th>
                <th style={{ padding: '6px 8px' }}>D</th>
                <th style={{ padding: '6px 8px' }}>L</th>
                <th style={{ padding: '6px 8px' }}>GD</th>
                <th style={{ padding: '6px 8px' }}>Pts</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row, i) => (
                <tr key={row.teamId}>
                  <td style={{ padding: '6px 8px' }}>{i + 1}</td>
                  <td style={{ padding: '6px 8px' }}>{row.logo} {row.name}</td>
                  <td style={{ padding: '6px 8px' }}>{row.played}</td>
                  <td style={{ padding: '6px 8px' }}>{row.win}</td>
                  <td style={{ padding: '6px 8px' }}>{row.draw}</td>
                  <td style={{ padding: '6px 8px' }}>{row.loss}</td>
                  <td style={{ padding: '6px 8px' }}>{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--accent-gold)' }}>{row.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRound && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{selectedRound.matches.every((m) => m.played) ? 'ROUND' : 'UPCOMING'} {selectedRound.round} · {selectedRound.date}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="btn" style={{ padding: '4px 10px', fontSize: 12 }}
                disabled={activeIdx <= 0}
                onClick={() => setRoundIdx(Math.max(0, activeIdx - 1))}
              >← Prev</button>
              <button
                className="btn" style={{ padding: '4px 10px', fontSize: 12 }}
                disabled={activeIdx >= schedule.length - 1}
                onClick={() => setRoundIdx(Math.min(schedule.length - 1, activeIdx + 1))}
              >Next →</button>
            </div>
          </div>
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {selectedRound.matches.map((m, i) => (
              <div key={i} className="list-row">
                <span>{teamLogo(m.home)} {teamName(m.home)} vs {teamName(m.away)} {teamLogo(m.away)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge">{m.played ? `${m.golA} - ${m.golB}` : '—'}</span>
                  {/* 5-BAND: faqat HAQIQATAN LiveMatch orqali o'ynalgan o'yinlar
                      (seed + o'sha paytdagi tarkib saqlangan) qayta tomosha
                      qilinadi - NPC-only o'yinlar hech qachon minut-minut
                      simulyatsiya qilinmagan, shuning uchun ularda "qayta
                      tomosha" qilib ko'rsatiladigan haqiqiy voqea yo'q. */}
                  {m.played && m.humanPlayed && m.seed && (
                    <button
                      className="btn" style={{ padding: '2px 8px', fontSize: 11 }}
                      onClick={() => navigate(`/leagues/${leagueId}/replay`, { state: { round: selectedRound.round, match: m } })}
                    >▶ Tomosha</button>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7-BAND: server-side domestic kubok - bitta ligadagi klublar orasida
          yagona (hammaga umumiy) bracket. `world.cup` allaqachon
          /api/world/:leagueId javobida keladi (faqat squads olib
          tashlanadi), shuning uchun qo'shimcha so'rov shart emas. */}
      {world?.cup && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🏆 {world.cup.name}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="btn" style={{ padding: '4px 10px', fontSize: 12 }}
                disabled={activeCupIdx <= 0}
                onClick={() => setCupRoundIdx(Math.max(0, activeCupIdx - 1))}
              >← Prev</button>
              <button
                className="btn" style={{ padding: '4px 10px', fontSize: 12 }}
                disabled={activeCupIdx >= cupRounds.length - 1}
                onClick={() => setCupRoundIdx(Math.min(cupRounds.length - 1, activeCupIdx + 1))}
              >Next →</button>
            </div>
          </div>
          {world.cup.championId && (
            <div className="sub" style={{ marginBottom: 10 }}>
              🏆 Chempion: <b>{teamLogo(world.cup.championId)} {teamName(world.cup.championId)}</b>
            </div>
          )}
          {selectedCupRound && (
            <>
              <div className="sub" style={{ marginBottom: 6 }}>
                {selectedCupRound.matches.every((m) => m.played) ? 'Tur' : 'Kutilmoqda'} {selectedCupRound.round} · {selectedCupRound.date}
              </div>
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {selectedCupRound.matches.map((m, i) => (
                  <div key={i} className="list-row">
                    <span>
                      {m.away === null ? (
                        <>{teamLogo(m.home)} <b>{teamName(m.home)}</b> — bye (raqibsiz o'tdi)</>
                      ) : (
                        <>
                          {teamLogo(m.home)} <span style={{ fontWeight: m.winnerId === m.home ? 700 : 400 }}>{teamName(m.home)}</span>
                          {' vs '}
                          <span style={{ fontWeight: m.winnerId === m.away ? 700 : 400 }}>{teamName(m.away)}</span> {teamLogo(m.away)}
                        </>
                      )}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="badge">
                        {m.away === null ? '—' : m.played ? `${m.golA} - ${m.golB}${m.wentToTiebreak ? ' (pen.)' : ''}` : '—'}
                      </span>
                      {m.played && m.humanPlayed && m.seed && (
                        <button
                          className="btn" style={{ padding: '2px 8px', fontSize: 11 }}
                          onClick={() => navigate(`/leagues/${leagueId}/replay`, { state: { round: selectedCupRound.round, match: m } })}
                        >▶ Tomosha</button>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </AppShell>
  );
}
