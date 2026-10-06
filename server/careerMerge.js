// ---------------------------------------------------------------------------
// Serverga tegishli maydonlarni (mukofotlar, terma jamoa, kubok satrlari)
// klientning yangi saqlanmasi bilan BIRLASHTIRISH.
//
// /api/career/save da klient yuborgan `incoming` nusxasi serverda yozilgan
// (awards.js, globalAwards.js, international.js) ma'lumotlarning ustidan
// yozib yubormasligi kerak. Shuning uchun serverdagi `stored` nusxadan
// yetishmayotgan mukofot/kubok/terma jamoa ma'lumoti `incoming` ga qo'shiladi.
//
// src/career/utils/honoursSync.js bilan bir xil mantiq (faqat yo'nalishi teskari).
// Hech narsa o'zgarmasa AYNAN `incoming` qaytariladi.
// ---------------------------------------------------------------------------
const awardKey = (a) => `${a && a.type}|${a && a.season}|${a && a.league}`;
const trophyKey = (t) => (typeof t === 'string' ? t : `${t && t.name}|${t && t.year}`);

function missing(local, remote, keyFn) {
  const have = new Set((local || []).map(keyFn));
  return (remote || []).filter((x) => !have.has(keyFn(x)));
}

/**
 * @param {object|null} stored   serverda hozir saqlangan o'yinchi (target.careerSave)
 * @param {object} incoming      klient yuborgan yangi o'yinchi
 * @returns {object}             birlashtirilgan o'yinchi
 */
function mergeServerOwnedFields(stored, incoming) {
  if (!incoming) return incoming;
  // Serverda hali karyera yo'q yoki boshqa (yangi) karyera - birlashtirish kerak emas.
  if (!stored || !stored.career || stored.id !== incoming.id) return incoming;

  const sc = stored.career;
  const ic = incoming.career || {};

  const newAwards = missing(ic.awards, sc.awards, awardKey);
  const newTrophies = missing(ic.trophies, sc.trophies, trophyKey);
  const intlChanged = !!sc.international && JSON.stringify(sc.international) !== JSON.stringify(ic.international || null);

  if (!newAwards.length && !newTrophies.length && !intlChanged) return incoming;

  const career = { ...ic };
  if (newAwards.length) career.awards = [...(ic.awards || []), ...newAwards];
  if (newTrophies.length) career.trophies = [...(ic.trophies || []), ...newTrophies];
  // Terma jamoa ma'lumotini faqat server yuritadi - serverdagi nusxa ustun.
  if (intlChanged) career.international = sc.international;
  return { ...incoming, career };
}

module.exports = { mergeServerOwnedFields };
