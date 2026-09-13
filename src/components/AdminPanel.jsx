import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, setProAccess, deleteUser } from '../utils/auth';
import { checkBackendVersion, REQUIRED_SERVER_VERSION } from '../career/utils/careerApi';
import Icon from './Icon';

export default function AdminPanel({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState(null); // username pending delete confirmation
  const [busy, setBusy] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [versionWarning, setVersionWarning] = useState(null);

  const loadUsers = useCallback(() => {
    setLoading(true);
    getAllUsers().then((list) => {
      setUsers(list);
      setLoading(false);
      // If any account is missing its (admin-only) plaintext password field,
      // the backend hasn't actually been redeployed with the current
      // server/index.js yet - surface that clearly instead of a blank field.
      if (list.some((u) => !u.password)) {
        checkBackendVersion().then((v) => {
          setVersionWarning(
            v.ok
              ? `Backend eski versiyada (v${v.serverVersion}, kerak: v${REQUIRED_SERVER_VERSION}). Render'dagi backend'ni eng so'nggi server/index.js bilan qayta deploy qiling.`
              : "Backend'ga ulanib bo'lmadi."
          );
        });
      } else {
        setVersionWarning(null);
      }
    });
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const toggleUser = async (username, current) => {
    await setProAccess(username, !current);
    loadUsers();
  };

  const confirmDelete = async (username) => {
    setBusy(true);
    const res = await deleteUser(username);
    setBusy(false);
    setConfirmTarget(null);
    if (res.ok) {
      loadUsers();
    } else {
      alert(res.error || "Foydalanuvchini o'chirib bo'lmadi");
    }
  };

  return (
    <div className="w-full rounded-xl border border-slate-700 bg-slate-800/60 p-4 text-left">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
          <Icon name="shield" size={16} className="text-amber-400" />
          Admin: Foydalanuvchilar
        </div>
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          onClick={() => setShowPasswords((v) => !v)}
        >
          <Icon name="eye" size={14} />
          {showPasswords ? 'Parollarni yashirish' : "Parollarni ko'rsatish"}
        </button>
      </div>

      {loading && <div className="text-slate-400 text-sm">Yuklanmoqda...</div>}

      {versionWarning && (
        <div className="mb-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs px-3 py-2 flex items-start gap-1.5">
          <Icon name="warning" size={14} className="shrink-0 mt-0.5" />
          <span>{versionWarning}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {users.map((u) => {
          const isSelf = u.username === currentUser.username;
          const isConfirming = confirmTarget === u.username;
          return (
            <div
              key={u.username}
              className="rounded-lg bg-slate-900/60 border border-slate-700 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="text-slate-200 text-sm font-semibold flex items-center gap-1.5 truncate">
                    {u.username}
                    {isSelf ? ' (siz)' : ''}
                    {u.isAdmin && <Icon name="shield" size={13} className="text-amber-400 shrink-0" />}
                  </span>
                  <span className="text-slate-500 text-xs font-mono truncate">
                    parol: {showPasswords ? (u.password || '(backend eski — ko\'rinmaydi)') : '••••••••'}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {u.isAdmin ? (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-700 text-amber-300">ADMIN</span>
                  ) : (
                    <>
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
                      <button
                        className="flex items-center justify-center w-7 h-7 rounded-full bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
                        onClick={() => setConfirmTarget(u.username)}
                        aria-label="O'chirish"
                        title="Foydalanuvchini o'chirish"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isConfirming && (
                <div className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 flex flex-col gap-2">
                  <div className="flex items-start gap-1.5 text-red-300 text-xs">
                    <Icon name="warning" size={14} className="shrink-0 mt-0.5" />
                    <span><b>{u.username}</b> ni rostdan ham o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi — akkaunt va karyera saqlanmasi butunlay o'chib ketadi.</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      disabled={busy}
                      className="px-3 py-1 rounded-md text-xs font-bold bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors disabled:opacity-50"
                      onClick={() => setConfirmTarget(null)}
                    >
                      Yo'q
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      className="px-3 py-1 rounded-md text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
                      onClick={() => confirmDelete(u.username)}
                    >
                      {busy ? 'O\'chirilmoqda...' : 'Ha, o\'chirish'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
