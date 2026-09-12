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
