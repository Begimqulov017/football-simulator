import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';
import { getLeagueTable, getTopScorers, getPlayerFixtures, getNextFixtureLabel, generateNews } from '../utils/season';

const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-yil ${d.getDate()}-${UZ_MONTHS[d.getMonth()]}`;
}

export default function HomePage() {
  const { player, nextDay, matchdayNext, prepareMatchday, worldDate, canAdvanceDay, hasUnwatchedResult, pendingWorldMatch } = useGame();
  const navigate = useNavigate();

  if (!player) return null;

  const table = getLeagueTable(player).slice(0, 5);
  const scorers = getTopScorers(player).slice(0, 5);
  const upcoming = getPlayerFixtures(player).filter((f) => !f.played).slice(0, 3);
  const latestNews = generateNews(player).slice(0, 4);
  const injured = !!player.career.injury;
  const nextOpponent = getNextFixtureLabel(player);

  // Jarohat FAQAT o'yin o'ynashga to'sqinlik qiladi, kunni o'tkazishga EMAS.
  // Avval bu yerda `if (injured) return;` turardi va tugmaning o'zi ham
  // disabled edi — natijada jarohatlangan foydalanuvchi butunlay qotib
  // qolardi (kun ham o'tmasdi, ya'ni jarohat ham hech qachon tuzalmasdi).
  // Endi jarohatda tugma oddiy "Next Day" bo'lib qoladi: o'sha kundagi liga
  // turi season.js'dagi processRound orqali foydalanuvchisiz (NPC tarkib
  // bilan) hal qilinadi, jarohat esa har kuni bir kunga kamayadi.
  const playable = matchdayNext && !injured;

  // 4-BAND: server umumiy dunyodagi o'yinni KUTMOQDA (pending) deb
  // bildirgan bo'lsa, ANA SHU birinchi o'ringa qo'yiladi - mahalliy
  // (klient-tomonlama, faqat kubok/mashg'ulot/xabarlar uchun qolgan) tizim
  // bilan hech qanday bog'liqligi yo'q, shuning uchun ular bir-birining
  // ustidan chiqmaydi. Eslatma: klientning o'z kalendari (`matchdayNext`)
  // bilan serverning kalendari orasida siljish bo'lishi mumkin (1-bosqichda
  // aniqlangan, hali to'liq birlashtirilmagan muammo) - shu sababli bu
  // tekshiruv HAR DOIM avval qilinadi, klient nima deb o'ylashidan qat'i
  // nazar.
  const handlePrimaryAction = () => {
    if (pendingWorldMatch) {
      navigate('/world-match');
      return;
    }
    if (playable) {
      try {
        prepareMatchday();
        navigate('/play-match');
      } catch (err) {
        console.error('Failed to prepare matchday', err);
        alert("O'yinni tayyorlashda xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
      }
    } else if (canAdvanceDay) {
      nextDay();
    }
    // canAdvanceDay === false: tugma allaqachon disabled - admin hali
    // "Kunni o'tkazish"ni bosmagan, shu sababli bu yerda hech narsa qilinmaydi.
  };

  const waitingForAdmin = !pendingWorldMatch && !playable && !canAdvanceDay;

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Xush kelibsiz, {player.name}</h1>
          <div className="sub">{player.club.logo} {player.club.name} · {player.club.leagueName}</div>
        </div>
        <span className="badge badge-green">{player.career.day}-kun</span>
      </div>

      {hasUnwatchedResult && (
        <div
          className="card"
          style={{
            marginBottom: 18, borderColor: 'var(--accent-gold)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}
          onClick={() => navigate('/live-result')}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-gold)' }}>🌍 Yangi natija tayyor!</div>
            <div className="sub">Umumiy dunyoda o'yiningiz hal qilindi - ko'rish uchun bosing.</div>
          </div>
          <span className="badge badge-gold">▶ Ko'rish</span>
        </div>
      )}

      {worldDate && (
        <div className="sub" style={{ marginBottom: 12 }}>
          🌍 Umumiy dunyo sanasi: <b>{worldDate}</b> (admin tomonidan boshqariladi)
          {waitingForAdmin && (
            <span style={{ color: 'var(--accent-gold)', marginLeft: 8 }}>
              — siz shu kunga yetib oldingiz, admin keyingi kunni ochguncha kuting.
            </span>
          )}
        </div>
      )}

      {player.career.freeAgent && (
        <div className="card" style={{ marginBottom: 18, borderColor: 'var(--accent-red)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-red)', marginBottom: 4 }}>🆓 ERKIN AGENT</div>
          <div className="sub">Hozir sizda klub yo'q - takliflarni ko'rish uchun Xabarlarni tekshiring.</div>
        </div>
      )}

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        {/* Time / Next Day */}
        <div className="card card--glow-green">
          <div className="card-title">VAQT</div>
          <div className="next-day-cta" style={{ marginBottom: 18 }}>
            <button
              className="next-day-btn"
              onClick={handlePrimaryAction}
              disabled={waitingForAdmin}
              style={
                (pendingWorldMatch || playable) ? { background: 'linear-gradient(90deg, var(--accent-gold), var(--accent-gold-dim))' }
                : waitingForAdmin ? { opacity: 0.5, cursor: 'not-allowed' }
                : undefined
              }
            >
              {pendingWorldMatch
                ? `▶ O'ynash (${pendingWorldMatch.competition === 'cup' ? 'Kubok' : 'Liga'} o'yini)`
                : playable
                  ? `▶ O'ynash${nextOpponent ? ` — ${nextOpponent}ga qarshi` : ''}`
                  : waitingForAdmin
                    ? '⏳ Adminni kuting...'
                    : 'Keyingi kun =>'}
            </button>
            <div className="indicator">
              <span className="indicator-label">SHAKL</span>
              <span className="indicator-value">{player.career.form}</span>
            </div>
            <div className="indicator">
              <span className="indicator-label">KUCH-QUVVAT</span>
              <div className="stamina-track"><div className="stamina-fill" style={{ width: `${player.career.stamina}%` }} /></div>
            </div>
          </div>
          {injured && (
            <div className="badge badge-red" style={{ marginBottom: 10, display: 'inline-block' }}>
              Jarohatlangan - {player.career.injury.daysLeft} kun qoldi
            </div>
          )}
          {injured && matchdayNext && (
            <div className="sub" style={{ marginBottom: 10 }}>
              Bugun o'yin bor, lekin siz jarohatlangansiz — o'yin sizsiz o'tadi.
              "Keyingi kun" bilan kunni o'tkazishingiz mumkin.
            </div>
          )}
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 10 }}>
            {formatDate(player.career.gameDate)}
          </div>
          <div className="grid grid-3">
            {[0, 1, 2].map((i) => {
              const f = upcoming[i];
              return (
                <div key={i} className="result-card" style={{ padding: '14px 8px' }}>
                  <div className="label" style={{ marginBottom: 8 }}>{f ? f.date : '—'}</div>
                  <button className="btn" disabled style={{ width: '100%', padding: '8px 6px', fontSize: 12 }}>
                    {f ? `${f.isHome ? 'uy' : 'mehmon'} — ${f.opponent}` : 'Mavsum tugadi'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mini dashboard: League top 5 */}
        <div className="grid" style={{ gap: 18 }}>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/league')}>
            <div className="card-title">LIGA TOP 5</div>
            {table.map((row, i) => (
              <div key={row.teamId} className="list-row" style={row.teamId === player.club.id ? { color: 'var(--accent-gold)' } : undefined}>
                <span>{i + 1}. {row.logo} {row.name}</span>
                <span className="badge">{row.pts} ochko</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/news')}>
          <div className="card-title">YANGILIKLAR</div>
          {latestNews.length === 0 && (
            <div className="sub" style={{ padding: 8 }}>Hozircha yangilik yo'q — bir necha o'yin o'ynang, sarlavhalar chiqa boshlaydi.</div>
          )}
          {latestNews.map((n) => (
            <div key={n.id} className="list-row" style={{ alignItems: 'flex-start' }}>
              <span style={{ display: 'flex', gap: 8 }}>
                <span>{n.icon}</span>
                <span>
                  <span style={{ fontWeight: 600 }}>{n.headline}</span>
                  <div className="sub" style={{ fontSize: 11 }}>{n.body}</div>
                </span>
              </span>
            </div>
          ))}
        </div>

        <div className="grid" style={{ gap: 18 }}>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/top-scorers')}>
            <div className="card-title">TOP 5 BOMBARDIR</div>
            {scorers.length === 0 && <div className="sub" style={{ padding: 8 }}>Hali gol yo'q.</div>}
            {scorers.map((s, i) => (
              <div key={s.id} className="list-row" style={s.id === player.id ? { color: 'var(--accent-gold)' } : undefined}>
                <span>{i + 1}. {s.name}</span>
                <span className="badge badge-gold">{s.goals}</span>
              </div>
            ))}
          </div>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/money')}>
            <div className="card-title">PUL VA BYUDJET</div>
            <div className="list-row"><span>Balans</span><span className="badge badge-green">${player.career.money.toLocaleString()}</span></div>
            <div className="list-row"><span>Haftalik maosh</span><span className="badge">${player.career.weeklyWage.toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
