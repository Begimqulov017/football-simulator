import React, { useEffect, useRef } from 'react';
import Icon from '../../components/Icon';
import StadiumBackground from './StadiumBackground';
import './auth.css';

/**
 * Shared frame for Login & Register: stadium backdrop + glass card + header
 * (back button, brand mark, title, switch-link). `shake` replays the shake
 * animation whenever it changes — pass an attempt/error counter.
 */
export default function AuthShell({ title, subtitle, switchLabel, onSwitch, onBack, shake = 0, children }) {
  const cardRef = useRef(null);

  // Replay the shake without remounting the card (remounting would drop input
  // focus and the password-reveal state): remove the class, force a reflow, re-add.
  useEffect(() => {
    const el = cardRef.current;
    if (!shake || !el) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  }, [shake]);

  return (
    <div className="au-root">
      <StadiumBackground />
      <div ref={cardRef} className="au-card">
        <div className="au-head">
          <button type="button" className="au-iconbtn" onClick={onBack} aria-label="Orqaga">
            <Icon name="back" size={18} />
          </button>
          <button type="button" className="au-link" onClick={onSwitch}>{switchLabel}</button>
        </div>
        <div className="au-brand"><Icon name="ball" size={30} strokeWidth={1.8} /></div>
        <h1 className="au-title">{title}</h1>
        <p className="au-sub">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

export function SubmitButton({ loading, done, loadingText, doneText, children }) {
  return (
    <button type="submit" className={`au-submit${done ? ' done' : ''}`} disabled={loading || done}>
      {loading && <span className="au-spin" aria-hidden="true" />}
      {done && <Icon name="check" size={20} strokeWidth={3} />}
      <span>{done ? doneText : loading ? loadingText : children}</span>
      {loading && <span className="au-loadbar" aria-hidden="true" />}
    </button>
  );
}

export function Banner({ kind = 'error', children }) {
  return (
    <div className={`au-banner ${kind}`} role="alert">
      <Icon name="warning" size={18} />
      <div>{children}</div>
    </div>
  );
}
