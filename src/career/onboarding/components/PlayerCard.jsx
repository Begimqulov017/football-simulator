import React from 'react';
import { TeamBadge } from '../../../components/TeamLogo';

// Yaratilgan o'yinchi kartasi (FUT'dan ilhomlangan, lekin Clean Light uslubida).
export default function PlayerCard({ player, club, rating, potential, revealed = true }) {
  const shown = revealed && rating != null;
  return (
    <div className="relative w-full max-w-[260px] mx-auto rounded-[22px] p-[3px] bg-gradient-to-br from-brand via-accent to-brand-dark shadow-lift">
      <div className="rounded-[20px] bg-surface-card px-5 pt-5 pb-4 flex flex-col items-center gap-1 overflow-hidden relative">
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-brand/10" />
        <div className="absolute -bottom-12 -left-10 w-32 h-32 rounded-full bg-accent/10" />

        <div className="relative w-full flex items-start justify-between">
          <div className="flex flex-col items-start leading-none">
            <span className="text-4xl font-black text-ink tabular-nums">{shown ? rating : '--'}</span>
            <span className="text-xs font-extrabold text-brand-dark mt-1">{player.position}</span>
          </div>
          <span className="text-3xl">{club ? <TeamBadge id={club.id} value={club.logo} size={36} /> : '❔'}</span>
        </div>

        <div className="relative my-3 w-24 h-24 rounded-full bg-gradient-to-b from-surface-muted to-surface-line border border-surface-line flex items-center justify-center">
          <span className="text-5xl font-black text-ink-soft/70 tabular-nums">#{player.number || '?'}</span>
        </div>

        <div className="relative text-center">
          <div className="text-lg font-black tracking-wide text-ink">{(player.nickname || player.surname || 'PLAYER').toUpperCase()}</div>
          <div className="text-xs text-ink-muted font-medium">{player.name} {player.surname}</div>
        </div>

        <div className="relative w-full mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-control bg-brand-tint border border-brand-soft py-2 text-center">
            <div className="text-[10px] font-extrabold uppercase tracking-wide text-brand-dark">Rating</div>
            <div className="text-xl font-black text-ink tabular-nums">{shown ? rating : '--'}</div>
          </div>
          <div className="rounded-control bg-accent-tint border border-accent-soft py-2 text-center">
            <div className="text-[10px] font-extrabold uppercase tracking-wide text-accent-dark">Potential</div>
            <div className="text-xl font-black text-ink tabular-nums">{shown && potential != null ? potential : '--'}</div>
          </div>
        </div>

        {club && <div className="relative mt-2 text-xs font-bold text-ink-muted text-center">{club.name}</div>}
      </div>
    </div>
  );
}
