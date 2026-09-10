import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import StartPage from './pages/StartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProSimulatorPage from './pages/ProSimulatorPage';
import { getCurrentUser, logout as authLogout } from './utils/auth';

export default function App() {
  const [screen, setScreen] = useState('start'); // 'start' | 'login' | 'register' | 'matchsimulator' | 'pro'
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, [screen]);

  const handleAuthSuccess = () => {
    setCurrentUser(getCurrentUser());
    setScreen('pro'); // login/register Pro Simulatorga kirish uchun so'ralgan bo'lardi
  };

  const handleLogout = () => {
    authLogout();
    setCurrentUser(null);
    setScreen('start');
  };

  const handleOpenPro = () => {
    // Matchsimulator uchun login shart emas, lekin Pro Simulator uchun MAJBURIY
    if (!getCurrentUser()) {
      setScreen('login');
      return;
    }
    setScreen('pro');
  };

  if (screen === 'matchsimulator') {
    return <Home onExitToStart={() => setScreen('start')} />;
  }

  if (screen === 'login') {
    return (
      <LoginPage
        onSuccess={handleAuthSuccess}
        onGoRegister={() => setScreen('register')}
        onBack={() => setScreen('start')}
      />
    );
  }

  if (screen === 'register') {
    return (
      <RegisterPage
        onSuccess={handleAuthSuccess}
        onGoLogin={() => setScreen('login')}
        onBack={() => setScreen('start')}
      />
    );
  }

  if (screen === 'pro') {
    const user = currentUser || getCurrentUser();
    if (!user) { setScreen('login'); return null; }
    return <ProSimulatorPage currentUser={user} onBack={() => setScreen('start')} />;
  }

  return (
    <StartPage
      currentUser={currentUser}
      onOpenMatchSimulator={() => setScreen('matchsimulator')}
      onOpenProSimulator={handleOpenPro}
      onGoLogin={() => setScreen('login')}
      onGoRegister={() => setScreen('register')}
      onLogout={handleLogout}
    />
  );
}
