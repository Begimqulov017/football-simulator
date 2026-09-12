import React from 'react';
import AppShell from '../components/AppShell';
import NotStarted from '../components/NotStarted';

export default function AllStatsPage() {
  return (
    <AppShell>
      <div className="page-header"><h1>All Stats</h1></div>
      <div className="card">
        <NotStarted icon="📊" title="Detailed stats aren't tracked yet" desc="Goals, assists and match ratings will populate here once matchdays begin." />
      </div>
    </AppShell>
  );
}
