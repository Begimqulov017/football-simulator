// ============================================================
// GLOBAL CHAT (Phase 9)
//   • Hamma login qilgan foydalanuvchi uchun ochiq umumiy chat
//   • Admin: xabarni PIN qilish (bitta) va O'CHIRISH
//   • @username teglari: server tegni haqiqiy foydalanuvchilarga qarshi
//     tekshiradi va xabarga `mentions` qilib yozadi (klient shuni ajratib ko'rsatadi)
//   • Anti-spam: 60 soniyada MAKS 7 xabar. 8-urinish rad etiladi va
//     1 daqiqalik COOLDOWN boshlanadi. Adminga cheklov qo'llanmaydi.
//
// Real-time: oddiy HTTP polling (klient har ~2.5 soniyada so'raydi) — qo'shimcha
// kutubxona (socket.io) kerak emas, MongoDB'dagi yagona hujjat bilan mos.
// ============================================================

const { roleOf, moderationView } = require('./roles');

const MAX_MESSAGES = 300;      // bazada saqlanadigan oxirgi xabarlar soni
const SEND_WINDOW = 100;       // har so'rovda qaytariladigan xabarlar soni
const MAX_TEXT_LEN = 300;
const RATE_LIMIT = 7;          // oynada ruxsat etilgan xabarlar
const RATE_WINDOW_MS = 60 * 1000;
const COOLDOWN_MS = 60 * 1000;

// username -> { stamps: number[], cooldownUntil: number }
// Xotirada: server restartida tozalanadi (spam himoyasi uchun yetarli).
const rateState = new Map();

function ensureChat(db) {
  db.chat = db.chat || { messages: [], pinnedId: null, seq: 0 };
  db.chat.messages = db.chat.messages || [];
  db.chat.seq = db.chat.seq || db.chat.messages.reduce((m, x) => Math.max(m, x.seq || 0), 0);
  if (db.chat.pinnedId === undefined) db.chat.pinnedId = null;
  return db.chat;
}

// ------------------------------------------------------------
// Rate limiter
// ------------------------------------------------------------
function rateInfo(username, now = Date.now()) {
  const st = rateState.get(username);
  if (!st) return { limit: RATE_LIMIT, remaining: RATE_LIMIT, cooldownMs: 0, windowMs: RATE_WINDOW_MS };
  if (now < st.cooldownUntil) {
    return { limit: RATE_LIMIT, remaining: 0, cooldownMs: st.cooldownUntil - now, windowMs: RATE_WINDOW_MS };
  }
  const live = st.stamps.filter((t) => now - t < RATE_WINDOW_MS);
  return { limit: RATE_LIMIT, remaining: Math.max(0, RATE_LIMIT - live.length), cooldownMs: 0, windowMs: RATE_WINDOW_MS };
}

// Urinishni hisobga oladi. { ok:true } yoki { ok:false, retryAfterMs }
function consumeRate(username, now = Date.now()) {
  let st = rateState.get(username);
  if (!st) { st = { stamps: [], cooldownUntil: 0 }; rateState.set(username, st); }
  if (now < st.cooldownUntil) return { ok: false, retryAfterMs: st.cooldownUntil - now };
  st.stamps = st.stamps.filter((t) => now - t < RATE_WINDOW_MS);
  if (st.stamps.length >= RATE_LIMIT) {
    st.cooldownUntil = now + COOLDOWN_MS;
    st.stamps = [];
    return { ok: false, retryAfterMs: COOLDOWN_MS };
  }
  st.stamps.push(now);
  return { ok: true };
}

function resetRateState() { rateState.clear(); }

// ------------------------------------------------------------
// @mentions
// ------------------------------------------------------------
const WORD = /[A-Za-z0-9_]/;

// Matn ichidan haqiqiy foydalanuvchilarni topadi (katta-kichik harf farqsiz).
// Login ichida bo'sh joy bo'lishi mumkin, shuning uchun regex emas, ro'yxat bo'yicha tekshiriladi.
function extractMentions(text, users) {
  const lower = String(text || '').toLowerCase();
  const found = new Set();
  (users || []).forEach((u) => {
    const tag = `@${u.username.toLowerCase()}`;
    let idx = lower.indexOf(tag);
    while (idx !== -1) {
      const before = lower[idx - 1];
      const after = lower[idx + tag.length];
      const okBefore = before === undefined || !WORD.test(before);
      const okAfter = after === undefined || !WORD.test(after);
      if (okBefore && okAfter) { found.add(u.username); break; }
      idx = lower.indexOf(tag, idx + 1);
    }
  });
  return [...found];
}

// ------------------------------------------------------------
// Public API (route handlerlar shu funksiyalarni chaqiradi)
// ------------------------------------------------------------
function displayNameOf(u) {
  const cs = u.careerSave;
  if (cs && cs.name) return `${cs.name} ${cs.surname || ''}`.trim();
  return u.username;
}

function publicMessage(m) {
  return {
    id: m.id, seq: m.seq, username: m.username, displayName: m.displayName,
    isAdmin: !!m.isAdmin, role: m.role || (m.isAdmin ? 'admin' : 'user'), clubLogo: m.clubLogo || null,
    text: m.text, mentions: m.mentions || [], at: m.at,
  };
}

function snapshot(db, user) {
  const chat = ensureChat(db);
  const messages = chat.messages.slice(-SEND_WINDOW).map(publicMessage);
  const pinnedRaw = chat.pinnedId ? chat.messages.find((m) => m.id === chat.pinnedId) : null;
  return {
    ok: true,
    messages,
    pinned: pinnedRaw ? publicMessage(pinnedRaw) : null,
    latestSeq: chat.seq,
    users: (db.users || []).map((u) => ({ username: u.username, displayName: displayNameOf(u), isAdmin: !!u.isAdmin, role: roleOf(u) })),
    me: { role: roleOf(user), muted: moderationView(user).muted },
    rate: user.isAdmin ? { limit: null, remaining: null, cooldownMs: 0, windowMs: RATE_WINDOW_MS, exempt: true } : rateInfo(user.username),
    serverTime: Date.now(),
  };
}

function postMessage(db, user, rawText) {
  const chat = ensureChat(db);
  const text = String(rawText || '').replace(/\s+/g, ' ').trim();
  if (!text) return { ok: false, error: "Bo'sh xabar yuborib bo'lmaydi" };
  if (text.length > MAX_TEXT_LEN) return { ok: false, error: `Xabar ${MAX_TEXT_LEN} belgidan oshmasligi kerak` };

  if (!user.isAdmin) {
    const r = consumeRate(user.username);
    if (!r.ok) {
      const sec = Math.ceil(r.retryAfterMs / 1000);
      return {
        ok: false, rateLimited: true, retryAfterMs: r.retryAfterMs,
        error: `Juda tez yozyapsiz (60 soniyada ${RATE_LIMIT} tadan ko'p emas). ${sec} soniyadan keyin qayta urinib ko'ring.`,
        rate: rateInfo(user.username),
      };
    }
  }

  chat.seq += 1;
  const msg = {
    id: `c${chat.seq}`,
    seq: chat.seq,
    username: user.username,
    displayName: displayNameOf(user),
    isAdmin: !!user.isAdmin,
    role: roleOf(user),
    clubLogo: user.careerSave?.club?.logo || null,
    text,
    mentions: extractMentions(text, db.users),
    at: new Date().toISOString(),
  };
  chat.messages.push(msg);
  if (chat.messages.length > MAX_MESSAGES) {
    const dropped = chat.messages.splice(0, chat.messages.length - MAX_MESSAGES);
    // Pin qilingan xabar tarixdan chiqib ketmasligi uchun qaytarib qo'yiladi
    const pinned = dropped.find((m) => m.id === chat.pinnedId);
    if (pinned) chat.messages.unshift(pinned);
  }
  return { ok: true, message: publicMessage(msg), rate: user.isAdmin ? null : rateInfo(user.username) };
}

// Admin: bitta xabarni pin qiladi; xuddi shu xabarga qayta bosilsa pin olinadi.
function togglePin(db, id) {
  const chat = ensureChat(db);
  const msg = chat.messages.find((m) => m.id === id);
  if (!msg) return { ok: false, error: 'Xabar topilmadi' };
  chat.pinnedId = chat.pinnedId === id ? null : id;
  return { ok: true, pinnedId: chat.pinnedId };
}

function deleteMessage(db, id) {
  const chat = ensureChat(db);
  const idx = chat.messages.findIndex((m) => m.id === id);
  if (idx === -1) return { ok: false, error: 'Xabar topilmadi' };
  chat.messages.splice(idx, 1);
  if (chat.pinnedId === id) chat.pinnedId = null;
  return { ok: true };
}

// Nav'dagi badge uchun: oxirgi ko'rilgan seq'dan keyingi xabarlar va menga tegilganlari
function unreadSummary(db, user, afterSeq) {
  const chat = ensureChat(db);
  const after = Number(afterSeq) || 0;
  const fresh = chat.messages.filter((m) => m.seq > after && m.username !== user.username);
  const me = user.username.toLowerCase();
  const mentionCount = fresh.filter((m) => (m.mentions || []).some((x) => x.toLowerCase() === me)).length;
  return { ok: true, latestSeq: chat.seq, unreadCount: fresh.length, mentionCount };
}

module.exports = {
  ensureChat, snapshot, postMessage, togglePin, deleteMessage, unreadSummary,
  extractMentions, consumeRate, rateInfo, resetRateState,
  RATE_LIMIT, RATE_WINDOW_MS, COOLDOWN_MS, MAX_TEXT_LEN,
};
