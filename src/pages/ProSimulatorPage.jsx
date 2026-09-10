import React from 'react';
import { getAllUsers, setProAccess, isAdmin } from '../utils/auth';

export default function ProSimulatorPage({ currentUser, onBack }) {
  const admin = isAdmin(currentUser.username);
  const allowed = currentUser.canAccessPro;
  const [, forceRerender] = React.useReducer((x) => x + 1, 0);

  const users = getAllUsers();

  const toggleUser = (username, current) => {
    setProAccess(username, !current);
    forceRerender();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700 p-6 shadow-2xl flex flex-col items-center text-center gap-3">
        <button
          className="self-start text-slate-300 hover:text-white text-sm font-semibold transition-colors"
          onClick={onBack}
        >
          ⬅ Orqaga
        </button>

        <span className="inline-block rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-bold tracking-wide px-3 py-1">
          🚧 COMING SOON
        </span>
        <h1 className="text-2xl font-black text-slate-50">Pro Simulator</h1>
        <p className="text-slate-400 text-sm">Kengaytirilgan, professional darajadagi simulyatsiya tajribasi tez orada!</p>

        {!allowed && (
          <div className="w-full rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 text-sm font-medium px-4 py-3">
            🔒 Ushbu bo'lim uchun <b>Premium</b> talab qilinadi. Sizda hozircha kirish huquqi yo'q.
          </div>
        )}
        {allowed && (
          <div className="w-full rounded-lg border border-green-500/40 bg-green-500/10 text-green-400 text-sm font-medium px-4 py-3">
            ✅ Sizda Pro Simulatorga kirish huquqi bor — tez orada bu yerda funksiyalar paydo bo'ladi.
          </div>
        )}

        {admin && (
          <div className="w-full rounded-xl border border-slate-700 bg-slate-800/60 p-4 text-left">
            <div className="text-slate-200 font-bold text-sm mb-3">🛡️ Admin: Foydalanuvchilar ruxsati</div>
            <div className="flex flex-col gap-2">
              {users.map((u) => (
                <div
                  key={u.username}
                  className="flex items-center justify-between rounded-lg bg-slate-900/60 border border-slate-700 px-3 py-2"
                >
                  <span className="text-slate-200 text-sm">
                    {u.username}{u.username === currentUser.username ? ' (siz)' : ''}
                  </span>
                  <button
                    className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                      u.canAccessPro
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                    onClick={() => toggleUser(u.username, u.canAccessPro)}
                  >
                    {u.canAccessPro ? 'ON' : 'OFF'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
