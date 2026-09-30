import React, { useState } from 'react';
import AppShell from '../components/AppShell';
import NotStarted from '../components/NotStarted';
import { useGame } from '../context/GameContext';
import { fetchAwards, fetchAwardsPreview } from '../utils/careerApi';
import { useFetch, Loading, ErrorBox } from '../admin/adminUi';
import AwardsCeremony from '../awards/AwardsCeremony';
import { Button } from '../../components/ui';

export const AWARDS_SEEN_KEY = (playerId) => `fs_awards_seen_${playerId}`;

// Phase 5 — Mavsum yakunidagi individual mukofotlar paneli.
export default function AwardsPage({ currentUser }) {
  const { player } = useGame();
  const leagueId = player?.club?.leagueId;
  const { loading, data, error, reload } = useFetch(() => fetchAwards(leagueId), [leagueId]);
  const [preview, setPreview] = useState(null);
  const [idx, setIdx] = useState(0);
  if (!player) return null;

  const list = data?.awards || [];
  const current = preview || list[idx];
  if (current && !preview && list[0] && idx === 0) {
    try { localStorage.setItem(AWARDS_SEEN_KEY(player.id), String(list[0].season)); } catch (e) { /* e'tiborsiz */ }
  }
  const mine = (player.career?.awards || []);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Awards</h1>
          <div className="sub">{player.club.leagueName} · Oltin to'p, Oltin batinka va mavsum tarkibi</div>
        </div>
      </div>
      <div className="font-sans text-ink flex flex-col gap-4">
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
            {mine.length > 0 && (
              <div className="bg-surface-card border border-surface-line rounded-card shadow-soft p-4">
                <div className="text-sm font-extrabold mb-2">🏅 Sizning mukofotlaringiz</div>
                <div className="flex flex-wrap gap-2">
                  {mine.map((a, i) => <span key={i} className="text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800 rounded-full px-3 py-1">{a.title} · {a.season}-mavsum</span>)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
