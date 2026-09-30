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

---

# 3-QISM (2026-09-16) — MongoDB'ga o'tish (Render Free plan doimiy saqlash muammosi)

## Muammo
Render Free planda **Persistent Disk yo'q**. Har bir deploy/restart'da
`server/data/db.json` (users, parollar, karyeralar, umumiy dunyo) butunlay
o'chib ketardi — chunki fayl tizimi konteyner bilan birga qayta yaratiladi.
Shell orqali qo'lda backup/restore qilish mumkin edi, lekin bu **har safar**
qo'lda takrorlanishi kerak edi va xatoga moyil edi.

## Yechim: MongoDB Atlas (bepul, cheksiz muddatga, Render'dan mustaqil)

**`server/db.js`** — TO'LIQ QAYTA YOZILDI:
- Fayl o'rniga MongoDB Atlas'ga yozadi (`MONGODB_URI` muhit o'zgaruvchisi orqali).
- `readDB()`/`writeDB()` interfeysi **AYNAN oldingidek** qoldi — sinxron,
  butun db obyektini qaytaradi/qabul qiladi. Buning siri: butun baza xotirada
  (`cache`) saqlanadi, Mongo bilan FONDA sinxronlanadi. Bu index.js'dagi
  **19 ta chaqiruv joyining birortasini ham o'zgartirishga hojat qoldirmadi**.
- Yozishlar KETMA-KET navbatga qo'yiladi (`writeQueue`) — bir nechta
  `writeDB()` tez-tez chaqirilsa, Mongo'ga tasodifiy tartibda emas, chaqirilgan
  tartibda yetib boradi (server/index.js'dagi `withLock()` bilan bir xil
  maqsad, lekin Mongo tomonida).
- `MONGODB_URI` topilmasa server **umuman ishga tushmaydi** (ochiq xato) —
  noto'g'ri sozlangan holda "tirik" ko'rinib, aslida hech narsa saqlamaydigan
  serverdan ko'ra bu xavfsizroq.

**`server/index.js`** — kichik o'zgarish:
- `initDB()` endi `app.listen()`dan OLDIN kutiladi (`.then()` ichida).
- `ensureAdminSeeded()` chaqiruvi (avval modul yuklanganda darhol ishlardi)
  endi `initDB()` tugagandan KEYIN chaqiriladi.

## Test qilish (haqiqiy MongoDB Atlas'ga bu muhitdan ulanib bo'lmagani uchun, drayverni deterministik soxta versiya bilan almashtirib)

### 1) `test_db_mongo.js` — db.js SHARTNOMASINI tekshiruvchi unit test
`require('mongodb')`ni Node module tizimi darajasida almashtirib, 5 ta holatni
tekshirdim:
1. Birinchi ishga tushirish — bo'sh baza qaytadi va darhol saqlanadi
2. `writeDB()` haqiqatan "bazaga" yetib boradi (faqat xotiraga emas)
3. **Server qayta ishga tushishi simulyatsiyasi** (butunlay yangi modul
   instance, xuddi yangi Render deploy kabi) — oldin yozilgan MA'LUMOT
   TO'LIQ QAYTIB KELDI (aynan hozirgi asosiy bug shu yerda tuzatiladi)
4. 20 ta tez-tez yozish ketma-ketligi — hech biri yo'qolmadi, tartib buzilmadi
5. `MONGODB_URI` yo'q bo'lsa server ochiq xato beradi, jim qolmaydi

**Natija: 5/5 PASS**

### 2) To'liq HTTP darajasidagi end-to-end test
`node index.js`ni haqiqiy Express bilan, lekin faylga asoslangan soxta
"Mongo" bilan (bu ham tashqi, process'dan mustaqil — `/tmp` fayliga yozadi,
xuddi haqiqiy tashqi baza kabi) ishga tushirib:
1. Admin login qilindi, yangi user (`testuser1`) ro'yxatdan o'tkazildi,
   karyera saqlandi
2. Server **o'ldirildi** (`kill`) — bu Render'ning deploy paytida konteynerni
   yo'q qilishini simulyatsiya qiladi
3. Server **qaytadan ishga tushirildi** — yangi Node process, mutlaqo yangi
   xotira
4. `testuser1` bilan qayta login qilindi — **MUVAFFAQIYATLI**, karyera
   ma'lumotlari (`Real Madrid`, pozitsiya, statistika) **to'liq saqlanib
   qolgan**

```
=== RESTARTING SERVER (simulating Render redeploy) ===
✅ MongoDB ulandi (football_career.appstate) — 2 user, 0 liga world topildi
=== VERIFY DATA SURVIVED RESTART ===
{"ok":true,"token":"...","user":{"username":"testuser1",...}}
{"ok":true,"player":{"id":"p1","name":"Test","surname":"User",...}}
```

### 3) Regressiya: 2-qismdagi barcha testlar MongoDB-orqa fon bilan qayta ishga tushirildi
`test_e2e_seasons.js` (4 mavsum, 1520 o'yin, squad evolyutsiyasi) — **hammasi
PASS**, hech narsa buzilmagan. Bu MongoDB'ga o'tish faqat saqlash qatlamini
almashtirganini, o'yin mantig'iga tegmaganini tasdiqlaydi.

## Sizga kerak bo'ladigan qadam (deploy paytida)
1. MongoDB Atlas'da BEPUL (M0, 512MB, muddatsiz) klaster yarating
2. Connection string oling
3. Render → Environment → `MONGODB_URI` muhit o'zgaruvchisini qo'shing
4. Kodni push qiling — SHU BILAN endi hech qanday deploy ma'lumotni
   o'chirmaydi, chunki baza Render'dan butunlay mustaqil joyda turadi

## Ma'lum cheklov
`db.json` (barcha users + har bir liganing to'liq squad'lari + xalqaro
turnirlar tarixi) bitta MongoDB HUJJATI sifatida saqlanadi. Bu hozirgi
o'lcham uchun (ehtimol bir necha MB) yaxshi ishlaydi, lekin foydalanuvchilar
soni juda ko'payib ketsa (ming(lab) faol karyera), MongoDB hujjat hajmi
chegarasi (16MB) yaqinlashishi mumkin — o'shanda har bir userni/liga world'ni
ALOHIDA hujjat qilib bo'lish kerak bo'ladi. Hozircha bu muammo emas.

---

# 2026-09-19 — Build blokeri, jarohat bug'i va spin cheklovi

## 0. KRITIK: frontend build butunlay buzilgan edi — tuzatildi

`b5c5606` ("v8: NPC lifecycle + international tournaments") commitida
`src/career/data/` papkasi serverga ko'chirilgan (`server/gamedata/`), lekin
frontenddagi import yo'llari yangilanmay qolgan edi:

- `src/career/data/clubRosterStore.js` — **butunlay o'chirilgan**, holbuki unga
  4 ta fayl (`GameContext.jsx`, `season.js`, `StartPage.jsx`, `ClubPage.jsx`)
  murojaat qilardi. Fayl `b5c5606^` dan tiklandi (107 qator, 7 ta eksport:
  `getClubExtras`, `addPlayerToClubRoster`, `removePlayerFromClubRoster`,
  `updatePlayerInClubRoster`, `getMergedSquad`, `joinClubRoster`,
  `previewClubTier` — hammasi chaqiruv joylariga aynan mos keladi).
- `../data/leaguesData` → `../../data/leaguesData` (`GameContext.jsx`,
  `season.js`, `playerGen.js`). `StartPage.jsx` avvalgi commitda allaqachon
  tuzatilgan edi, qolgan 3 tasi esa e'tibordan chetda qolgan.

Ya'ni Sep 15 dan beri Netlify build'i "Module not found" bilan yiqilib kelgan.
Tekshirildi: `node node_modules/react-scripts/scripts/build.js` → **Compiled**
(186 kB gzip). `netlify.toml` da `CI = "false"` turganini ham tasdiqladim, ya'ni
eslint ogohlantirishlari build'ni yiqitmaydi.

## 1. BUG: jarohatlangan holatda "Next Day" ishlamasdi

`src/career/pages/HomePage.jsx` — bitta tugma ham "Next Day", ham "Play Match"
vazifasini bajarardi, shuning uchun `disabled={injured}` va
`if (injured) return;` jarohatda IKKALASINI ham bloklab qo'yardi. Natija:
foydalanuvchi butunlay qotib qolardi — kun o'tmagani uchun jarohat ham hech
qachon tuzalmasdi (o'lik holat).

Tuzatildi: `playable = matchdayNext && !injured`. Jarohatda tugma oddiy
"Next Day" bo'lib qoladi, o'sha kundagi liga turi `season.js:processRound`
orqali foydalanuvchisiz (NPC tarkib bilan) hal qilinadi. `season.js` ning
ichki mantig'iga TEGILMADI — u allaqachon to'g'ri ishlar edi.

## 2. Karyera yaratishda spin urinishlari cheklandi (4 ta)

`src/career/pages/StartPage.jsx` — avval reyting/klub/potensial slotlarini
CHEKSIZ aylantirish mumkin edi. Endi har biri uchun `MAX_SPINS = 4`:
istalgan paytda to'xtab, qo'ldagi natija bilan o'ynab ketish mumkin; 4-marta
bosilgandan keyin chiqqan natija yakuniy. Har slotda "N urinish qoldi" /
"Yakuniy" ko'rsatkichi bor.

Teshik yopildi: birinchi aylantirishdan keyin MILLAT tanlovi qulflanadi —
aks holda klub urinishlari tugagach millatni almashtirib, qaytadan 4 ta
urinish olish mumkin bo'lardi.

## 3. Testlar

- `tests/test_engine_aging.js` va `tests/test_e2e_seasons.js` dagi qattiq
  yozilgan `/home/claude/work/app/...` yo'llari nisbiy yo'lga o'tkazildi
  (avval umuman ishga tushmas edi).
- YANGI: `tests/test_injury_and_aging.js` — `season.js` ni esbuild bilan CJS
  ga bundle qilib (localStorage stub bilan) to'g'ridan-to'g'ri tekshiradi.
  Natija: 12/12 OK. Jumladan: matchday kuni jarohatlangan holatda sana va
  `day` bir kunga suriladi, jarohat 10→9 ga kamayadi, o'sha turdagi 10 ta
  o'yin baribir hal qilinadi, foydalanuvchining `appearances` i oshmaydi,
  10 kundan keyin jarohat tuzaladi. Yosh: 1825 kunda aniq 5 marta oshadi
  (day 366, 731, 1096, 1461, 1826 — ya'ni aniq 365 kunda).

## 4. ANIQLANGAN, HALI TUZATILMAGAN MUAMMO — kalendar siljishi

Yuqoridagi testda ko'rindi: `day 366` da o'yin sanasi `2027-11-13` bo'lib
qoldi, holbuki `2026-07-31` + 365 kun = `2027-07-31`. Sabab: client tomonda
mavsum tugagach `finalizeSeason` kalendarni keyingi mavsum boshiga SAKRATADI,
`day` esa bittalab sanaydi. Natijada 5 "yil" ichida 7 ta mavsum o'tib ketdi.
Serverdagi umumiy dunyo esa yiliga ANIQ 1 mavsum yuritadi va sanani hech
qachon sakratmaydi. Ya'ni client karyera soati bilan `db.worldDate` bir-biridan
uziladi — bu 4 va 6-bandlar (userning o'z o'yinini o'ynashi, 15 kun orqada
qolishni hisoblash) uchun to'g'ridan-to'g'ri muammo. Kalendarni birlashtirish
keyingi bosqichlarning bir qismi bo'lishi kerak.

SERVER_VERSION o'zgarmadi (8) — bu bosqichda server kodiga tegilmadi.

---

# 2026-09-19 (davomi) — 2-BAND: barcha ligalar serverda, istalgan foydalanuvchi istalgan ligani ko'ra oladi

## Server (SERVER_VERSION 8 → 9, careerApi.js REQUIRED_SERVER_VERSION ham 9)

`server/index.js`:
- `POST /api/admin/advance-world-day` — avval faqat ICHIDA jonli user bo'lgan
  ligalar `world` olardi (`leagueIdsInUse`). Endi `engine.LEAGUES.forEach((l)
  => ensureWorldForLeague(db, l.id))` — BARCHA 21 liga har bir "Next Day"da
  birga suriladi, hech kim o'ynamasa ham. Hajmi standalone skript bilan
  o'lchandi: 21 liganing hammasi world olsa jami ~0.73 MB — 16MB Mongo
  hujjat limitidan juda uzoq, xavfsiz.
- YANGI: `GET /api/leagues` — barcha 21 liganing ro'yxati (nomi, mamlakati,
  bayrog'i, klublar soni, `isMine`, va world mavjud bo'lsa `season/day/
  gameDate`). Istalgan login qilgan user chaqira oladi.
- `GET /api/world/:leagueId` o'zgarishsiz qoldi — u allaqachon istalgan
  ligani (kerak bo'lsa yaratib) qaytarardi; endi shunchaki chaqirilganda
  har doim "boshlangan" liga topiladi.

## Frontend

- `src/career/utils/careerApi.js` — `fetchLeagues()` qo'shildi.
- `src/career/utils/season.js` — `getLeagueTable`dan umumiy
  `computeStandingsTable(standings)` funksiyasi ajratildi (endi
  o'yinchining shaxsiy standings'i BILAN serverdan kelgan world standings'i
  BIR XIL kod bilan jadvalga aylanadi).
- YANGI `src/career/pages/LeaguesPage.jsx` — 21 liganing hammasini
  ro'yxat qilib ko'rsatadi (`/api/leagues`), qaysi biri "sizning ligangiz"
  ekanini belgilaydi, bosilganda `/leagues/:leagueId`ga o'tadi.
- YANGI `src/career/pages/LeagueBrowsePage.jsx` — `/api/world/:leagueId`
  orqali ISTALGAN liganing standings jadvali va tur-tur natijalarini (o'tgan
  VA kelasi turlar, chunki `world.schedule` butun mavsumni oldindan
  generatsiya qiladi) ko'rsatadi — foydalanuvchi o'sha ligada o'ynamasa ham.
- `CareerApp.jsx` va `AppShell.jsx` — `/leagues` va `/leagues/:leagueId`
  route'lari va yon menyuga "Barcha ligalar" havolasi qo'shildi.
- `AdminPanel.jsx` — tugma tavsifi "barcha faol ligalar" dan "BARCHA 21 liga
  (hech kim o'ynamasa ham)" ga aniqlashtirildi.

## Testlar

YANGI `tests/test_all_leagues_world.js` + `tests/_mock_mongodb_hook.js` —
`server/index.js`ni HAQIQIY http server sifatida (child_process bilan)
ishga tushirib, `require('mongodb')`ni `Module._load` orqali xotiradagi
mock bilan almashtiradi (loyiha eslatmasida aytilgan usul aynan shu).
MUHIM: bu mock faqat test paytida `-r` flag orqali yuklanadi,
`server/node_modules/mongodb` ga HECH QACHON tegilmaydi — production/Render
uchun haqiqiy MongoDB drayveri butunlay o'zgarishsiz qoladi.

12/12 test OK: boshlanishda 21/21 liga `season=null`; bitta
`advance-world-day` 21/21 ligani birga boshlaydi va bittalab suradi; hech
kim o'ynamaydigan Iraqi Premier League ham avtomatik haqiqiy hisob bilan
yuradi va `/api/world/`orqali ko'rinadi; javobda `squads` maydoni yo'q
(og'irlikni tejash); har bosishda ANIQ 1 kun suriladi (sakrash yo'q,
3-band talabi qayta tasdiqlandi).

`node --check server/index.js`, `node --check server/db.js` va to'liq
`react-scripts build` (Compiled, 187 kB gzip) — hammasi toza o'tdi.

## Deploy uchun eslatma

SERVER_VERSION 9 ga oshdi — Render'da backend qayta deploy qilinishi SHART
(aks holda frontend "backend hali yangilanmagan" ogohlantirishini ko'rsatadi,
`AdminPanel.jsx`ning versiya tekshiruvi tufayli).

---

# 2026-09-19 (davomi #2) — 3-BAND: seedlangan RNG + ko'rinadigan penalti seriyasi

## Seedlangan RNG (rng.js)

YANGI `src/utils/rng.js` — `Math.random()`ning o'rnini bosuvchi `rand()`:
odatda haqiqiy `Math.random()` bilan bir xil (mulberry32 PRNG, seedsiz holatda
`Math.random`ga proksi), lekin `setSeed(seed)` chaqirilgandan keyin
DETERMINISTIK bo'lib qoladi. `clearSeed()` bilan yana haqiqiy tasodifga
qaytadi. Bu quyidagilarni ta'minlaydi: umumiy dunyodagi o'yinning natijasi
kim ochib ko'rsa ham bir xil bo'ladi, va "qayta tomosha" funksiyasi (5-band)
shu seedga tayanadi.

`src/utils/engine.js` (24 joy), `src/components/LiveMatch.jsx` (12 joy) va
`src/utils/tournamentEngine.js` (17 joy) dagi BARCHA `Math.random()`
chaqiruvlari `rand()` bilan almashtirildi. Ikki joyda (`engine.js`ning
`checkRandomMatchEvent`ida va `tournamentEngine.js`ning tick loopida) mahalliy
`const rand = Math.random() * 100` o'zgaruvchisi import qilingan `rand()`
funksiyasini SOYALAB (shadowing) qo'yib, "rand is not a function" xatosiga
olib kelardi — bu ikkalasi `roll` deb qayta nomlandi.

`LiveMatch`ga yangi IXTIYORIY `seed` prop qo'shildi: berilsa, komponent
mount bo'lganda `setSeed(seed)` chaqiriladi (tick loop boshlanishidan OLDIN —
effektlar tartibi tekshirildi), unmount bo'lganda `clearSeed()` — boshqa
(seedsiz) o'yinlarga "sirqib chiqmasin". Seed berilmasa (Tezkor
O'yin/eski Turnir), xatti-harakat 100% oldingidek.

**Test:** `tests/test_seeded_rng.js` — `engine.js` va `rng.js`ni BITTA
umumiy entry orqali (haqiqiy ilova ular bir xil modul nusxasini bo'lishgani
kabi) esbuild bilan bundle qilib tekshiradi: bir xil seed bilan 90 daqiqalik
simulyatsiya AYNAN bir xil hodisalar ketma-ketligini beradi (194ta hodisa,
bayt-baytiga teng); boshqa seed boshqa natija beradi; seedsiz holat haqiqiy
tasodifiy va bir tekis taqsimlangan (o'rtacha ≈0.5) qoladi. 10/10 OK.
MUHIM ESLATMA: engine.js va rng.js'ni ALOHIDA-ALOHIDA bundle qilib test
qilish YOLDIRUVCHI natija berardi (har biri o'zining mustaqil rng holatini
olardi) — buni umumiy entry fayl orqali BIRGA bundle qilib tuzatildi.

## Ko'rinadigan penalti seriyasi

Muammo: `simulatePenaltyShootout()` (tournamentEngine.js) durang tugagan
pley-off o'yinidan keyin FONDA, foydalanuvchiga ko'rinmasdan hisoblanardi —
foydalanuvchi faqat yakuniy `[p: 4-3]` yozuvini ko'rardi.

Yechim: YANGI `simulatePenaltyShootoutDetailed(teamA, teamB)` — har bir
zarbani (`{side, round, kicker:{id,name}, scored}`) alohida qaytaradi (eng
yaxshi OVRli 5 dala o'yinchisi navbat bilan zarba qiladi, GK zarba qilmaydi,
kerak bo'lsa "oltin penalti"gacha davom etadi). Eski `simulatePenaltyShootout`
endi shu funksiyaning yupqa o'ramasi (faqat yakuniy hisobni qaytaradi) —
BARCHA eski chaqiruvchilar (CL pley-off, ikki turli knockout) hech narsa
o'zgartirmasdan ishlashda davom etadi.

`LiveMatch.jsx`ga yangi IXTIYORIY `shootoutOnDraw` prop qo'shildi: true
bo'lsa va 90+qo'shimcha daqiqada hisob teng bo'lsa, natija darhol e'lon
qilinmaydi — avval penalti seriyasi ZARBA-ZARBA (har 650ms, kim zarba
qilayotgani va gol/otkazib yuborgani bilan) jonli ko'rsatiladi, so'ng
foydalanuvchi "Davom etish →" bosgach `onFinish`ga `penA/penB/penWinner/
penKicks` bilan birga yuboriladi.

`resolveTie(fixture, teamsById, precomputedShootout)` — endi ixtiyoriy
3-parametr qabul qiladi: agar LiveMatch foydalanuvchiga seriyani ALLAQACHON
ko'rsatib bergan bo'lsa, ANA SHU natija yoziladi — resolveTie qaytadan
(foydalanuvchi ko'rmagan, mos kelmaydigan) yangi seriya "o'ynamaydi".
Berilmasa — avvalgidek o'zi hisoblab oladi (orqaga qarab to'liq moslashuvchan).

`TournamentView.jsx`: `handlePlayKnockoutLeg` — BIR TURLI (`!useTwoLegged`)
pley-off o'yinlarida `shootoutOnDraw=true` beriladi va natijadagi
`penA/penB/penWinner` `resolveTie`ga uzatiladi. **Qasddan cheklangan
qamrov:** ikki turli o'yinlarda (CL pley-off, ikki turli knockout) YIG'INDI
hisobi kerak bo'lgani uchun (leg2ning O'ZI teng bo'lishi shart emas —
masalan leg1 1-1, leg2 3-1 bo'lsa yig'indi 4-2, durang emas, lekin leg2
o'zi ham teng emas), ular hozircha avvalgidek KO'RINMASDAN hal qilinadi —
bu YANGI regressiya EMAS, shunchaki yangi animatsiya hali shu holatga
yoyilmagan. Keyingi bosqichda kengaytirilishi mumkin.

**Test:** `tests/test_penalty_shootout.js` — 9/9 OK: bir xil seed bilan
zarbalar ketma-ketligi bayt-baytiga teng; darvozabon hech qachon zarba
qilmaydi; 500/500 seriya durangsiz tugaydi (min 10 zarba); eski va yangi
funksiya bir xil yakuniy hisob beradi; `resolveTie` `precomputedShootout`
berilganda aynan shuni yozadi, berilmaganda eski xatti-harakatini saqlaydi.

## Umumiy tekshiruv

`node --check`, to'liq `react-scripts build` (188.7 kB gzip, faqat oldindan
bor eslint ogohlantirishlari, yangi xato yo'q) va BARCHA 5 test fayli
(`test_injury_and_aging`, `test_engine_aging`, `test_seeded_rng`,
`test_penalty_shootout`, `test_all_leagues_world`) qayta ishga tushirildi —
hammasi toza o'tdi.

SERVER_VERSION o'zgarmadi (bu bosqich faqat frontend/quick-play dvijogiga
tegishli, serverga tegilmadi).

---

# 2026-09-19 (davomi #3) — 4-BAND: user o'z o'yinini HAQIQIY quick-play dvijogida o'ynaydi

## Muammo

Avval, umumiy dunyoda foydalanuvchining klubi o'ynashi kerak bo'lgan kunda,
server uning natijasini DARHOL, `simulateHumanPlayerMatch()` degan mavhum
formula (OVR farqi + forma + tasodif) bilan "taxmin qilib" hal qilardi -
foydalanuvchi hech narsa ko'rmasdi, faqat tayyor hisobni o'qirdi. Siz
so'ragan narsa: bu HAQIQIY quick-play dvijogi (Match Simulator/Turnirda
ishlatiladigan, sariq/qizil karta va penalti bilan) orqali, real
statistikaga asoslanib o'ynatilishi kerak.

## Server: "pending" (kutilayotgan) o'yin holati

`server/index.js`ning `advance-world-day`i - agar biror o'yinda kamida bitta
JAROHATLANMAGAN inson o'yinchi bo'lsa, ENDI uni darhol hal qilmaydi. O'rniga:
```
{ ...m, played: false, pending: true, seed: "<leagueId>:s<season>:r<round>:<home>:<away>" }
```
deb belgilaydi. Shu turdagi BOSHQA (faqat NPC) o'yinlar avvalgidek darhol
hal bo'ladi - hech narsa sekinlashmaydi. Jarohatlangan inson bo'lsa (o'zi
o'ynay olmaydi) - avvalgidek avtomatik.

`server/engine.js`ga `generateMatchSeed()` qo'shildi (eksport qilindi) -
`src/utils/rng.js:setSeed()` shu qiymatni qabul qiladi, shuning uchun
klient dvijogi serverning "bu o'yin" degan seediga to'liq mos keladi.

YANGI endpointlar:
- `GET /api/world-match-detail` - foydalanuvchining pending o'yini uchun
  ikkala klub (nom/logo) + ularning world squadlari (aged/retired - frozen
  emas) + seedni qaytaradi. Squadlar OG'IR bo'lgani uchun bu FAQAT
  foydalanuvchi "Play" bosganda chaqiriladi, 20 soniyalik pollingda emas.
- `POST /api/career/submit-match-result` - foydalanuvchi LiveMatch orqali
  O'ZI o'ynagan natijani (`scoreA/scoreB/myGoals/myAssists/myRating/
  myInjured`) yozib qo'yadi: standings yangilanadi, qolgan gollar NPC
  hamjamoadoshlarga (`topScorers`) tarqatiladi, o'yin `played:true` bo'ladi,
  foydalanuvchining shaxsiy karyera statistikasi (appearances/goals/
  assists/matchRatings/injury) yangilanadi.
- `GET /api/career/mine` endi `pendingWorldMatch: {leagueId, round, home,
  away, seed, isHome} | null` ham qaytaradi (mavjud 20s polling shu yerga
  ulanadi - yangi alohida so'rov shart emas).

**MUHIM CHEKLANGAN QAMROV (bilib qoldirilgan):** to'liq server-tomonlama
anti-cheat YO'Q - klient LiveMatchda HAQIQATAN o'ynagan natijaga
ishoniladi, xuddi Match Simulator/Turnir rejimlarida bo'lgani kabi. Agar
RAQIB klubida ham boshqa inson bo'lsa (ikki do'st bir-biriga qarshi) -
hozircha FAQAT natijani yuborgan tomonning shaxsiy statistikasi yoziladi;
ikkinchi insonning shaxsiy statistikasi bu safar yangilanmaydi (kelajakda
kengaytirilishi mumkin).

## 6-BAND (xavfsizlik zanjiri sifatida shu bilan BIRGA kerak bo'lgani uchun oldindan qilindi)

Muammo: agar `isSeasonComplete()` BARCHA o'yinlar `played` bo'lishini
kutsa, bitta faol bo'lmagan foydalanuvchining pending o'yini butun liganing
mavsumini ABADIY to'xtatib qo'yardi. Yechim: `autoResolveStalePendingMatches()`
- har bir `advance-world-day`da BARCHA ligalarni tekshiradi, 15+ kun
(`PENDING_MATCH_CATCHUP_DAYS`) kutilgan pending o'yinlarni eski
`simulateHumanPlayerMatch` yo'li bilan foydalanuvchisiz hal qiladi va
foydalanuvchiga NIMA sodir bo'lgani + statistikasi bilan xabar qoldiradi
(`career.messages`, mavjud xabar shakli bilan bir xil: `{id, type:'club',
date, from, subject, body, read:false, resolved:true}`). Javobda
`autoResolvedPending` maydoni qo'shildi.

`SERVER_VERSION` 9 → 10.

## Frontend

- `src/career/utils/careerApi.js` - `fetchPendingMatchDetail()`,
  `submitMatchResult()` qo'shildi; `loadCareerFromServer()` endi
  `pendingWorldMatch`ni ham qaytaradi.
- `src/career/context/GameContext.jsx` - `pendingWorldMatch` state (dastlabki
  yuklashda VA har 20s pollingda yangilanadi) + `refreshPendingWorldMatch()`
  (natija yuborilgach 20s kutmasdan darhol yangilash uchun).
- YANGI `src/career/pages/WorldMatchPage.jsx` - pending o'yin tafsilotini
  oladi, foydalanuvchining O'Z o'yinchisini (`{id,name,pos,ovr,stamina}` -
  `engine.js` FAQAT shu maydonlarga qaraydi, `mainStats`ga tegmaydi) mos
  klubning world squadiga qo'shadi, `LiveMatch`ni server seedi bilan
  ko'rsatadi, tugagach `playerEventsMap`/`playerRatings`dan o'zining
  gol/assist/reyting/jarohatini ajratib serverga yuboradi.
- `src/career/pages/HomePage.jsx` - `pendingWorldMatch` mavjud bo'lsa, ANA
  SHU birinchi o'ringa qo'yiladi (mahalliy `matchdayNext`/`prepareMatchday`
  tizimidan OLDIN tekshiriladi) - ikkalasi bir-biriga bog'liq emas, shuning
  uchun 1-bosqichda topilgan klient/server kalendar siljishi bu yerda
  muammo tug'dirmaydi (server nima desa, shu amal qilinadi).

## Test

YANGI `tests/test_pending_match.js` - haqiqiy server (mock MongoDB) bilan:
foydalanuvchi klubi o'ynashi kerak bo'lgan kunda o'yin DARHOL emas, pending
(seed bilan) bo'lib qolishi; shu turdagi boshqa (NPC-only) o'yinlar
avvalgidek darhol hal bo'lishi; `/api/world-match-detail` to'g'ri seed va
ikkala klub squadini (20 va 13 nafar) qaytarishi; `/api/career/submit-match-
result`dan keyin standings/schedule/karyera statistikasi to'g'ri yozilishi
(goals=2, appearances=1, golA=3-golB=1); 15+ kun kutilgan pending o'yin
avtomatik hal qilinib, foydalanuvchiga statistikasi bilan xabar qoldirilishi.
15/15 OK.

Barcha oldingi test fayllari (`test_injury_and_aging`, `test_engine_aging`,
`test_seeded_rng`, `test_penalty_shootout`, `test_all_leagues_world`) qayta
ishga tushirildi - hammasi toza o'tdi. To'liq `react-scripts build` -
189.4 kB gzip, yangi eslint xatosi yo'q.

## Hali ochiq qolgan (keyingi bosqichlar uchun)

- 5-band (qayta tomosha): endi seed schedule'da saqlanadi, shuning uchun
  texnik asos tayyor, lekin "eski o'ynalgan world-match'ni qayta ochish"
  ekrani hali yozilmagan.
- Ikki inson bir-biriga qarshi o'ynagan pending o'yinda faqat BITTASI
  (birinchi submit qilgan) statistikasi yoziladi.
- Client/server kalendar siljishi (1-bosqichda topilgan) hali to'liq
  birlashtirilmagan - bu safar mahalliy tizimdan mustaqil ishlagani uchun
  pending-match oqimiga ta'sir qilmaydi, lekin umuman hal qilinishi kerak.

---

# 2026-09-19 (davomi #4) — 5-BAND: o'tgan o'yinlarni qayta tomosha qilish

## Nima qilindi

Endi 4-bosqichda o'yin `seed` bilan yozilgani tufayli, qayta tomosha uchun
texnik asos allaqachon tayyor edi. Yetishmayotgan yagona narsa: o'sha
o'yinda inson o'yinchi(lar) QAYSI klub tarkibida bo'lgani hech qayerda
saqlanmagani (`world.squads` faqat NPC'larni saqlaydi, inson faqat
LiveMatch ekranida vaqtinchalik qo'shiladi) - shuning uchun qayta tomosha
qilinsa, inson tarkibda YO'Q bo'lib, boshqa (asl o'ynalgandan farqli)
natija chiqishi mumkin edi.

**Server** (`server/index.js`, `/api/career/submit-match-result`): endi
o'yin `played:true` bo'lganda, shu ligadagi HAR IKKI klubning tarkibida
bo'lgan barcha inson o'yinchi(lar) (`db.users` bo'yicha qidirilib)
`m.humanEntries = [{side, id, name, pos, ovr}, ...]` sifatida yoziladi, va
`m.humanPlayed = true` belgilanadi (bu o'yin HAQIQATAN LiveMatch orqali
o'ynalgani, mavhum formula bilan emas, degan belgi). `m.seed` allaqachon
pending bosqichidan qolgan - o'chirilmaydi.

Yangi server endpoint SHART emas edi - `GET /api/world/:leagueId` da
`includeSquads=1` query parametri ALLAQACHON bor edi (avvalgi
bosqichlardan meros, ishlatilmagan holda), shunchaki `careerApi.js:
fetchWorld()`ga shu parametrni uzatish imkoniyati qo'shildi.

**Frontend:**
- `src/career/pages/LeagueBrowsePage.jsx` - `m.played && m.humanPlayed &&
  m.seed` bo'lgan har bir o'yin qatoriga "▶ Tomosha" tugmasi qo'shildi.
- YANGI `src/career/pages/MatchReplayPage.jsx` - bosilganda o'sha o'yinning
  `seed`i, `world.squads` (joriy - MUHIM ESLATMA pastda) va
  `m.humanEntries`dan qurilgan aniq tarkib bilan `LiveMatch`ni ochadi.
  Bu HAQIQIY qayta tomosha (yangi natija yozilmaydi, `onFinish` bo'sh).

**QASDDAN CHEKLANGAN QAMROV:** faqat `humanPlayed` (ya'ni LiveMatch orqali
haqiqatan o'ynalgan) o'yinlar qayta tomosha qilinadi - NPC-only o'yinlar
hech qachon minut-minut simulyatsiya qilinmagan (ular mavhum `simulateTeamMatch`
formulasi bilan hal qilingan), shuning uchun ularda "qayta ko'rsatiladigan"
haqiqiy voqea yo'q - "Tomosha" tugmasi ularda umuman ko'rinmaydi (chalkash
bo'lmasligi uchun, soxta animatsiya o'rniga).

**BILIB QO'YILGAN CHEKLOV (mavsum chegarasi):** `world.squads` joriy
holatni saqlaydi - agar o'yin O'TGAN mavsumdan bo'lsa va shu orada squad
qarigan/yangilangan bo'lsa, qayta tomosha ENDI boshqa (asl o'ynalgandan
farqli) tarkib bilan ishlaydi. JORIY mavsum ichidagi o'yinlar uchun bu
muammo emas (squad mavsum davomida o'zgarmaydi). To'liq tuzatish uchun har
bir o'yinga o'z paytidagi squad snapshotini saqlash kerak bo'ladi - bu
hajmni sezilarli oshiradi, shuning uchun hozircha amalga oshirilmadi.

## Test

YANGI `tests/test_match_replay.js` - haqiqiy server orqali bitta pending
o'yinni "o'ynatib" (submit-match-result), yozilgan `m.seed` va
`m.humanEntries`ni tekshiradi (1 ta inson yozilgan, to'g'ri `side`),
so'ngra ANA SHU ma'lumotlar bilan CLIENT tomonda (engine.js/rng.js)
mustaqil ikki marta qayta simulyatsiya qilib, ikkalasi AYNAN bir xil
natija berishini tasdiqlaydi (seed+squad determinizmi - `MatchReplayPage`
tayanadigan asosiy kafolat). 4/4 OK.

Barcha 7 test fayli (`test_injury_and_aging`, `test_engine_aging`,
`test_seeded_rng`, `test_penalty_shootout`, `test_all_leagues_world`,
`test_pending_match`, `test_match_replay`) qayta ishga tushirildi - hammasi
toza o'tdi. To'liq `react-scripts build` - 189.7 kB gzip, yangi xato yo'q.

SERVER_VERSION o'zgarmadi (10 da qoldi - bu qo'shimcha submit-match-result
javobiga YANGI maydon qo'shish, mavjud kontraktni buzmaydi).

---

# 2026-09-19 (davomi #5) — 6-band frontend tuzatishlari + 8-band: veteran pasayishi

## 6-band: server qo'shgan xabarlar/statistika clientga yetib bormasdi

`GameContext.jsx`ning 20 soniyalik pollingi FAQAT `lastMatchResult`ni
serverdan ko'chirardi. Ikkita real kamchilik topildi va tuzatildi:

1. **Xabarlar hech qachon ko'rinmasdi.** 15-kunlik avto-o'tkazish
   (oldingi bosqichda) foydalanuvchiga `career.messages`ga xabar
   qo'shadi, lekin poll bu maydonni umuman ko'chirmasdi - xabar
   `MessagesPage`da HECH QACHON chiqmasdi. Endi poll serverda bor,
   lekin lokal ro'yxatda yo'q xabarlarni (id bo'yicha) qo'shib qo'yadi.
2. **`WorldMatchPage`dan keyin statistika "stale" qolardi.** Foydalanuvchi
   o'z dunyodagi o'yinini o'ynab, natijani serverga yuborgandan keyin,
   lokal `player.career.goals/appearances` YANGILANMASDI (keyingi to'liq
   yuklashgacha eski sonlar ko'rinardi). Endi `submitMatchResult()`dan
   keyin bir xil o'sish (increment) `updatePlayer()` orqali lokal holatga
   ham qo'llaniladi.

## 8-band: inson o'yinchisi uchun 30+ yoshda pasayish

Tekshirildi: NPC futbolchilar uchun bu ALLAQACHON ishlaydi
(server/engine.js: ageAndRefreshSquad). Inson o'yinchi uchun ESA
`resolveVeteranProgression()` (statCalc.js) yozilgan edi, LEKIN hech
qayerda chaqirilmagan edi - shuning uchun 30+ yoshdagi past formadagi
inson o'yinchi CHEKSIZ yuqori qolib ketardi, hech qachon pasaymasdi.

`src/career/utils/season.js`ning `prepareNextDay()`sidagi tug'ilgan kun
(365 kunlik) tekshiruviga qo'shildi: yosh 30+ bo'lsa va so'nggi 10 o'yin
reytingining o'rtachasi 7.5dan past bo'lsa (NPC bilan BIR XIL chegara),
subStats/mainStats/overall har yili 1.0-2.0 ball pasayadi (clampStat
bilan), va "Age is catching up" degan xabar qoldiriladi. Yaxshi formadagi
(o'rtacha >7.5) veteranlar pasaymaydi. 30 yoshdan kichiklar bu tekshiruvga
umuman kirmaydi.

**QASDDAN AMALGA OSHIRILMAGAN QISM: majburiy pensiya.** Original
topshiriqda "MAJBURIY PENSIYA (juda keksa yoshda) borligini tekshir...
agar yo'q bo'lsa, foydalanuvchi bilan aniqlashtirilishi kerak" deyilgan
edi. Bu HAQIQATAN yo'q - va buni QASDDAN qilmadim, chunki bu foydalanuvchi
karyerasini SO'ZSIZ, avtomatik ravishda tugatadigan (ortga qaytarib
bo'lmaydigan) voqea - vazn jihatidan pasayishdan butunlay boshqa
toifadagi qaror. Buni amalga oshirishdan oldin: qaysi yoshda (NPC uchun
`randomRetireAge` odatda ~33-38 oralig'ida), va tugagach nima bo'lishi
kerak (yangi karyera boshlash so'raladimi, yoki shunchaki "pensiyaga
chiqdingiz" ekrani ko'rsatiladimi) - buni alohida so'rayman.

## Test

YANGI `tests/test_veteran_decline.js` - 4 stsenariy, 12 tekshiruv, 3 marta
ketma-ket ishga tushirilib BARQARORLIGI tasdiqlandi (avval bitta versiyasi
tasodifiy - "flaky" edi, sababi topildi va tuzatildi: agar tug'ilgan kun
aniq bir kunlik simulyatsiyaga TO'G'RI kelib, o'sha kunda tasodifiy o'yin
o'ynalsa, seedlangan test reytinglari haqiqiy o'yin natijasi bilan
ustidan yozilib ketardi - shuning uchun test endi `schedule: []` bilan
izolyatsiya qilinadi, bitta tug'ilgan kun tikligi hech qanday tasodifiy
o'yin bilan aralashmaydi):
1. 29→30 yosh, past forma (avg 6.48) → OVR pasaydi, xabar qoldi.
2. 29→30 yosh, yaxshi forma (avg 8.0) → OVR o'zgarmadi, xabar yo'q.
3. 24→25 yosh, past forma → 30dan yosh bo'lgani uchun pasaymadi.
4. 31 yoshdan boshlab 3 yil ketma-ket past forma → OVR har yili monoton
   pasaydi (masalan 75→74→72→71).

Barcha 8 test fayli (`test_injury_and_aging`, `test_engine_aging`,
`test_seeded_rng`, `test_penalty_shootout`, `test_all_leagues_world`,
`test_pending_match`, `test_match_replay`, `test_veteran_decline`) 3
marta qatorda qayta ishga tushirildi - hammasi barqaror, toza o'tdi.
To'liq `react-scripts build` - yangi xato/ogohlantirish yo'q.

---

# 2026-09-19 (davomi #6) — 8-band yakunlandi: majburiy pensiya

## Nima qilindi

Foydalanuvchi bergan ANIQ foizlar bo'yicha (o'zgartirilmadi/"to'g'irlanmadi"
- aynan aytilgan raqamlar ishlatildi):

| Yosh | Pensiya ehtimoli |
|---|---|
| 35 | 70% |
| 36 | 65% |
| 37 | 45% |
| 38 | 50% |
| 39-41 | 70% |
| 42-43 | 80% |
| 44 | 90% |
| 45+ | **100% (SHART, kafolatlangan)** |

`src/career/utils/statCalc.js` - `getRetirementChance(age)` qo'shildi.
`src/career/utils/season.js`ning tug'ilgan kun blokida (pasayish
tekshiruvidan KEYIN) - shu ehtimol bilan pensiya "tashlanadi". Chiqsa:

- `career.retired = true`, `career.retirementLegacy = {money, surname,
  retiredAge}` o'rnatiladi, "Retirement" xabari qoldiriladi.
- `prepareNextDay()` ENDI shu playerdan chaqirilsa, HECH NARSA qilmaydi
  (kun/o'yin/mashg'ulot to'xtaydi - karyera "muzlatiladi").

## Pensiyadan keyin: "<Familiya> Jr." (meros)

Foydalanuvchi so'ragan aniq oqim: pul meros bo'lib o'tadi, o'g'il sifatida
yangi karyera boshlanadi.

- YANGI `src/career/pages/RetirementPage.jsx` - yakuniy statistika
  (appearances/goals/assists/o'rtacha reyting/kubok/pul) va "▶ Start as
  `<Familiya> Jr.`" tugmasi. Bosilganda: `sessionStorage`ga
  `{surname, money, retiredAge}` yoziladi, `resetSave()` chaqiriladi
  (eski karyera o'chiriladi, klub ro'yxatidan chiqariladi), `/start`ga
  o'tiladi.
- `StartPage.jsx` - mount bo'lganda shu sessionStorage yozuvini o'qiydi:
  familiya maydoni oldindan `"<Familiya> Jr."` bilan to'ldiriladi, va
  `career.money` odatdagi 1000 o'rniga MEROS qilingan pul bilan
  boshlanadi. Yaratilgandan keyin sessionStorage tozalanadi. UI'da
  "Continuing the family legacy - inherited $X" degan oltin rangli
  yorliq ko'rsatiladi.
- `CareerApp.jsx` - `RequirePlayer` endi `player.career.retired` bo'lsa
  BOSHQA HECH QANDAY sahifaga (HomePage, Training va h.k.) kirishga
  ruxsat bermaydi, `/retirement`ga yo'naltiradi. Yangi `RequireRetired`
  guardi - agar karyera retired bo'lmasa yoki umuman yo'q bo'lsa,
  `/retirement`ning o'zi ham mos yerga qaytaradi.

**BILIB QO'YILGAN CHEKLOV:** agar pensiyaga chiqish PAYTIDA foydalanuvchida
umumiy dunyodan `pendingWorldMatch` (4-band) bo'lib qolgan bo'lsa - bu
alohida hal qilinmadi (kamdan-kam holat: yiliga bir marta, 35 yoshdan
boshlab 30-90% ehtimol; 15-kunlik avto-o'tkazish (6-band) baribir uni
oxir-oqibat tozalaydi, shuning uchun butunlay osilib qolmaydi).

## Test

YANGI `tests/test_forced_retirement.js` - 18 tekshiruv:
1. 44→45 yosh - 10 marta ketma-ket, HAR SAFAR albatta pensiyaga chiqadi
   (100% - tasodifga bog'liq emasligi tasdiqlandi).
2. 34→35 yosh - 34 yoshning o'zida (35dan past) ehtimol yo'qligi.
3. Meros (`retirementLegacy.money/surname/retiredAge`) aniq saqlanishi.
4. Pensiyaga chiqgach karyera to'liq muzlashi (3 marta `advanceOneDay`
   chaqirilsa ham kun/sana O'ZGARMAYDI).
5. 35 yoshda statistik ehtimol - 500 urinishda kuzatilgan chastota 69.4%
   (kutilgan 70%ga juda yaqin, 60-80% oralig'ida).

Barcha 9 test fayli (`test_injury_and_aging`, `test_engine_aging`,
`test_seeded_rng`, `test_penalty_shootout`, `test_all_leagues_world`,
`test_pending_match`, `test_match_replay`, `test_veteran_decline`,
`test_forced_retirement`) qayta ishga tushirildi - hammasi toza o'tdi.
To'liq `react-scripts build` - 191.2 kB gzip, yangi xato/ogohlantirish
yo'q (barchasi oldindan bor edi).

## LOYIHA TOPSHIRIG'I BO'YICHA UMUMIY HOLAT

| Band | Holat |
|---|---|
| 0. Build blokeri | ✅ Tuzatildi |
| 1. Jarohat bug'i + yosh | ✅ Tuzatildi |
| 2. Barcha ligalar avtomatik | ✅ Tayyor |
| 3. Admin roli aniqlashtirish | ✅ Tasdiqlandi (1 kun = 1 bosish) |
| 4. Foydalanuvchi o'z o'yinini o'ynashi | ✅ Tayyor (real quick-play) |
| 5. O'yinlarni qayta ko'rish | ✅ Tayyor (humanPlayed o'yinlar uchun) |
| 6. 15 kun orqada qolish - avto-o'tkazish | ✅ Tayyor + frontendga ulandi |
| 7. Kuboklar serverga | ⏳ Hali qilinmadi (katta, alohida ish) |
| 8. Futbolchi yoshi/pensiyasi | ✅ To'liq tugallandi (pasayish + majburiy pensiya) |

Yagona qolgan katta ish - **7-band** (kuboklarni client-side'dan
server-side umumiy dunyoga ko'chirish, admin bir tugma bilan liga+kubokni
birga surishi uchun).

---

# 2026-09-19 (davomi #7) — 7-BAND: server-side domestic kubok (YAKUNIY BOSQICH)

## Qamrov (qasddan cheklangan)

Faqat **domestic kubok** (bitta liga ichidagi klublar orasida) serverga
ko'chirildi. **Kontinental kubok** (Champions League uslubidagi) AVVALGIDEK
client-local (`season.js`) holida qoladi - u bir nechta MAMLAKAT/LIGA
klublaridan yig'ilgan pool talab qiladi, bu butunlay boshqa (ancha katta)
integratsiya bo'lardi. Bu qasddan qilingan, ochiq e'lon qilingan cheklov.

## Server: `server/engine.js` — kubok bracket dvijogi

YANGI funksiyalar: `pairUpForKnockout` (toq son bo'lsa "bye"), `buildCupRound`,
`initDomesticCup` (mavsum boshida 1-turni yaratadi), `isCupRoundComplete`,
`buildNextCupRound` (oldingi tur g'oliblaridan keyingi turni yaratadi -
keyingi turlar OLDINDAN emas, faqat oldingisi tugagach dinamik generatsiya
qilinadi, chunki g'oliblar oldindan noma'lum).

## Server: `server/index.js`

- `ensureWorldForLeague` - har bir yangi (yoki migratsiya qilinayotgan eski)
  world uchun `world.cup = engine.initDomesticCup(...)` qo'shildi.
- `rolloverSeason` - yangi mavsum uchun yangi kubok yaratiladi.
- YANGI `resolveCupRoundForLeague(db, leagueId, newDate)` - AYNAN league
  bilan bir xil pending/auto-resolve mantig'i: insonli o'yin "pending"
  bo'lib qoladi (seed bilan, LiveMatch orqali o'ynash uchun), NPC-only
  o'yin darhol hal bo'ladi. Farqi: STANDINGS o'rniga G'OLIB kerak - durang
  bo'lsa, `teamStrength`ga tortishilgan tasodifiy tiebreak (NPC-only
  o'yinlar uchun serverda ko'rinmas holda; inson o'zi o'ynasa - pastga
  qarang, JONLI penalti seriyasi). Tur to'liq tugagach, DARHOL keyingi
  turni yaratadi yoki (1 g'olib qolsa) chempionni toj kiyadi: `career.
  trophies`ga yozadi, "Champions: <nom>!" xabari qoldiradi. `advance-
  world-day`da bu funksiya HAR bir liga uchun, league matchdayidan
  MUSTAQIL (kubok kunlari ligadan boshqa sanalarda) chaqiriladi.
- `findPendingMatchForUser` - endi kubokni ham tekshiradi
  (`competition:'cup'|'league'` bilan belgilab).
- `/api/world-match-detail` va `/api/career/submit-match-result` -
  `competition` asosida ikkiga (`world.schedule` vs `world.cup.rounds`)
  tarmoqlanadi. Kubokda: `topScorers`ga tegilmaydi, `standings`ga
  tegilmaydi, o'rniga `winnerId` va bracket kaskadi (keyingi tur/chempion).

**MUHIM TUZATISH (test paytida topildi):** `autoResolveStalePendingMatches`
(6-band, 15 kunlik xavfsizlik zanjiri) DASTLAB faqat `world.schedule`ni
(league) tekshirardi - kubok pending o'yinlari BU YERGA umuman kirmasdi!
Demak bitta o'ynalmagan kubok o'yini o'sha BUTUN turni (demak, boshqa
hamma klublarning kubokdagi taraqqiyotini ham) ABADIY to'xtatib qo'yardi.
Bu funksiya endi kubok uchun ham (bir xil 15 kunlik chegara, avtomatik
hal qilish, "Kubokda avtomatik o'tkazildi" xabari, va bracket kaskadi
bilan) ishlaydi.

**Penalti seriyasi (3-band bilan integratsiya):** kubokda durang bo'lishi
mumkin emas. `WorldMatchPage.jsx` endi kubok fiksturalarida
`shootoutOnDraw={true}` beradi - foydalanuvchi durang holatda penalti
seriyasini JONLI ko'radi (avval bu umuman yo'q edi, kubok o'yinlari
oddiy ochiq durang bilan yuborilib, server "uy jamoasi g'olib" deb
ADOLATSIZ hal qilardi). Client `result.penWinner`dan aniq g'olib klub
ID'sini (`penWinnerClubId`) serverga yuboradi, server buni tiebreakdan
USTUN qo'yadi.

`SERVER_VERSION` 10 → 11.

## Frontend

- `src/career/pages/WorldMatchPage.jsx` - AYNAN o'zgarishsiz umumiy
  ishladi (competition-agnostik yozilgan edi) - faqat `shootoutOnDraw` va
  `penWinnerClubId` qo'shildi.
- `src/career/pages/LeagueBrowsePage.jsx` - YANGI kubok bo'limi: bracket
  tur-tur ko'rsatiladi (Prev/Next), g'olib **qalin** harf bilan
  ajratiladi, "bye" alohida belgilanadi, penalti bilan tugagan o'yinlar
  "(pen.)" bilan, chempion banner, va `humanPlayed` o'yinlar uchun
  "▶ Tomosha" (5-band bilan integratsiya - qayta tomosha kubok o'yinlarida
  ham ishlaydi).
- `HomePage.jsx`, `AdminPanel.jsx` - tugma/tavsif matnlari kubokni ham
  aks ettiradigan qilib yangilandi.

## Test

YANGI `tests/test_domestic_cup.js` (10 tekshiruv) - MUHIM TARTIB BILAN:
avval katta liga (la_liga, 20 klub)da inson o'yinchi (real_madrid) HAR
turda yutib borib, oxir-oqibat "Spain Cup" CHEMPIONI bo'lishi (trophy +
xabar bilan) tasdiqlanadi, FAQAT SHUNDAN KEYIN kichik liga (3 klub)ning
kuzatuvsiz (NPC-only) to'liq avtomatik tugashi tekshiriladi. **Test
yozishda o'zi topilgan muhim narsa:** `advance-world-day` BARCHA 21
liganing hammasini BIRGA suradi, shuning uchun agar kichik liga testi
AVVAL 80 kun kuzatuvsiz ishlab tursa, katta liganing insoni ham o'sha
kunlar davomida "kuzatuvsiz" qolib, uning pending o'yinlari 15-kunlik
xavfsizlik zanjiri tomonidan TASODIFIY hal qilinib (va ehtimol yutqazib,
kubokdan chiqarib yuborilib) ketardi - bu ANIQ shunday sodir bo'lganini
kuzatib, test tartibini (avval inson-boshqaradigan, keyin kuzatuvsiz)
almashtirib tuzatdim.

YANGI `tests/test_cup_catchup.js` (5 tekshiruv) - yuqorida topilgan
xatoni maxsus sinaydi: kubok pending o'yini ATAYLAB 20 kun o'ynalmay
qoldiriladi, 15-kunlik chegaradan o'tgach AVTOMATIK hal qilinishi,
foydalanuvchiga xabar qoldirilishi, va ENG MUHIMI - bracket ABADIY
to'xtab qolmasdan (keyingi tur yaratilib) davom etishi tasdiqlanadi.

Barcha 11 test fayli (`test_injury_and_aging`, `test_engine_aging`,
`test_seeded_rng`, `test_penalty_shootout`, `test_all_leagues_world`,
`test_pending_match`, `test_match_replay`, `test_veteran_decline`,
`test_forced_retirement`, `test_domestic_cup`, `test_cup_catchup`) qayta
ishga tushirildi - hammasi toza o'tdi. To'liq `react-scripts build` -
191.6 kB gzip, yangi xato yo'q.

---

# LOYIHA TO'LIQ YAKUNLANDI

| Band | Holat |
|---|---|
| 0. Build blokeri | ✅ |
| 1. Jarohat bug'i + yosh | ✅ |
| 2. Barcha ligalar avtomatik | ✅ |
| 3. Admin roli + seedlangan RNG + penalti | ✅ |
| 4. Foydalanuvchi o'z o'yinini o'ynashi | ✅ |
| 5. O'yinlarni qayta ko'rish | ✅ |
| 6. 15 kun orqada qolish - avto-o'tkazish | ✅ |
| 7. Domestic kubok serverga (kontinental - client-local qoldi) | ✅ |
| 8. Futbolchi yoshi/pensiyasi (pasayish + majburiy pensiya) | ✅ |

Barcha 8 band bajarildi. 11 ta test fayli, jami 100+ tekshiruv, hammasi
toza o'tadi. `SERVER_VERSION = 11`. Deploy uchun tayyor.
