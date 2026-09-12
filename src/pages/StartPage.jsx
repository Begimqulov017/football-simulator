import React from 'react';
import Icon from '../components/Icon';

export default function StartPage({ currentUser, onOpenMatchSimulator, onOpenProSimulator, onGoLogin, onGoRegister, onLogout }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700 p-6 shadow-2xl flex flex-col items-center text-center">
        <div className="w-full flex items-center justify-end gap-2 mb-4">
          {currentUser ? (
            <div className="flex items-center gap-2 text-sm text-slate-200 bg-slate-800/80 border border-slate-700 rounded-full pl-3 pr-2 py-1">
              <Icon name="user" size={15} className="text-slate-400" />
              {currentUser.username}
              <button
                className="flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold transition-colors pl-1"
                onClick={onLogout}
                aria-label="Chiqish"
              >
                <Icon name="logout" size={15} />
              </button>
            </div>
          ) : (
            <>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800 transition-colors text-sm"
                onClick={onGoLogin}
              >
                <Icon name="login" size={15} />
                Login
              </button>
              <button
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-sm transition-colors"
                onClick={onGoRegister}
              >
                Register
              </button>
            </>
          )}
        </div>

        <h1 className="text-3xl font-black text-slate-50 mb-1">⚽ Match Simulator</h1>
        <p className="text-slate-400 text-sm mb-6">Qaysi tajribani tanlaysiz?</p>

        <div className="w-full flex flex-col gap-3">
          <button
            className="w-full flex flex-col items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-green-500 transition-colors p-5"
            onClick={onOpenMatchSimulator}
          >
            <span className="w-11 h-11 rounded-full bg-green-500/15 border border-green-500/40 flex items-center justify-center text-green-400">
              <Icon name="gamepad" size={22} />
            </span>
            <span className="text-slate-50 font-bold">Matchsimulator</span>
            <span className="text-slate-400 text-xs">Bepul • Kirish shart emas</span>
          </button>

          <button
            className="w-full flex flex-col items-center gap-1.5 rounded-xl border border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-slate-800/60 hover:border-amber-400 transition-colors p-5"
            onClick={onOpenProSimulator}
          >
            <span className="w-11 h-11 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Icon name="trophy" size={22} />
            </span>
            <span className="text-slate-50 font-bold">Football Career Online</span>
            <span className="text-amber-400 text-xs">Premium • Kirish talab qilinadi</span>
          </button>
        </div>
      </div>
    </div>
  );
}
