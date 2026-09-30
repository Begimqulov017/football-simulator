import React from 'react';
import Icon from '../../components/Icon';
import { Button } from '../../components/ui';
import BrandMark from './BrandMark';

// Yuqori panel: chapda logotip, o'ngda Login/Register yoki foydalanuvchi holati.
export default function TopBar({ currentUser, onGoLogin, onGoRegister, onLogout }) {
  return (
    <header className="w-full max-w-6xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 pt-5">
      <div className="flex items-center gap-2.5">
        <BrandMark />
        <span className="hidden sm:block text-sm font-extrabold tracking-wide text-ink">FOOTBALL-SIMULATOR</span>
      </div>

      <div className="flex items-center gap-2">
        {currentUser ? (
          <div className="flex items-center gap-2 rounded-full bg-surface-card border border-surface-line shadow-soft pl-3 pr-1.5 py-1.5 text-sm font-semibold text-ink">
            <Icon name="user" size={15} className="text-ink-muted" />
            <span className="max-w-[9rem] truncate">{currentUser.username}</span>
            <button
              type="button"
              onClick={onLogout}
              aria-label="Chiqish"
              className="inline-flex items-center justify-center w-7 h-7 rounded-full text-ink-muted hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Icon name="logout" size={15} />
            </button>
          </div>
        ) : (
          <>
            <Button variant="secondary" size="sm" onClick={onGoLogin}>
              <Icon name="login" size={15} />
              Login
            </Button>
            <Button variant="primary" size="sm" onClick={onGoRegister}>
              Register
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
