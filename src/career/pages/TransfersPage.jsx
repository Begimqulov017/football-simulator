import React, { useCallback, useDeferredValue, useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';
import NegotiationModal from '../transfers/NegotiationModal';
import '../transfers/transfers.css';
import { INITIAL_TEAMS } from '../../data/teamsData';
import { displayRating } from '../utils/statCalc';
import {
  MAX_TURNS, ROLES, analyseClub, buildContext, clubStatus, getLeagueOfTeam, ALL_LEAGUES,
  marketValue, remainingContractYears, startNegotiation, transferFee, turnOf, formatTerms,
} from '../transfers/transferUtils';
import TeamLogo from '../../components/TeamLogo';

const LIVE_STAGES = ['offer', 'counter', 'final', 'accepted'];
const PAGE_SIZE = 24;

const TABS = [
  { id: 'hub', label: 'Transfer Hub' },
  { id: 'talks', label: 'Negotiations' },
  { id: 'history', label: 'My Transfers' },
  { id: 'world', label: 'World Feed' },
];

// PHASE 11: hub'da faqat sizga TAKLIF yuborgan (yoki muzokarasi davom etayotgan) klublar turadi.
const STATUS_FILTERS = [
  { id: 'all', label: 'All offers' },
  { id: 'offers', label: 'In talks' },
];

const SORTS = [
  { id: 'fit', label: 'Best fit' },
  { id: 'power', label: 'Club power' },
  { id: 'name', label: 'Name A–Z' },
];

const HISTORY_TYPE = {
  signing: { label: 'First contract', tone: 'blue' },
  transfer: { label: 'Transfer', tone: 'green' },
  free: { label: 'Free signing', tone: 'gold' },
  renewal: { label: 'Renewal', tone: '' },
};

const norm = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const fmtFee = (f) => (f > 0 ? `$${Number(f).toFixed(1)}M` : 'Free');
const STATUS_ORDER = { agreed: 0, negotiating: 1, offer: 2, hot: 3, open: 4, monitoring: 5, current: 6, cooldown: 7, closed: 8 };

function StatusPill({ status }) {
  const live = status.key === 'negotiating' || status.key === 'agreed' || status.key === 'offer';
  return <span className={`tx-pill ${status.tone}${live ? ' pulse' : ''}`}>{status.label}</span>;
}

function TurnDots({ stage }) {
  const t = stage === 'accepted' ? MAX_TURNS : turnOf(stage);
  return (
    <span className="tx-turns" aria-label={`Turn ${t} of ${MAX_TURNS}`}>
      {Array.from({ length: MAX_TURNS }, (_, i) => <i key={i} className={i < t ? 'on' : ''} />)}
    </span>
  );
}

function ClubCard({ row, onOpen }) {
  const { team, league, analysis, status, neg, offerMsg } = row;
  const role = ROLES[analysis.deservedRole];
  const live = neg && LIVE_STAGES.includes(neg.stage);
  const blocked = status.key === 'closed' || status.key === 'cooldown' || status.key === 'current';

  let label = 'Negotiation room';
  if (status.key === 'current') label = 'Your club';
  else if (status.key === 'closed') label = 'Unavailable';
  else if (status.key === 'cooldown') label = 'Cooling off';
  else if (neg?.stage === 'accepted') label = 'Sign contract';
  else if (live) label = 'Resume talks';
  else if (offerMsg) label = 'Open offer';

  const cls = ['card', 'tx-club'];
  if (live || status.key === 'offer') cls.push('is-active');
  if (status.key === 'current') cls.push('is-current');
  if (status.key === 'closed') cls.push('is-muted');

  return (
    <div className={cls.join(' ')}>
      <div className="tx-club-head">
        <span className="tx-logo" aria-hidden="true"><TeamLogo id={team.id} logo={team.logo} size={34} /></span>
        <div style={{ minWidth: 0 }}>
          <div className="tx-club-name" title={team.name}>{team.name}</div>
          <div className="tx-club-league">{league.flag} {league.name}</div>
        </div>
      </div>

      <div className="tx-club-meta">
        <div className="tx-meta"><div className="k">Power</div><div className="v">{analysis.power}</div></div>
        <div className="tx-meta" title={`The club would use you as: ${role.label}`}><div className="k">Role {role.icon}</div><div className="v">{role.label.split(' ')[0]}</div></div>
        <div className="tx-meta">
          <div className="k">{offerMsg ? 'Offer' : 'Rank'}</div>
          <div className="v">{offerMsg ? `$${offerMsg.offer.wage.toLocaleString()}` : `#${analysis.rank + 1}`}</div>
        </div>
      </div>

      <div className="tx-club-foot">
        <StatusPill status={status} />
        {live && <TurnDots stage={neg.stage} />}
        <button
          type="button"
          className={`btn${blocked ? '' : ' btn-primary'}`}
          disabled={blocked}
          onClick={() => onOpen(row)}
          aria-label={`${label} — ${team.name}`}
        >
          {label}
        </button>
      </div>
    </div>
  );
}

function HubTab({ rows, player, career, onOpen }) {
  const [query, setQuery] = useState('');
  const [leagueId, setLeagueId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState('fit');
  const [shown, setShown] = useState(PAGE_SIZE);
  const deferred = useDeferredValue(query); // yozayotganda input qotmaydi, ro'yxat real vaqtda yangilanadi

  const filtered = useMemo(() => {
    const q = norm(deferred.trim());
    const list = rows.filter((r) => {
      if (leagueId !== 'all' && r.league.id !== leagueId) return false;
      if (q && !(norm(r.team.name).includes(q) || norm(r.league.name).includes(q) || norm(r.league.country).includes(q))) return false;
      const k = r.status.key;
      if (statusFilter === 'offers') return ['agreed', 'negotiating'].includes(k) || !!(r.neg && LIVE_STAGES.includes(r.neg.stage));
      return true;
    });
    const by = {
      fit: (a, b) => (STATUS_ORDER[a.status.key] - STATUS_ORDER[b.status.key]) || (b.analysis.value - a.analysis.value),
      power: (a, b) => b.analysis.power - a.analysis.power,
      name: (a, b) => a.team.name.localeCompare(b.team.name),
    }[sort];
    return [...list].sort(by);
  }, [rows, deferred, leagueId, statusFilter, sort]);

  const reset = (fn) => (e) => { fn(e.target.value); setShown(PAGE_SIZE); };
  const mv = marketValue(player);
  const fee = transferFee(player, career);
  const left = remainingContractYears(career);

  return (
    <>
      <div className="tx-summary">
        <div className="card tx-stat">
          <div className="tx-stat-label">YOUR MARKET VALUE</div>
          <div className="tx-stat-value">{fmtFee(mv)}</div>
          <div className="tx-stat-sub">{displayRating(player.overall)} OVR · age {player.age}</div>
        </div>
        <div className="card tx-stat">
          <div className="tx-stat-label">CURRENT CONTRACT</div>
          <div className="tx-stat-value">{career.freeAgent ? 'Free agent' : `${left.toFixed(1)} yr left`}</div>
          <div className="tx-stat-sub">${(career.weeklyWage || 0).toLocaleString()}/week{career.contract?.releaseClause != null ? ` · clause $${career.contract.releaseClause}M` : ''}</div>
        </div>
        <div className="card tx-stat">
          <div className="tx-stat-label">FEE IF YOU MOVE</div>
          <div className="tx-stat-value">{fmtFee(fee)}</div>
          <div className="tx-stat-sub">{career.freeAgent ? 'No fee for free agents' : career.contract?.releaseClause != null ? 'Set by your release clause' : 'Paid by the buying club'}</div>
        </div>
      </div>

      <div className="tx-toolbar">
        <input
          className="tx-input" type="search" placeholder="Search offering club, league or country…" value={query}
          onChange={reset(setQuery)} aria-label="Search clubs"
        />
        <select className="tx-select" value={leagueId} onChange={reset(setLeagueId)} aria-label="Filter by league">
          <option value="all">All leagues</option>
          {ALL_LEAGUES.map((l) => <option key={l.id} value={l.id}>{l.flag} {l.name}</option>)}
        </select>
        <select className="tx-select" value={sort} onChange={reset(setSort)} aria-label="Sort clubs">
          {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      <div className="tx-chips" role="group" aria-label="Filter by status">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id} type="button" className={`tx-chip${statusFilter === f.id ? ' active' : ''}`}
            aria-pressed={statusFilter === f.id} onClick={() => { setStatusFilter(f.id); setShown(PAGE_SIZE); }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="tx-result-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'offer' : 'offers'}</p>

      {filtered.length === 0 ? (
        <div className="card tx-empty">{rows.length === 0 ? "No club has sent you an offer yet. Offers arrive in your Messages as your form and rating grow - only clubs that make you an offer appear here." : 'No offers match your filters. Try a different search.'}</div>
      ) : (
        <div className="tx-grid">
          {filtered.slice(0, shown).map((r) => <ClubCard key={r.team.id} row={r} onOpen={onOpen} />)}
        </div>
      )}

      {filtered.length > shown && (
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <button type="button" className="btn" onClick={() => setShown((n) => n + PAGE_SIZE)}>
            Show more ({filtered.length - shown} left)
          </button>
        </div>
      )}
    </>
  );
}

function TalksTab({ career, currentClubId, onOpenTeam }) {
  const entries = Object.values(career.negotiations || {}).filter((n) => n.teamId !== currentClubId).sort((a, b) => (b.closedDay ?? 1e9) - (a.closedDay ?? 1e9) || b.startedDay - a.startedDay);
  const live = entries.filter((n) => LIVE_STAGES.includes(n.stage));
  const past = entries.filter((n) => !LIVE_STAGES.includes(n.stage));

  const STAGE_LABEL = { signed: 'Signed', walked: 'Walked away', rejected: 'Final offer rejected', withdrawn: 'Withdrawn' };
  const STAGE_TONE = { signed: 'green', walked: 'red', rejected: 'red', withdrawn: '' };

  const Row = ({ n, active }) => {
    const team = INITIAL_TEAMS.find((t) => t.id === n.teamId);
    if (!team) return null;
    const last = [...n.thread].reverse().find((e) => e.by === 'club' && e.terms);
    return (
      <div className="list-row" style={{ gap: 12, flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span className="tx-logo" aria-hidden="true"><TeamLogo id={team.id} logo={team.logo} size={34} /></span>
          <span>
            <b>{team.name}</b>
            <br />
            <span className="sub" style={{ fontSize: 12 }}>{last ? `Latest: ${formatTerms(last.terms)}` : 'No offer sent yet'}</span>
          </span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {active ? (
            <>
              <TurnDots stage={n.stage} />
              <span className={`tx-pill ${n.stage === 'accepted' ? 'green' : 'gold'}`}>
                {n.stage === 'accepted' ? 'Deal agreed' : n.stage === 'final' ? 'Final decision' : n.stage === 'counter' ? 'Club countered' : 'Your offer'}
              </span>
              <button type="button" className="btn btn-primary" onClick={() => onOpenTeam(n.teamId)}>{n.stage === 'accepted' ? 'Sign' : 'Open'}</button>
            </>
          ) : (
            <span className={`tx-pill ${STAGE_TONE[n.stage] || ''}`}>{STAGE_LABEL[n.stage] || n.stage}</span>
          )}
        </span>
      </div>
    );
  };

  if (!entries.length) {
    return <div className="card tx-empty">No negotiations yet. Open a club in the Transfer Hub to start talks — you get 3 turns per offer.</div>;
  }
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div className="card">
        <div className="card-title">ACTIVE TALKS ({live.length})</div>
        {live.length === 0 ? <div className="sub" style={{ fontSize: 13 }}>Nothing in progress.</div> : live.map((n) => <Row key={n.teamId} n={n} active />)}
      </div>
      {past.length > 0 && (
        <div className="card">
          <div className="card-title">CLOSED TALKS</div>
          {past.map((n) => <Row key={n.teamId} n={n} />)}
        </div>
      )}
    </div>
  );
}

function HistoryTab({ career }) {
  const list = [...(career.transferHistory || [])].reverse();
  const moves = list.filter((t) => t.type === 'transfer' || t.type === 'free');
  const totalFees = moves.reduce((s, t) => s + (t.fee || 0), 0);
  const biggest = moves.reduce((m, t) => Math.max(m, t.fee || 0), 0);

  if (!list.length) {
    return <div className="card tx-empty">No transfers yet — your history will appear here after your first move.</div>;
  }
  return (
    <>
      <div className="tx-summary">
        <div className="card tx-stat"><div className="tx-stat-label">MOVES</div><div className="tx-stat-value">{moves.length}</div><div className="tx-stat-sub">transfers &amp; free signings</div></div>
        <div className="card tx-stat"><div className="tx-stat-label">TOTAL FEES</div><div className="tx-stat-value">{fmtFee(totalFees)}</div><div className="tx-stat-sub">paid for you</div></div>
        <div className="card tx-stat"><div className="tx-stat-label">BIGGEST FEE</div><div className="tx-stat-value">{fmtFee(biggest)}</div><div className="tx-stat-sub">single move</div></div>
      </div>
      <div className="card">
        <div className="card-title">TRANSFER HISTORY</div>
        <div className="tx-table-wrap">
          <table className="tx-table">
            <thead>
              <tr>
                <th>Date</th><th>Move</th><th>Type</th><th>Fee</th><th>Wage</th><th>Length</th><th>Role</th><th>Clause</th><th>Turns</th>
              </tr>
            </thead>
            <tbody>
              {list.map((t, i) => {
                const meta = HISTORY_TYPE[t.type] || { label: t.type, tone: '' };
                const isMove = t.type === 'transfer' || t.type === 'free';
                return (
                  <tr key={t.id || `${t.date}-${i}`}>
                    <td className="num">{t.date}</td>
                    <td>
                      <div className="tx-move">
                        <span>{t.fromLogo || '🆓'} {t.from || 'Free agent'}</span>
                        <span className="arrow">→</span>
                        <span>{t.toLogo} {t.to}</span>
                      </div>
                    </td>
                    <td><span className={`tx-pill ${meta.tone}`}>{meta.label}</span></td>
                    <td className="num">{isMove ? fmtFee(t.fee || 0) : '—'}</td>
                    <td className="num">{t.wage != null ? `$${t.wage.toLocaleString()}/wk` : '—'}</td>
                    <td className="num">{t.years ? `${t.years} yr` : '—'}</td>
                    <td>{t.role && ROLES[t.role] ? `${ROLES[t.role].icon} ${ROLES[t.role].label}` : '—'}</td>
                    <td className="num">{t.releaseClause != null ? `$${t.releaseClause}M` : '—'}</td>
                    <td className="num">{t.turns ? `${t.turns}/${MAX_TURNS}` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function WorldTab({ log }) {
  const recent = useMemo(() => [...log].reverse().slice(0, 20), [log]);
  const top10 = useMemo(() => [...log].sort((a, b) => b.fee - a.fee).slice(0, 10), [log]);

  if (!log.length) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 32 }}>
        <div className="sub">The transfer window is quiet right now - check back after a few more matchdays.</div>
      </div>
    );
  }
  return (
    <div className="grid grid-2">
      <div className="card">
        <div className="card-title">TOP 10 BIGGEST TRANSFERS</div>
        <div style={{ maxHeight: 440, overflowY: 'auto' }}>
          {top10.map((t) => (
            <div key={t.id} className="list-row">
              <span>
                {t.playerName} {t.isUser && <span className="tx-pill green" style={{ marginLeft: 4 }}>You</span>} <span className="sub">({t.playerPos}, {t.ovr} OVR)</span>
                <br />
                <span className="sub">{t.fromLogo} {t.fromClub} → {t.toLogo} {t.toClub}</span>
              </span>
              <span className="badge badge-gold">{fmtFee(t.fee)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="card-title">RECENT TRANSFERS</div>
        <div style={{ maxHeight: 440, overflowY: 'auto' }}>
          {recent.map((t) => (
            <div key={t.id} className="list-row">
              <span>
                {t.playerName} {t.isUser && <span className="tx-pill green" style={{ marginLeft: 4 }}>You</span>}
                <br />
                <span className="sub">{t.fromClub} → {t.toClub} · {t.date}</span>
              </span>
              <span className="badge">{fmtFee(t.fee)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TransfersPage() {
  const { player, saveNegotiation, completeNegotiatedTransfer, declineOffer } = useGame();
  const career = player?.career;
  const [tab, setTab] = useState('hub');
  const [activeId, setActiveId] = useState(null);
  const [fresh, setFresh] = useState(null); // hali yuborilmagan (saqlanmagan) 1-tur muzokarasi

  // Kiruvchi transfer takliflari (Messages'dagi hal qilinmaganlari) — klub bo'yicha.
  const offerByTeam = useMemo(() => {
    const map = {};
    (career?.messages || []).forEach((m) => {
      if (m.type === 'transfer' && !m.resolved && m.offer?.teamId) map[m.offer.teamId] = m;
    });
    return map;
  }, [career?.messages]);

  const negotiations = career?.negotiations;
  const rows = useMemo(() => {
    if (!player) return [];
    return INITIAL_TEAMS.filter((t) => getLeagueOfTeam(t.id) && t.id !== player.club?.id && (offerByTeam[t.id] || ((negotiations || {})[t.id] && LIVE_STAGES.includes((negotiations || {})[t.id].stage)))).map((team) => {
      const analysis = analyseClub(player, team);
      const offerMsg = offerByTeam[team.id] || null;
      const status = clubStatus({ team, analysis, player, career: player.career, offerMsg });
      return { team, league: getLeagueOfTeam(team.id), analysis, offerMsg, neg: (negotiations || {})[team.id] || null, status };
    });
    // player obyekti har yangilanishda o'zgaradi — faqat kerakli maydonlarga tayanamiz
  }, [player?.overall, player?.age, player?.potential, player?.club?.id, career?.day, negotiations, offerByTeam]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeRow = useMemo(() => (activeId ? rows.find((r) => r.team.id === activeId) || null : null), [rows, activeId]);

  const ctx = useMemo(() => {
    if (!activeRow || !player) return null;
    return buildContext({ player, career: player.career, team: activeRow.team, offer: activeRow.offerMsg?.offer || null });
  }, [activeRow, player?.overall, player?.age, player?.potential, career?.day, career?.freeAgent, career?.contract]); // eslint-disable-line react-hooks/exhaustive-deps

  const openTeam = useCallback((teamId) => {
    const row = rows.find((r) => r.team.id === teamId);
    if (!row || ['closed', 'cooldown', 'current'].includes(row.status.key)) return;
    if (!(row.neg && LIVE_STAGES.includes(row.neg.stage))) {
      const c = buildContext({ player, career: player.career, team: row.team, offer: row.offerMsg?.offer || null });
      setFresh(startNegotiation(c, player.career.day, row.offerMsg?.id || null));
    } else {
      setFresh(null);
    }
    setActiveId(teamId);
  }, [rows, player]);

  const closeRoom = useCallback(() => { setActiveId(null); setFresh(null); }, []);

  if (!player) return null;

  const log = career.transferLog || [];
  const totalVolume = log.reduce((s, t) => s + t.fee, 0);
  const liveCount = Object.values(negotiations || {}).filter((n) => LIVE_STAGES.includes(n.stage) && n.teamId !== player.club?.id).length;
  const persisted = activeId ? (negotiations || {})[activeId] : null;
  const negotiation = persisted && LIVE_STAGES.includes(persisted.stage) ? persisted : fresh;

  const handleChange = (next) => saveNegotiation(next.teamId, next);
  const handleWalk = (next) => {
    saveNegotiation(next.teamId, next);
    if (next.messageId) declineOffer(next.messageId); // Messages'dagi taklif ham yopiladi
    closeRoom();
  };
  const handleSign = (deal) => {
    completeNegotiatedTransfer(deal);
    closeRoom();
    setTab('history');
  };

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Transfers</h1>
          <div className="sub">Negotiate your next move — 3 turns per offer, the last one is final.</div>
        </div>
        <span className="badge badge-gold">${totalVolume.toFixed(1)}M world volume</span>
      </div>

      <div className="tx-tabs" role="tablist" aria-label="Transfers sections">
        {TABS.map((t) => (
          <button
            key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={`tx-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.id === 'talks' && liveCount > 0 && <span className="tx-count">{liveCount}</span>}
          </button>
        ))}
      </div>

      {tab === 'hub' && <HubTab rows={rows} player={player} career={career} onOpen={(r) => openTeam(r.team.id)} />}
      {tab === 'talks' && <TalksTab career={career} currentClubId={player.club?.id} onOpenTeam={openTeam} />}
      {tab === 'history' && <HistoryTab career={career} />}
      {tab === 'world' && <WorldTab log={log} />}

      {ctx && negotiation && (
        <NegotiationModal
          key={activeId}
          ctx={ctx}
          negotiation={negotiation}
          currentWage={career.weeklyWage}
          onChange={handleChange}
          onWalk={handleWalk}
          onSign={handleSign}
          onClose={closeRoom}
        />
      )}
    </AppShell>
  );
}
