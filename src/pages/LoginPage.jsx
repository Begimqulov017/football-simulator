import React, { useState } from 'react';
import { loginUser } from '../utils/auth';
import AuthShell, { SubmitButton, Banner } from './auth/AuthShell';
import AuthField from './auth/AuthField';
import { routeServerError } from './auth/authUtils';

// Props are unchanged (App.jsx): onSuccess(username), onGoRegister(), onBack().
export default function LoginPage({ onSuccess, onGoRegister, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({}); // { username, password, form }
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(0);

  const clear = (key) => setErrors((e) => (e[key] || e.form ? { ...e, [key]: undefined, form: undefined } : e));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || done) return;

    const local = {
      username: username.trim() ? undefined : 'Loginni kiriting',
      password: password ? undefined : 'Parolni kiriting',
    };
    if (local.username || local.password) {
      setErrors(local);
      setShake((n) => n + 1);
      return;
    }

    setErrors({});
    setLoading(true);
    const res = await loginUser(username, password);
    setLoading(false);

    if (!res.ok) {
      setErrors(routeServerError(res));
      setShake((n) => n + 1);
      return;
    }
    // Brief success state so the transition doesn't feel abrupt.
    setDone(true);
    setTimeout(() => onSuccess(res.username), 550);
  };

  return (
    <AuthShell
      title="Xush kelibsiz"
      subtitle="Hisobingizga kiring va karyerangizni davom ettiring"
      switchLabel="Ro'yxatdan o'tish"
      onSwitch={onGoRegister}
      onBack={onBack}
      shake={shake}
    >
      <form className="au-form" onSubmit={handleSubmit} noValidate>
        {errors.form && <Banner>{errors.form}</Banner>}

        <AuthField
          id="login-username"
          label="Login"
          icon="user"
          value={username}
          onChange={(v) => { setUsername(v); clear('username'); }}
          error={errors.username}
          autoComplete="username"
          autoFocus
          disabled={loading || done}
        />
        <AuthField
          id="login-password"
          label="Parol"
          icon="lock"
          type="password"
          value={password}
          onChange={(v) => { setPassword(v); clear('password'); }}
          error={errors.password}
          autoComplete="current-password"
          disabled={loading || done}
        />

        <SubmitButton loading={loading} done={done} loadingText="Tekshirilmoqda..." doneText="Muvaffaqiyatli!">
          Kirish
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
