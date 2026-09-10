// ============================================================
// AUTH FACADE
// ============================================================
// Ilovaning qolgan qismi (App.jsx, LoginPage, RegisterPage, ProSimulatorPage)
// FAQAT shu fayldagi funksiyalarni import qiladi (`from '../utils/auth'`) —
// ular qaysi adapter ishlatilayotganini bilmaydi ham, bilishi ham shart emas.
//
// Hozircha faol adapter — `localStorageAdapter` (frontend-simulyatsiya,
// haqiqiy backend emas — batafsili shu fayl ichida yozilgan).
//
// KELAJAKDA HAQIQIY BACKENDGA O'TISH UCHUN:
//   import firebaseAdapter from './firebaseAdapter';
//   const activeAdapter = firebaseAdapter;
// — shu ikki qatorni almashtirish kifoya, boshqa hech narsani o'zgartirish
// shart emas (metod nomlari bir xil bo'lishi kerak).
import localStorageAdapter from './localStorageAdapter';

const activeAdapter = localStorageAdapter;

export const getAllUsers = (...args) => activeAdapter.getAllUsers(...args);
export const getUserCount = (...args) => activeAdapter.getUserCount(...args);
export const isRegistrationOpen = (...args) => activeAdapter.isRegistrationOpen(...args);
export const isAdmin = (...args) => activeAdapter.isAdmin(...args);
export const registerUser = (...args) => activeAdapter.registerUser(...args);
export const loginUser = (...args) => activeAdapter.loginUser(...args);
export const logout = (...args) => activeAdapter.logout(...args);
export const getCurrentUser = (...args) => activeAdapter.getCurrentUser(...args);
export const canAccessPro = (...args) => activeAdapter.canAccessPro(...args);
export const setProAccess = (...args) => activeAdapter.setProAccess(...args);
