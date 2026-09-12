import React from 'react';
import AppShell from '../components/AppShell';
import NotStarted from '../components/NotStarted';

export default function TransfersPage() {
  return (
    <AppShell>
      <div className="page-header"><h1>Transfers</h1></div>
      <div className="card">
        <NotStarted icon="💸" title="Transfer market not started" desc="The top-5 biggest money moves will be tracked here." />
      </div>
    </AppShell>
  );
}
