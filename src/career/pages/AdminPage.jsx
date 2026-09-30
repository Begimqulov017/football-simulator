import React from 'react';
import AppShell from '../components/AppShell';
import AdminDashboard from '../admin/AdminDashboard';

// Phase 4 — Admin Dashboard (Clean Light). Faqat adminlar uchun; server ham tekshiradi.
export default function AdminPage({ currentUser }) {
  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <div className="sub">O'yinchilar statistikasi, ligalar va turnirlar, ruxsatlar va simulyatsiya boshqaruvi</div>
        </div>
      </div>
      {currentUser?.isAdmin ? (
        <AdminDashboard currentUser={currentUser} />
      ) : (
        <div className="card"><div className="sub">Bu sahifa faqat adminlar uchun.</div></div>
      )}
    </AppShell>
  );
}
