import React from 'react';
import AppShell from '../components/AppShell';
import AdminPanel from '../../components/AdminPanel';

export default function AdminPage({ currentUser }) {
  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Admin</h1>
          <div className="sub">Sizda shaxsiy karyera yo'q — siz umumiy dunyoni (kunni) boshqarasiz va barcha o'yinchilarni kuzatasiz</div>
        </div>
      </div>
      <div style={{ maxWidth: 640 }}>
        <AdminPanel currentUser={currentUser} />
      </div>
    </AppShell>
  );
}
