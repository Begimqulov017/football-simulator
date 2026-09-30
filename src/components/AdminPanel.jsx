import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, setProAccess, deleteUser } from '../utils/auth';
import { checkBackendVersion, REQUIRED_SERVER_VERSION, advanceWorldDay, wipeAllData } from '../career/utils/careerApi';
import Icon from './Icon';

export default function AdminPanel({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState(null); // username pending delete confirmation
  const [busy, setBusy] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [versionWarning, setVersionWarning] = useState(null);
  const [worldBusy, setWorldBusy] = useState(false);
  const [worldResult, setWorldResult] = useState(null);
  const [wipeStep, setWipeStep] = useState(0); // 0 = idle, 1 = first confirm, 2 = typed confirm
  const [wipeText, setWipeText] = useState('');
  const [wipeBusy, setWipeBusy] = useState(false);
  const [wipeResult, setWipeResult] = useState(null);

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

  const handleAdvanceWorld = async () => {
    setWorldBusy(true);
    setWorldResult(null);
    const res = await advanceWorldDay();
    setWorldBusy(false);
    if (res.ok) {
      setWorldResult({
        ok: true,
        date: res.worldDate,
        count: res.resolvedMatches,
        matches: res.matches || []
      });
    } else {
      setWorldResult({ ok: false, error: res.error || "Kunni o'tkazib bo'lmadi" });
    }
  };

  const handleWipe = async () => {
    setWipeBusy(true);
    setWipeResult(null);
    const res = await wipeAllData();
    setWipeBusy(false);
    setWipeStep(0);
    setWipeText('');
    if (res.ok) {
      setWipeResult({ ok: true });
      loadUsers(); // now shows only the admin, with no career
      setWorldResult(null);
    } else {
      setWipeResult({ ok: false, error: res.error || "Tozalab bo'lmadi" });
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

      <div className="mb-4 rounded-lg border border-green-500/40 bg-green-500/10 p-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="text-green-300 text-sm font-bold flex items-center gap-1.5">
            🌍 Umumiy dunyo kalendari
          </div>
          <button
            type="button"
            disabled={worldBusy}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xs transition-colors disabled:opacity-50"
            onClick={handleAdvanceWorld}
          >
            {worldBusy ? "O'tkazilmoqda..." : "▶ Kunni o'tkazish (hammaga)"}
          </button>
        </div>
        <p className="text-green-200/70 text-xs mb-2">
          Bosilganda BARCHA 21 liga (hech kim o'ynamasa ham) bir kunga siljiydi va shu kundagi barcha liga VA kubok o'yinlari hal qilinadi — bu foydalanuvchilarning yagona umumiy kalendari, ular o'zlari kun o'tkaza olmaydi.
        </p>
        {worldResult && (
          worldResult.ok ? (
            <div className="text-xs text-slate-300">
              <div className="font-semibold mb-1">
                Sana: {worldResult.date} · {worldResult.count} ta o'yin hal qilindi
              </div>
              {worldResult.matches.length > 0 && (
                <div className="max-h-32 overflow-y-auto flex flex-col gap-0.5">
                  {worldResult.matches.map((m, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{m.league}: {m.home} vs {m.away}</span>
                      <span className="font-mono">
                        {m.score}{m.humanPlayers > 0 ? ` (${m.humanPlayers} user)` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-red-300">{worldResult.error}</div>
          )
        )}
      </div>

      <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="text-red-300 text-sm font-bold flex items-center gap-1.5">
            ⚠️ Xavfli hudud — hammasini tozalash
          </div>
          {wipeStep === 0 && (
            <button
              type="button"
              disabled={wipeBusy}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors disabled:opacity-50"
              onClick={() => setWipeStep(1)}
            >
              Wipe Data
            </button>
          )}
        </div>
        <p className="text-red-200/70 text-xs mb-2">
          Barcha foydalanuvchilar, karyeralar, liga natijalari va xalqaro turnirlar tarixi butunlay o'chadi — bu amalni ortga qaytarib bo'lmaydi. Faqat siz (admin) o'z parolingiz bilan qolasiz, lekin sizning karyerangiz ham tozalanadi.
        </p>

        {wipeStep === 1 && (
          <div className="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 flex flex-col gap-2">
            <div className="flex items-start gap-1.5 text-red-300 text-xs">
              <Icon name="warning" size={14} className="shrink-0 mt-0.5" />
              <span>Rostdan ham HAMMASINI o'chirmoqchimisiz? Buni tasdiqlash uchun pastga <b>OCHIRISH</b> deb yozing.</span>
            </div>
            <input
              type="text"
              value={wipeText}
              onChange={(e) => setWipeText(e.target.value)}
              placeholder="OCHIRISH"
              className="w-full rounded-md bg-slate-900 border border-red-500/40 text-red-100 text-xs px-2 py-1.5 font-mono"
              autoFocus
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                className="px-3 py-1 rounded-md text-xs font-bold bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors"
                onClick={() => { setWipeStep(0); setWipeText(''); }}
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={wipeText.trim().toUpperCase() !== 'OCHIRISH' || wipeBusy}
                className="px-3 py-1 rounded-md text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-40"
                onClick={handleWipe}
              >
                {wipeBusy ? 'Tozalanmoqda...' : 'Ha, HAMMASINI OCHIRISH'}
              </button>
            </div>
          </div>
        )}

        {wipeResult && (
          wipeResult.ok ? (
            <div className="text-xs text-green-300 mt-1">✅ Barcha ma'lumotlar tozalandi. Endi hammasi 0'dan.</div>
          ) : (
            <div className="text-xs text-red-300 mt-1">{wipeResult.error}</div>
          )
        )}
      </div>

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
