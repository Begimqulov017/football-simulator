// Mirrors the server's validation (server/index.js: /api/register) so people
// get instant feedback instead of a round-trip. The server stays the source of
// truth — these only pre-empt its messages.
export const MIN_USERNAME = 3;
export const MIN_PASSWORD = 4;

export function validateUsername(v) {
  const s = v.trim();
  if (!s) return 'Loginni kiriting';
  if (s.length < MIN_USERNAME) return `Login kamida ${MIN_USERNAME} belgidan iborat bo'lishi kerak`;
  return '';
}

export function validatePassword(v) {
  if (!v) return 'Parolni kiriting';
  if (v.length < MIN_PASSWORD) return `Parol kamida ${MIN_PASSWORD} belgidan iborat bo'lishi kerak`;
  return '';
}

// The server answers with a single Uzbek sentence. Route it to the field it is
// about so the red state appears on the right input; anything else (network
// failure, "no slots left", ...) stays a form-level banner.
export function routeServerError(res) {
  const msg = res?.error || "Noma'lum xatolik";
  if (res?.networkError) return { form: msg };
  const low = msg.toLowerCase();
  if (low.startsWith('parol')) return { password: msg };
  if (low.includes('login')) return { username: msg };
  return { form: msg };
}

// 0-4 score for the register strength meter (client-side hint only).
export function passwordStrength(p) {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 4) s++;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
  else if (/\d/.test(p) && p.length >= 6) s++;
  return Math.min(s, 4);
}
