// ---------------------------------------------------------------------------
// Serverga tegishli maydonlarni (mukofotlar, terma jamoa, kubok satrlari)
// serverdan kelgan nusxadan lokal o'yinchiga BIRLASHTIRISH.
// GameContext'dagi 20 soniyalik poll shuni ishlatadi - shunda Ballon d'Or,
// Golden Boot, Team of the Season va terma jamoa kubogi sahifani qayta
// ochmasdan ham Profile'da paydo bo'ladi, va keyingi avto-saqlash ularni
// serverdan o'chirib yubormaydi.
// Hech narsa o'zgarmasa AYNAN `prev` qaytariladi (ortiqcha saqlashlar bo'lmasin).
// server/careerMerge.js bilan bir xil mantiq.
// ---------------------------------------------------------------------------
const awardKey = (a) => `${a.type}|${a.season}|${a.league}`;
const trophyKey = (t) => (typeof t === 'string' ? t : `${t?.name}|${t?.year}`);

function missing(local, remote, keyFn) {
  const have = new Set((local || []).map(keyFn));
  return (remote || []).filter((x) => !have.has(keyFn(x)));
}

export function mergeServerHonours(prev, serverPlayer) {
  if (!prev || !serverPlayer?.career || serverPlayer.id !== prev.id) return prev;
  const pc = prev.career || {};
  const sc = serverPlayer.career;

  const newAwards = missing(pc.awards, sc.awards, awardKey);
  const newTrophies = missing(pc.trophies, sc.trophies, trophyKey);
  const intlChanged = !!sc.international && JSON.stringify(sc.international) !== JSON.stringify(pc.international || null);

  if (!newAwards.length && !newTrophies.length && !intlChanged) return prev;

  const career = { ...pc };
  if (newAwards.length) career.awards = [...(pc.awards || []), ...newAwards];
  if (newTrophies.length) career.trophies = [...(pc.trophies || []), ...newTrophies];
  if (intlChanged) career.international = sc.international;
  return { ...prev, career };
}
