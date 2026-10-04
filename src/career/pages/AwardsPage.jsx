import React, { useState } from 'react';
import AppShell from '../components/AppShell';
import NotStarted from '../components/NotStarted';
import PitchView from '../components/PitchView';
import { useGame } from '../context/GameContext';
import { fetchAwards, fetchAwardsPreview, fetchGlobalAwards, fetchGlobalAwardsLive, finalizeGlobalAwards } from '../utils/careerApi';
import { useFetch, Loading, ErrorBox } from '../admin/adminUi';
import AwardsCeremony from '../awards/AwardsCeremony';
import { Button } from '../../components/ui';

export const AWARDS_SEEN_KEY = (playerId) => `fs_awards_seen_${playerId}`;

// Phase 9 — Mavsum yakuni mukofotlari.
//   "Global" tab: BARCHA ligalar bo'yicha Ballon d'Or (vaznli formula), Golden Boot (liga koeffitsiyenti:
//   Top-5 = 2.0x, qolganlar = 1.5x) va Team of the Season.
//   "Liga" tab: avvalgi (Phase 5) liga ichidagi marosim — o'zgarishsiz saqlangan.

const WEIGHT_LABELS = {
  impact: ["Maydondagi ta'sir (gol / mudofaa)", '🎯'],
  ability: ['Reyting va mahorat', '⭐'],
  team: ['Jamoa natijasi', '🏟️'],
  silverware: ['Kubok va Yevropa', '🏆'],
  prestige: ['Liga koeffitsiyenti', '🌍'],
};

const Card = ({ title, sub, children, className = '' }) => (
  <div className={`bg-surface-card border border-surface-line rounded-card shadow-soft p-4 sm:p-5 ${className}`}>
    {title && <div className="text-sm font-extrabold">{title}</div>}
    {sub && <div className="text-xs text-ink-muted mb-3">{sub}</div>}
    {!sub && title && <div className="mb-3" />}
    {children}
  </div>
);

const Pill = ({ children, tone = 'neutral' }) => {
  const tones = { neutral: 'bg-surface-muted text-ink-soft', gold: 'bg-amber-50 border border-amber-200 text-amber-800', top5: 'bg-brand-soft text-brand-dark', other: 'bg-accent-tint text-accent-dark' };
  return <span className={`text-[11px] font-extrabold rounded-full px-2 py-0.5 ${tones[tone]}`}>{children}</span>;
};

function BallonDor({ bd, weights, myId }) {
  const w = bd.winner;
  if (!w) return <div className="text-sm text-ink-muted">Nomzod topilmadi.</div>;
  const weightMap = weights || bd.weights || {};
  return (
    <div className="flex flex-col gap-4">
      <div className={`rounded-card border px-4 py-4 flex flex-wrap items-center gap-4 ${w.id === myId ? 'border-amber-400 bg-amber-50' : 'border-surface-line bg-surface-muted'}`}>
        <div className="text-4xl">🏆</div>
        <div className="flex-1 min-w-[200px]">
          <div className="text-xl font-black">{w.name}{w.id === myId ? ' (siz!)' : w.username ? ` (@${w.username})` : ''}</div>
          <div className="text-sm text-ink-muted">{w.logo} {w.clubName} · {w.leagueFlag} {w.leagueName} · {w.pos} · OVR {w.ovr}</div>
          <div className="text-xs text-ink-muted">Mavsumda {w.goals} gol</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-brand-dark">{w.score}</div>
          <div className="text-[11px] text-ink-muted">umumiy ball</div>
        </div>
      </div>

      {w.breakdown && (
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.keys(WEIGHT_LABELS).map((k) => (
            <div key={k}>
              <div className="flex justify-between text-xs font-bold text-ink-soft">
                <span>{WEIGHT_LABELS[k][1]} {WEIGHT_LABELS[k][0]} <span className="text-ink-subtle">({Math.round((weightMap[k] || 0) * 100)}%)</span></span>
                <span>{w.breakdown[k]}</span>
              </div>
              <div className="h-2 rounded-full bg-surface-muted overflow-hidden mt-1">
                <div className="h-full bg-brand rounded-full" style={{ width: `${Math.min(100, w.breakdown[k])}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!!bd.nominees?.length && (
        <div>
          <div className="text-[11px] font-extrabold tracking-wider text-ink-muted mb-1">NOMZODLAR</div>
          <ul className="divide-y divide-surface-line">
            {bd.nominees.map((n, i) => (
              <li key={n.id} className="py-1.5 flex items-center gap-2 text-sm">
                <span className="w-5 text-ink-muted">{i + 2}</span>
                <span className="font-bold">{n.name}{n.id === myId ? ' (siz)' : ''}</span>
                <span className="text-xs text-ink-muted">{n.logo} {n.clubName} · {n.leagueFlag}</span>
                <span className="ml-auto font-extrabold">{n.score}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function GoldenBoot({ list, myId }) {
  if (!list?.length) return <div className="text-sm text-ink-muted">Gol urganlar yo'q.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-ink-muted"><th>#</th><th>Futbolchi</th><th>Klub / Liga</th><th className="text-right">Gol</th><th className="text-right">Koef.</th><th className="text-right">Ball</th></tr>
        </thead>
        <tbody>
          {list.map((r) => (
            <tr key={r.id} className={`border-t border-surface-line ${r.id === myId ? 'bg-amber-50 font-bold' : ''} ${r.rank === 1 ? 'font-extrabold' : ''}`}>
              <td className="py-1.5 pr-2">{r.rank === 1 ? '👟' : r.rank}</td>
              <td className="pr-2">{r.name}{r.id === myId ? ' (siz)' : ''}</td>
              <td className="pr-2 text-xs text-ink-muted">{r.logo} {r.clubName} · {r.leagueFlag} {r.leagueName}</td>
              <td className="text-right">{r.goals}</td>
              <td className="text-right"><Pill tone={r.coef >= 2 ? 'top5' : 'other'}>{r.coef.toFixed(1)}x</Pill></td>
              <td className="text-right font-extrabold">{r.weighted}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 text-[11px] text-ink-subtle">Ball = gollar × liga koeffitsiyenti. Top-5 liga (Premier League, La Liga, Bundesliga, Serie A, Ligue 1) = 2.0x, qolganlari = 1.5x.</div>
    </div>
  );
}

function TeamOfSeason({ team, myId }) {
  if (!team?.length) return <div className="text-sm text-ink-muted">Tarkib shakllanmadi.</div>;
  const players = team.map((p) => ({ ...p, sub: `${p.logo || ''} ${p.leagueFlag || ''}`.trim(), isYou: p.id === myId }));
  return (
    <div className="grid gap-4 md:grid-cols-2 items-start">
      <PitchView players={players} />
      <ul className="divide-y divide-surface-line text-sm">
        {team.map((p) => (
          <li key={p.id} className={`py-1.5 flex items-center gap-2 ${p.id === myId ? 'font-extrabold text-amber-800' : ''}`}>
            <span className="w-8 text-xs text-ink-muted">{p.pos}</span>
            <span>{p.name}{p.id === myId ? ' ★' : ''}</span>
            <span className="text-xs text-ink-muted">{p.logo} {p.clubName}</span>
            <span className="ml-auto text-xs">{p.leagueFlag}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GlobalAwardsView({ awards, weights, myId, heading, children }) {
  return (
    <div className="flex flex-col gap-4">
      {heading}
      <Card title="🏆 Global Ballon d'Or" sub="Barcha ligalar o'yinchilari orasidan: vaznli formula bo'yicha eng yaxshi futbolchi">
        <BallonDor bd={awards.ballonDor} weights={weights} myId={myId} />
      </Card>
      <Card title="👟 Global Golden Boot" sub="Liga koeffitsiyenti bilan vaznlangan gollar (Top-5 = 2.0x, qolganlar = 1.5x)">
        <GoldenBoot list={awards.goldenBoot} myId={myId} />
      </Card>
      <Card title="🧩 Team of the Season" sub="Butun dunyo bo'yicha ramziy jamoa · 4-3-3">
        <TeamOfSeason team={awards.teamOfSeason} myId={myId} />
      </Card>
      {children}
    </div>
  );
}

function GlobalTab({ player, isAdmin }) {
  const { loading, data, error, reload } = useFetch(fetchGlobalAwards, []);
  const [idx, setIdx] = useState(0);
  const [live, setLive] = useState(null);
  const [liveBusy, setLiveBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  const history = data?.history || [];
  const pending = data?.pending || [];
  const current = live || history[idx];

  const showLive = async () => {
    setLiveBusy(true);
    const r = await fetchGlobalAwardsLive();
    setLiveBusy(false);
    if (r.ok) setLive(r.live); else setMsg(r.error || 'Yuklab bo\'lmadi');
  };
  const finalize = async (season) => {
    const r = await finalizeGlobalAwards(season);
    setMsg(r.ok ? `${season}-mavsum yakunlandi` : (r.error || r.reason || 'Yakunlab bo\'lmadi'));
    if (r.ok) { setLive(null); setIdx(0); reload(); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {!live && history.length > 1 && history.map((h, i) => (
          <button key={h.season} type="button" onClick={() => setIdx(i)} className={`font-sans text-xs font-bold rounded-full px-3 py-1.5 border cursor-pointer ${idx === i ? 'bg-ink text-white border-ink' : 'bg-surface-card text-ink-soft border-surface-line'}`}>{h.season}-mavsum</button>
        ))}
        <Button size="sm" variant="secondary" onClick={live ? () => setLive(null) : showLive} disabled={liveBusy}>
          {live ? '← Yakunlangan mavsumlar' : liveBusy ? 'Hisoblanmoqda…' : '📈 Joriy poyga (jonli)'}
        </Button>
      </div>

      {msg && <div className="text-sm rounded-control border border-surface-line bg-surface-muted px-3 py-2">{msg}</div>}

      {current ? (
        <GlobalAwardsView
          awards={current}
          weights={data?.weights}
          myId={player.id}
          heading={(
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="gold">{live ? `JONLI · ${live.leagues} liga bo'yicha hozirgi holat` : `${current.season}-mavsum · ${current.leaguesCounted}/${current.leaguesTotal} liga`}</Pill>
              {current.forced && <Pill>Ba'zi ligalar kutilmasdan yakunlangan</Pill>}
              {current.date && <span className="text-xs text-ink-muted">{current.date}</span>}
            </div>
          )}
        />
      ) : (
        <NotStarted icon="🌍" title="Global mukofotlar hali e'lon qilinmagan" desc="Barcha ligalar mavsumni tugatgach (yoki kutish muddati o'tgach) Ballon d'Or, Golden Boot va Team of the Season shu yerda avtomatik paydo bo'ladi. Hozirgi poygani 'Joriy poyga' tugmasi bilan ko'rishingiz mumkin." />
      )}

      {pending.length > 0 && (
        <Card title="⏳ Kutilayotgan mavsumlar" sub="Ba'zi ligalar mavsumni hali tugatmagan">
          <ul className="text-sm flex flex-col gap-2">
            {pending.map((p) => (
              <li key={p.season} className="flex items-center gap-3">
                <span>{p.season}-mavsum — {p.leaguesDone} liga tugatgan</span>
                {isAdmin && <Button size="sm" variant="ghost" onClick={() => finalize(p.season)}>Admin: hozir yakunlash</Button>}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function LeagueTab({ player, currentUser }) {
  const leagueId = player?.club?.leagueId;
  const { loading, data, error, reload } = useFetch(() => fetchAwards(leagueId), [leagueId]);
  const [preview, setPreview] = useState(null);
  const [idx, setIdx] = useState(0);

  const list = data?.awards || [];
  const current = preview || list[idx];
  if (current && !preview && list[0] && idx === 0) {
    try { localStorage.setItem(AWARDS_SEEN_KEY(player.id), String(list[0].season)); } catch (e) { /* e'tiborsiz */ }
  }

  return (
    <div className="flex flex-col gap-4">
      {loading && <Loading />}
      {error && <ErrorBox error={error} onRetry={reload} />}
      {!loading && !error && (
        <>
          {list.length > 1 && !preview && (
            <div className="flex gap-2 flex-wrap">
              {list.map((a, i) => (
                <button key={a.season} type="button" onClick={() => setIdx(i)} className={`font-sans text-xs font-bold rounded-full px-3 py-1.5 border cursor-pointer ${idx === i ? 'bg-ink text-white border-ink' : 'bg-surface-card text-ink-soft border-surface-line'}`}>{a.season}-mavsum</button>
              ))}
            </div>
          )}
          {current ? <AwardsCeremony awards={current} myId={player.id} /> : (
            <NotStarted icon="🎖️" title="Mukofotlar hali e'lon qilinmagan" desc="Mavsum tugagach (liga oxirgi turi o'ynalgach) marosim shu yerda avtomatik paydo bo'ladi." />
          )}
          {currentUser?.isAdmin && (
            <div className="flex items-center gap-3">
              <Button size="sm" variant="secondary" onClick={async () => { const r = await fetchAwardsPreview(leagueId); if (r.ok) setPreview(r.preview); }}>👁 Admin: joriy holat bo'yicha ko'rish</Button>
              {preview && <Button size="sm" variant="ghost" onClick={() => setPreview(null)}>Yopish</Button>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AwardsPage({ currentUser }) {
  const { player } = useGame();
  const [tab, setTab] = useState('global');
  if (!player) return null;

  const mine = player.career?.awards || [];

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Awards</h1>
          <div className="sub">{tab === 'global' ? "Butun dunyo · Ballon d'Or, Golden Boot va Team of the Season" : `${player.club.leagueName} · Oltin to'p, Oltin batinka va mavsum tarkibi`}</div>
        </div>
      </div>
      <div className="font-sans text-ink flex flex-col gap-4">
        <div className="flex gap-2">
          {[['global', '🌍 Global'], ['league', `🏟️ ${player.club.leagueName || 'Liga'}`]].map(([k, label]) => (
            <button key={k} type="button" onClick={() => setTab(k)} className={`font-sans text-xs font-bold rounded-full px-4 py-2 border cursor-pointer ${tab === k ? 'bg-ink text-white border-ink' : 'bg-surface-card text-ink-soft border-surface-line'}`}>{label}</button>
          ))}
        </div>

        {tab === 'global' ? <GlobalTab player={player} isAdmin={!!currentUser?.isAdmin} /> : <LeagueTab player={player} currentUser={currentUser} />}

        {mine.length > 0 && (
          <div className="bg-surface-card border border-surface-line rounded-card shadow-soft p-4">
            <div className="text-sm font-extrabold mb-2">🏅 Sizning mukofotlaringiz</div>
            <div className="flex flex-wrap gap-2">
              {mine.map((a, i) => <span key={i} className="text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800 rounded-full px-3 py-1">{a.title} · {a.season}-mavsum</span>)}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
