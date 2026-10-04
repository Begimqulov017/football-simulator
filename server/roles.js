// ============================================================
// PHASE 10 — ROLLAR VA JAZO (mute / suspend) YORDAMCHILARI
// ============================================================
// Rollar: 'user' < 'moderator' < 'admin'.
// `isAdmin` maydoni eski kod bilan mosligi uchun saqlanadi va HAR DOIM
// role === 'admin' bilan bir xil bo'lib turadi (setRole() shuni kafolatlaydi).
const ROLES = ['user', 'moderator', 'admin'];

function roleOf(u) {
  if (!u) return 'user';
  if (u.isAdmin) return 'admin';
  return u.role === 'moderator' ? 'moderator' : 'user';
}

function setRole(u, role) {
  u.role = role;
  u.isAdmin = role === 'admin';
  // admin va moderator Career ilovasiga (chat/admin panel shu yerda) kira olishi kerak
  if (role === 'admin' || role === 'moderator') u.canAccessPro = true;
}

const isStaff = (u) => roleOf(u) !== 'user';

// Mute: `mutedUntil` — ISO sana; "doimiy" mute uchun uzoq kelajak sanasi.
const FOREVER = '9999-12-31T00:00:00.000Z';
function isMuted(u, now = Date.now()) {
  return !!u?.mutedUntil && new Date(u.mutedUntil).getTime() > now;
}

// Foydalanuvchi holatining qisqa (frontend uchun) ko'rinishi
function moderationView(u) {
  return {
    role: roleOf(u),
    suspended: u.suspended ? { at: u.suspended.at, by: u.suspended.by, reason: u.suspended.reason || '' } : null,
    muted: isMuted(u) ? { until: u.mutedUntil, forever: u.mutedUntil === FOREVER, reason: u.muteReason || '' } : null,
  };
}

module.exports = { ROLES, FOREVER, roleOf, setRole, isStaff, isMuted, moderationView };
