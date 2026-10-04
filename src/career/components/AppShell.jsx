import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useExit, useCurrentUser } from '../context/ExitContext';
import useProceduralMessages from '../utils/useProceduralMessages';
import { unreadCounts } from '../utils/messageGenerator';
import Icon from '../../components/Icon';
import { displayRating } from '../utils/statCalc';
import useChatUnread from '../hooks/useChatUnread';

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
  { to: '/awards', icon: 'star', label: 'Awards' },
  { to: '/chat', icon: 'chat', label: 'Global Chat' },
  { to: '/news', icon: 'news', label: 'News' },
  { to: '/users', icon: 'users', label: 'Users' }
];

const BADGE_STYLE = {
  marginLeft: 'auto',
  background: 'var(--accent-red)',
  boxShadow: '0 0 0 2px var(--bg-base), 0 0 10px rgba(239, 68, 68, 0.6)',
  flex: 'none'
};

// Red notification marker. `count` = number pill (Messages); no count = a plain dot.
function NavBadge({ count, label }) {
  if (!count) return null;
  return count === true ? (
    <span aria-label={label} title={label} style={{ ...BADGE_STYLE, width: 9, height: 9, borderRadius: '50%' }} />
  ) : (
    <span
      aria-label={label}
      title={label}
      style={{
        ...BADGE_STYLE, minWidth: 20, height: 20, padding: '0 6px', borderRadius: 10,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 11, fontWeight: 700, lineHeight: 1
      }}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function AppShell({ children }) {
  const { player } = useGame();
  const onExit = useExit();
  const currentUser = useCurrentUser();
  const { pathname } = useLocation();
  // Chat sahifasi ochiq bo'lganda badge kerak emas (sahifaning o'zi ko'rsatadi)
  const chatBadge = useChatUnread(currentUser?.username, pathname === '/chat');

  // Generates match reports / coach advice / call-ups etc. into the inbox.
  // Lives here (not on MessagesPage) so the badge updates on every page.
  useProceduralMessages();

  const unread = useMemo(() => unreadCounts(player?.career?.messages), [player?.career?.messages]);

  const badgeFor = (to) => {
    if (to === '/messages') {
      return unread.total
        ? <NavBadge count={unread.total} label={`${unread.total} unread message${unread.total === 1 ? '' : 's'}`} />
        : null;
    }
    if (to === '/national-team') {
      return unread.national ? <NavBadge count label="Unread national team message" /> : null;
    }
    return null;
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="club-badge">{player?.club?.logo || '⚽'}</div>
          <div>
            <div className="name">{player ? `${player.name} ${player.surname}` : 'Player'}</div>
            <div className="rating">OVR {displayRating(player?.overall) ?? '--'}</div>
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
            {badgeFor(item.to)}
            {item.to === '/chat' && (chatBadge.mentions > 0 || chatBadge.unread > 0) && (
              <span
                title={chatBadge.mentions > 0 ? `Sizga ${chatBadge.mentions} ta @teg` : `${chatBadge.unread} ta yangi xabar`}
                style={{
                  marginLeft: 'auto', minWidth: 20, height: 20, padding: '0 6px', borderRadius: 10,
                  fontSize: 11, fontWeight: 800, lineHeight: '20px', textAlign: 'center', color: '#fff',
                  background: chatBadge.mentions > 0 ? '#EF4444' : '#0284C7'
                }}
              >
                {chatBadge.mentions > 0 ? `@${chatBadge.mentions}` : (chatBadge.unread > 99 ? '99+' : chatBadge.unread)}
              </span>
            )}
          </NavLink>
        ))}
        {(currentUser?.isAdmin || currentUser?.role === 'moderator') && (
          <NavLink to="/admin" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <span className="icon"><Icon name="shield" size={17} /></span>
            <span>{currentUser?.isAdmin ? 'Admin' : 'Moderatsiya'}</span>
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
