import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import StartPage from './pages/StartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FootballCareerOnline from './pages/FootballCareerOnline';
import { getCurrentUser, logout as authLogout } from './utils/auth';

export default function App() {
  const [screen, setScreen] = useState('start'); // 'start' | 'login' | 'register' | 'matchsimulator' | 'career'
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Sessiyani serverdan tekshiramiz (token localStorage'da, LEKIN haqiqiyligini
  // markazlashgan backend tasdiqlaydi — shuning uchun asinxron).
  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((user) => {
      if (!cancelled) {
        setCurrentUser(user);
        setAuthChecked(true);
      }
    });
    return () => { cancelled = true; };
  }, [screen]);

  const handleAuthSuccess = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
    setScreen('career'); // login/register Pro Simulatorga kirish uchun so'ralgan bo'lardi
  };

  const handleLogout = async () => {
    await authLogout();
    setCurrentUser(null);
    setScreen('start');
  };

  const handleOpenPro = () => {
    // Matchsimulator uchun login shart emas, lekin Pro Simulator uchun MAJBURIY
    if (!currentUser) {
      setScreen('login');
      return;
    }
    setScreen('career');
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

  if (screen === 'career') {
    if (!authChecked) return null; // sessiya hali tekshirilmoqda — miltillashning oldini olamiz
    if (!currentUser) { setScreen('login'); return null; }
    return <FootballCareerOnline currentUser={currentUser} onBack={() => setScreen('start')} />;
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
