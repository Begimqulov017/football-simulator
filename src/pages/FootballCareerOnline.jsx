import React from 'react';
import Icon from '../components/Icon';
import CareerApp from '../career/CareerApp';
import AdminPanel from '../components/AdminPanel';

export default function FootballCareerOnline({ currentUser, onBack }) {
  const admin = !!currentUser.isAdmin;
  const allowed = currentUser.canAccessPro;

  // Premium (yoki admin) foydalanuvchi uchun — to'liq Football Career Online
  // ilovasini shu yerga ochamiz, "Menyuga qaytish" bosilganda esa asosiy
  // ekranga (onBack) qaytariladi.
  if (allowed) {
    return <CareerApp currentUser={currentUser} onExit={onBack} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700 p-6 shadow-2xl flex flex-col items-center text-center gap-3">
        <button
          className="self-start flex items-center gap-1.5 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
          onClick={onBack}
        >
          <Icon name="back" size={16} />
          Orqaga
        </button>

        <span className="w-14 h-14 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <Icon name="trophy" size={26} />
        </span>
        <h1 className="text-2xl font-black text-slate-50">Football Career Online</h1>
        <p className="text-slate-400 text-sm">Bitta o'yinchining karyerasini boshidan boshlab o'yna: klub, transfer, mashg'ulot, va boshqa foydalanuvchilar bilan statistikangizni solishtiring.</p>

        <div className="w-full flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 text-sm font-medium px-4 py-3">
          <Icon name="lock" size={18} className="shrink-0" />
          Ushbu bo'lim uchun <b>Premium</b> talab qilinadi. Sizda hozircha kirish huquqi yo'q.
        </div>

        {admin && <AdminPanel currentUser={currentUser} />}
      </div>
    </div>
  );
}
