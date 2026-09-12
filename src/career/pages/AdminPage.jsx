import React from 'react';
import AppShell from '../components/AppShell';
import AdminPanel from '../../components/AdminPanel';

export default function AdminPage({ currentUser }) {
  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Admin</h1>
          <div className="sub">Foydalanuvchilarni boshqarish — ruxsat berish, o'chirish</div>
        </div>
      </div>
      <div style={{ maxWidth: 640 }}>
        <AdminPanel currentUser={currentUser} />
      </div>
    </AppShell>
  );
}
