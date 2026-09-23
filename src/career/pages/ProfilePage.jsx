import React from 'react';
import AppShell from '../components/AppShell';
import NotStarted from '../components/NotStarted';
import StatBar from '../components/StatBar';
import { useGame } from '../context/GameContext';
import { MAIN_STAT_LABELS } from '../utils/statCalc';

export default function ProfilePage() {
  const { player } = useGame();
  if (!player) return null;

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>{player.name} {player.surname}</h1>
          <div className="sub">#{player.number} · {player.position} · {player.age} yosh{player.nationality ? ` · ${player.nationality}` : ''}</div>
        </div>
        <span className="badge badge-gold">OVR {player.overall} · POT {player.potential}</span>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="card-title">ISM</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>{player.name} {player.surname}</div>
          <div className="card-title" style={{ marginTop: 14 }}>POZITSIYA</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>{player.position}</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div className="card-title">KLUB LOGOTIPI</div>
          <div style={{ fontSize: 44 }}>{player.club.logo}</div>
          <div style={{ marginTop: 8, fontFamily: 'var(--font-display)' }}>{player.club.name}</div>
          <div className="sub">{player.club.flag} {player.club.leagueName}</div>
          {player.club.tier && (
            <span className={`badge${player.club.tier === 'starter' ? ' badge-gold' : ''}`} style={{ marginTop: 8, display: 'inline-block' }}>
              {player.club.tier === 'starter' ? "⭐ Asosiy tarkib" : '🪑 Zaxira'}
            </span>
          )}
        </div>

        <div className="card">
          <div className="card-title">MILLIY TERMA JAMOA</div>
          {player.career?.international?.caps ? (
            <>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>
                {player.career.international.country}
              </div>
              <div className="sub" style={{ marginTop: 6 }}>
                {player.career.international.caps} o'yin · {player.career.international.goals || 0} gol · {player.career.international.assists || 0} assist
              </div>
              {!!(player.career.international.trophies || []).length && (
                <div style={{ marginTop: 8 }}>
                  {player.career.international.trophies.map((t, i) => (
                    <span key={i} className="badge badge-gold" style={{ marginRight: 6, marginBottom: 4, display: 'inline-block' }}>
                      🏆 {t.name} {t.year}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <NotStarted icon="🌍" title="Hali chaqirilmagansiz" desc="Terma jamoaga eng yaxshi futbolchilar chaqiriladi — reytingingizni oshiring." />
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-title">KONTRAKT</div>
        {player.career.freeAgent ? (
          <div style={{ color: 'var(--accent-red)', fontSize: 14 }}>
            🆓 Siz erkin agentsiz - Xabarlarda klub takliflarini kuting.
          </div>
        ) : player.career.contract ? (
          <>
            <div className="list-row">
              <span>Qolgan yillar</span>
              <span>{Math.max(0, Math.ceil((player.career.contract.signedDay + player.career.contract.yearsTotal * 365 - player.career.day) / 365))} / {player.career.contract.yearsTotal}</span>
            </div>
            <div className="list-row"><span>Haftalik maosh</span><span>${player.career.weeklyWage.toLocaleString()}</span></div>
          </>
        ) : (
          <div className="sub">Kontrakt topilmadi.</div>
        )}
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="card-title">BU MAVSUM</div>
          <div className="list-row"><span>O'yinlar</span><span>{player.career.seasonAppearances || 0}</span></div>
          <div className="list-row"><span>Gollar</span><span>{player.career.seasonGoals || 0}</span></div>
          <div className="list-row"><span>Assistlar</span><span>{player.career.seasonAssists || 0}</span></div>
        </div>

        <div className="card">
          <div className="card-title">KARYERA JAMI</div>
          <div className="list-row"><span>O'yinlar</span><span>{player.career.appearances}</span></div>
          <div className="list-row"><span>Gollar</span><span>{player.career.goals}</span></div>
          <div className="list-row"><span>Assistlar</span><span>{player.career.assists}</span></div>
          <div className="list-row">
            <span>O'rtacha reyting</span>
            <span>{player.career.matchRatings.length ? (player.career.matchRatings.reduce((a, b) => a + b, 0) / player.career.matchRatings.length).toFixed(1) : '—'}</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-title">HAFTALIK MAOSH</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--accent-gold)' }}>
          ${player.career.weeklyWage.toLocaleString()} / hafta
        </div>
        <div className="sub" style={{ marginTop: 4 }}>Balans: ${player.career.money.toLocaleString()}</div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">BARCHA STATLAR</div>
          {Object.entries(player.mainStats).map(([key, val]) => (
            <StatBar key={key} label={MAIN_STAT_LABELS[key]} value={val} />
          ))}
        </div>

        <div className="card">
          <div className="card-title">TROPHIES <span className="sub" style={{ fontWeight: 400 }}>· sizning shaxsiy yutuqlaringiz</span></div>
          {(!player.career.trophies || player.career.trophies.length === 0) ? (
            <NotStarted icon="🏆" title="Hali kubok yo'q" desc="Vitringizni to'ldirish uchun sovrinlar yutib oling." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
              {[...player.career.trophies].reverse().map((t, i) => (
                <div key={i} className="list-row">
                  <span>{t.icon || '🏆'} {t.name}</span>
                  <span className="badge badge-gold">{t.year}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
