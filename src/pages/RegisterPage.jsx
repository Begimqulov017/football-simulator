import React, { useState, useEffect } from 'react';
import { registerUser, getMeta } from '../utils/auth';
import AuthShell, { SubmitButton, Banner } from './auth/AuthShell';
import AuthField from './auth/AuthField';
import { validateUsername, validatePassword, routeServerError, passwordStrength, canAutoFocus } from './auth/authUtils';

const STRENGTH = [
  { label: '', color: 'rgba(255,255,255,.12)' },
  { label: 'Zaif', color: '#f87171' },
  { label: "O'rtacha", color: '#fbbf24' },
  { label: 'Yaxshi', color: '#34d399' },
  { label: 'Kuchli', color: '#10b981' },
];

// Props (App.jsx): onSuccess(username), onGoLogin(username?), onBack(), initialUsername.
// initialUsername carries over what was typed on the Login screen, so switching
// between the two forms never makes the person retype their login.
export default function RegisterPage({ onSuccess, onGoLogin, onBack, initialUsername = '' }) {
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [errors, setErrors] = useState({}); // { username, password, password2, form }
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(0);
  const [meta, setMeta] = useState({ userCount: 0, maxUsers: 10, registrationOpen: true, loaded: false });

  // Ro'yxatdan o'tish ochiqmi va nechta joy qolgani — serverdan (barcha
  // qurilmalar uchun bir xil sonlar) olinadi.
  useEffect(() => {
    let cancelled = false;
    getMeta().then((m) => { if (!cancelled) setMeta({ ...m, loaded: true }); });
    return () => { cancelled = true; };
  }, []);

  const open = !meta.loaded || meta.registrationOpen;
  const strength = passwordStrength(password);
  const clear = (...keys) => setErrors((e) => {
    const next = { ...e, form: undefined };
    keys.forEach((k) => { next[k] = undefined; });
    return next;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || done) return;

    const local = {
      username: validateUsername(username) || undefined,
      password: validatePassword(password) || undefined,
      password2: !password2 ? 'Parolni qayta kiriting' : password !== password2 ? 'Parollar mos emas' : undefined,
    };
    if (local.username || local.password || local.password2) {
      setErrors(local);
      setShake((n) => n + 1);
      return;
    }

    setErrors({});
    setLoading(true);
    const res = await registerUser(username, password);
    setLoading(false);

    if (!res.ok) {
      setErrors(routeServerError(res));
      setShake((n) => n + 1);
      return;
    }
    setDone(true);
    setTimeout(() => onSuccess(res.username), 550);
  };

  const busy = loading || done;

  return (
    <AuthShell
      title="Hisob yaratish"
      subtitle="Bir necha soniyada ro'yxatdan o'ting va maydonga chiqing"
      switchLabel="Kirish"
      onSwitch={() => { if (!busy) onGoLogin(username.trim()); }}
      onBack={onBack}
      shake={shake}
      footerText="Hisobingiz bormi?"
      footerAction="Kirish"
    >
      {!open ? (
        <Banner kind="closed">
          Ro'yxatdan o'tish yopiq — maksimal {meta.maxUsers} nafar foydalanuvchi allaqachon ro'yxatdan o'tgan.
        </Banner>
      ) : (
        <form className="au-form" onSubmit={handleSubmit} noValidate>
          {errors.form && <Banner>{errors.form}</Banner>}

          <AuthField
            id="reg-username"
            label="Yangi login"
            icon="user"
            value={username}
            onChange={(v) => { setUsername(v); clear('username'); }}
            error={errors.username}
            showValid={!validateUsername(username)}
            autoComplete="username"
            autoFocus={canAutoFocus() && !initialUsername}
            disabled={busy}
          />

          <AuthField
            id="reg-password"
            label="Parol"
            icon="lock"
            type="password"
            value={password}
            onChange={(v) => { setPassword(v); clear('password', 'password2'); }}
            error={errors.password}
            autoComplete="new-password"
            autoFocus={canAutoFocus() && !!initialUsername}
            disabled={busy}
          >
            {password && !errors.password && (
              <div className="au-meter" aria-hidden="true">
                {[1, 2, 3, 4].map((i) => (
                  <span key={i} style={i <= strength ? { background: STRENGTH[strength].color } : undefined} />
                ))}
                <b style={{ color: STRENGTH[strength].color }}>{STRENGTH[strength].label}</b>
              </div>
            )}
          </AuthField>

          <AuthField
            id="reg-password2"
            label="Parolni takrorlang"
            icon="lock"
            type="password"
            value={password2}
            onChange={(v) => { setPassword2(v); clear('password2'); }}
            error={errors.password2}
            autoComplete="new-password"
            disabled={busy}
          />

          <SubmitButton loading={loading} done={done} loadingText="Yuborilmoqda..." doneText="Hisob yaratildi!">
            Ro'yxatdan o'tish
          </SubmitButton>
        </form>
      )}

      <div className="au-foot">
        <span className={`au-slots${meta.loaded && !meta.registrationOpen ? ' full' : ''}`}>
          <i />
          Bo'sh joylar: {meta.loaded ? `${Math.max(meta.maxUsers - meta.userCount, 0)} / ${meta.maxUsers}` : '—'}
        </span>
      </div>
    </AuthShell>
  );
}
