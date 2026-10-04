# Phase 9 + 10 — o'zgargan va yangi fayllar

Bu zip OLDINGI `football-simulator-phases-3-8.zip` ustiga qo'yiladi (ildizda ochib "ustidan yozish").

## Backend'ni ham deploy qiling
`SERVER_VERSION` va `REQUIRED_SERVER_VERSION` = 14. Faqat frontend deploy qilinsa "backend yangilanmagan" xabari chiqadi.

## Birlashtirishda hal qilingan to'qnashuvlar
- **Ikki chat:** Phase 9 (`server/chat.js`) va Phase 10 (`adminTools.js` ichida) ikkalasi ham `/api/chat` yozgan edi.
  Endi bitta: engine = Phase 9, moderatsiya (pin/delete/mute/audit, admin + moderator) = Phase 10 (`/api/mod/...`).
  `ChatPage` (Phase 9) moderator/mute'ni qo'llaydi; admin panelidagi `ChatPanel` (Phase 10) yangi API shakliga moslandi.
- `server/index.js`: Phase 3 (`mergeServerOwnedFields`), Phase 7 (`roundOvr`), Phase 9 va 10 kodlari birga; `/api/career/save`
  avval admin-edit konfliktini tekshiradi, keyin server yozgan mukofotlarni birlashtiradi.
- `GameContext.jsx`: honoursSync + displayRating + Phase 8 negotiation + Phase 10 `ackRev`/admin patch/majburiy yangilik birga.
- `AppShell.jsx`: o'qilmagan xabar badge'i + chat badge'i + moderator uchun "Moderatsiya" havolasi; takroriy "Chat" havolasi olib tashlandi.
- Global mukofotlar (`global_ballon_dor` va h.k.) Profile > Honours va hisoblagichlarda ko'rinadi (`utils/honours.js`).
