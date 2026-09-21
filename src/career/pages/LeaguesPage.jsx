import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { fetchLeagues } from '../utils/careerApi';

// 2-BAND: istalgan foydalanuvchi istalgan liganing holatini ko'ra olishi
// kerak, faqat o'z ligasini emas. Bu sahifa BARCHA 21 liganing ro'yxatini
// (server/api/leagues orqali) ko'rsatadi - qaysi biri hali "world" olganini
// (kimdir allaqachon ochgani, yoki admin "Next Day" bosgani) va qaysi
// mavsum/kunda turganini ham ko'rsatib turadi.
export default function LeaguesPage() {
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState([]);
  const [worldDate, setWorldDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchLeagues().then((res) => {
      if (cancelled) return;
      setLeagues(res.leagues || []);
      setWorldDate(res.worldDate);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Barcha ligalar</h1>
          <div className="sub">Dunyodagi 21 ta liganing barchasini ko'ring - o'z ligangiz bo'lmasa ham.</div>
        </div>
        {worldDate && <span className="badge badge-green">🌍 {worldDate}</span>}
      </div>

      {loading && <div className="sub" style={{ padding: 12 }}>Yuklanmoqda...</div>}

      <div className="grid grid-2" style={{ gap: 14 }}>
        {leagues.map((l) => (
          <div
            key={l.id}
            className="card"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
            onClick={() => navigate(`/leagues/${l.id}`)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>{l.flag}</span>
              <div>
                <div style={{ fontWeight: 600 }}>{l.name}{l.isMine && <span className="badge badge-gold" style={{ marginLeft: 8, fontSize: 11 }}>SIZNING LIGANGIZ</span>}</div>
                <div className="sub">{l.country} · {l.teamCount} klub</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {l.season ? (
                <>
                  <div className="badge">Mavsum {l.season}</div>
                  <div className="sub" style={{ fontSize: 11, marginTop: 4 }}>Kun {l.day}</div>
                </>
              ) : (
                <div className="sub" style={{ fontSize: 11 }}>Hali boshlanmagan</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
