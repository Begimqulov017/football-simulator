import React, { useState, useEffect } from 'react';
import { registerUser, getMeta } from '../utils/auth';
import Icon from '../components/Icon';

export default function RegisterPage({ onSuccess, onGoLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ userCount: 0, maxUsers: 10, registrationOpen: true, loaded: false });

  // Ro'yxatdan o'tish ochiqmi va nechta joy qolgani — serverdan (barcha
  // qurilmalar uchun bir xil sonlar) olinadi.
  useEffect(() => {
    let cancelled = false;
    getMeta().then((m) => { if (!cancelled) setMeta({ ...m, loaded: true }); });
    return () => { cancelled = true; };
  }, []);

  const open = !meta.loaded || meta.registrationOpen;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) { setError('Parollar mos emas'); return; }
    setLoading(true);
    const res = await registerUser(username, password);
    setLoading(false);
    if (!res.ok) { setError(res.error); return; }
    setError('');
    onSuccess(res.username);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-10">
      <form className="w-full max-w-sm rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700 p-6 shadow-2xl flex flex-col gap-3" onSubmit={handleSubmit}>
        <div className="flex items-center justify-between mb-2">
          <button type="button" className="text-slate-300 hover:text-white transition-colors" onClick={onBack} aria-label="Orqaga">
            <Icon name="back" />
          </button>
          <h2 className="text-xl font-black text-slate-50">Register</h2>
          <button type="button" className="text-green-400 hover:text-green-300 text-sm font-semibold transition-colors" onClick={onGoLogin}>
            Login
          </button>
        </div>

        {!open ? (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 text-sm font-medium px-4 py-3 mt-1">
            Ro'yxatdan o'tish yopiq — maksimal 10 nafar foydalanuvchi allaqachon ro'yxatdan o'tgan.
          </div>
        ) : (
          <>
            <input
              className="w-full rounded-lg bg-slate-800 text-white placeholder-slate-500 border border-slate-700 px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
              type="text"
              placeholder="Username (new)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <input
              className="w-full rounded-lg bg-slate-800 text-white placeholder-slate-500 border border-slate-700 px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              className="w-full rounded-lg bg-slate-800 text-white placeholder-slate-500 border border-slate-700 px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
              type="password"
              placeholder="Password (again)"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />

            {error && <div className="text-red-400 text-sm font-medium">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-60 text-white font-bold py-2.5 mt-1 transition-colors"
            >
              {loading ? 'Yuborilmoqda...' : "Ro'yxatdan o'tish"}
            </button>
            <div className="text-center text-xs text-slate-400 mt-1">
              Joylar: {meta.loaded ? `${meta.userCount}/${meta.maxUsers}` : '—'}
            </div>
          </>
        )}
      </form>
    </div>
  );
}
