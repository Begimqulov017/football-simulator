# Football-Simulator — Qayta qurish: bajarilgan ishlar (Phase 1–5)

## Lokal ishga tushirish
```
npm install && (cd server && npm install)
cd server && node index.js        # MONGODB_URI bo'lmasa: lokal JSON baza (server/data/db.json)
npm start                         # frontend
```
Admin akkaunt: `Begimqulov017` (server/index.js'dagi seed).

## Phase 1 — Dizayn tizimi va Landing
`tailwind.config.js` (tokenlar), `src/components/ui/*`, `src/landing/*`, `docs/DESIGN_SYSTEM.md`.

## Phase 2 — Match Simulator
- `src/utils/sofaRating.js` — Sofascore uslubidagi reyting: 6.0 bazasi, xatosiz paslar, gol/assist, seyv, kartochka;
  egri chiziq 10.0 ga asimptotik (9.0+ juda kam, 10.0 amalda yo'q).
- `src/components/LiveMatch.jsx` — 1 soniya = 1 daqiqa; gol/xavfli vaziyatda 0.3x (1 daqiqa ~ 3.3s);
  Quick Play: sokin daqiqalar bir zumda, zarba/xavfli hujum/gollar 0.3x'da.
- `src/components/match/*`, `MatchTablo.jsx`, `EventLog.jsx` — Sofascore uslubidagi kartalar (Summary/Lineups/Stats/Ratings).

## Phase 3 — Career boshlanishi
`src/career/onboarding/*` — O'yinchi yaratish (yil 2009 avtomatik), klub g'ildiragi (4 ta Decline),
rating/potential ochilishi, Negotiate modal (maosh, muddat, Key Player/Rotation), imzo animatsiyasi.

## Phase 4 — Dashboard va Admin
- `src/career/dashboard/*` — sana + 31 kunlik Timeline, Play Match -> Next Day, kun o'yinlari ro'yxati.
- `src/career/admin/*` — Players Stats (+ transferlar tarixi), Leagues/Tournaments (ligalar, CL, EL, xalqaro, simulyatsiya tarixi),
  Player Permissions (Premium, parol, Wipe Data), Skip/Pending.
- `server/continental.js` — Champions League + Europa League; `server/index.js` — admin endpointlari,
  `advance-world-day` endi `days` (1-31) qabul qiladi. Skip logikasi: real o'yinchisi bor o'yinlar `pending` bo'lib kutadi.
- `server/db.js` — MONGODB_URI bo'lmasa lokal JSON baza.

## Phase 5 — Xalqaro tanaffus, mukofotlar, optimizatsiya
- `src/career/international/calendar.js` — tanaffus haftaligi (har 70 kunda +-3 kun) va turnir oynalari;
  Timeline/DayMatches'da klub logotiplari o'rniga davlat bayroqlari; `TournamentView` terma jamoa turnirlari uchun.
- `server/awards.js` + `src/career/awards/*` — Oltin batinka, Oltin to'p (Ballon d'Or), mavsum tarkibi (4-3-3),
  mavsum tugaganda avtomatik; marosim paneli `/awards`.
- Career butunlay Clean Light (`career-light.css`), mobil layout tuzatildi, lazy loading (bosh bundle 194 -> 54 kB gzip),
  `prefers-reduced-motion` qo'llab-quvvatlanadi.
