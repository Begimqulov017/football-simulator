import React from 'react';
import { NavLink } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useExit, useCurrentUser } from '../context/ExitContext';
import Icon from '../../components/Icon';

const NAV_ITEMS = [
  { to: '/home', icon: 'home', label: 'Home' },
  { to: '/profile', icon: 'user', label: 'Profile' },
  { to: '/club', icon: 'club', label: 'Club' },
  { to: '/leagues', icon: 'trophy', label: "Barcha ligalar" },
  { to: '/all-stats', icon: 'stats', label: 'All Stats' },
  { to: '/messages', icon: 'mail', label: 'Messages & Suggests' },
  { to: '/training', icon: 'dumbbell', label: 'Training' },
  { to: '/transfers', icon: 'transfer', label: 'Transfers' },
  { to: '/national-team', icon: 'trophy', label: 'National Team' },
  { to: '/news', icon: 'news', label: 'News' },
  { to: '/users', icon: 'users', label: 'Users' }
];

export default function AppShell({ children }) {
  const { player } = useGame();
  const onExit = useExit();
  const currentUser = useCurrentUser();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="club-badge">{player?.club?.logo || '⚽'}</div>
          <div>
            <div className="name">{player ? `${player.name} ${player.surname}` : 'Player'}</div>
            <div className="rating">OVR {player?.overall ?? '--'}</div>
          </div>
        </div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="icon"><Icon name={item.icon} size={17} /></span>
            <span>{item.label}</span>
          </NavLink>
        ))}
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
