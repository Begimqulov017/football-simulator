# DEPLOY QO'LLANMASI — Football Career Online

Ilova ikki qismdan iborat va **ikki xil joyga** deploy qilinadi:

| Qism | Papka | Qayerga | Nima qiladi |
|---|---|---|---|
| Frontend | loyiha ildizi (`src/`, `public/`) | **Netlify** | Brauzerdagi React ilovasi |
| Backend | `server/` | **Render** | Login/parol, karyera saqlanmasi, umumiy dunyo |

> **TARTIB MUHIM:** avval **backend**, keyin **frontend**.
> Frontend'dagi `REQUIRED_SERVER_VERSION = 8` eski backend'ni aniqlab,
> foydalanuvchiga "backend hali yangilanmagan" degan xabar chiqaradi. Agar
> teskari tartibda qilsangiz, backend deploy bo'lguncha ilova ishlamaydi.

---

## 0. Tayyorgarlik — GitHub

Netlify ham, Render ham GitHub'dagi repodan o'qiydi.

```bash
cd football-career-online       # zip'dan chiqqan `app` papkasi
git init                        # agar repo hali yo'q bo'lsa
git add .
git commit -m "v9: NPC lifecycle + national teams"
git remote add origin https://github.com/<sizning-useringiz>/<repo>.git
git push -u origin main
```

Agar repo allaqachon bor bo'lsa — shunchaki `git add . && git commit && git push`.

`.gitignore` allaqachon `server/data/`ni chetlab o'tadi — parollar va baza
GitHub'ga **tushmaydi**. Bu to'g'ri; Render o'z diskida o'z bazasini yuritadi.

---

## 1. BACKEND → Render

### 1.1. Servis yaratish

Render dashboard → **New → Web Service** → GitHub repongizni tanlang.

Sozlamalar:

| Maydon | Qiymat |
|---|---|
| Name | `football-career-api` (ixtiyoriy) |
| Root Directory | `server` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/api/meta` |

> Repoda `render.yaml` ham bor — **New → Blueprint** orqali shu faylni tanlasangiz
> hamma narsa avtomatik sozlanadi.

### 1.2. ⚠️ BAZANI SAQLAB QOLISH (eng muhim qadam)

Render'da ilova papkasi **efemer** — har bir deploy va har bir restart'da
build image'dan qayta yoziladi. Ya'ni standart holatda `server/data/db.json`
(**barcha foydalanuvchilar, parollar, karyeralar, umumiy dunyo, terma jamoa
tarixi**) har deploy'da **butunlay yo'qoladi**.

Buni hal qilish uchun `server/db.js` endi `DATA_DIR` muhit o'zgaruvchisini
qo'llab-quvvatlaydi.

**Render'da:**
1. Servis → **Disks** → **Add Disk**
   - Name: `football-data`
   - Mount Path: `/var/data`
   - Size: 1 GB
2. Servis → **Environment** → **Add Environment Variable**
   - Key: `DATA_DIR`
   - Value: `/var/data`

Shundan keyin baza diskda turadi va deploy'lar orasida saqlanadi.

> **Disk Render'ning pullik rejasida** (eng arzoni ~$7/oy). Bepul rejada disk
> yo'q. Agar hozircha bepul rejada qolsangiz — ilova ishlaydi, lekin **har
> deploy/restart'dan keyin hamma ro'yxatdan qaytadan o'tishi kerak bo'ladi** va
> umumiy dunyo noldan boshlanadi. Uzoq muddatli o'yin uchun bu yaramaydi.

### 1.3. Tekshirish

Deploy tugagach, Render bergan manzilni oching:

```
https://<sizning-servisingiz>.onrender.com/api/meta
```

Shunday javob kelishi kerak:

```json
{"ok":true,"serverVersion":8,"userCount":1,"maxUsers":10,"registrationOpen":true}
```

`"serverVersion":8` ekanini albatta tasdiqlang. Agar 6 yoki 7 chiqsa — eski kod
deploy bo'lgan, Render'da **Manual Deploy → Clear build cache & deploy** qiling.

Bu manzilni nusxa oling — keyingi qadamda kerak bo'ladi.

---

## 2. FRONTEND → Netlify

### 2.1. Sayt yaratish

Netlify → **Add new site → Import an existing project** → GitHub repongiz.

Build sozlamalari repodagi `netlify.toml` faylidan avtomatik olinadi:
- Build command: `npm run build`
- Publish directory: `build`

### 2.2. Backend manzilini ko'rsatish (majburiy)

**Site configuration → Environment variables → Add a variable:**

| Key | Value |
|---|---|
| `REACT_APP_API_BASE_URL` | `https://<sizning-servisingiz>.onrender.com` |

Oxirida **slash qo'ymang** (`.../` emas, `.com`).

> Loyihadagi `.env` faylida `https://football-simulator-server.onrender.com` yozilgan — bu faqat lokal
> ishlash uchun. Netlify'dagi muhit o'zgaruvchisi undan ustun turadi, shuning
> uchun `.env`ni o'zgartirish shart emas.

### 2.3. Deploy

**Deploy site** tugmasini bosing. Muhit o'zgaruvchisini keyin qo'shsangiz —
**Deploys → Trigger deploy → Clear cache and deploy site** qiling, chunki CRA
muhit o'zgaruvchilarini build paytida kodga "qotirib" yozadi.

---

## 3. Yakuniy tekshiruv (shu tartibda)

1. Netlify manzilini oching → ro'yxatdan o'ting yoki admin bilan kiring
   (`Begimqulov017` / `beg1mqulov.011`).
2. **Birinchi ish: admin parolini o'zgartiring** (pastga qarang).
3. Football Career Online → futbolchi yarating.
4. Admin panel → **"Kunni o'tkazish"** tugmasini bir necha marta bosing.
5. Home sahifasida "Yangi natija tayyor" banneri chiqishi kerak.
6. **National Team** sahifasini oching — tarkib ko'rinishi kerak.
7. Brauzerni yangilang — karyera saqlanib qolgan bo'lishi kerak (server'dan
   o'qiydi).

---

## 4. Bilib qo'yish kerak bo'lgan narsalar

### 4.1. Render bepul rejada "uxlaydi"
15 daqiqa faolliksiz turgan servis to'xtaydi; keyingi so'rov **30-60 soniya**
kutadi. Frontend buni "Serverga ulanib bo'lmadi" deb ko'rsatishi mumkin —
ikkinchi urinishda ishlaydi. Yechim: pullik reja, yoki har 10 daqiqada
`/api/meta`ni chaqiruvchi tashqi "uptime" xizmati.

### 4.2. Admin paroli ochiq matnda saqlanadi
`server/index.js` ichida `ADMIN_PASSWORD` kodda yozilgan va admin panelida
barcha parollar ochiq ko'rinadi. Bu do'stlar orasidagi kichik loyiha uchun
qilingan, lekin **internetga ochiq saytda xavfli**. Eng kami:
`ADMIN_PASSWORD`ni o'zgartirib, kodni qayta deploy qiling. Kelajakda bu
qiymatni ham muhit o'zgaruvchisiga chiqarish kerak.

### 4.3. Kunni kim o'tkazadi
Umumiy dunyo **faqat admin "Kunni o'tkazish" tugmasini bosganda** oldinga
siljiydi. Avtomatik emas. Agar har kuni avtomatik siljishini xohlasangiz — bu
alohida ish (Render Cron Job + maxsus `CRON_SECRET` bilan himoyalangan
endpoint). Hozircha qilinmagan.

### 4.4. Baza hajmi
`db.json` endi ancha kattaroq: har bir faol liga uchun ~20 klub × ~20 futbolchi
tarkibi, mavsum jadvali, xalqaro turnirlar. Bir necha liga faol bo'lsa bir necha
MB bo'ladi. 1 GB disk juda yetarli, lekin `db.js` har so'rovda butun faylni
o'qib-yozadi — foydalanuvchilar soni ancha oshsa, haqiqiy DB'ga (Postgres)
o'tish kerak bo'ladi. `db.js`dagi `readDB`/`writeDB` shu maqsadda ataylab
ajratib qo'yilgan — faqat shu ikki funksiyani almashtirish kifoya.

### 4.5. CORS
Server hozir `cors()` bilan **hamma domenga** ochiq. Netlify domeningiz
ma'lum bo'lgach, `server/index.js`da uni cheklash tavsiya etiladi:
```js
app.use(cors({ origin: 'https://<sizning-saytingiz>.netlify.app' }));
```

---

## 5. Keyingi deploy'lar

Kod o'zgartirganda:

```bash
git add . && git commit -m "..." && git push
```

Ikkalasi ham avtomatik qayta deploy bo'ladi.

**Esda tuting:** `server/index.js` yoki `server/engine.js` o'zgarsa —
`SERVER_VERSION` (server/index.js) va `REQUIRED_SERVER_VERSION`
(src/career/utils/careerApi.js) ni **birga oshiring**, va **avval backend**
deploy bo'lishini kuting.
