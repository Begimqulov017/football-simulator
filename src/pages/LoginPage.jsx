import React, { useState, useRef, useEffect } from 'react';
import { loginUser } from '../utils/auth';
import AuthShell, { SubmitButton, Banner } from './auth/AuthShell';
import AuthField from './auth/AuthField';
import {
  validateLoginUsername, validateLoginPassword, routeServerError, isUserNotFound, canAutoFocus,
} from './auth/authUtils';

/**
 * Login form (Phase 1, "Form Features").
 *
 * Props (App.jsx):
 *   onSuccess(username)        - signed in
 *   onGoRegister(username?)    - go to Register; the typed login is carried over
 *   onBack()                   - back to the start screen
 *   initialUsername            - pre-fills the login (e.g. coming back from Register)
 *
 * Validation: nothing is shown while the person is still filling in the form.
 * After the first failed submit, each field re-validates live (on every
 * keystroke and on blur) and the first invalid field is focused. Server
 * answers are routed to the field they are about; "login not found" offers
 * a one-tap jump to Register.
 */
export default function LoginPage({ onSuccess, onGoRegister, onBack, initialUsername = '' }) {
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({}); // { username, password, form }
  const [attempted, setAttempted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(0);
  const [focusReq, setFocusReq] = useState(null); // { field, n }

  const userRef = useRef(null);
  const passRef = useRef(null);
  const timerRef = useRef(null);

  const busy = loading || done;

  // Focus is requested through state so it runs AFTER the inputs are
  // re-enabled (they are disabled while the request is in flight).
  useEffect(() => {
    if (!focusReq) return;
    const el = focusReq.field === 'password' ? passRef.current : userRef.current;
    if (el) { el.focus(); if (focusReq.select) el.select(); }
  }, [focusReq]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const requestFocus = (field, select = false) => setFocusReq({ field, select, n: Date.now() });

  const validators = { username: validateLoginUsername, password: validateLoginPassword };

  // Typing clears any server/form error; once a submit has been attempted the
  // field also re-validates live so the red state disappears the moment it's fixed.
  const handleChange = (field, setter) => (value) => {
    setter(value);
    setErrors((e) => ({
      ...e,
      form: undefined,
      [field]: attempted ? validators[field](value) || undefined : undefined,
    }));
  };

  const handleBlur = (field, value) => () => {
    if (!attempted) return;
    setErrors((e) => (e.form ? e : { ...e, [field]: validators[field](value) || undefined }));
  };

  const goRegister = () => { if (!busy) onGoRegister(username.trim()); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;

    const local = {
      username: validateLoginUsername(username) || undefined,
      password: validateLoginPassword(password) || undefined,
    };
    if (local.username || local.password) {
      setAttempted(true);
      setErrors(local);
      setShake((n) => n + 1);
      requestFocus(local.username ? 'username' : 'password');
      return;
    }

    setErrors({});
    setLoading(true);
    const res = await loginUser(username, password);
    setLoading(false);

    if (!res.ok) {
      const next = routeServerError(res);
      setAttempted(true);
      setErrors(next);
      setShake((n) => n + 1);
      if (next.password) requestFocus('password', true);
      else if (next.username) requestFocus('username', true);
      return;
    }
    // Brief success state so the transition doesn't feel abrupt.
    setDone(true);
    timerRef.current = setTimeout(() => onSuccess(res.username), 550);
  };

  const prefilled = !!initialUsername;

  return (
    <AuthShell
      title="Xush kelibsiz"
      subtitle="Hisobingizga kiring va karyerangizni davom ettiring"
      switchLabel="Ro'yxatdan o'tish"
      onSwitch={goRegister}
      onBack={onBack}
      shake={shake}
      footerText="Hisobingiz yo'qmi?"
      footerAction="Ro'yxatdan o'tish"
    >
      <form className="au-form" onSubmit={handleSubmit} noValidate>
        {errors.form && <Banner>{errors.form}</Banner>}

        <AuthField
          ref={userRef}
          id="login-username"
          name="username"
          label="Login"
          icon="user"
          value={username}
          onChange={handleChange('username', setUsername)}
          onBlur={handleBlur('username', username)}
          error={errors.username}
          autoComplete="username"
          enterKeyHint="next"
          autoFocus={canAutoFocus() && !prefilled}
          disabled={busy}
        >
          {isUserNotFound(errors.username) && (
            <div className="au-cta-row">
              <span>Hisobingiz yo'qmi?</span>
              <button type="button" className="au-inline-cta" onClick={goRegister}>Ro'yxatdan o'ting</button>
            </div>
          )}
        </AuthField>

        <AuthField
          ref={passRef}
          id="login-password"
          name="password"
          label="Parol"
          icon="lock"
          type="password"
          value={password}
          onChange={handleChange('password', setPassword)}
          onBlur={handleBlur('password', password)}
          error={errors.password}
          autoComplete="current-password"
          enterKeyHint="go"
          capsHint
          autoFocus={canAutoFocus() && prefilled}
          disabled={busy}
        />

        <SubmitButton loading={loading} done={done} loadingText="Tekshirilmoqda..." doneText="Muvaffaqiyatli!">
          Kirish
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
