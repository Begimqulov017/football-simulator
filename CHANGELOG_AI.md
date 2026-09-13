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
