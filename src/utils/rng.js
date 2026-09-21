// ---------------------------------------------------------------------------
// SEEDLANGAN RNG — "quick play" dvijogi (engine.js + LiveMatch.jsx) endi
// to'g'ridan-to'g'ri Math.random() chaqirmaydi, balki shu yerdagi rand()ni
// chaqiradi. Odatda rand() = haqiqiy Math.random() (tezkor o'yin/turnirlar
// avvalgidek tasodifiy qoladi). Lekin setSeed(seed) chaqirilgandan keyin
// rand() DETERMINISTIK bo'lib qoladi — bir xil seed bilan boshlangan o'yin
// har doim AYNAN bir xil natija bilan tugaydi.
//
// Bu quyidagilarni ta'minlaydi (2/4/5-band):
//   - Umumiy dunyodagi o'yinning natijasi kim ochib ko'rsa ham bir xil.
//   - "Qayta tomosha" - o'sha seedni saqlab, o'yinni boshidan qayta ishga
//     tushirish orqali ishlaydi (statistika/animatsiya bilan birga).
//
// Algoritm: mulberry32 - kichik, tez, standart PRNG (kripto emas, lekin bu
// yerda kripto shart emas - faqat takrorlanuvchan tasodif kerak).
// ---------------------------------------------------------------------------

let seededNext = null; // null bo'lsa -> haqiqiy Math.random ishlatiladi

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// String yoki sonli seedni 32-bitli butun songa aylantiradi (oddiy hash).
function normalizeSeed(seed) {
  if (typeof seed === 'number') return seed >>> 0;
  const str = String(seed);
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function setSeed(seed) {
  seededNext = mulberry32(normalizeSeed(seed));
}

export function clearSeed() {
  seededNext = null;
}

export function isSeeded() {
  return seededNext !== null;
}

// engine.js va LiveMatch.jsx BUTUN Math.random() o'rniga shuni chaqiradi.
export function rand() {
  return seededNext ? seededNext() : Math.random();
}

// Yangi, mustaqil o'yin uchun tasodifiy (lekin qayta tomosha qilsa bo'ladigan)
// seed generatsiya qiladi - qayta tomosha uchun ANIQ shu qiymat saqlanishi
// kerak.
export function generateSeed() {
  return Math.floor(Math.random() * 0xFFFFFFFF);
}
