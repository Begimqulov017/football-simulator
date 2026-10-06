import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useGame } from '../context/GameContext';
import CareerDashboard from '../dashboard/CareerDashboard';
import AwardsBanner from '../awards/AwardsBanner';
import { getLeagueTable, getTopScorers } from '../utils/season';
import { useNewsFeed } from '../utils/useNewsFeed';
import NewsBanner from '../news/NewsBanner';
import { NewsModal } from '../news/newsUi';
import TeamLogo from '../../components/TeamLogo';

// Dark neon panel - barcha Home bloklari uchun umumiy ko'rinish
function Panel({ title, accent = 'cyan', onClick, right, children }) {
  const line = { cyan: 'from-cyan-400', emerald: 'from-emerald-400', amber: 'from-amber-400', violet: 'from-violet-400' }[accent];
  const text = { cyan: 'text-cyan-300', emerald: 'text-emerald-300', amber: 'text-amber-300', violet: 'text-violet-300' }[accent];
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020]/90 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition-colors ${onClick ? 'cursor-pointer hover:border-white/25' : ''}`}
    >
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${line} via-transparent to-transparent`} />
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className={`text-[11px] font-extrabold uppercase tracking-[0.2em] ${text}`} style={{ fontFamily: 'var(--font-display)' }}>{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
}

function Row({ left, right, hot }) {
  return (
    <div className={`flex items-center justify-between gap-2 border-b border-white/5 py-2 text-sm last:border-b-0 ${hot ? 'font-bold text-amber-300' : 'text-slate-200'}`}>
      <span className="truncate">{left}</span>
      {right}
    </div>
  );
}

const Pill = ({ children, tone = 'slate' }) => {
  const t = {
    slate: 'border-white/10 bg-white/5 text-slate-200',
    gold: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
    green: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  }[tone];
  return <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-bold tabular-nums ${t}`}>{children}</span>;
};

export default function HomePage() {
  const { player, worldDate } = useGame();
  const navigate = useNavigate();
  const { feed, featured } = useNewsFeed(player);
  const [open, setOpen] = useState(null);

  if (!player) return null;

  const table = getLeagueTable(player).slice(0, 5);
  const scorers = getTopScorers(player).slice(0, 5);

  // Featured bo'sh bo'lsa - eng so'nggi 3 ta yangilik "Latest" sifatida aylanadi
  const bannerItems = featured.length ? featured : feed.slice(0, 3);
  const bannerLabel = featured.length ? 'Featured' : 'Latest';

  // Modal ichida Newer/Older navigatsiya (banner ro'yxati bo'yicha emas, butun feed bo'yicha)
  const openIdx = open ? feed.findIndex((n) => n.id === open.id) : -1;
  const newer = openIdx > 0 ? () => setOpen(feed[openIdx - 1]) : null;
  const older = openIdx >= 0 && openIdx < feed.length - 1 ? () => setOpen(feed[openIdx + 1]) : null;

  return (
    <AppShell>
      <div
        className="relative -mx-2 overflow-hidden rounded-3xl border border-white/10 bg-[#05080f] p-4 text-slate-100 sm:p-6"
        style={{
          backgroundImage: 'radial-gradient(700px 320px at 12% -10%, rgba(34,211,238,0.14), transparent 60%), radial-gradient(600px 300px at 100% 0%, rgba(167,139,250,0.14), transparent 60%), linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: 'auto, auto, 36px 36px, 36px 36px',
        }}
      >
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-2xl font-black text-white sm:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>Welcome back, {player.name}</div>
            <div className="mt-1 text-sm text-slate-400"><TeamLogo id={player.club.id} logo={player.club.logo} size={18} /> {player.club.name} · {player.club.leagueName}</div>
          </div>
          <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.25)]">Day {player.career.day}</span>
        </div>

        {worldDate && (
          <div className="mb-4 text-xs text-slate-400">
            🌍 Umumiy dunyo sanasi: <b className="text-slate-200">{worldDate}</b> (admin tomonidan boshqariladi)
          </div>
        )}

        {player.career.freeAgent && (
          <div className="mb-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-center shadow-[0_0_30px_rgba(244,63,94,0.15)]">
            <div className="text-sm font-black tracking-wider text-rose-300" style={{ fontFamily: 'var(--font-display)' }}>🆓 FREE AGENT</div>
            <div className="mt-1 text-xs text-slate-300">You're without a club right now - check Messages for offers coming in.</div>
          </div>
        )}

        <AwardsBanner player={player} />

        {/* Featured news - full width, bitta karta */}
        <div className="mb-5">
          <NewsBanner
            items={bannerItems}
            fallbackLabel={bannerLabel}
            onOpen={setOpen}
            onViewAll={() => navigate('/news')}
            modalOpen={!!open}
          />
        </div>

        {/* Match schedule / game list (CareerDashboard o'zgarishsiz, neon ramka ichida) */}
        <div className="mb-5 overflow-hidden rounded-2xl border border-cyan-400/25 bg-[#0b1020] p-2 shadow-[0_0_40px_rgba(34,211,238,0.10)] sm:p-3">
          <CareerDashboard />
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Panel title="League Top 5" accent="cyan" onClick={() => navigate('/league')} right={<span className="text-[10px] font-semibold text-slate-500">View all →</span>}>
            {table.length === 0 && <div className="py-2 text-sm text-slate-500">No table yet.</div>}
            {table.map((row, i) => (
              <Row key={row.teamId} hot={row.teamId === player.club.id} left={<>{i + 1}. <TeamLogo id={row.teamId} logo={row.logo} size={18} /> {row.name}</>} right={<Pill tone={row.teamId === player.club.id ? 'gold' : 'slate'}>{row.pts} pts</Pill>} />
            ))}
          </Panel>

          <Panel title="Top Scorers" accent="amber" onClick={() => navigate('/top-scorers')} right={<span className="text-[10px] font-semibold text-slate-500">View all →</span>}>
            {scorers.length === 0 && <div className="py-2 text-sm text-slate-500">No goals yet.</div>}
            {scorers.map((s, i) => (
              <Row key={s.id} hot={s.id === player.id} left={`${i + 1}. ${s.name}`} right={<Pill tone="gold">{s.goals}</Pill>} />
            ))}
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Panel title="Latest Headlines" accent="violet" onClick={() => navigate('/news')} right={<span className="text-[10px] font-semibold text-slate-500">News archive →</span>}>
            {feed.length === 0 && <div className="py-2 text-sm text-slate-500">No headlines yet - play a few matchdays.</div>}
            {feed.slice(0, 4).map((n) => (
              <div
                key={n.id}
                onClick={(e) => { e.stopPropagation(); setOpen(n); }}
                className="flex cursor-pointer items-start gap-2.5 border-b border-white/5 py-2 last:border-b-0 hover:bg-white/[0.03]"
              >
                <span className="text-lg">{n.icon}</span>
                <span className="min-w-0 flex-1 text-sm font-semibold text-slate-200">{n.headline}</span>
              </div>
            ))}
          </Panel>

          <Panel title="Money & Budget" accent="emerald" onClick={() => navigate('/money')}>
            <Row left="Balance" right={<Pill tone="green">${player.career.money.toLocaleString()}</Pill>} />
            <Row left="Weekly Wage" right={<Pill>${player.career.weeklyWage.toLocaleString()}</Pill>} />
          </Panel>
        </div>
      </div>

      <NewsModal item={open} onClose={() => setOpen(null)} onPrev={newer} onNext={older} />
    </AppShell>
  );
}
