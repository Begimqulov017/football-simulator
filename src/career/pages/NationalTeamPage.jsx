import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import NotStarted from '../components/NotStarted';
import { useGame } from '../context/GameContext';
import { fetchInternational, fetchNationSquad, fetchNationRankings } from '../utils/careerApi';

const GROUP_OF_POS = {
  GK: 'GK',
  CB: 'DEF', LB: 'DEF', RB: 'DEF',
  CDM: 'MID', CM: 'MID', CAM: 'MID', LM: 'MID', RM: 'MID',
  ST: 'ATT', LW: 'ATT', RW: 'ATT'
};
const GROUP_SLOTS = { ATT: 3, MID: 3, DEF: 4, GK: 1 };
const GROUP_ORDER = ['ATT', 'MID', 'DEF', 'GK'];
const LANE = { LW: -2, LM: -2, LB: -2, ST: 0, CAM: 0, CDM: 0, CM: 0, CB: 0, GK: 0, RW: 2, RM: 2, RB: 2 };

// 11-BOSQICH: milliy terma jamoa endi CLUB sahifasidagi kabi haqiqiy
// FORMATSIYA (asosiy 11lik) + ZAXIRA ko'rinishida - avval faqat tekis
// jadval edi, "11likka chaqirilishi kerak" degan talabga mos emas edi.
function buildFormation(squad) {
  const byGroup = { ATT: [], MID: [], DEF: [], GK: [] };
  squad.forEach((p) => { (byGroup[GROUP_OF_POS[p.pos] || 'MID']).push(p); });
  Object.values(byGroup).forEach((list) => list.sort((a, b) => (b.ovr || 0) - (a.ovr || 0)));

  const starters = [];
  GROUP_ORDER.forEach((g) => starters.push(...byGroup[g].slice(0, GROUP_SLOTS[g])));
  const usedIds = new Set(starters.map((p) => p.id));
  const leftovers = squad.filter((p) => !usedIds.has(p.id)).sort((a, b) => (b.ovr || 0) - (a.ovr || 0));
  while (starters.length < 11 && leftovers.length) starters.push(leftovers.shift());

  const starterIds = new Set(starters.map((p) => p.id));
  const bench = squad.filter((p) => !starterIds.has(p.id)).sort((a, b) => (b.ovr || 0) - (a.ovr || 0));

  const rows = GROUP_ORDER.map((g) => starters
    .filter((p) => (GROUP_OF_POS[p.pos] || 'MID') === g)
    .map((p, idx) => ({ p, idx }))
    .sort((a, b) => (LANE[a.p.pos] ?? 0) - (LANE[b.p.pos] ?? 0) || a.idx - b.idx)
    .map((x) => x.p));
  return { rows, bench };
}

function surname(fullName) {
  const parts = (fullName || '').trim().split(' ');
  return parts[parts.length - 1] || fullName;
}

export default function NationalTeamPage() {
  const { player } = useGame();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [squad, setSquad] = useState(null);
  const [squadError, setSquadError] = useState(null);
  const [world, setWorld] = useState({ tournaments: [], upcomingTournaments: [], history: [], news: [] });
  const [rankings, setRankings] = useState([]);
  const [tab, setTab] = useState('squad');

  useEffect(() => {
    let alive = true;
    (async () => {
      const [intl, nation, ranks] = await Promise.all([
        fetchInternational(),
        player?.nationality ? fetchNationSquad(player.nationality) : Promise.resolve({ ok: false }),
        fetchNationRankings()
      ]);
      if (!alive) return;
      setWorld(intl);
      setRankings(ranks);
      if (nation.ok) setSquad(nation.team);
      else setSquadError(nation.error || "Terma jamoa ma'lumoti topilmadi");
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [player?.nationality]);

  if (!player) return null;

  const intl = player.career?.international;
  const live = (world.tournaments || []).filter((t) => !t.finished);
  const upcoming = world.upcomingTournaments || [];
  const isCurrentlyPicked = !!squad?.squad?.some((p) => p.isYou);
  const { rows, bench } = squad ? buildFormation(squad.squad) : { rows: [], bench: [] };

  const cardStyle = (p) => ({
    width: 84, height: 72, borderRadius: 14,
    background: 'var(--glass-fill)',
    border: p.isYou ? '2px solid var(--accent-gold)' : '1px solid var(--glass-border)',
    boxShadow: p.isYou ? '0 0 0 3px rgba(255, 200, 60, 0.15)' : 'none',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-display)', position: 'relative', padding: '0 4px'
  });

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Milliy terma jamoa</h1>
          <div className="sub">
            {player.nationality || '—'}
            {world.worldDate ? ` · umumiy dunyo sanasi: ${world.worldDate}` : ''}
          </div>
        </div>
        <span className={`badge${intl?.caps ? ' badge-gold' : ''}`}>
          {intl?.caps ? `${intl.caps} o'yin · ${intl.goals || 0} gol` : 'Hali o\'ynamagan'}
        </span>
      </div>

      {loading ? (
        <NotStarted icon="⏳" title="Yuklanmoqda" desc="Terma jamoa ma'lumotlari olinmoqda." />
      ) : (
        <>
          <div className="card" style={{ marginBottom: 18 }}>
            <div className="card-title">SIZNING XALQARO KARYERANGIZ</div>
            <div className="grid grid-3" style={{ marginBottom: intl?.caps ? 10 : 0 }}>
              <div><div className="sub">Jami o'yinlar</div><div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{intl?.caps || 0}</div></div>
              <div><div className="sub">Gollar</div><div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{intl?.goals || 0}</div></div>
              <div><div className="sub">Assistlar</div><div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{intl?.assists || 0}</div></div>
            </div>
            <div style={{ marginTop: 8 }}>
              <span className={`badge ${isCurrentlyPicked ? 'badge-gold' : ''}`}>
                {isCurrentlyPicked ? "⭐ Hozirgi tarkibga chaqirilgansiz" : 'Hozircha tarkibda emassiz'}
              </span>
            </div>
            {intl?.lastCallUp && (
              <div style={{ marginTop: 10 }} className="sub">
                So'nggi o'yin: {intl.lastCallUp.date} · {intl.lastCallUp.competition} · {intl.lastCallUp.opponent}ga qarshi
                {intl.lastCallUp.rating ? ` · baho ${intl.lastCallUp.rating}` : ''}
                {intl.lastCallUp.seed !== undefined && intl.lastCallUp.seed !== null && (
                  <button
                    className="btn btn-ghost"
                    style={{ marginLeft: 10, padding: '2px 10px', fontSize: 12 }}
                    onClick={() => navigate('/national-team/replay')}
                  >
                    ▶ So'nggi o'yinni tomosha qilish
                  </button>
                )}
              </div>
            )}
            {!!(intl?.trophies || []).length && (
              <div style={{ marginTop: 8 }}>
                {intl.trophies.map((t, i) => (
                  <span key={i} className="badge badge-gold" style={{ marginRight: 6 }}>🏆 {t.name} {t.year}</span>
                ))}
              </div>
            )}
          </div>

          <div className="tabs" style={{ marginBottom: 14 }}>
            {[
              ['squad', 'Tarkib'],
              ['upcoming', `Kelayotgan turnirlar${live.length ? ` (${live.length} jonli)` : ''}`],
              ['rankings', 'Jahon reytingi'],
              ['history', 'Tarix']
            ].map(([k, label]) => (
              <button
                key={k}
                className={`btn${tab === k ? '' : ' btn-ghost'}`}
                style={{ marginRight: 8, marginBottom: 8 }}
                onClick={() => setTab(k)}
              >{label}</button>
            ))}
          </div>

          {tab === 'squad' && (
            <div className="grid grid-2">
              <div className="card">
                <div className="card-title">
                  {squad ? `${squad.flag} ${squad.country} — ASOSIY TARKIB (${squad.confederation} · kuch ${squad.strength})` : 'TARKIB'}
                </div>
                {squad ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {rows.map((row, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {row.map((p) => (
                          <div key={p.id} title={`${p.name} · ${p.pos} · OVR ${p.ovr}${p.isYou ? ' (Siz)' : ''}`} style={cardStyle(p)}>
                            <span style={{ fontSize: 12, textAlign: 'center', lineHeight: 1.15, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {surname(p.name)}
                            </span>
                            <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{p.pos}</span>
                            <span style={{ fontSize: 10, color: 'var(--accent-gold)' }}>{p.ovr}</span>
                            {p.isYou && <span style={{ position: 'absolute', top: -6, right: -6, fontSize: 11 }}>⭐</span>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <NotStarted icon="🏳️" title="Tarkib mavjud emas" desc={squadError} />
                )}
              </div>
              <div className="card">
                <div className="card-title">ZAXIRADAGI FUTBOLCHILAR</div>
                <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                  {bench.map((p) => (
                    <div key={p.id} className="list-row" style={p.isYou ? { color: 'var(--accent-gold)', fontWeight: 700 } : undefined}>
                      <span>{p.name}{p.isYou ? ' ⭐ (Siz)' : p.username ? ` (@${p.username})` : ''}</span>
                      <span className="badge">{p.pos} · {p.ovr}</span>
                    </div>
                  ))}
                  {squad && !bench.length && <div className="sub" style={{ padding: 8 }}>Zaxira yo'q.</div>}
                </div>
              </div>
            </div>
          )}

          {tab === 'upcoming' && (
            <>
              {live.map((t) => (
                <div className="card" key={t.id} style={{ marginBottom: 16 }}>
                  <div className="card-title">🔴 JONLI: {t.name} {t.year} · {t.size} jamoa</div>
                  {t.knockout?.length ? t.knockout.map((r) => (
                    <div key={r.label} style={{ marginBottom: 10 }}>
                      <div className="sub" style={{ marginBottom: 4 }}>{r.label}</div>
                      {r.ties.map((tie, i) => (
                        <div key={i}>
                          {tie.homeFlag} {tie.home} {tie.golA}–{tie.golB} {tie.away} {tie.awayFlag}
                          {tie.penalties ? ` (pen ${tie.penalties.a}–${tie.penalties.b})` : ''} → <b>{tie.winner}</b>
                        </div>
                      ))}
                    </div>
                  )) : null}
                  <div className="sub" style={{ marginTop: 8, marginBottom: 4 }}>Guruhlar</div>
                  <div className="grid grid-2">
                    {t.groups.map((g) => (
                      <div key={g.name} style={{ marginBottom: 8 }}>
                        <b>Guruh {g.name}</b>
                        {g.table.map((row) => (
                          <div key={row.country} className="sub">{row.country} — {row.pts} ochko ({row.gf}:{row.ga})</div>
                        ))}
                      </div>
                    ))}
                  </div>
                  {!!t.topScorers?.length && (
                    <>
                      <div className="sub" style={{ marginTop: 10, marginBottom: 4 }}>Eng ko'p gol urganlar</div>
                      {t.topScorers.slice(0, 5).map((s) => (
                        <div key={s.id} className="sub">{s.name} ({s.teamName}) — {s.goals}</div>
                      ))}
                    </>
                  )}
                </div>
              ))}

              <div className="card">
                <div className="card-title">TAQVIMDAGI KEYINGI TURNIRLAR</div>
                {upcoming.length === 0 ? (
                  <div className="sub" style={{ padding: 8 }}>Yaqin yillarda yangi turnir rejalashtirilmagan.</div>
                ) : (
                  upcoming.map((t, i) => (
                    <div key={i} className="list-row">
                      <span>🏆 {t.name} {t.year}{t.confederation ? ` · ${t.confederation}` : ' · Jahon chempionati'}</span>
                      <span className="badge">{t.startDate}</span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {tab === 'rankings' && (
            <div className="card">
              <div className="card-title">JAHON REYTINGI — O'RTACHA KUCH BO'YICHA</div>
              <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                {rankings.map((r, i) => (
                  <div
                    key={r.country}
                    className="list-row"
                    style={r.country === player.nationality ? { color: 'var(--accent-gold)', fontWeight: 700 } : undefined}
                  >
                    <span>{i + 1}. {r.flag} {r.country} <span className="sub" style={{ fontSize: 11 }}>· {r.confederation}</span></span>
                    <span className="badge badge-gold">{r.avgRating}</span>
                  </div>
                ))}
                {!rankings.length && <div className="sub" style={{ padding: 8 }}>Reyting hisoblanmoqda...</div>}
              </div>
            </div>
          )}

          {tab === 'history' && (
            <div className="card">
              <div className="card-title">O'TGAN TURNIRLAR</div>
              {(world.history || []).length ? (
                <table className="table">
                  <thead><tr><th>Yil</th><th>Turnir</th><th>Chempion</th><th>2-o'rin</th><th>Eng ko'p gol</th></tr></thead>
                  <tbody>
                    {world.history.map((h) => (
                      <tr key={h.id}>
                        <td>{h.year}</td><td>{h.name}</td><td><b>{h.winner}</b></td><td>{h.runnerUp}</td>
                        <td>{h.topScorer ? `${h.topScorer.name} (${h.topScorer.goals})` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <NotStarted icon="🏆" title="Hali turnir o'tmagan" desc="Birinchi turnir yakunlangach shu yerda ko'rinadi." />
              )}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
