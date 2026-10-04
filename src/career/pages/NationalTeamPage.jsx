import React, { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import NotStarted from '../components/NotStarted';
import PitchView from '../components/PitchView';
import { useGame } from '../context/GameContext';
import { fetchInternational, fetchNationHub } from '../utils/careerApi';
import TournamentView from '../tournaments/TournamentView';
import { flagOfNation } from '../international/calendar';
import { NATIONALITIES } from '../../data/leaguesData';

// Phase 9 — National Team Hub
//   • Chaqiruv shartlari (eligibility): nima yetishmayotgani aniq ko'rsatiladi
//   • Tarkib: maydondagi boshlang'ich 11 (4-3-3) + zaxira skameykasi
//   • Fixtures: kelgusi va o'tgan o'yinlar (guruh, pley-off, o'rtoqlik)
//   • Turnirlar va tarix (avvalgi funksiyalar saqlangan)
// Hamma ma'lumot umumiy dunyodan keladi: terma jamoa tarkibini server har safar qayta tanlaydi.

const TABS = [['overview', 'Chaqiruv'], ['squad', 'Tarkib'], ['fixtures', "O'yinlar"], ['live', 'Turnirlar'], ['history', 'Tarix']];

const Card = ({ title, children, className = '' }) => (
  <div className={`bg-surface-card border border-surface-line rounded-card shadow-soft p-4 ${className}`}>
    {title && <div className="text-[11px] font-extrabold tracking-wider text-ink-muted mb-3">{title}</div>}
    {children}
  </div>
);

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-xs text-ink-muted">{label}</div>
      <div className="text-2xl font-black text-ink">{value}</div>
    </div>
  );
}

// ---------------------------------------------------------------- Eligibility
function EligibilityCard({ el }) {
  if (!el || !el.hasPlayer) return null;
  const pct = Math.max(0, Math.min(100, el.cutoffOvr ? Math.round((el.ovr / el.cutoffOvr) * 100) : 100));
  const status = el.inStartingXI ? { text: "Boshlang'ich 11 da", tone: 'bg-brand-soft text-brand-dark border-brand' }
    : el.calledUp ? { text: 'Chaqirilgan (zaxira)', tone: 'bg-accent-tint text-accent-dark border-accent' }
      : { text: 'Chaqirilmagan', tone: 'bg-amber-50 text-amber-800 border-amber-300' };
  return (
    <Card title="CHAQIRUV SHARTLARI">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className={`text-sm font-extrabold border rounded-full px-3 py-1 ${status.tone}`}>{status.text}</span>
        {el.rankOverall != null && (
          <span className="text-xs text-ink-muted">
            Mamlakat bo'yicha <b className="text-ink">{el.rankOverall}-o'rin</b> · {el.slot} pozitsiyasida <b className="text-ink">{el.rankInPosition}-o'rin</b> ({el.poolSize} futbolchidan)
          </span>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs font-bold text-ink-soft mb-1">
          <span>Sizning OVR: {el.ovr}</span>
          <span>Chaqiruv chegarasi: {el.cutoffOvr}</span>
        </div>
        <div className="h-2.5 rounded-full bg-surface-muted overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className={`h-full rounded-full transition-all duration-700 ${el.ovr >= el.cutoffOvr ? 'bg-brand' : 'bg-amber-400'}`} style={{ width: `${pct}%` }} />
        </div>
        {!el.calledUp && el.gapToCallUp > 0 && (
          <div className="mt-2 text-xs text-amber-800">Chaqirilish uchun yana taxminan <b>+{el.gapToCallUp} OVR</b> kerak.</div>
        )}
      </div>

      <ul className="flex flex-col gap-2">
        {el.checks.map((c) => (
          <li key={c.key} className="flex items-start gap-2 text-sm">
            <span className={`mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-black ${c.ok ? 'bg-brand-soft text-brand-dark' : 'bg-red-100 text-red-600'}`} aria-label={c.ok ? 'bajarilgan' : 'bajarilmagan'}>{c.ok ? '✓' : '✕'}</span>
            <span className="flex-1">
              <span className="font-bold text-ink">{c.label}</span>
              <span className="block text-xs text-ink-muted">{c.detail}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 text-[11px] text-ink-subtle">Tarkib har xalqaro o'yin oldidan qaytadan tanlanadi: reytingingiz va sog'ligingiz hal qiladi.</div>
    </Card>
  );
}

// ---------------------------------------------------------------- Squad
function PlayerRow({ p, i }) {
  return (
    <tr className={p.isYou ? 'bg-amber-50 font-bold' : ''}>
      <td className="py-1.5 pr-2 text-ink-muted">{i}</td>
      <td className="py-1.5 pr-2">{p.name}{p.isYou ? ' (siz)' : p.username ? ` (@${p.username})` : ''}</td>
      <td className="py-1.5 pr-2">{p.pos}</td>
      <td className="py-1.5 pr-2 font-bold">{p.ovr}</td>
      <td className="py-1.5 text-ink-muted">{p.clubName || '—'}</td>
    </tr>
  );
}

function SquadTable({ rows, start }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-xs text-ink-muted"><th>#</th><th>Futbolchi</th><th>Poz</th><th>OVR</th><th>Klub</th></tr></thead>
        <tbody>{rows.map((p, i) => <PlayerRow key={p.id} p={p} i={start + i} />)}</tbody>
      </table>
    </div>
  );
}

function SquadView({ hub }) {
  const xi = hub.xi.map((p) => ({ ...p, sub: p.clubName ? String(p.clubName).slice(0, 10) : '' }));
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title={`${hub.flag} ${hub.country} — BOSHLANG'ICH 11 (${hub.formation})`}>
        <PitchView players={xi} />
        <div className="mt-3 text-xs text-ink-muted text-center">Kuch: <b className="text-ink">{hub.strength}</b> · {hub.confederation}</div>
      </Card>
      <div className="flex flex-col gap-4">
        <Card title="BOSHLANG'ICH 11"><SquadTable rows={hub.xi} start={1} /></Card>
        <Card title={`ZAXIRA SKAMEYKASI (${hub.bench.length})`}>
          {hub.bench.length ? <SquadTable rows={hub.bench} start={12} /> : <div className="text-sm text-ink-muted">Zaxira o'yinchilari yo'q.</div>}
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Fixtures
function resultChip(f, country) {
  if (f.golA == null) return null;
  const mine = f.home === country ? f.golA : f.golB;
  const theirs = f.home === country ? f.golB : f.golA;
  let r = mine > theirs ? 'G' : mine < theirs ? 'M' : 'D';
  if (mine === theirs && f.penalties) {
    const pm = f.home === country ? f.penalties.a : f.penalties.b;
    const pt = f.home === country ? f.penalties.b : f.penalties.a;
    r = pm > pt ? 'G' : 'M';
  }
  const tone = r === 'G' ? 'bg-brand-soft text-brand-dark' : r === 'D' ? 'bg-surface-muted text-ink-soft' : 'bg-red-100 text-red-600';
  const label = r === 'G' ? "G'alaba" : r === 'D' ? 'Durang' : "Mag'lubiyat";
  return <span className={`text-[11px] font-extrabold rounded-full px-2 py-0.5 ${tone}`}>{label}</span>;
}

function FixtureRow({ f, country }) {
  const played = f.golA != null;
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 border-b border-surface-line last:border-0">
      <div className="w-24 shrink-0">
        <div className="text-xs font-bold text-ink">{f.date}</div>
        <div className="text-[11px] text-ink-muted">{f.stage}</div>
      </div>
      <div className="flex-1 min-w-[180px] text-sm font-bold text-ink">
        <span>{f.homeFlag} {f.home}</span>
        <span className="mx-2 text-ink-muted font-black">
          {played ? `${f.golA} - ${f.golB}${f.penalties ? ` (pen ${f.penalties.a}-${f.penalties.b})` : ''}` : 'vs'}
        </span>
        <span>{f.away ? `${f.awayFlag || ''} ${f.away}` : <span className="font-normal text-ink-muted">raqib o'sha kuni aniqlanadi</span>}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-ink-muted">{f.competition}</span>
        {played && resultChip(f, country)}
      </div>
    </li>
  );
}

function FixturesView({ hub }) {
  const { upcoming, played } = hub.fixtures;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="KELGUSI O'YINLAR">
        {upcoming.length ? <ul>{upcoming.map((f, i) => <FixtureRow key={i} f={f} country={hub.country} />)}</ul>
          : <div className="text-sm text-ink-muted">Rejalashtirilgan o'yin yo'q.</div>}
      </Card>
      <Card title="O'TGAN O'YINLAR">
        {played.length ? <ul>{played.map((f, i) => <FixtureRow key={i} f={f} country={hub.country} />)}</ul>
          : <div className="text-sm text-ink-muted">Hali rasmiy o'yin o'tmagan. Tanaffus o'yinlari va turnir natijalari shu yerda paydo bo'ladi.</div>}
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------- Page
export default function NationalTeamPage() {
  const { player } = useGame();
  const ownNation = player?.nationality || null;
  const [country, setCountry] = useState(ownNation);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);       // { hub, eligibility, worldDate }
  const [error, setError] = useState(null);
  const [world, setWorld] = useState({ tournaments: [], history: [], news: [] });
  const [tab, setTab] = useState('overview');

  useEffect(() => { if (ownNation && !country) setCountry(ownNation); }, [ownNation, country]);

  useEffect(() => {
    if (!country) { setLoading(false); return undefined; }
    let alive = true;
    setLoading(true);
    (async () => {
      const [intl, res] = await Promise.all([fetchInternational(), fetchNationHub(country)]);
      if (!alive) return;
      setWorld(intl);
      if (res.ok) { setData(res); setError(null); } else { setData(null); setError(res.error || "Terma jamoa ma'lumoti topilmadi"); }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [country]);

  const nations = useMemo(() => [...(NATIONALITIES || [])].sort((a, b) => a.name.localeCompare(b.name)), []);
  if (!player) return null;

  const intl = player.career?.international;
  const live = (world.tournaments || []).filter((t) => !t.finished);
  const viewingOwn = country === ownNation;
  const tabs = TABS.map(([k, label]) => [k, k === 'live' && live.length ? `${label} (${live.length})` : label]);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>{flagOfNation(country)} National Team</h1>
          <div className="sub">
            {flagOfNation(ownNation)} {ownNation || '—'}{world.worldDate ? ` · dunyo sanasi: ${world.worldDate}` : ''}
          </div>
        </div>
        <span className={`badge${intl?.caps ? ' badge-gold' : ''}`}>
          {intl?.caps ? `${intl.caps} caps · ${intl.goals || 0} gol` : 'Hali chaqirilmagan'}
        </span>
      </div>

      <div className="font-sans text-ink flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`font-sans text-xs font-bold rounded-full px-3.5 py-1.5 border cursor-pointer ${tab === k ? 'bg-ink text-white border-ink' : 'bg-surface-card text-ink-soft border-surface-line'}`}
            >{label}</button>
          ))}
          {(tab === 'squad' || tab === 'fixtures') && (
            <label className="ml-auto flex items-center gap-2 text-xs text-ink-muted">
              Jamoa:
              <select
                value={country || ''}
                onChange={(e) => setCountry(e.target.value)}
                className="font-sans text-sm bg-surface-card border border-surface-line rounded-control px-2 py-1.5"
              >
                {ownNation && <option value={ownNation}>{flagOfNation(ownNation)} {ownNation} (mening)</option>}
                {nations.filter((n) => n.name !== ownNation).map((n) => <option key={n.name} value={n.name}>{n.flag} {n.name}</option>)}
              </select>
            </label>
          )}
        </div>

        {loading && <NotStarted icon="⏳" title="Yuklanmoqda" desc="Terma jamoa ma'lumotlari olinmoqda." />}

        {!loading && tab === 'overview' && (
          <>
            {data && viewingOwn ? <EligibilityCard el={data.eligibility} /> : (
              <NotStarted icon="🏳️" title="Chaqiruv ma'lumoti mavjud emas" desc={error || "Bu bo'lim faqat o'z mamlakatingiz uchun. Boshqa jamoani 'Tarkib' bo'limida ko'ring."} />
            )}
            <Card title="SIZNING XALQARO KARYERANGIZ">
              {intl?.caps ? (
                <div className="grid grid-cols-3 gap-3">
                  <Stat label="Caps" value={intl.caps} />
                  <Stat label="Gollar" value={intl.goals || 0} />
                  <Stat label="Assistlar" value={intl.assists || 0} />
                  {intl.lastCallUp && (
                    <div className="col-span-3 text-xs text-ink-muted">
                      So'nggi o'yin: {intl.lastCallUp.date} · {intl.lastCallUp.competition} · {intl.lastCallUp.opponent}ga qarshi
                      {intl.lastCallUp.rating ? ` · baho ${intl.lastCallUp.rating}` : ''}
                    </div>
                  )}
                  {!!(intl.trophies || []).length && (
                    <div className="col-span-3 flex flex-wrap gap-2">
                      {intl.trophies.map((t, i) => (
                        <span key={i} className="text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800 rounded-full px-3 py-1">🏆 {t.name} {t.year}</span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NotStarted icon="🌍" title="Terma jamoaga hali chaqirilmadingiz" desc="Terma jamoaga eng yuqori reytingli futbolchilar chaqiriladi. Reytingingizni oshiring — har bir xalqaro o'yin oldidan tarkib qaytadan tanlanadi." />
              )}
            </Card>
          </>
        )}

        {!loading && tab === 'squad' && (data ? <SquadView hub={data.hub} /> : <NotStarted icon="🏳️" title="Tarkib mavjud emas" desc={error} />)}
        {!loading && tab === 'fixtures' && (data ? <FixturesView hub={data.hub} /> : <NotStarted icon="📅" title="O'yinlar jadvali mavjud emas" desc={error} />)}

        {!loading && tab === 'live' && (
          live.length ? live.map((t) => (
            <div className="bg-surface-card border border-surface-line rounded-card shadow-soft p-4" key={t.id}>
              <TournamentView comp={t} mode="nation" />
            </div>
          )) : (
            <NotStarted icon="📅" title="Hozir turnir yo'q" desc="Jahon chempionati 4 yilda bir (2026, 2030, 2034...), Yevropa/Copa/Osiyo/Afrika kubogi esa ular orasidagi juft yillarda o'tkaziladi." />
          )
        )}

        {!loading && tab === 'history' && (
          <Card title="O'TGAN TURNIRLAR">
            {(world.history || []).length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-xs text-ink-muted"><th>Yil</th><th>Turnir</th><th>Chempion</th><th>2-o'rin</th><th>Eng ko'p gol</th></tr></thead>
                  <tbody>
                    {world.history.map((h) => (
                      <tr key={h.id} className="border-t border-surface-line">
                        <td className="py-1.5">{h.year}</td><td>{h.name}</td><td><b>{h.winner}</b></td><td>{h.runnerUp}</td>
                        <td>{h.topScorer ? `${h.topScorer.name} (${h.topScorer.goals})` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <NotStarted icon="🏆" title="Hali turnir o'tmagan" desc="Birinchi turnir yakunlangach shu yerda ko'rinadi." />
            )}
          </Card>
        )}
      </div>
    </AppShell>
  );
}
