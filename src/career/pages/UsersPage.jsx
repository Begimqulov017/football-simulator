import React, { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import { fetchAllCareerUsers, checkBackendVersion, REQUIRED_SERVER_VERSION } from '../utils/careerApi';
import Icon from '../../components/Icon';

function formatMoney(n) {
  if (n == null) return '-';
  return '€' + Number(n).toLocaleString('en-US');
}

export default function UsersPage({ currentUser }) {
  const [state, setState] = useState({ loading: true, error: null, users: [] });

  const load = () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchAllCareerUsers().then(async (res) => {
      if (!res.ok) {
        const version = await checkBackendVersion();
        const error = version.ok && !version.upToDate
          ? `Backend eski versiyada ishlamoqda (v${version.serverVersion}, kerak: v${REQUIRED_SERVER_VERSION}). Render'dagi backend'ni server/index.js bilan qayta deploy qiling.`
          : (res.error || "Yuklab bo'lmadi");
        setState({ loading: false, error, users: [] });
      } else {
        setState({ loading: false, error: null, users: res.users });
      }
    });
  };

  useEffect(() => { load(); }, []);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <div className="sub">Football Career Online'dagi barcha premium o'yinchilarning klub statistikasi</div>
        </div>
      </div>

      {state.loading && (
        <div className="card" style={{ textAlign: 'center', padding: '32px 16px' }}>
          Yuklanmoqda...
        </div>
      )}

      {!state.loading && state.error && (
        <div className="card" style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--accent-red)' }}>
          <Icon name="lock" size={22} />
          <div style={{ marginTop: 8 }}>{state.error}</div>
          <button className="btn" style={{ marginTop: 14 }} onClick={load}>Qayta urinish</button>
        </div>
      )}

      {!state.loading && !state.error && (
        <div className="grid grid-2">
          {state.users.length === 0 && (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Hozircha hech kim karyera boshlamagan.
            </div>
          )}
          {state.users.map((u) => (
            <div
              key={u.username}
              className="card"
              style={u.username === currentUser?.username ? { borderColor: 'rgba(245, 158, 11, 0.5)' } : undefined}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: 'var(--glass-fill)',
                  border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 22,
                }}>
                  {u.club?.logo || '⚽'}
                </div>
                <div>
                  <div className="card-title" style={{ marginBottom: 2 }}>
                    {u.username}{u.username === currentUser?.username ? ' (Siz)' : ''}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {u.name} {u.surname} · {u.position || '-'}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--accent-gold)' }}>
                    {u.overall ?? '-'}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>OVR</div>
                </div>
              </div>

              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                {u.club ? `${u.club.flag || ''} ${u.club.name} · ${u.club.leagueName}` : 'Klub tanlanmagan'}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>{u.career?.appearances ?? 0}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>O'yinlar</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--accent-green)' }}>{u.career?.goals ?? 0}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Gol</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--accent-blue)' }}>{u.career?.assists ?? 0}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Assist</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--accent-gold)' }}>{formatMoney(u.career?.money)}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Balans</div>
                </div>
              </div>

              {!!u.career?.trophies?.length && (
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {u.career.trophies.map((t, i) => (
                    <span key={i} className="badge badge-gold" style={{ fontSize: 10 }}>
                      <Icon name="trophy" size={11} /> {typeof t === 'string' ? t : t.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
