import React, { useState } from 'react';
import Icon from '../../components/Icon';

// Icon.jsx has no "eye-off" glyph, so it lives here to keep that shared file untouched.
function EyeOff({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.9 17.9A10.9 10.9 0 0 1 12 19C5 19 1 12 1 12a18.5 18.5 0 0 1 5.1-5.9M9.9 5.2A9.7 9.7 0 0 1 12 5c7 0 11 7 11 7a18.6 18.6 0 0 1-2.2 3.2M14.1 14.1a3 3 0 1 1-4.2-4.2M1 1l22 22" />
    </svg>
  );
}

/**
 * Floating-label glass input.
 * Visual states: idle / focus / filled / invalid / valid. `error` shows an
 * inline message below the field; `showValid` adds a check once it's filled
 * and error-free.
 */
export default function AuthField({
  id, label, icon, type = 'text', value, onChange, error, showValid = false,
  autoFocus = false, autoComplete, disabled = false, onBlur, children,
}) {
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';
  const filled = value !== '';
  const cls = ['au-field', focused && 'focus', filled && 'filled', error && 'invalid', !error && showValid && filled && 'valid']
    .filter(Boolean).join(' ');

  return (
    <div className={cls}>
      <div className="au-box">
        <span className="au-ico"><Icon name={icon} size={19} /></span>
        <div className="au-inwrap">
          <input
            id={id}
            className="au-input"
            type={isPassword && reveal ? 'text' : type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => { setFocused(false); if (onBlur) onBlur(); }}
            autoFocus={autoFocus}
            autoComplete={autoComplete}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-err` : undefined}
            spellCheck={false}
            autoCapitalize="none"
          />
          <label className="au-label" htmlFor={id}>{label}</label>
        </div>
        {!error && showValid && filled && !isPassword && <span className="au-tick"><Icon name="check" size={18} strokeWidth={2.6} /></span>}
        {isPassword && (
          <button
            type="button"
            className="au-eye"
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? 'Parolni yashirish' : "Parolni ko'rsatish"}
            tabIndex={-1}
          >
            {reveal ? <EyeOff /> : <Icon name="eye" size={18} />}
          </button>
        )}
      </div>
      {error && (
        <div className="au-msg" id={`${id}-err`} role="alert">
          <Icon name="warning" size={14} />
          <span>{error}</span>
        </div>
      )}
      {children}
    </div>
  );
}
