import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../../components/Icon';
import {
  MAX_TURNS, COOLDOWN_DAYS, ROLES, ROLE_LIST, CONTRACT_YEARS, TERM_LABELS, INTEREST_META, roundTo,
  evaluateTerms, idealWageFor, wageBoundsFor, clauseBoundsFor,
  submitOffer, acceptClubTerms, walkAway, formatTerms,
} from './transferUtils';
import TeamLogo from '../../components/TeamLogo';

const THINK_MS = 900;
const fmtM = (n) => (n > 0 ? `$${n.toFixed(1)}M` : 'Free');

function bubbleText(e, teamName) {
  if (e.by === 'you') {
    if (e.kind === 'offer') return e.turn === 1 ? 'Here is my offer.' : 'I have revised my offer.';
    return e.note || '';
  }
  return e.note || `${teamName} replied.`;
}

export default function NegotiationModal({ ctx, negotiation, currentWage, onChange, onSign, onWalk, onClose }) {
  const { team, league } = ctx;
  const stage = negotiation.stage;
  const [draft, setDraft] = useState(negotiation.draft);
  const [thinking, setThinking] = useState(false);
  const timer = useRef(null);
  const dialogRef = useRef(null);

  // Klub javob bergach (stage/turn o'zgarganda) maydonlar klub taklifiga yangilanadi.
  useEffect(() => { setDraft(negotiation.draft); }, [negotiation.stage, negotiation.turn]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { const t = timer; return () => clearTimeout(t.current); }, []);

  // Escape, fokus va orqa fon skrolli.
  useEffect(() => {
    dialogRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape' && !thinking) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; };
  }, [thinking, onClose]);

  const editable = (stage === 'offer' || stage === 'counter') && !thinking;
  const ev = useMemo(() => evaluateTerms(draft, ctx), [draft, ctx]);
  const nextTurn = stage === 'offer' ? 1 : 2;
  const threshold = ctx.thresholds[nextTurn];
  const meterTone = ev.score >= threshold ? 'good' : ev.score >= threshold - 12 ? 'warn' : 'bad';
  const wageBounds = wageBoundsFor(ctx, draft.role);
  const clauseBounds = clauseBoundsFor(ctx);
  const overPct = Math.round((ev.ratio - 1) * 100);
  const activeStep = stage === 'offer' ? 0 : stage === 'counter' ? 1 : 2;
  const interest = INTEREST_META[ctx.analysis.interest];

  // ---- maydonlarni o'zgartirish ----
  const changeRole = (roleId) => {
    if (!editable || roleId === draft.role) return;
    const ratio = draft.wage / idealWageFor(ctx, draft.role); // "so'ralgan ustama" saqlanadi
    const b = wageBoundsFor(ctx, roleId);
    setDraft((d) => ({ ...d, role: roleId, wage: Math.min(b.max, Math.max(b.min, roundTo(ratio * b.base))) }));
  };
  const toggleClause = (on) => {
    if (!editable) return;
    setDraft((d) => ({ ...d, clause: on ? Math.min(clauseBounds.max, Math.max(clauseBounds.min, Math.round(ctx.idealClause))) : null }));
  };

  // ---- harakatlar ----
  const send = () => {
    if (!editable) return;
    setThinking(true);
    timer.current = setTimeout(() => {
      setThinking(false);
      onChange(submitOffer(negotiation, draft, ctx));
    }, THINK_MS);
  };
  const accept = () => onChange(acceptClubTerms(negotiation));
  const walk = () => onWalk(walkAway(negotiation, ctx.day));
  const sign = () => onSign({
    teamId: team.id, terms: negotiation.deal, fee: ctx.fee, messageId: negotiation.messageId, turns: negotiation.turn,
  });

  const titleId = `tx-title-${team.id}`;
  const host = document.querySelector('.career-app') || document.body;

  const content = (
    <div className="tx-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && !thinking) onClose(); }}>
      <div className="tx-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} ref={dialogRef}>
        <div className="tx-modal-head">
          <div className="tx-modal-title">
            <span className="tx-logo" aria-hidden="true"><TeamLogo id={team.id} logo={team.logo} size={34} /></span>
            <div style={{ minWidth: 0 }}>
              <h2 id={titleId}>Negotiation room · {team.name}</h2>
              <div className="sub">{league?.flag} {league?.name} · {interest.label}</div>
            </div>
          </div>
          <button type="button" className="tx-x" onClick={onClose} disabled={thinking} aria-label="Close negotiation room">
            <Icon name="close" size={16} />
          </button>
        </div>

        {stage === 'accepted' ? (
          <div className="tx-done">
            <svg className="tx-tick" viewBox="0 0 96 96" aria-hidden="true">
              <circle cx="48" cy="48" r="44" fill="#ECFDF5" stroke="#10B981" strokeWidth="4" />
              <path d="M28 50l14 14 27-30" fill="none" stroke="#059669" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <div className="big">Deal agreed!</div>
              <p className="sub" style={{ marginTop: 4, color: 'var(--text-secondary)', fontSize: 13 }}>
                {team.name} accepted after {negotiation.turn} {negotiation.turn === 1 ? 'turn' : 'turns'}. Sign to make the move official.
              </p>
            </div>
            <div className="tx-done-grid">
              <div className="tx-meta"><div className="k">Weekly</div><div className="v">${negotiation.deal.wage.toLocaleString()}</div></div>
              <div className="tx-meta"><div className="k">Length</div><div className="v">{negotiation.deal.years} yr</div></div>
              <div className="tx-meta"><div className="k">Role</div><div className="v">{ROLES[negotiation.deal.role].icon} {ROLES[negotiation.deal.role].label}</div></div>
              <div className="tx-meta"><div className="k">Clause</div><div className="v">{negotiation.deal.clause != null ? `$${negotiation.deal.clause}M` : 'None'}</div></div>
              <div className="tx-meta"><div className="k">Fee</div><div className="v">{fmtM(ctx.fee)}</div></div>
            </div>
            <div className="tx-actions" style={{ width: '100%' }}>
              <button type="button" className="btn btn-primary" onClick={sign}>Sign contract →</button>
              <button type="button" className="btn" onClick={onClose}>Decide later</button>
            </div>
          </div>
        ) : (
          <div className="tx-modal-body">
            <div className="tx-facts">
              <div className="tx-meta"><div className="k">Transfer fee</div><div className="v">{fmtM(ctx.fee)}</div></div>
              <div className="tx-meta"><div className="k">Your value</div><div className="v">{fmtM(ctx.marketValue)}</div></div>
              <div className="tx-meta"><div className="k">Current wage</div><div className="v">${(currentWage || 0).toLocaleString()}</div></div>
              <div className="tx-meta"><div className="k">Club power</div><div className="v">{ctx.analysis.power}</div></div>
            </div>

            <div className="tx-steps" aria-label={`Turn ${negotiation.turn} of ${MAX_TURNS}`}>
              {['Your offer', 'Club counter', 'Final decision'].map((t, i) => (
                <div key={t} className={`tx-step${i < activeStep ? ' done' : ''}${i === activeStep ? (stage === 'final' ? ' final-now' : ' now') : ''}`}>
                  <div className="n">Turn {i + 1}</div>
                  <div className="t">{t}</div>
                </div>
              ))}
            </div>

            {negotiation.thread.length > 0 && (
              <div className="tx-thread" aria-live="polite">
                {negotiation.thread.map((e, i) => (
                  <div key={i} className={`tx-bubble ${e.by}${e.by === 'club' ? ` ${e.kind}` : ''}`}>
                    <div className="who">{e.by === 'you' ? `You · turn ${e.turn}` : `${team.name} · turn ${e.turn}`}</div>
                    <div>{bubbleText(e, team.name)}</div>
                    {e.terms && <div className="terms">{formatTerms(e.terms)}</div>}
                  </div>
                ))}
              </div>
            )}

            {stage === 'final' && (
              <div className="tx-lockbar" role="status">
                <Icon name="lock" size={16} />
                <span>Turn 3 is the final decision — these terms are non-negotiable. Accept them or walk away.</span>
              </div>
            )}

            {/* ---- Squad role ---- */}
            <div>
              <div className="tx-field-label"><span>{TERM_LABELS.role}</span></div>
              <div className="tx-roles" role="radiogroup" aria-label="Squad role">
                {ROLE_LIST.map((r) => (
                  <button
                    key={r.id} type="button" role="radio" aria-checked={draft.role === r.id}
                    className={`tx-role${draft.role === r.id ? ' on' : ''}`} disabled={!editable} onClick={() => changeRole(r.id)}
                  >
                    <div className="rt">{r.icon} {r.label}</div>
                    <div className="rd">{r.desc}</div>
                    {ctx.analysis.deservedRole === r.id && <span className="rb">Club's view of you</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* ---- Salary ---- */}
            <div>
              <div className="tx-field-label"><span>{TERM_LABELS.salary}</span><span className="val">${draft.wage.toLocaleString()}</span></div>
              <input
                className="tx-range" type="range" min={wageBounds.min} max={wageBounds.max} step={10} value={draft.wage}
                disabled={!editable} aria-label="Weekly salary"
                onChange={(e) => setDraft((d) => ({ ...d, wage: roundTo(Number(e.target.value)) }))}
              />
              <div className="tx-range-legend">
                <span>${wageBounds.min.toLocaleString()}</span>
                <span>Club budget ${wageBounds.base.toLocaleString()}{overPct > 0 ? ` · you ask +${overPct}%` : ''}</span>
                <span>${wageBounds.max.toLocaleString()}</span>
              </div>
            </div>

            {/* ---- Contract length ---- */}
            <div>
              <div className="tx-field-label"><span>{TERM_LABELS.years}</span></div>
              <div className="tx-years" role="radiogroup" aria-label="Contract length in years">
                {CONTRACT_YEARS.map((y) => (
                  <button
                    key={y} type="button" role="radio" aria-checked={draft.years === y}
                    className={`tx-year${draft.years === y ? ' on' : ''}`} disabled={!editable}
                    onClick={() => setDraft((d) => ({ ...d, years: y }))}
                  >
                    {y}y
                  </button>
                ))}
              </div>
            </div>

            {/* ---- Release clause ---- */}
            <div>
              <div className="tx-field-label">
                <span>{TERM_LABELS.clause}</span>
                <span className="val">{draft.clause != null ? `$${draft.clause}M` : 'None'}</span>
              </div>
              <label className="tx-toggle">
                <input type="checkbox" checked={draft.clause == null} disabled={!editable} onChange={(e) => toggleClause(!e.target.checked)} />
                No release clause
              </label>
              {draft.clause != null && (
                <>
                  <input
                    className="tx-range" type="range" min={clauseBounds.min} max={clauseBounds.max} step={1} value={draft.clause}
                    disabled={!editable} aria-label="Release clause in millions"
                    onChange={(e) => setDraft((d) => ({ ...d, clause: Number(e.target.value) }))}
                  />
                  <div className="tx-range-legend">
                    <span>${clauseBounds.min}M</span><span>Club wants ≥ ${Math.round(ctx.idealClause)}M</span><span>${clauseBounds.max}M</span>
                  </div>
                </>
              )}
              <div className="tx-hint">A low clause makes a future exit cheaper (the buying club pays exactly this fee) — but the club dislikes it.</div>
            </div>

            {/* ---- Willingness meter (turn 1-2) ---- */}
            {stage !== 'final' && (
              <div className="tx-meter">
                <div className="tx-meter-top">
                  <span>Club willingness</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{ev.score}%</span>
                </div>
                <div className="tx-bar" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={ev.score} aria-label="Club willingness">
                  <div className={`fill ${meterTone}`} style={{ width: `${ev.score}%` }} />
                  <div className="mark" style={{ left: `${Math.min(100, threshold)}%` }} title={`Club accepts at ${threshold}%`} />
                </div>
                <div className="tx-bar-legend">
                  {ev.score >= threshold ? 'The club would accept these terms.' : `The club accepts from ${threshold}% (marker).`}
                </div>
                <ul className="tx-rows">
                  {Object.entries(ev.terms).map(([k, v]) => (
                    <li key={k}><span className={`dot ${v.status}`} /><span className="lbl">{TERM_LABELS[k]}</span><span className="note">{v.note}</span></li>
                  ))}
                </ul>
              </div>
            )}

            {/* ---- Actions ---- */}
            <div className="tx-actions">
              {stage === 'offer' && (
                <>
                  <button type="button" className="btn btn-primary" onClick={send} disabled={thinking}>
                    {thinking ? 'Club is considering…' : 'Send offer'}
                  </button>
                  <button type="button" className="btn" onClick={onClose} disabled={thinking}>Close</button>
                </>
              )}
              {stage === 'counter' && (
                <>
                  <button type="button" className="btn btn-primary" onClick={accept} disabled={thinking}>Accept club's counter</button>
                  <button type="button" className="btn" onClick={send} disabled={thinking}>
                    {thinking ? 'Club is considering…' : 'Send revised offer'}
                  </button>
                  <button type="button" className="btn btn-danger-soft" onClick={walk} disabled={thinking}>Walk away</button>
                </>
              )}
              {stage === 'final' && (
                <>
                  <button type="button" className="btn btn-primary" onClick={accept}>Accept final offer</button>
                  <button type="button" className="btn btn-danger-soft" onClick={walk}>Reject &amp; walk away</button>
                </>
              )}
            </div>
            {stage === 'counter' && (
              <div className="tx-hint" style={{ marginTop: -6 }}>
                Sending a revised offer is your last move: if the club is still not satisfied it issues a final, non-negotiable decision.
              </div>
            )}
            {(stage === 'counter' || stage === 'final') && (
              <div className="tx-hint" style={{ marginTop: -6 }}>
                Walking away or rejecting the final offer closes the talks for {COOLDOWN_DAYS} days.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, host);
}
