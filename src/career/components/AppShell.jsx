import React from 'react';
import { NavLink } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useExit, useCurrentUser } from '../context/ExitContext';
import Icon from '../../components/Icon';

const NAV_ITEMS = [
  { to: '/home', icon: 'home', label: 'Bosh sahifa' },
  { to: '/profile', icon: 'user', label: 'Profil' },
  { to: '/club', icon: 'club', label: 'Klub' },
  { to: '/leagues', icon: 'trophy', label: "Barcha ligalar" },
  { to: '/all-stats', icon: 'stats', label: 'Statistika' },
  { to: '/messages', icon: 'mail', label: 'Xabarlar' },
  { to: '/training', icon: 'dumbbell', label: 'Mashg\'ulot' },
  { to: '/transfers', icon: 'transfer', label: 'Transferlar' },
  { to: '/national-team', icon: 'trophy', label: 'Milliy terma jamoa' },
  { to: '/news', icon: 'news', label: 'Yangiliklar' },
  { to: '/users', icon: 'users', label: 'Foydalanuvchilar' }
];

export default function AppShell({ children }) {
  const { player } = useGame();
  const onExit = useExit();
  const currentUser = useCurrentUser();
  // 1-BOSQICH: Admin akkaunti hech qachon karyera saqlanmasiga ega
  // bo'lmaydi (u faqat "umumiy dunyo"ni boshqaradi) - shuning uchun Home,
  // Club, Training kabi faqat karyerasi bor foydalanuvchilarga tegishli
  // menyu bandlarini butunlay yashiramiz, aks holda ular bosilganda
  // ma'nosiz "karyerangiz yo'q" holatiga tushib qolar edi.
  const isAdminOnly = !!currentUser?.isAdmin && !player;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="club-badge">{isAdminOnly ? '🛡️' : (player?.club?.logo || '⚽')}</div>
          <div>
            <div className="name">{isAdminOnly ? currentUser.username : (player ? `${player.name} ${player.surname}` : 'Player')}</div>
            <div className="rating">{isAdminOnly ? 'ADMIN' : `OVR ${player?.overall ?? '--'}`}</div>
          </div>
        </div>
        {!isAdminOnly && NAV_ITEMS.map((item) => {
          const unreadCount = item.to === '/messages'
            ? (player?.career?.messages || []).filter((m) => !m.read).length
            : 0;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="icon"><Icon name={item.icon} size={17} /></span>
              <span>{item.label}</span>
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: 'auto', background: '#ff4d4d', color: '#fff', borderRadius: 999,
                  fontSize: 11, fontWeight: 700, minWidth: 18, height: 18, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', padding: '0 5px'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
        {currentUser?.isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <span className="icon"><Icon name="shield" size={17} /></span>
            <span>Admin</span>
          </NavLink>
        )}
        <button
          type="button"
          className="nav-item"
          onClick={onExit}
          style={{ marginTop: 'auto', cursor: 'pointer', width: '100%', textAlign: 'left', background: 'none', border: '1px solid transparent' }}
        >
          <span className="icon"><Icon name="logout" size={17} /></span>
          <span>Menyuga qaytish</span>
        </button>
      </aside>
      <main className="main-area">{children}</main>
    </div>
  );
}
