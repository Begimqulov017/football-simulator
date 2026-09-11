// ============================================================
// AUTH FACADE
// ============================================================
// Ilovaning qolgan qismi (App.jsx, LoginPage, RegisterPage, ProSimulatorPage)
// FAQAT shu fayldagi funksiyalarni import qiladi (`from '../utils/auth'`) —
// ular qaysi adapter ishlatilayotganini bilmaydi ham, bilishi ham shart emas.
//
// FAOL ADAPTER: `apiAdapter` — markazlashgan server (`server/`)ga ulanadi,
// shuning uchun akkauntlar BARCHA qurilmalarda bir xil (localStorage'dagi
// eski `localStorageAdapter` endi ishlatilmaydi, lekin kelajakda kerak
// bo'lib qolsa deb fayli saqlab qo'yilgan).
//
// Diqqat: bu adapterning barcha metodlari ENDI ASINXRON (Promise qaytaradi),
// chunki ular tarmoq orqali serverga so'rov yuboradi — chaqirilgan joyda
// albatta `await`/`.then()` ishlatilishi kerak.
import apiAdapter from './apiAdapter';

const activeAdapter = apiAdapter;

export const getMeta = (...args) => activeAdapter.getMeta(...args);
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
