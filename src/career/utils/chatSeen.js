// Chatda oxirgi KO'RILGAN xabar raqami (seq) — har foydalanuvchi uchun alohida.
// Nav'dagi o'qilmagan / @teg badge'i shu qiymatdan keyingi xabarlarni sanaydi.
export const CHAT_SEEN_EVENT = 'fs-chat-seen';
const key = (username) => `fs_chat_seen_${username}`;

export function getChatSeen(username) {
  try { return Number(localStorage.getItem(key(username))) || 0; } catch (e) { return 0; }
}

export function setChatSeen(username, seq) {
  try { localStorage.setItem(key(username), String(seq)); } catch (e) { /* e'tiborsiz */ }
  try { window.dispatchEvent(new Event(CHAT_SEEN_EVENT)); } catch (e) { /* e'tiborsiz */ }
}
