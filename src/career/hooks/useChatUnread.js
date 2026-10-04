import { useEffect, useState } from 'react';
import { fetchChatUnread } from '../utils/careerApi';
import { getChatSeen, CHAT_SEEN_EVENT } from '../utils/chatSeen';

// Nav badge uchun: o'qilmagan xabarlar va menga qilingan @teglar soni.
// `paused` (chat sahifasi ochiq) bo'lsa so'rov yuborilmaydi.
export default function useChatUnread(username, paused) {
  const [state, setState] = useState({ unread: 0, mentions: 0 });

  useEffect(() => {
    if (!username || paused) { setState({ unread: 0, mentions: 0 }); return undefined; }
    let alive = true;
    const tick = async () => {
      if (document.hidden) return;
      const r = await fetchChatUnread(getChatSeen(username));
      if (alive && r && r.ok) setState({ unread: r.unreadCount || 0, mentions: r.mentionCount || 0 });
    };
    tick();
    const id = setInterval(tick, 6000);
    const onSeen = () => tick();
    window.addEventListener(CHAT_SEEN_EVENT, onSeen);
    return () => { alive = false; clearInterval(id); window.removeEventListener(CHAT_SEEN_EVENT, onSeen); };
  }, [username, paused]);

  return state;
}
