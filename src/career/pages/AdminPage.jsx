import React from 'react';
import AppShell from '../components/AppShell';
import AdminDashboard from '../admin/AdminDashboard';

// Phase 10 — Admin Panel & Unified Engine (Clean Light).
// Admin: Master Calendar, fixture, tarkib/statistika tahriri, yangilik, chat, foydalanuvchilar.
// Moderator: faqat chat moderatsiyasi. Har bir amalni server o'zi ham rol bo'yicha tekshiradi.
export default function AdminPage({ currentUser }) {
  const isAdmin = !!currentUser?.isAdmin;
  const isMod = currentUser?.role === 'moderator';
  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>{isAdmin ? 'Admin Dashboard' : 'Moderatsiya'}</h1>
          <div className="sub">
            {isAdmin
              ? "Dunyo kalendari, fixture va tarkib tahriri, yangiliklar, chat moderatsiyasi va foydalanuvchilarni boshqarish"
              : "Chatni moderatsiya qilish: xabarlarni biriktirish, o'chirish va foydalanuvchilarni mute qilish"}
          </div>
        </div>
      </div>
      {isAdmin || isMod ? (
        <AdminDashboard currentUser={currentUser} />
      ) : (
        <div className="card"><div className="sub">Bu sahifa faqat admin va moderatorlar uchun.</div></div>
      )}
    </AppShell>
  );
}
