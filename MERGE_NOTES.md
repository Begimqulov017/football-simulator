# Phase 13 — top-5 liga haqiqiy ma'lumotlari, `nat`, terma jamoa + server tuzatishi

`football-simulator-phase12.zip` ustiga ochiladi (loyiha ildizida, "ustidan yozish").

## MUHIM (tartib bilan)
1. **`server/index.js` ni TO'LIQ almashtiring** (qo'lda qirqib qo'shmang). Unda `mergeServerOwnedFields` ichiga joylangan,
   shuning uchun `require('./careerMerge')` va `server/careerMerge.js` kerak emas (o'chirib tashlasangiz bo'ladi).
2. **Backend'ni deploy qiling, so'ng admin panelidan "Wipe Data" qiling.** Jamoa id'lari va futbolchilar o'zgargan
   (inter, milan, como, elche, hamburger_sv yangi; inter_milan, ac_milan, las_palmas, holstein_kiel yo'q), eski world bilan aralashmaydi.
   Wipe qilinmaguncha dunyo siljimaydi va aniq xabar chiqadi. DIQQAT: Wipe Data barcha foydalanuvchilarni (admindan tashqari) o'chiradi.
3. Data fayllar client va server uchun BIR XIL: `src/data/*` va `server/gamedata/*` (teamsData, leaguesData, nationsData).
