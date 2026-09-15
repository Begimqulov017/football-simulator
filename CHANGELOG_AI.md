# Mini Futbol Simulyatori — YANGILANISH JURNALI (2026-09-12)

Bu fayl avvalgi `AI_CONTEXT.md` (yoki shunga o'xshash) faylga QO'SHIMCHA —
o'sha fayldagi hamma narsa (arxitektura, deploy, auth tizimi) hali ham TO'G'RI
va o'zgarmagan. Bu safar qilingan ishlar quyida.

## 1. Football Career Online — ikkinchi loyiha shu yerga qo'shildi

Alohida `football-career` React loyihasi endi mustaqil emas — u
`src/career/` papkasi ichiga ko'chirilib, asosiy ilovaning **Pro Simulator**
bo'limi o'rniga **"Football Career Online"** nomi bilan ishga tushadi.

```
src/career/
├── CareerApp.jsx        ← eski football-career/src/App.jsx (HashRouter shu yerda)
├── components/          ← AppShell, NotStarted va h.k.
├── context/
│   ├── GameContext.jsx  ← o'zgartirildi: endi username bo'yicha va serverga sinxronlanadi
│   └── ExitContext.jsx  ← YANGI: "Menyuga qaytish" tugmasi va currentUser'ni pastga uzatish uchun
├── data/                ← teamsData, clubRosterStore va h.k. (o'zgarishsiz)
├── pages/
│   ├── ...               (mavjud sahifalar)
│   ├── UsersPage.jsx     ← YANGI: barcha premium o'yinchilarning klub statistikasi
│   └── AdminPage.jsx     ← YANGI: admin uchun /admin sahifasi (AppShell ichida)
├── utils/
│   ├── ...
│   └── careerApi.js      ← YANGI: /api/career/* bilan gaplashadi
└── career.css            ← eski src/index.css, LEKIN barcha selektorlar
                             `.career-app` ostiga ko'chirilgan (pastga qarang)
```

`src/pages/ProSimulatorPage.jsx` **o'chirildi**, o'rniga
`src/pages/FootballCareerOnline.jsx` qo'shildi:
- `currentUser.canAccessPro` bo'lsa → to'liq `<CareerApp />` ochiladi.
- bo'lmasa → eski "Premium talab qilinadi" ekrani (+ admin bo'lsa Admin panel).

`App.jsx`da ekran nomi `'pro'` dan `'career'`ga o'zgartirildi (funksional farq
yo'q, faqat nomi aniqroq).

### Nega CSS to'qnashmadi?
Ikkala loyihada ham `.app-shell`, `.sidebar` kabi BIR XIL klass nomlari bor
edi (ikkalasi ham o'z sidebar-layoutiga ega). Shuning uchun **butun
`career.css`dagi barcha selektorlar** (`:root`, `body`, umumiy reset'lardan
tashqari) `.career-app ` prefiksi bilan qayta yozildi, va `CareerApp.jsx`
o'zining butun daraxtini `<div className="career-app">` bilan o'raydi. Agar
kelajakda career.css'ga yangi klass qo'shsangiz — uni albatta
`.career-app .sizning-klassingiz { ... }` shaklida yozing, aks holda u global
bo'lib, asosiy simulyatorning dizaynini buzishi mumkin.

## 2. Karyera saqlanmasi endi SERVERDA HAM turadi

Avval `football-career` faqat `localStorage`ga saqlanardi (bitta
brauzer/qurilma bilan cheklangan). Endi:

- `server/db.js`dagi har bir user obyektida `careerSave` (to'liq futbolchi
  obyekti) va `careerSavedAt` maydonlari bor.
- Yangi endpointlar (`server/index.js`):
  - `POST /api/career/save` — joriy foydalanuvchi o'z saqlanmasini yozadi.
  - `GET /api/career/mine` — boshqa qurilmadan kirganda saqlanmani tortib
    olish uchun.
  - `GET /api/career/users` — **faqat premium yoki admin** — barcha
    o'yinchilarning ochiq statistikasi (parol/token'siz).
- Frontend (`src/career/context/GameContext.jsx`): sahifa ochilganda avval
  serverdan so'raydi, topmasa shu qurilmadagi localStorage'ga qaytadi; har bir
  o'zgarishda 1.2 soniyalik kechikish bilan (debounce) serverga ham yozadi.
  localStorage HAMON asosiy/tezkor manba — server faqat orqa fonda sinxronlab
  turadi, shuning uchun internet vaqtincha uzilsa ham o'yin to'xtamaydi.

**MUHIM:** `localStorage` kaliti endi `fpcs_save_v1__<username>` (avval
shunchaki `fpcs_save_v1` edi) — chunki endi bir nechta do'st bitta qurilmada
turli hisoblar bilan kirishi mumkin.

## 3. "Users" bo'limi (Football Career Online ichida)

Yangi `/users` sahifasi (`src/career/pages/UsersPage.jsx`) — sidebar'da
"Users" tugmasi orqali ochiladi. `GET /api/career/users`dan olingan
ma'lumotni chiqaradi: username, klub (nomi + bayrog'i + ligasi), reyting
(OVR), o'yinlar/gol/assist/balans, va yutgan kubaklar. Bu sahifa faqat
`canAccessPro` (yoki admin) bo'lgan foydalanuvchilarga ochiq — chunki server
ham xuddi shu tekshiruvni qiladi (403 qaytaradi), frontend esa xatoni chiroyli
ko'rsatadi.

## 4. Admin panelga: parollar + o'chirish (tasdiqlash bilan)

`src/components/AdminPanel.jsx` (umumiy komponent, ikki joyda ishlatiladi:
`FootballCareerOnline.jsx`da — premium bo'lmagan admin uchun — va
`career/pages/AdminPage.jsx`da — premium admin `/admin` sahifasida):

- Har bir foydalanuvchi qatorida parol ko'rsatiladi (standart holatda
  `••••••••` bilan yashiringan, "Parollarni ko'rsatish" tugmasi bosilganda
  ochiq matnda chiqadi).
- Har bir (admin bo'lmagan) foydalanuvchi yonida 🗑 tugma bor. Bosilganda
  darhol o'chirilmaydi — o'sha qator ichida **"Ha / Yo'q"** tasdiqlash bloki
  chiqadi. "Ha, o'chirish" bosilsagina `DELETE /api/users/:username`
  chaqiriladi (bu akkaunt, sessiyalari, va karyera saqlanmasini butunlay
  o'chiradi). Server tomonida ham admin akkauntni o'chirishga qarshi himoya
  bor.
- Parollar `server/db.js`da endi **ikki xil** saqlanadi: `passwordHash`
  (login tekshiruvi uchun, bcrypt bilan) va `password` (ochiq matn, FAQAT
  admin paneli buni ko'rsatishi uchun). Bu oddiy xavfsizlik amaliyotiga
  qarshi (parollar odatda ochiq saqlanmaydi) — lekin loyiha egasi buni ongli
  ravishda so'ragan (yopiq, ~9 nafar do'st doirasidagi shaxsiy loyiha uchun).
  Agar kelajakda bu loyihani kengroq auditoriyaga ochsangiz — bu qismni olib
  tashlashni ko'rib chiqing.

## 5. Dizayn tuzatishlari

- **Muammo edi:** ba'zi kirish/chiqish (⬅, 🚪) tugmalari hech qanday CSS'siz,
  xom emoji sifatida chizilar edi (`.sidebar-back-btn` uchun umuman uslub yo'q
  edi) — shuning uchun "chizilgan" ko'rinardi.
  **Yechim:** `src/components/Icon.jsx` — barqaror, rangli, chizilmagan SVG
  ikonkalar to'plami yaratildi (orqaga, kirish, chiqish, foydalanuvchi,
  qalqon, kubok va h.k.) va Login/Register/StartPage/Home/AppShell/Admin
  panelidagi barcha navigatsiya ikonkalari shularga almashtirildi.
  `.sidebar-back-btn`ga ham to'liq CSS qo'shildi.
- **Muammo edi:** ikkita loyihaning rang palitralari bir xil emas edi
  (`football-career`da `#00ff87` yashil / `#ffd700` oltin, simulyatorda esa
  Tailwind `green-500` / `amber-500`). **Yechim:** career.css'dagi
  `--accent-green`, `--accent-gold`, `--accent-red`, `--bg-base` o'zgaruvchilari
  simulyatorning Tailwind ranglariga (`#22c55e`, `#f59e0b`, `#ef4444`,
  `slate-900`) moslashtirildi — endi ikkala bo'lim ham bir xil "his"da.

## 6. Yangi/o'zgargan fayllar ro'yxati (tezkor ko'rinish)

- `server/db.js` — o'zgarmadi (struktura o'zgarishlari faqat `index.js`da).
- `server/index.js` — parol (ochiq matn), `/api/career/*`, `DELETE
  /api/users/:username`, `adminUserView`, `careerSummary` qo'shildi.
- `src/utils/auth/apiAdapter.js`, `index.js` — `deleteUser` qo'shildi.
- `src/pages/StartPage.jsx` — qayta yozildi (Football Career Online nomi,
  SVG ikonkalar).
- `src/pages/LoginPage.jsx`, `RegisterPage.jsx` — orqaga tugmasi SVG bo'ldi.
- `src/pages/Home.jsx` — orqaga tugmasi SVG bo'ldi, CSS qo'shildi.
- `src/pages/ProSimulatorPage.jsx` → **o'chirildi**, o'rniga
  `src/pages/FootballCareerOnline.jsx`.
- `src/components/Icon.jsx`, `src/components/AdminPanel.jsx` — YANGI.
- `src/career/**` — YANGI (football-career'dan ko'chirilgan + moslashtirilgan).
- `src/index.js` — `career.css` import qilindi.
- `package.json` — `react-router-dom` qo'shildi.
- `.gitignore` — `/server/node_modules`, `/server/data` qo'shildi.

## 7. Deploy — o'zgarish yo'q

Deploy jarayoni **aynan avvalgidek**: Netlify (frontend, `npm run build` →
`build/`) va Render (backend, `server/` papkasi, `npm start`). Yangi
environment variable talab qilinmaydi. Backend qayta deploy qilinganda eski
`server/data/db.json` saqlanib qoladi (Render diskida), shuning uchun mavjud
foydalanuvchilar va ularning parollari/karyeralari yo'qolmaydi — faqat yangi
maydonlar (`password`, `careerSave`) birinchi so'rovda avtomatik
to'ldiriladi/ishlatiladi.

---

# YANGILANISH #2 (2026-09-12, ikkinchi tur)

## 1. Users ro'yxati ("network" xatosi)
`careerApi.js`dagi xato xabari aniqlashtirildi — endi "backend hali yangilanmagan bo'lishi mumkin" kabi tushunarli xabar chiqadi, va "Qayta urinish" tugmasi qo'shildi. **Agar hali ham ishlamasa — buning asosiy sababi backend (`server/`)ning eng so'nggi kod bilan Render'da qayta deploy qilinmaganidir.** Frontend va backend fayllarining IKKALASINI HAM almashtirib, push qilganingizga ishonch hosil qiling.

## 2. Training balansi
`statCalc.js`: potentsialga yaqinlashgan sari o'sish tezligi ancha keskinroq
pasayadigan qilindi (avvalgidan taxminan 2 baravar sekinroq), va bazaviy
gain qiymatlari (`HIGH_RISK/BALANCED/LIGHT`) ham kamaytirildi. Endi
potentsialning oxirgi bir nechta ballari uchun sezilarli ko'proq mashq/vaqt
kerak bo'ladi.

## 3. Squad formatsiyasi tuzatildi (LW → GK bug)
`ClubPage.jsx`: avval "SQUAD" bo'limi 11 nafarni FAQAT OVR bo'yicha
saralab, oxirgi (eng past OVR'li) o'yinchini pastki (vizual jihatdan
"GK") katakka qo'yardi — real pozitsiyasidan qat'i nazar. Endi haqiqiy
pozitsiya guruhlariga (ATT/MID/DEF/GK) qarab joylashtiradi: hujumchilar
tepada, GK pastda — pozitsiyangiz qanday bo'lsa, katakda ham shu ko'rinadi.

## 4. Messages: klub qiziqishi + jamoadosh xabarlari
`season.js`ga ikkita yangi xabar turi qo'shildi:
- `scout` — boshqa klublar sizni "kuzatib turgani" haqida yumshoqroq,
  taklifsiz xabar (haqiqiy transfer taklifidan ko'ra tez-tez keladi).
- `teammate` — jamoadoshingizdan tasodifiy xabar (yutuqdan keyin tabrik,
  mag'lubiyatdan keyin dalda).
Ikkalasi ham endi nafaqat o'yin kunlarida, balki "tinch" kunlarda ham (kichik
ehtimollik bilan) kelishi mumkin — pochta doim jonli turadi.

## 5. "Play Match" — jonli o'ynash rejimi (YANGI, eng katta o'zgarish)
Endi o'yin kuni kelganda **"Next Day"** tugmasi **"▶ Play vs [raqib]"**ga
almashadi (Home sahifasida) va Games (Matchday) sahifasida ham tegishli
fikstura yonida "▶ Play" tugmasi chiqadi. Bosilganda yangi `/play-match`
sahifasi ochiladi:
- Natija ALLAQACHON hisoblab qo'yilgan (adolatli, o'zgarmas) — lekin daqiqama-daqiqa jonli "efirga uzatiladi": hisob soat kabi yuguradi, gol daqiqalari tasodifiy tartibda ko'rsatiladi, sizning gollaringiz/assistlaringiz alohida belgilanadi.
- Faqat tezlik tugmalari bor (1x/2x/4x) — **"tugatish" yoki "o'tkazib yuborish" tugmasi yo'q**, siz so'ragandek.
- To'liq vaqt tugagach: reyting, gol, assist ko'rsatiladi, va agar reyting 8.3+ bo'lsa **"⭐ MAN OF THE MATCH"** belgisi chiqadi.
- "Continue" bosilgandagina natija saqlanmaga yoziladi (server + localStorage).

Buning uchun `season.js`dagi `advanceOneDay` funksiyasi `prepareNextDay`ga
ajratildi (natija hisoblanadi, lekin darhol qo'llanilmaydi — playback
tugagach `commitMatchday()` orqali qo'llaniladi). Tasodifiy natija faqat
BIR MARTA hisoblanadi (playback ko'rsatilgani bilan bir xil natija saqlanadi).

## 6. All Stats sahifasi to'ldirildi
Avval butunlay bo'sh ("Coming Soon") edi. Endi: umumiy statistika
(o'yinlar/gol/assist/o'rtacha reyting/eng yaxshi reyting/MOTM soni/gol va
assist-per-game/trofeylar), jamoaviy natija (g'alaba/durang/mag'lubiyat), so'nggi
formalar ro'yxati, va to'liq o'yin tarixi jadvali (`matchHistory` — har bir
o'ynalgan o'yin serverga ham saqlanadi, oxirgi 40 tasi saqlanadi).

## Ehtiyot bo'lish kerak bo'lgan narsa
Bu safar HAM faqat `src/career/utils/statCalc.js` va `src/career/utils/season.js`
emas — `src/career/pages/` ichidagi bir nechta sahifa (`HomePage.jsx`,
`GamesPage.jsx`, `ClubPage.jsx`, `AllStatsPage.jsx`, `MessagesPage.jsx`),
`src/career/context/GameContext.jsx`, va yangi `src/career/pages/PlayMatchPage.jsx`
fayli ham o'zgargan/qo'shilgan. **Butun `src` papkasini almashtirish eng
ishonchli yo'l** — faqat bitta faylni qo'lda ko'chirish xatoga olib kelishi
mumkin.

---

# YANGILANISH #3 (2026-09-12, uchinchi tur) — BUG'LAR + BACKEND VERSIYA TEKSHIRUVI

## MUHIM: Ko'p bug'larning ASOSIY SABABI topildi
Users ro'yxati ishlamasligi, admin panelida parollar ko'rinmasligi, va boshqa
qurilmada karyera qayta so'ralishi — bularning aksariyati **BITTA SABABGA**
bog'liq edi: **backend (`server/index.js`) hali Render'da eski versiyada
turgan edi**, ya'ni 1-turdagi (`/api/career/*`, parol maydoni, `DELETE
/api/users/:username`) o'zgarishlar hali qayta deploy qilinmagan edi.

Buni endi FAQAT taxmin qilish shart emas — `server/index.js`ga versiya raqami
(`SERVER_VERSION = 3`) qo'shildi, `/api/meta`da qaytariladi. Frontend endi:
- **Users sahifasi**: agar backend eski bo'lsa, aniq "Backend v{X} da, kerak
  v{Y} — Render'da qayta deploy qiling" xabarini chiqaradi (avvalgi noaniq
  "network" xatosi o'rniga).
- **Admin panel**: agar biror foydalanuvchining paroli bo'sh kelsa (eski
  backend belgisi), tepada aniq ogohlantirish banneri chiqadi.

**Amaliy xulosa: bu safar HAM backend fayli (`server/index.js`) o'zgargan —
uni albatta almashtirib, qayta push qiling, aks holda yuqoridagilar hech biri
tuzalmaydi.**

## 1. Login/Register → beixtiyor Football Career Online'ga tashlab yuborish
`App.jsx`dagi asosiy sabab: `handleAuthSuccess` har doim `setScreen('career')`
qilar edi — hatto oddiy bosh sahifadagi "Login"/"Register" tugmasidan
kirilganda ham. Endi faqat "Football Career Online" tugmasi orqali (kirish
talab qilingani uchun) login qilingandagina shu yerga qaytariladi; oddiy
login/register doim bosh sahifaga qaytadi. Bu "karyeraga kirib ism-familiya
so'rab qolishi" muammosining aksariyat holatlarini ham hal qiladi (chunki bu
avval, login qilingan zahoti, hali karyerasi bo'lmagan foydalanuvchini
"ism-familiya kiriting" ekraniga tashlab yuborar edi).

## 2. "Yuklanmoqda..." da abadiy qotib qolish (Play Match)
`PlayMatchPage.jsx`ga himoya qo'shildi: agar o'yin tayyorlashda xatolik
yuz bersa (try/catch) YOKI 6 soniyadan ko'p hech narsa hal bo'lmasa, aniq
xato xabari va "Bosh sahifaga qaytish" tugmasi chiqadi — abadiy spinner
o'rniga.

## 3. Training tezligi — YANGI, ancha real yondashuv
Avvalgi "ozgina sekinlashtirish" yetarli emas edi. Endi **yillik OVR o'sish
chegarasi** qo'shildi (`yearlyOvrCap` — yoshga qarab): 20 yoshgacha yiliga
maks +3.4, 21-23 +2.2, 24-27 +1.1, 28-30 +0.5, 31+ +0.15. Test natijalari:
- 15 ballik farq (masalan 65→80): potentialga ~21 yoshda yetadi
- 25 ballik farq (60→85): ~28 yoshda yetadi
- 30 ballik farq (58→88, super-talant): ~33 yoshda yetadi

Bu aynan siz so'ragan "27-30 yoki 33 yoshgacha" me'yoriga mos.

## 4. Yosh UMUMAN oshmasligi (yangi topilgan bug)
Test paytida aniqlandi: `season.js`da yosh hech qachon avtomatik oshmas edi
— player abadiy 17 yoshda qolardi! Endi har 365 kunda "tug'ilgan kun"
xabari bilan yosh oshadi va yillik o'sish limiti ham shu kuni qayta
tiklanadi.

## 5. OVR ko'tarilsa ham asosiy tarkibga chiqmaslik
Sabab: `player.club.tier` ("starter"/"bench") FAQAT klubga qo'shilgan kuni
bir marta hisoblanar, keyin hech qachon qayta tekshirilmas edi. Endi HAR BIR
o'yin oldidan (`recomputeTier`) joriy OVR asosida qayta hisoblanadi — agar
loyiq bo'lsangiz "Siz endi asosiy tarkibdasiz!" xabari keladi (yoki aksincha,
zaxiraga tushib qolsangiz ham xabar beriladi).

## 6. Club sahifasida eski OVR ko'rinishi
Squad panelidagi va zaxiradagi o'z yozuvingiz endi doim jonli (real vaqtdagi)
OVR/pozitsiya/ism bilan ko'rsatiladi — umumiy "roster" ma'lumoti orqada
qolib ketgan bo'lsa ham.

## O'zgargan fayllar (bu safar)
`src/App.jsx`, `src/career/pages/{StartPage,TrainingPage,HomePage,GamesPage,ClubPage}.jsx`,
`src/career/pages/PlayMatchPage.jsx`, `src/career/pages/UsersPage.jsx`,
`src/career/context/GameContext.jsx`, `src/career/data/clubRosterStore.js`,
`src/career/utils/{season,statCalc}.js`, `src/components/AdminPanel.jsx`,
`server/index.js` (versiya raqami qo'shildi). **Bu safar HAM `src` VA
`server` ikkalasini ham almashtirib, ikkalasini ham push qiling.**

---

# YANGILANISH #4 (2026-09-13) — MAVSUM TIZIMI, TROFEYLAR, YANGILIKLAR, TRANSFERLAR

## 🐛 Ikkita JUDA MUHIM bug topildi va tuzatildi (test qilib aniqlandi)
1. **1-Round hech qachon o'ynalmas edi.** `career.gameDate` boshlang'ich qiymati
   jadvaldagi 1-o'yin sanasi bilan BIR XIL edi (`2026-08-01`), lekin kun
   almashtirish har doim "ertangi kun"ni tekshiradi — shuning uchun 1-tur
   abadiy o'tkazib yuborilardi. Endi boshlang'ich sana bir kun oldinga
   (`2026-07-31`) qo'yildi.
2. **Mavsum tugagandan keyin YANGI mavsum bir yil KECH boshlanardi.** Bunga
   o'xshash off-by-one xatolik tufayli. Ikkalasi ham test orqali topilib
   tuzatildi — endi mavsumlar ketma-ket, to'g'ri yillarda davom etadi.

## 1. Mavsum uzunligi — liga hajmiga qarab muvozanatlangan
Kichik ligalar (3-6 jamoa) endi bitta oddiy davra bo'ylab o'ynab tezda
tugamaydi — ular yetarlicha ko'p marta bir-biri bilan uchrashib, katta
ligalar (18-20 jamoa) bilan TAXMINAN bir xil mavsum uzunligiga (~250-280
kun, avgustdan apr/mayga qadar) yetkaziladi.

## 2. Mavsum tugashi va yangisi — CHEKSIZ davom etadi
Barcha o'yinlar o'ynalgach: chempion aniqlanadi, Oltin Top (eng ko'p gol
urgan) e'lon qilinadi, agar SIZ chempion yoki Oltin Top bo'lsangiz — trofey
va tabrik xabari keladi. Keyin DARHOL yangi mavsum boshlanadi (yangi jadval,
0 dan turnir jadvali) — pul, umrbod statistika, va trofeylar saqlanib qoladi.

## 3. Trofeylar — Profile va Club sahifalarida
Ikkalasida ham hozirgacha yutgan barcha trofeylar (chempionlik, Oltin Top)
ro'yxati ko'rinadi.

## 4. All Stats — endi yil-ma-yil statistika bilan
"SEASON BY SEASON" bo'limi qo'shildi: har bir tugagan mavsum uchun yil,
liga, o'rin, o'yinlar/gol/assist, va agar chempion/Oltin Top bo'lsangiz shu
ham ko'rinadi.

## 5. League sahifasi — endi har bir turni ko'rish mumkin
Standart jadvaldan tashqari, "ROUND RESULTS" bo'limi qo'shildi — Prev/Next
tugmalari bilan istalgan o'ynalgan turdagi BARCHA (nafaqat sizniki)
o'yinlarning natijasini ko'rish mumkin.

## 6. News (Yangiliklar) — YANGI sahifa
Ligangizdagi katta hisoblar (6+ gol), bir tomonlama g'alabalar, kutilmagan
natijalar (kuchsiz jamoa kuchlisini yutishi), sizning MVP o'yinlaringiz,
ketma-ket g'alaba seriyalari, va trofeylaringiz — barchasi yangiliklar
lentasida avtomatik chiqadi.

## 7. Transfers — endi to'liq ishlaydi
Dunyo bo'ylab (barcha ligalardagi) transferlar avtomatik generatsiya qilinadi
(narx o'yinchi reytingi+yoshiga qarab hisoblanadi). Sahifada: eng katta 10
transfer, so'nggi transferlar, va umumiy transfer hajmi ($) ko'rsatiladi.
**Eslatma:** bu hozircha faqat "yangiliklar tasmasi" — real jamoalar
tarkibini o'zgartirmaydi (bu alohida, ancha murakkab keyingi bosqich).

## Hali qilinmagan (keyingi bosqich uchun)
- Kuboklar (mamlakat kubogi, Champions League) — bracket tizimi kerak.
- Chindan HAM barcha foydalanuvchilar bitta ligada, admin butun dunyo
  kalendarini boshqarishi — bu serverning butunlay qayta qurilishini talab
  qiladi (hozir har bir user o'zining shaxsiy ligasida o'ynaydi).
- Yil oxiri sovrinlar marosimi (alohida "kun" belgilanishi bilan).

## O'zgargan/qo'shilgan fayllar
`src/career/utils/season.js` (juda ko'p qo'shimcha), `src/career/pages/{ProfilePage,ClubPage,AllStatsPage,LeaguePage,TransfersPage,StartPage}.jsx`,
`src/career/pages/NewsPage.jsx` (yangi), `src/career/CareerApp.jsx`,
`src/career/components/AppShell.jsx`, `src/components/Icon.jsx`.
**Backend (`server/`) BU SAFAR O'ZGARMADI** — faqat `src`ni almashtirsangiz
yetarli.

---

# YANGILANISH #5 (2026-09-13) — KUBOKLAR + HAQIQIY UMUMIY KLUB TARKIBI

## ⚠️ BU SAFAR BACKEND (server/) HAM O'ZGARDI — ikkalasini ham almashtiring va push qiling!
Server versiyasi 3 → **4** ga oshdi (yangi endpoint qo'shildi).

## 1. Kuboklar — Domestic Cup + Champions League/Europa League/AFC Champions League
Har bir mavsum boshida avtomatik ravishda:
- **Mamlakat kubogi** (masalan "England Cup", "Spain Cup") — o'z ligangizdagi
  boshqa klublar bilan bir martalik (single-leg) plей-off, 4 bosqich
  (Round of 16 → Final).
- **Kontinental kubok** — agar o'tgan mavsun ligada YUQORI o'rinlarda
  yakunlagan bo'lsangiz (1-2 o'rin → Champions League, 3-4 o'rin → Europa
  League — faqat Yevropa ligalarida; Osiyo ligalarida 1-2 o'rin → AFC
  Champions League), keyingi mavsumda avtomatik ishtirok etasiz.
- G'olib bo'lsangiz — trofey (Profile/Club sahifasida ko'rinadi), yangiliklar
  tasmasida ("News") ham chiqadi.
- Kubok o'yinlari liga kunlari bilan **hech qachon to'qnashmaydi** (avtomatik
  bo'sh sana tanlanadi) va Home/Games sahifasidagi "▶ Play" tugmasi orqali
  xuddi liga o'yinlaridek o'ynaladi.
- Bularning barchasi maxsus test skripti bilan (soxta 900+ kunlik karyera
  simulyatsiya qilib) tekshirilgan — kubok yutish, chiqib qolish, kontinental
  malaka olish hammasi to'g'ri ishlaydi.

## 2. Serverda HAQIQIY ulashiladigan klub tarkibi (multiplayer qadam)
Yangi endpoint: `GET /api/career/club-roster/:clubId`. Endi agar sizning
do'stingiz (boshqa qurilma yoki brauzerdan, xuddi shu saytga kirib) xuddi
shu klubni tanlagan bo'lsa — Club sahifangizda ular **HAQIQATAN** (localStorage
emas, markazlashgan serverdan) ko'rinadi: ismi, pozitsiyasi, reytingi, asosiy
tarkibdami-yo'qmi. Test qilib tekshirdim: ikkita alohida akkaunt bir xil
klubni tanlaganda, ikkalasi ham bir-birini to'g'ri ko'radi.

**Bu — sizning "hammasi bitta serverda, cityda bo'lishimiz mumkin" so'rovingizga
javob.** To'liq tushuntirish: bu ALOHIDA o'yin emas, lekin bu hali "hamma
bitta ligada bir xil kunda, admin butun dunyoni boshqaradi" degani ham emas —
har kim hali o'z shaxsiy kalendarida o'ynaydi, lekin klub tarkibi endi
umumiy/real. To'liq umumiy liga/kalendar — bu alohida, ancha katta va
xavfli qayta qurishni talab qiladigan keyingi bosqich (agar xohlasangiz).

## O'zgargan fayllar
`server/index.js` (yangi endpoint + versiya 4), `src/career/utils/careerApi.js`,
`src/career/utils/season.js` (juda ko'p — kuboklar), `src/career/pages/{StartPage,GamesPage,HomePage,ClubPage,ProfilePage}.jsx`.

---

# YANGILANISH #6 (2026-09-14) — 1-BOSQICH: UMUMIY DUNYO (SHARED WORLD) — ADMIN BOSHQARADIGAN KALENDAR

## ⚠️ BU ENG KATTA O'ZGARISH. Backend versiyasi 4 → 5.

## Nima qilindi
Bu — siz so'ragan "hammasi bitta serverda, admin kunni o'tkazadi, real userlar
bir-biriga duch kelishi mumkin" g'oyasining **1-bosqichi** (asos qismi):

1. **`server/engine.js`** (yangi) — mavjud `season.js` mantig'ining serverga
   ko'chirilgan (portlangan) versiyasi: jamoa kuchi, o'yin natijasi, o'yinchi
   shaxsiy statistikasi, jadval tuzish, standings yangilash.
2. **`server/gamedata/`** (yangi) — barcha 172 klub va 21 liga ma'lumoti
   (`teamsData.js`, `leaguesData.js`) serverga ko'chirildi.
3. **`GET /api/world/:leagueId`** — istalgan foydalanuvchi ligadagi umumiy
   jadval/turnir jadvalini ko'rishi mumkin.
4. **`POST /api/admin/advance-world-day`** — FAQAT ADMIN. Bosilganda:
   - Kamida bitta faol (foydalanuvchisi bor) HAR BIR liga uchun umumiy
     kalendar 1 kunga siljiydi.
   - O'sha kunga to'g'ri keladigan barcha o'yinlar hal qilinadi (jamoa
     kuchiga qarab).
   - Agar biror o'yinda REAL foydalanuvchi(lar) qatnashsa (o'z klubi shu
     o'yinda bo'lsa) — ularning shaxsiy statistikasi (gol/assist/reyting)
     avtomatik hisoblab, career saqlanmasiga yoziladi.
   - **Bir xil klubdagi ikkita do'st ham, ikki xil (raqib) klubdagi ikkita
     do'st ham — bittasi o'yinda ikkalasi ham qatnashadi.** Bu real test
     bilan tasdiqlangan: "Manchester City 2-1 Liverpool FC" o'yinida 4 ta
     real foydalanuvchi (2 tasi har tomonda) birga qatnashdi.
5. Admin panelida yangi **"🌍 Kunni o'tkazish (hammaga)"** tugmasi — bosilganda
   necha liga, necha o'yin hal qilingani va har birining natijasi ko'rinadi.

## 🐛 Ikkita JIDDIY bug topildi va tuzatildi (real test orqali)
1. **`db.js`ning kritik xatosi**: server ma'lumot o'qiganda faqat
   `users`/`sessions`ni saqlab, YANGI `leagueWorlds` maydonini har safar
   **jimgina o'chirib tashlar edi** — shuning uchun admin "kunni o'tkazsa"
   ham, dunyo hech qachon 1-kundan oldinga siljimasdi. Tuzatildi.
2. **Race condition (poyga holati)**: tez-tez so'rov kelganda (masalan bir
   nechta admin/foydalanuvchi bir vaqtda harakat qilsa), ma'lumotlar
   bir-birini "yeb qo'yishi" (session yo'qolishi, dunyo orqaga qaytishi)
   mumkin edi. Butun so'rov jarayonini ketma-ket qayta ishlaydigan qulf
   (lock) mexanizmi qo'shildi — 40 marta bir zumda ketma-ket so'rov yuborib
   stress-test qilindi, barchasi to'g'ri ishladi.

## MUHIM: Bu hali frontend bilan TO'LIQ ulanmagan
Backend (server) to'liq ishlaydi va test qilingan. Lekin hozircha:
- Frontend (o'yinchi tomoni) hali BU YANGI umumiy dunyoni ko'rsatmaydi —
  har bir user hamon o'zining ESKI, shaxsiy simulyatsiyasida o'ynaydi
  (avvalgi "Play Match", "Next Day" va h.k. hammasi eskicha ishlayapti).
- Bu ataylab qilingan: avval ASOSNI (backend, admin nazorati, ikki real
  user bitta o'yinda uchrashishi) mustahkam va xatosiz qilib qurish kerak
  edi — bu tayyor va sinovdan o'tgan. Keyingi safar frontendni shu yangi
  tizimga ulaymiz (Home sahifasi "Next Day" o'rniga umumiy dunyo sanasini
  ko'rsatadi, o'z natijangizni ko'rish uchun interfeys va h.k.)

## O'zgargan/qo'shilgan fayllar
`server/engine.js` (yangi), `server/gamedata/` (yangi), `server/db.js`
(kritik bug tuzatildi), `server/index.js` (yangi endpointlar + lock
mexanizmi, versiya 5), `src/career/utils/careerApi.js`,
`src/components/AdminPanel.jsx`.

**Backend (`server/`) ni albatta almashtiring va push qiling** — bu safar
frontend ('src') deyarli o'zgarmagan (faqat admin tugmasi qo'shildi), asosiy
ish backendda.

---

# YANGILANISH #7 (2026-09-14) — FRONTEND UMUMIY DUNYOGA ULANDI + KONTRAKT TIZIMI

## Backend versiyasi 5 → 6.

## 1. Live Match — umumiy dunyo natijasini ko'rish
- `GET /api/career/mine` endi umumiy dunyoning joriy sanasini (`worldDate`)
  ham qaytaradi.
- Yangi `POST /api/career/ack-result` — natijani "ko'rildi" deb belgilaydi.
- Frontendda **yangi `/live-result` sahifasi** (`LiveResultPage.jsx`) — admin
  kunni o'tkazganda sizning klubingiz o'ynagan bo'lsa, Home sahifasida
  **"🌍 Yangi natija tayyor!"** banneri chiqadi. Bosilganda o'sha o'yin
  daqiqama-daqiqa (tezlik tugmalari bilan) qayta ko'rsatiladi — xuddi avvalgi
  "Play Match" kabi, lekin natija admin tomonidan ALLAQACHON hal qilingan
  bo'lib, sizga faqat ko'rsatiladi.
- GameContext endi har 20 soniyada serverni tekshirib turadi — ilova ochiq
  turgan payt ham admin yangi kunni o'tkazsa, natija avtomatik ko'rinadi.
- Home sahifasida umumiy dunyo sanasi ham doim ko'rsatiladi.

## 2. Kontrakt tizimi (yangi)
Aytilganidek — endi kontrakt **cheksiz emas**:
- Har bir yangi karyera 3-8 yillik shartnoma bilan boshlanadi (liga
  darajasiga qarab — katta ligalar uzunroq shartnoma taklif qiladi).
- Shartnoma tugashiga ~2.5 oy qolganda avtomatik "Contract renewal talks"
  xabari keladi (yangi yillik shartnoma + maosh taklifi bilan).
- Agar 5 marta ketma-ket rad javob qilinsa — klub sizni **ozod qiladi**
  ("Released" xabari bilan), va siz **erkin agent** bo'lasiz.
- Agar shartnoma muddati tugab, yangilanmasa — avtomatik erkin agent
  bo'lasiz.
- Erkin agent bo'lganingizda: liga o'yinlari to'xtaydi, lekin vaqti-vaqti
  bilan (taxminan har 5-6 kunda) turli klublardan (istalgan liga/mamlakatdan)
  taklif xabarlari kela boshlaydi. Birini qabul qilsangiz — yangi klub,
  yangi liga (agar boshqa ligadan bo'lsa — yangi jadval/kubok ham avtomatik
  tuziladi), yangi shartnoma bilan davom etasiz.
- Profile sahifasida yangi "CONTRACT" bo'limi — qolgan yil soni va maosh
  ko'rsatiladi (yoki "Free Agent" holati).
- Test qilib tekshirdim: 3 yillik shartnoma to'g'ri kunlarida tugadi, erkin
  agentlikda 60 kun ichida 4 ta turli klubdan taklif keldi.

## Eslatma
Kontrakt tizimi hozircha **shaxsiy** (har bir user o'zining shartnomasi) —
bu umumiy dunyo bilan bog'liq emas, alohida ishlaydi. Umumiy dunyoda
(server) esa hali faqat LIGA o'yinlari boshqariladi; kubok/kontrakt/mashg'ulot
hali mahalliy (client-side) davom etadi. Bu Faza 2ning navbatdagi qismi
bo'ladi (NPC futbolchilar yoshi/retirement/akademiya, milliy terma jamoalar).

## O'zgargan fayllar
`server/index.js` (worldDate, ack-result endpoint, versiya 6),
`src/career/utils/careerApi.js`, `src/career/utils/season.js` (kontrakt
mantig'i), `src/career/context/GameContext.jsx` (polling, kontrakt/erkin
agent handling), `src/career/pages/{StartPage,HomePage,ProfilePage}.jsx`,
`src/career/pages/LiveResultPage.jsx` (yangi), `src/career/CareerApp.jsx`.

---

# 2-QISM (2026-09-15) — NPC hayot sikli + Milliy terma jamoalar

`SERVER_VERSION` 6 → **8**, `REQUIRED_SERVER_VERSION` 6 → **8**.

## A. NPC futbolchilar: yosh, pensiya, akademiya (YAKUNLANDI va ULANDI)

Avval `engine.js` oxirida yozib qo'yilgan, lekin hech qayerdan chaqirilmaydigan
funksiyalar endi umumiy dunyoga to'liq ulandi.

**`server/engine.js`**
- `initWorldSquad(team, homeCountry)` — YANGI. Statik `teamsData.js` squad'idan
  **chuqur nusxa** olib, har bir futbolchiga `age`, `retireAge`, `nationality`
  qo'shadi. Chuqur nusxa muhim: aks holda barcha league world'lar bitta
  module-level `INITIAL_TEAMS` massivini o'zgartirar edi.
- `ageAndRefreshSquad(squad, retirementLog, clubName, homeCountry, releaseLog)` —
  qayta yozildi. Endi **pure** (kirish massivini o'zgartirmaydi) va squad hajmini
  cheklaydi (pastda "Topilgan bug'lar"ga qarang).
- `randomAcademyPlayer(homeCountry)` — id to'qnashuvi tuzatildi (`Date.now()`
  bitta millisekundda o'nlab futbolchi yaratilganda takrorlanardi), `stats`,
  `retireAge`, `nationality` qo'shildi.
- `isSeasonComplete(world)`, `sortedTable(standings)` — YANGI yordamchilar.

**`server/index.js`**
- `ensureWorldForLeague()` endi `world.squads`, `season`, `seasonStartDate`,
  `newsLog`, `seasonHistory` yaratadi **va eski (v6) world'larni migratsiya
  qiladi** — mavjud schedule/standings saqlanib qoladi.
- `advance-world-day` ichida `engine.resolveMatch(...)` YANGI imzo bilan
  chaqiriladi: `world.squads[m.home]` / `world.squads[m.away]`.
- `rolloverSeason(world, league)` — YANGI. **Server endi mavsum tugashini
  aniqlaydi** (avval schedule hech qachon yangilanmas edi): barcha squadlar bir
  yilga qariydi, chempion/pensiya/akademiya yangiliklari `newsLog`ga yoziladi
  (OVR≥80 — alohida sarlavha), tugagan mavsum `seasonHistory`ga arxivlanadi,
  keyingi mavsum jadvali va standings generatsiya qilinadi.
- `GET /api/world/:leagueId` endi `squads`ni qaytarmaydi (`?includeSquads=1`
  bo'lmasa) — har 20 soniyalik polling'ga ~400 futbolchi yubormaslik uchun.

### Test paytida topilgan va tuzatilgan bug'lar
1. **Tarkiblar cheksiz o'sardi.** 10 mavsumlik test: La Liga 319 → **830**
   futbolchi (klubda 40+), o'rtacha OVR 73.7 → 68. Sabab: yiliga 2-5 akademiya
   keladi, lekin atigi ~0.5 kishi pensiyaga chiqadi. **Tuzatildi:** squad hajmi
   18-26 oralig'ida ushlab turiladi, klub eng kam qiymatli fringe futbolchilarni
   chiqarib yuboradi (`squadValue()` — reyting + yoshlik bonusi / veteranlik
   jarimasi). Endi 364 da barqaror, OVR ~73.5 da qoladi. Chiqarilganlarning 94% —
   70 OVR dan past akademiya yoshlari; 80+ yulduz hech qachon chiqarilmaydi.
2. **Darvozabonsiz klublar.** `valencia` va `malaga` 1 ta GK bilan keladi;
   pensiya ustiga qo'shilib 0 ga tushardi. **Tuzatildi:** `MIN_GK = 2` kafolati
   — zaxira GK bo'lmasa akademiyadan olinadi (`initWorldSquad`da ham).
3. **Akademiya soni noto'g'ri hisoblanardi** (`age <= 18` o'tgan yilgi yoshlarni
   ham qo'shardi) — endi id bo'yicha aniq yangi kelganlar sanaladi.

## B. Umumiy kalendar (`db.worldDate`) — MUHIM O'ZGARISH

Avval har bir liga o'zining `gameDate`ini yuritardi. Ligalar uzunligi har xil
(18 jamoali liga 34 round, 20 jamoali 38, Superliga 52), shuning uchun ular
turli kunlarda mavsumni tugatib, **sanalari bir-biridan uzilib ketardi**.
Endi bitta global `db.worldDate` bor, barcha world'lar shundan o'qiydi.

Shu sababli mavsum yakunida sana **sakramaydi** (avvalgi rejadagi "yozni
o'tkazib yuborish" olib tashlandi) — yoz o'ynaladi, chunki aynan o'shanda
xalqaro turnirlar bo'ladi.

**Jarohat tiklanishi** ham qo'shildi: server jarohat berardi, lekin hech qachon
tuzatmasdi — bu futbolchini terma jamoaga **abadiy yaroqsiz** qilib qo'yardi.

## C. Milliy terma jamoalar + xalqaro turnirlar (YANGI MODUL)

**`server/gamedata/nationsData.js`** — YANGI. 77 millat, konfederatsiyasi bilan
(UEFA/AFC/CONMEBOL/CAF/CONCACAF). Har bir futbolchining millati **id hash'idan
deterministik** hisoblanadi (`nationalityFor`) — hech narsa saqlanmaydi va
futbolchi millati hech qachon o'zgarmaydi, liga umumiy dunyoga qo'shilganda ham.
`NATION_WEIGHT` — millatlar og'irligi (Braziliya 10, Vetnam 2 va h.k.).

**`server/international.js`** — YANGI, ~420 qator.
- `buildPlayerPool(db)` — **butun o'yindagi har bir futbolchi**: faol umumiy
  dunyodagi klublar `world.squads`dan, qolgan ~150 klub statik ma'lumotdan,
  ustiga barcha real userlarning `careerSave`i.
- `pickSquad()` — pozitsiya kvotalari bilan (3 GK / 7 himoyachi / 6 yarim maydon /
  5 hujumchi) eng yaxshi 23 kishi. **Har bir o'yin oldidan qaytadan tanlanadi** —
  doimiy joy yo'q.
- Turnir davriyligi: `yil % 4 === 2` → Jahon chempionati (2026, 2030, 2034);
  `yil % 4 === 0` → Yevro + Copa América + Osiyo kubogi + Afrika kubogi
  (2028, 2032). **Hech qachon bir yilda to'qnashmaydi.**
- Format: guruhlar (4 kishilik, 3 tur) → pley-off → final; penalti seriyasi bor.
  Turnir hajmi moslashuvchan (32/16/8) — CONMEBOLda 10 mamlakat bor, hammasi
  23 kishilik tarkib to'play olmaydi, shuning uchun Copa América 8 jamoada
  o'tadi, butunlay o'tkazilmay qolishi o'rniga.
- Xalqaro pauza: har 70 kunda o'rtoqlik o'yinlari (yoz oynasidan tashqari).
- Real userlar: `careerSave.career.international = { country, caps, goals,
  assists, trophies, lastCallUp }`; chempion tarkibdagi userlar kubokni oladi.
- `GET /api/international`, `GET /api/international/nation/:country` — YANGI.

**Frontend:** `src/career/pages/NationalTeamPage.jsx` (YANGI sahifa — tarkib /
joriy turnirlar / tarix), AppShell'da "National Team" bandi, ProfilePage'da
"INTERNATIONAL" kartochkasi, `careerApi.js`da `fetchInternational()` va
`fetchNationSquad()`.

### Bu yerda ham test bug topdi
- **Deterministik millat taqsimoti tekis edi** → terma jamoa kuchi tasodifiy
  bo'lib qolgandi (4 yillik testda **Boliviya JCh finaliga chiqdi**). Tuzatildi:
  `NATION_WEIGHT` bilan og'irlangan taqsimot.
- **`star_uz` 4 yilda atigi 2 marta chaqirildi** — sabab yuqoridagi tiklanmaydigan
  jarohat bug'i. Tuzatilgandan keyin: 23 caps, 3 gol, 4 assist.
- Terma tarkib GK'lar bilan boshlanardi (pozitsiya kvotalari tartibi) — endi
  reyting bo'yicha saralanadi.

## Test qilish (haqiqiy raqamlar bilan, taxminsiz)

Uch xil test skripti, barchasi **haqiqiy ishlayotgan serverga** qarshi:
- `test_engine_aging.js` — standalone, 10 mavsum squad evolyutsiyasi.
- `test_e2e_seasons.js` — 1460 admin bosishi, 4 mavsum → **14/14 PASS**.
- `test_migration.js` — eski v6 `db.json` → v8 server → **10/10 PASS**.
- `test_international.js` — 1460 kun, 5 turnir, 603 xalqaro o'yin → **14/14 PASS**.
- Ko'p ligali test (La Liga + Bundesliga + Superliga, turli uzunlikdagi
  mavsumlar) → **6/6 PASS**, uchalasi ham bitta sanada qoladi.

## Ma'lum cheklov
Millat id hash'idan kelib chiqqani uchun real futbolchilar "noto'g'ri"
mamlakatga tushishi mumkin (masalan Antonio Rüdiger O'zbekiston termasida).
Buni tuzatish uchun `teamsData.js`dagi 2591 futbolchiga qo'lda `nationality`
yozib chiqish kerak — hozircha qilinmadi.

## KEYINGI QADAM (3-vazifa — HALI QILINMAGAN)
Kubok / Training / Xabarlarni umumiy dunyoga ko'chirish. Bu eng xavfli qism;
reja yozilib, tasdiqlanmaguncha boshlanmaydi.
