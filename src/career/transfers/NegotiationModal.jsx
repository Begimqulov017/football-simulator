import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../../components/Icon';
import {
  MAX_TURNS, COOLDOWN_DAYS, ROLES, ROLE_LIST, CONTRACT_YEARS, TERM_LABELS, INTEREST_META, roundTo,
  evaluateTerms, idealWageFor, wageBoundsFor, clauseBoundsFor,
  submitOffer, acceptClubTerms, acceptVariant, buildClubVariants, walkAway, formatTerms,
} from './transferUtils';
import TeamLogo from '../../components/TeamLogo';

const THINK_MS = 900;
const fmtM = (n) => (n > 0 ? `$${n.toFixed(1)}M` : 'Bepul');

function bubbleText(e, teamName) {
  if (e.by === 'you') {
    if (e.kind === 'offer') return e.turn === 1 ? 'Mana mening taklifim.' : "Taklifimni o'zgartirdim.";
    return e.note || '';
  }
  return e.note || `${teamName} javob berdi.`;
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
  const variants = useMemo(() => (stage === 'counter' && negotiation.clubTerms ? buildClubVariants(negotiation, ctx) : []), [stage, negotiation, ctx]);

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
  const acceptPack = (terms) => onChange(acceptVariant(negotiation, terms));
  const editPack = (terms) => { if (stage === 'counter') setDraft(terms); };
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
              <h2 id={titleId}>{ctx.renewal ? 'Shartnoma yangilash' : 'Muzokara xonasi'} · {team.name}</h2>
              <div className="sub">{league?.flag} {league?.name} · {interest.label}</div>
            </div>
          </div>
          <button type="button" className="tx-x" onClick={onClose} disabled={thinking} aria-label="Muzokara xonasini yopish">
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
              <div className="big">Kelishuv tayyor!</div>
              <p className="sub" style={{ marginTop: 4, color: 'var(--text-secondary)', fontSize: 13 }}>
                {team.name} {negotiation.turn}-bosqichda rozi bo'ldi. {ctx.renewal ? 'Yangilashni rasmiylashtirish uchun imzolang.' : "Transferni rasmiylashtirish uchun imzolang."}
              </p>
            </div>
            <div className="tx-done-grid">
              <div className="tx-meta"><div className="k">Haftalik</div><div className="v">${negotiation.deal.wage.toLocaleString()}</div></div>
              <div className="tx-meta"><div className="k">Muddat</div><div className="v">{negotiation.deal.years} yil</div></div>
              <div className="tx-meta"><div className="k">Rol</div><div className="v">{ROLES[negotiation.deal.role].icon} {ROLES[negotiation.deal.role].label}</div></div>
              <div className="tx-meta"><div className="k">Klauzula</div><div className="v">{negotiation.deal.clause != null ? `$${negotiation.deal.clause}M` : "Yo'q"}</div></div>
              {!ctx.renewal && <div className="tx-meta"><div className="k">Summa</div><div className="v">{fmtM(ctx.fee)}</div></div>}
            </div>
            <div className="tx-actions" style={{ width: '100%' }}>
              <button type="button" className="btn btn-primary" onClick={sign}>{ctx.renewal ? 'Yangilashni tasdiqlash →' : 'Shartnomani imzolash →'}</button>
              <button type="button" className="btn" onClick={onClose}>Keyinroq hal qilaman</button>
            </div>
          </div>
        ) : (
          <div className="tx-modal-body">
            <div className="tx-facts">
              {!ctx.renewal && <div className="tx-meta"><div className="k">Transfer summasi</div><div className="v">{fmtM(ctx.fee)}</div></div>}
              <div className="tx-meta"><div className="k">Sizning bahoyingiz</div><div className="v">{fmtM(ctx.marketValue)}</div></div>
              <div className="tx-meta"><div className="k">Joriy maosh</div><div className="v">${(currentWage || 0).toLocaleString()}</div></div>
              <div className="tx-meta"><div className="k">Klub kuchi</div><div className="v">{ctx.analysis.power}</div></div>
            </div>

            <div className="tx-steps" aria-label={`${negotiation.turn}-bosqich / ${MAX_TURNS}`}>
              {['Sizning taklifingiz', 'Klub javobi', 'Yakuniy qaror'].map((t, i) => (
                <div key={t} className={`tx-step${i < activeStep ? ' done' : ''}${i === activeStep ? (stage === 'final' ? ' final-now' : ' now') : ''}`}>
                  <div className="n">{i + 1}-bosqich</div>
                  <div className="t">{t}</div>
                </div>
              ))}
            </div>

            {negotiation.thread.length > 0 && (
              <div className="tx-thread" aria-live="polite">
                {negotiation.thread.map((e, i) => (
                  <div key={i} className={`tx-bubble ${e.by}${e.by === 'club' ? ` ${e.kind}` : ''}`}>
                    <div className="who">{e.by === 'you' ? `Siz · ${e.turn}-bosqich` : `${team.name} · ${e.turn}-bosqich`}</div>
                    <div>{bubbleText(e, team.name)}</div>
                    {e.terms && <div className="terms">{formatTerms(e.terms)}</div>}
                  </div>
                ))}
              </div>
            )}

            {thinking && (
              <div className="tx-thread" aria-live="polite">
                <div className="tx-bubble club">
                  <div className="who">{team.name}</div>
                  <div>Klub taklifni ko'rib chiqmoqda<span className="tx-typing">…</span></div>
                </div>
              </div>
            )}

            {variants.length > 0 && (
              <div>
                <div className="tx-field-label"><span>Klub variantlari</span></div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {variants.map((v) => (
                    <div key={v.label} className="tx-bubble club" style={{ display: 'block', maxWidth: '100%' }}>
                      <div className="who">{v.label}</div>
                      <div className="terms">{formatTerms(v.terms)}</div>
                      <div style={{ fontSize: 11, opacity: 0.75, margin: '2px 0 6px' }}>{v.hint}</div>
                      <div className="tx-actions" style={{ margin: 0 }}>
                        <button type="button" className="btn btn-primary" disabled={thinking} onClick={() => acceptPack(v.terms)}>Qabul qilish</button>
                        {stage === 'counter' && <button type="button" className="btn" disabled={thinking} onClick={() => editPack(v.terms)}>O'zgartirish</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stage === 'final' && (
              <div className="tx-lockbar" role="status">
                <Icon name="lock" size={16} />
                <span>3-bosqich — yakuniy qaror. Shartlar o'zgarmaydi: qabul qiling yoki chiqib keting.</span>
              </div>
            )}

            {/* ---- Squad role ---- */}
            <div>
              <div className="tx-field-label"><span>{TERM_LABELS.role}</span></div>
              <div className="tx-roles" role="radiogroup" aria-label="Jamoadagi rol">
                {ROLE_LIST.map((r) => (
                  <button
                    key={r.id} type="button" role="radio" aria-checked={draft.role === r.id}
                    className={`tx-role${draft.role === r.id ? ' on' : ''}`} disabled={!editable} onClick={() => changeRole(r.id)}
                  >
                    <div className="rt">{r.icon} {r.label}</div>
                    <div className="rd">{r.desc}</div>
                    {ctx.analysis.deservedRole === r.id && <span className="rb">Klubning sizga bahosi</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* ---- Salary ---- */}
            <div>
              <div className="tx-field-label"><span>{TERM_LABELS.salary}</span><span className="val">${draft.wage.toLocaleString()}</span></div>
              <input
                className="tx-range" type="range" min={wageBounds.min} max={wageBounds.max} step={10} value={draft.wage}
                disabled={!editable} aria-label="Haftalik maosh"
                onChange={(e) => setDraft((d) => ({ ...d, wage: roundTo(Number(e.target.value)) }))}
              />
              <div className="tx-range-legend">
                <span>${wageBounds.min.toLocaleString()}</span>
                <span>Klub byudjeti ${wageBounds.base.toLocaleString()}{overPct > 0 ? ` · siz +${overPct}% so'rayapsiz` : ''}</span>
                <span>${wageBounds.max.toLocaleString()}</span>
              </div>
            </div>

            {/* ---- Contract length ---- */}
            <div>
              <div className="tx-field-label"><span>{TERM_LABELS.years}</span></div>
              <div className="tx-years" role="radiogroup" aria-label="Shartnoma muddati (yil)">
                {CONTRACT_YEARS.map((y) => (
                  <button
                    key={y} type="button" role="radio" aria-checked={draft.years === y}
                    className={`tx-year${draft.years === y ? ' on' : ''}`} disabled={!editable}
                    onClick={() => setDraft((d) => ({ ...d, years: y }))}
                  >
                    {y} yil
                  </button>
                ))}
              </div>
            </div>

            {/* ---- Release clause ---- */}
            <div>
              <div className="tx-field-label">
                <span>{TERM_LABELS.clause}</span>
                <span className="val">{draft.clause != null ? `$${draft.clause}M` : "Yo'q"}</span>
              </div>
              <label className="tx-toggle">
                <input type="checkbox" checked={draft.clause == null} disabled={!editable} onChange={(e) => toggleClause(!e.target.checked)} />
                Chiqish klauzulasi yo'q
              </label>
              {draft.clause != null && (
                <>
                  <input
                    className="tx-range" type="range" min={clauseBounds.min} max={clauseBounds.max} step={1} value={draft.clause}
                    disabled={!editable} aria-label="Chiqish klauzulasi (million)"
                    onChange={(e) => setDraft((d) => ({ ...d, clause: Number(e.target.value) }))}
                  />
                  <div className="tx-range-legend">
                    <span>${clauseBounds.min}M</span><span>Klub kamida ${Math.round(ctx.idealClause)}M xohlaydi</span><span>${clauseBounds.max}M</span>
                  </div>
                </>
              )}
              <div className="tx-hint">Past klauzula kelajakda ketishni arzonlashtiradi (sotib oluvchi klub aynan shu summani to'laydi), lekin klubga yoqmaydi.</div>
            </div>

            {/* ---- Willingness meter (turn 1-2) ---- */}
            {stage !== 'final' && (
              <div className="tx-meter">
                <div className="tx-meter-top">
                  <span>Klubning rozilik darajasi</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{ev.score}%</span>
                </div>
                <div className="tx-bar" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={ev.score} aria-label="Klubning rozilik darajasi">
                  <div className={`fill ${meterTone}`} style={{ width: `${ev.score}%` }} />
                  <div className="mark" style={{ left: `${Math.min(100, threshold)}%` }} title={`Klub ${threshold}% dan rozi bo'ladi`} />
                </div>
                <div className="tx-bar-legend">
                  {ev.score >= threshold ? 'Klub bu shartlarga rozi bo\'ladi.' : `Klub ${threshold}% dan rozi bo'ladi (chiziq).`}
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
                    {thinking ? "Klub o'ylamoqda…" : 'Taklifni yuborish'}
                  </button>
                  <button type="button" className="btn" onClick={onClose} disabled={thinking}>Yopish</button>
                </>
              )}
              {stage === 'counter' && (
                <>
                  <button type="button" className="btn btn-primary" onClick={accept} disabled={thinking}>Klub javobini qabul qilish</button>
                  <button type="button" className="btn" onClick={send} disabled={thinking}>
                    {thinking ? "Klub o'ylamoqda…" : "O'zgartirilgan taklifni yuborish"}
                  </button>
                  <button type="button" className="btn btn-danger-soft" onClick={walk} disabled={thinking}>Muzokaradan chiqish</button>
                </>
              )}
              {stage === 'final' && (
                <>
                  <button type="button" className="btn btn-primary" onClick={accept}>Yakuniy taklifni qabul qilish</button>
                  <button type="button" className="btn btn-danger-soft" onClick={walk}>Rad etish va chiqish</button>
                </>
              )}
            </div>
            {stage === 'counter' && (
              <div className="tx-hint" style={{ marginTop: -6 }}>
                O'zgartirilgan taklif — oxirgi harakatingiz: klub yana rozi bo'lmasa, yakuniy va o'zgarmas qaror chiqaradi.
              </div>
            )}
            {(stage === 'counter' || stage === 'final') && (
              <div className="tx-hint" style={{ marginTop: -6 }}>
                Muzokaradan chiqish yoki yakuniy taklifni rad etish gaplashuvni {COOLDOWN_DAYS} kunga yopadi.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, host);
}
