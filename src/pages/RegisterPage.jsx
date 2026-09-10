import React, { useState } from 'react';
import { registerUser, isRegistrationOpen, getUserCount } from '../utils/auth';

export default function RegisterPage({ onSuccess, onGoLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');

  const open = isRegistrationOpen();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== password2) { setError('Parollar mos emas'); return; }
    const res = registerUser(username, password);
    if (!res.ok) { setError(res.error); return; }
    setError('');
    onSuccess(res.username);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-10">
      <form className="w-full max-w-sm rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700 p-6 shadow-2xl flex flex-col gap-3" onSubmit={handleSubmit}>
        <div className="flex items-center justify-between mb-2">
          <button type="button" className="text-slate-300 hover:text-white text-lg transition-colors" onClick={onBack}>⬅</button>
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
              className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2.5 mt-1 transition-colors"
            >
              Ro'yxatdan o'tish
            </button>
            <div className="text-center text-xs text-slate-400 mt-1">Joylar: {getUserCount()}/10</div>
          </>
        )}
      </form>
    </div>
  );
}
