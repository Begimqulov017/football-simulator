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

## Phase 3 — Profile Page
- `ProfilePage.jsx`: o'yinchi kartasi, tablar (Overview / Attributes / Career / Honours), radar chart, International Status
  (squad o'rni yoki "Not Called Up Yet" + minimal OVR), Trophy Cabinet (Individual / Club / Country, qulflangan holat, ochilish animatsiyasi).
- `server/careerMerge.js` + `utils/honoursSync.js`: server yozgan mukofotlar/terma jamoa ma'lumoti klient saqlashi bilan ustidan yozilmaydi.
  `/api/career/save` birlashtiradi, GameContext poll'i klientga qo'shadi. `SERVER_VERSION = 13`.

## Phase 4 — Club Page & Pitch Lineup
- `ClubPage.jsx` + `src/career/club/*`: katta taktik maydon (o'yinchi familiyasi doira ostida), maysa teksturasi, Bench paneli,
  zamonaviy squad jadvali, taktika sliderlari (Attacking/Defensive), chemistry vidjeti va klub kubogi paneli.

## Phase 5 (Dashboard) — Leagues & Tournaments Dashboard
**Sahifa:** `src/career/pages/LeaguesPage.jsx` (`/leagues?tab=leagues|cups|continental|international`) — 4 bo'lim, faol bo'lim URL'da saqlanadi.
Simulyatsiya tarixi foydalanuvchilarga ko'rinmaydi: u faqat Admin panelida (`/admin` → Ligalar/Turnirlar). Adminga sahifa tepasida o'sha yerga o'tish tugmasi bor.

| Bo'lim | Fayl | Manba |
|---|---|---|
| Ligalar | `src/career/leagues/LeaguesView.jsx` | `/api/leagues` + `/api/hub/league/:id` |
| Kuboklar | `src/career/leagues/CupsView.jsx` | `/api/hub/cups` |
| Kontinental (UCL, UEL, AFC CL) | `src/career/leagues/ContinentalView.jsx` | `/api/continental` |
| Xalqaro (World Cup, Euro, Asian Cup, Nations League, Copa, AFCON) | `src/career/leagues/InternationalView.jsx` | `/api/international` |

Umumiy komponentlar: `StatLeaders.jsx` (Top Scorers / Assists / Cards / Rating), `TrophyCabinet.jsx` (g'oliblar tarixi + eng ko'p titul), `shared.jsx`.

**Backend o'zgarishlari (SERVER_VERSION 13):**
- `server/engine.js` — `distributeMatch()` har o'yinda gol, assist, o'yinlar soni, sariq/qizil kartochka va reytingni yozadi; `buildLeaders()` peshqadamlar jadvalini quradi. Eski DB yozuvlari (faqat `goals`) buzilmaydi.
- `server/continental.js` — **AFC Champions League** (`acl`, 16 klub, 4 guruh, Osiyo ligalaridan); UCL/UEL/ACL endi "pool"lar bo'yicha tanlanadi.
- `server/international.js` — **UEFA Nations League** (toq yillarda, 16 jamoa); tarix yozuvlariga `key` qo'shildi.
- `server/index.js` — `/api/hub/league/:id`, `/api/hub/cups`; `/api/leagues` ga `region`, `division`, `leader`, `lastChampion`; `rolloverSeason` endi kubok g'olibini `world.cupHistory`ga arxivlaydi va `seasonHistory`ga eng yaxshi assistchi/reyting qo'shadi.
- Test: `node tests/test_hub_stats.js` (server/ papkasidan: `cd server && node ../tests/test_hub_stats.js`).

**Cheklovlar:** o'yin ma'lumotlarida hozircha faqat 1-divizion ligalar bor — UI `division` maydoni bo'yicha guruhlaydi, shuning uchun server quyi liga qaytarsa "2-divizion" bo'limi o'zi paydo bo'ladi. Kubok o'yinlaridagi o'yinchi statistikasi mavjud tizim bo'yicha liga statistikasiga qo'shiladi (alohida kubok statistikasi yo'q). Statistika yangi o'ynalgan o'yinlardan boshlab yig'iladi (eski o'yinlar uchun kartochka/reyting yo'q).

## Phase 6 — Dynamic Messages & Notifications
- `MessagesPage.jsx`: Coach / Club / National / System filtrlari, yulduzcha (favorite) boshqaruvi.
- `utils/messageGenerator.js` + `useProceduralMessages.js`: o'yindan keyingi hisobot, murabbiy maslahati, jamoadosh dialoglari,
  terma jamoa chaqiruvi/milestone xabarlari. `AppShell.jsx`: o'qilmagan xabarlar uchun qizil badge.

## Phase 7 — High-Precision Training Engine
- `statCalc.js`: ichki 2 xonali aniqlik (`72.12`). `round2`, `clampPrecise`, `displayRating` (>=72.50 → 73, <=72.49 → 72), `formatPrecise`, `formatDelta`;
  `calcMainStats/calcOVR/calcGoalkeeperOVR` endi `{ precise: true }` qabul qiladi. `simulateTrainingSession()` — sof (pure) funksiya: har bir tanlangan stat
  va uning ichki atributlari o'z tasodifiy ko'paytirgichini oladi, yillik OVR limiti (`yearlyOvrCap`) saqlanadi, hisobot `career.lastTraining`ga yoziladi.
- `TrainingPage.jsx`: aniq qiymatlar (72.12 OVR), kartalar ostida +0.12 chiplari, "Session breakdown" kartasi (atribut bo'yicha), silliq progress barlar,
  sanab chiquvchi (ticking) hisoblagichlar, level-up toast'lar. `utils/useAnimatedNumber.js` — yangi hook.
- Boshqa joylarda `displayRating()` bilan butun songa yaxlitlanadi (AppShell, Profile, Club, Users, PlayersTab, roster, server).
- `season.js`: keksa yoshdagi pasayish ham aniq (precise); potential endi `Math.ceil(overall)` dan pastga tushmaydi (kasr bo'lib qolmasligi uchun).

## Phase 8 — Interaktiv transfer muzokarasi
- `src/career/transfers/transferUtils.js` — toza mantiq: bozor bahosi, transfer summasi (release clause = aniq summa),
  klub qiziqishi (hot/open/monitoring/closed), 3 bosqichli holat mashinasi
  (`offer` → `counter` → `final` → `accepted | walked | rejected`). Natija DETERMINISTIK: "Club willingness"
  ko'rsatkichi va qaror bir xil formuladan chiqadi. 3-tur o'zgarmas (`submitOffer` hech narsa qilmaydi).
- `src/career/transfers/NegotiationModal.jsx` — muzokara xonasi: rol (Star/Key/Rotation/Prospect), haftalik maosh,
  muddat (1–6 yil), release clause; chat tarixi, 3 bosqichli stepper, Esc/fokus/mobil bottom-sheet.
- `src/career/pages/TransfersPage.jsx` — 4 tab: Transfer Hub (real vaqt qidiruv + liga/status/saralash), Negotiations,
  My Transfers (tarix jadvali), World Feed (avvalgi top-10/recent).
- `GameContext.jsx` — `saveNegotiation` (holat saqlanadi, modal yopilsa ham davom etadi) va
  `completeNegotiatedTransfer` (klub/liga/shartnoma, tarix, dunyo lentasi, yangilik, xabar; boshqa ligada mavsum qayta quriladi).
- `career.negotiations`, `career.contract.releaseClause`, `transferHistory` yozuvlariga `fee/role/releaseClause/turns` qo'shildi
  (eski saqlanmalar bilan mos: yangi maydonlar ixtiyoriy).
- Rad etilgan/tashlab ketilgan klub bilan 30 kun cooldown. Kiruvchi taklif (Messages) shu yerda ochiladi.
- Test: `node tests/test_transfer_negotiation.js` (10 ta tekshiruv).

## Phase 9 — National Team Hub, Global Chat, Global Awards
- `NationalTeamPage.jsx` + `PitchView.jsx`: boshlang'ich 11 + zaxira, fixtures, chaqiruv shartlari (`/api/international/hub/:country`).
- `server/chat.js` + `ChatPage.jsx` + `useChatUnread.js`: umumiy chat (@teglar, spam limiti, pin, nav'da o'qilmagan badge).
- `server/globalAwards.js` + `AwardsPage.jsx`: barcha ligalar bo'yicha Global Ballon d'Or / Golden Boot / Team of the Season.
  Yutuqlar `career.awards` ga `type: global_*`, `league: 'Global'` bilan yoziladi (Profile > Honours'da ko'rinadi).

## Phase 10 — Admin Panel & Unified Engine
- `server/adminTools.js` + `server/roles.js`: rollar (user < moderator < admin), mute/suspend, Master Calendar (qo'lda +X kun va
  avto-simulyatsiya BITTA `advanceDays` orqali), qo'lda fixture, jamoa tarkibi tahriri, majburiy yangilik, foydalanuvchilar jadvali.
- `src/career/admin/*`: AdminDashboard (admin: hamma tablar; moderator: faqat chat moderatsiyasi).
- State consistency: admin karyerani tahrirlasa server `adminEdit.rev` yozadi; klient `ackRev` yuboradi, eskirgan bo'lsa
  `/api/career/save` rad etadi va patch'ni qaytaradi (GameContext qo'llaydi).

## Phase 9 + 10 birlashtirish
- Ikkala phase ham o'z chatini yozgan edi. Endi BITTA chat: engine = Phase 9 `server/chat.js`; moderatsiya (`/api/mod/chat/:id/pin|DELETE`,
  `/api/mod/users/:username/mute`, audit) = Phase 10, admin VA moderator uchun. Mute qilingan foydalanuvchi `POST /api/chat` da 403 `code: muted`.
- `SERVER_VERSION` va `REQUIRED_SERVER_VERSION` = 14.
- `tests/test_phase9_10_integration.js`: haqiqiy server kodi bilan 37 ta tekshiruv (rollar, chat, mute, admin-edit, auto-sim, hub...).

## Tuzatish: karyera "yo'qolib qolish" va boshlang'ich reyting
- Muammo: admin akkaunt "Wipe Data" qilingach (server `adminEdit` yozadi), yangi yaratilgan karyera saqlashda `conflict` deb rad etilar,
  klient uni qayta yubormas va 20 soniyalik poll "serverda karyera yo'q" deb ism-familya formasiga qaytarar edi.
- `/api/career/save`: wipe'dan KEYIN yaratilgan (`createdAt` > `adminEdit.at`) karyera qabul qilinadi; eskirgan nusxa hamon rad etiladi.
- `GameContext`: serverga hali saqlanmagan karyerani poll o'chirmaydi; wipe konfliktida eski karyera qaytarib yozilmaydi.
- `playerGen.js`: boshlang'ich reyting 67–73 (min 67), potential 80–90 (min 80, hech qachon reytingdan past emas).

## Phase 11 — Yagona simulatsiya (server = yagona haqiqat)
- Muammo: ikkita alohida simulyatsiya bor edi (klient `season.js` + `PlayMatchPage`, va server umumiy dunyosi). Natijalar, jadval,
  top butsilar, kubok bir-biriga mos kelmasdi; o'yin "Kick-off..." sahifasida emas, asl simulyatorda (`LiveMatch`) o'ynalishi kerak edi.
- Endi liga/kubok natijalari FAQAT serverda. Klient `GET /api/career/league-state` orqali jadval, natijalar, butsilar va kubok yo'lini
  oladi (`applyWorldState`); lokal liga/kubok simulyatsiyasi OLIB TASHLANDI, `PlayMatchPage`/`LiveResultPage` o'chirildi
  (`/play-match` -> `/world-match`, `/live-result` -> `/home`).
- O'yin o'z kunida: kutilayotgan (pending) o'yin sanasi bilan keladi; o'yinchi shu kunga yetib kelib `LiveMatch`da o'ynaydi
  (`recordPlayedMatch` shaxsiy statistikani yozadi). Admin kunni o'tkazganda o'yin o'ynalmay kutadi.
- "Siz adminga yetib oldingiz": o'yinchi dunyo sanasidan keyingi kunga o'ta olmaydi ("Adminni kuting").
- 15 kunlik avtomatik hal qilish OLIB TASHLANDI. Mavsumning oxirgi turini admin o'tkaza olmaydi, agar o'yinchi o'z o'yinini o'ynamagan
  bo'lsa; faqat admin panelidagi aniq "Skip" (`POST /api/admin/pending/skip`) o'yinni qo'lda hal qiladi.
- Mavsum serverda tugagach klient o'z mavsumini yopadi (`closeSeasonFromHistory`): kubok, Oltin batinka, tarix. Server tarixga
  yakuniy jadval va butsilarni yozadi.
- Transfer hub: faqat sizga TAKLIF yuborgan (yoki muzokarasi davom etayotgan) klublar ko'rinadi.
- `SERVER_VERSION`/`REQUIRED_SERVER_VERSION` o'zgarmadi (14).

