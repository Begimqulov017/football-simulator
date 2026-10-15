// Ilova ochilgach serverdan creator ma'lumotining versiyasini so'raydi. Versiya o'zgargan bo'lsa yangi nusxani saqlab,
// sahifani BIR MARTA qayta yuklaydi (shunda barcha ro'yxatlar/logotiplar yangi ma'lumot bilan quriladi).
import { API_BASE } from '../career/utils/careerApi';
import { readCustomCache, writeCustomCache } from './customData';

export function syncCustomData() {
  const cached = readCustomCache();
  const have = cached ? cached.version || 0 : 0;
  fetch(`${API_BASE}/api/data/custom?v=${have}`)
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (!d || !d.ok || d.unchanged || d.version === have) return;
      writeCustomCache(d);
      let guard = null;
      try { guard = sessionStorage.getItem('fpcs_custom_reload'); } catch (e) { /* ignore */ }
      if (guard === String(d.version)) return; // bir xil versiya uchun ikkinchi marta qayta yuklamaymiz
      try { sessionStorage.setItem('fpcs_custom_reload', String(d.version)); } catch (e) { /* ignore */ }
      window.location.reload();
    })
    .catch(() => { /* server uxlab yotgan bo'lishi mumkin - keshdagi nusxa bilan ishlayveramiz */ });
}
