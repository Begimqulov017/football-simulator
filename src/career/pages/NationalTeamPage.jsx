import React, { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import NotStarted from '../components/NotStarted';
import { useGame } from '../context/GameContext';
import { fetchInternational, fetchNationSquad } from '../utils/careerApi';

// Everything on this page comes from the shared world - national squads are
// picked by the server from every player alive in the game, so what you see
// here is the same call-up list every other user sees.
export default function NationalTeamPage() {
  const { player } = useGame();
  const [loading, setLoading] = useState(true);
  const [squad, setSquad] = useState(null);
  const [squadError, setSquadError] = useState(null);
  const [world, setWorld] = useState({ tournaments: [], history: [], news: [] });
  const [tab, setTab] = useState('squad');

  useEffect(() => {
    let alive = true;
    (async () => {
      const [intl, nation] = await Promise.all([
        fetchInternational(),
        player?.nationality ? fetchNationSquad(player.nationality) : Promise.resolve({ ok: false })
      ]);
      if (!alive) return;
      setWorld(intl);
      if (nation.ok) setSquad(nation.team);
      else setSquadError(nation.error || "Terma jamoa ma'lumoti topilmadi");
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [player?.nationality]);

  if (!player) return null;

  const intl = player.career?.international;
  const live = (world.tournaments || []).filter((t) => !t.finished);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>National Team</h1>
          <div className="sub">
            {player.nationality || '—'}
            {world.worldDate ? ` · umumiy dunyo sanasi: ${world.worldDate}` : ''}
          </div>
        </div>
        <span className={`badge${intl?.caps ? ' badge-gold' : ''}`}>
          {intl?.caps ? `${intl.caps} caps · ${intl.goals || 0} gol` : 'Hali chaqirilmagan'}
        </span>
      </div>

      {loading ? (
        <NotStarted icon="⏳" title="Yuklanmoqda" desc="Terma jamoa ma'lumotlari olinmoqda." />
      ) : (
        <>
          {/* Your own international record */}
          <div className="card" style={{ marginBottom: 18 }}>
            <div className="card-title">SIZNING XALQARO KARYERANGIZ</div>
            {intl?.caps ? (
              <div className="grid grid-3">
                <div><div className="sub">Caps</div><div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{intl.caps}</div></div>
                <div><div className="sub">Gollar</div><div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{intl.goals || 0}</div></div>
                <div><div className="sub">Assistlar</div><div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{intl.assists || 0}</div></div>
                {intl.lastCallUp && (
                  <div style={{ gridColumn: '1 / -1', marginTop: 10 }} className="sub">
                    So'nggi o'yin: {intl.lastCallUp.date} · {intl.lastCallUp.competition} · {intl.lastCallUp.opponent}ga qarshi
                    {intl.lastCallUp.rating ? ` · baho ${intl.lastCallUp.rating}` : ''}
                  </div>
                )}
                {!!(intl.trophies || []).length && (
                  <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
                    {intl.trophies.map((t, i) => (
                      <span key={i} className="badge badge-gold" style={{ marginRight: 6 }}>🏆 {t.name} {t.year}</span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NotStarted
                icon="🌍"
                title="Terma jamobaga hali chaqirilmadingiz"
                desc="Terma jamoaga eng yuqori reytingli futbolchilar chaqiriladi. Reytingingizni oshiring — har bir xalqaro pauzada tarkib qaytadan tanlanadi."
              />
            )}
          </div>

          <div className="tabs" style={{ marginBottom: 14 }}>
            {[['squad', 'Tarkib'], ['live', `Turnirlar${live.length ? ` (${live.length})` : ''}`], ['history', 'Tarix']].map(([k, label]) => (
              <button
                key={k}
                className={`btn${tab === k ? '' : ' btn-ghost'}`}
                style={{ marginRight: 8 }}
                onClick={() => setTab(k)}
              >{label}</button>
            ))}
          </div>

          {tab === 'squad' && (
            <div className="card">
              <div className="card-title">
                {squad ? `${squad.flag} ${squad.country} — joriy tarkib (${squad.confederation} · kuch ${squad.strength})` : 'TARKIB'}
              </div>
              {squad ? (
                <table className="table">
                  <thead><tr><th>#</th><th>Futbolchi</th><th>Poz</th><th>OVR</th><th>Klub</th></tr></thead>
                  <tbody>
                    {squad.squad.map((p, i) => (
                      <tr key={p.id} style={p.isYou ? { fontWeight: 700, background: 'rgba(255,215,0,0.08)' } : undefined}>
                        <td>{i + 1}</td>
                        <td>{p.name}{p.isYou ? ' (siz)' : p.username ? ` (@${p.username})` : ''}</td>
                        <td>{p.pos}</td>
                        <td>{p.ovr}</td>
                        <td>{p.clubName || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <NotStarted icon="🏳️" title="Tarkib mavjud emas" desc={squadError} />
              )}
            </div>
          )}

          {tab === 'live' && (
            live.length ? live.map((t) => (
              <div className="card" key={t.id} style={{ marginBottom: 16 }}>
                <div className="card-title">{t.name} {t.year} · {t.size} jamoa</div>
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
            )) : (
              <NotStarted
                icon="📅"
                title="Hozir turnir yo'q"
                desc="Jahon chempionati 4 yilda bir (2026, 2030, 2034...), Yevropa/Copa/Osiyo/Afrika kubogi esa ular orasidagi juft yillarda o'tkaziladi."
              />
            )
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
