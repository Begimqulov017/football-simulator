# Tuzatish paketi — karyera yo'qolishi + boshlang'ich reyting/potential

Oldingi `football-simulator-phases-9-10.zip` ustiga ochiladi (loyiha ildizida, "ustidan yozish").

1. `server/index.js` — Wipe Data'dan keyin yaratilgan YANGI karyera qabul qilinadi (eskirgan nusxa hamon rad etiladi).
2. `src/career/context/GameContext.jsx` — poll hali saqlanmagan karyerani o'chirmaydi; wipe konfliktini to'g'ri hal qiladi.
3. `src/career/utils/playerGen.js` — reyting min 67 (67–73), potential min 80 (80–90).
4. `tests/test_phase9_10_integration.js` — wipe/yangi karyera uchun 4 ta yangi tekshiruv (jami 41).
5. `docs/PHASES.md` — o'zgarishlar yozildi.

Backend'ni ham qayta deploy qiling (server/index.js o'zgargan).
