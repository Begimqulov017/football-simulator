import { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { generateMessages } from './messageGenerator';

// Watches the player's state and appends any procedural message (match report,
// coach advice, teammate chat, call-up, milestone...) that is not in the inbox
// yet. Ids are deterministic, so this is idempotent: no duplicates, and no
// update loop (once the ids exist, `fresh` is empty and nothing is written).
//
// Mounted once inside AppShell, which wraps every career page - that is why
// the red badge in the menu is up to date no matter which page you are on.
export default function useProceduralMessages() {
  const { player, updatePlayer } = useGame();

  useEffect(() => {
    if (!player?.career) return;
    const existing = new Set((player.career.messages || []).map((m) => m.id));
    const fresh = generateMessages(player).filter((m) => !existing.has(m.id));
    if (!fresh.length) return;

    updatePlayer((prev) => {
      const have = new Set((prev.career.messages || []).map((m) => m.id));
      const add = fresh.filter((m) => !have.has(m.id));
      if (!add.length) return {};
      return { career: { ...prev.career, messages: [...(prev.career.messages || []), ...add] } };
    });
  }, [player]); // eslint-disable-line react-hooks/exhaustive-deps
}
