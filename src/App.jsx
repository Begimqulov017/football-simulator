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

  // Where login/register should send the person back to once they're signed
  // in - 'start' for the plain Login/Register buttons on the home screen,
  // 'career' only when they were sent to login *because* they tried to open
  // Football Career Online while logged out.
  const [postAuthDestination, setPostAuthDestination] = useState('start');

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
    setScreen(postAuthDestination);
  };

  const handleLogout = async () => {
    await authLogout();
    setCurrentUser(null);
    setScreen('start');
  };

  const handleOpenPro = () => {
    // Matchsimulator uchun login shart emas, lekin Pro Simulator uchun MAJBURIY
    if (!currentUser) {
      setPostAuthDestination('career');
      setScreen('login');
      return;
    }
    setScreen('career');
  };

  // The plain Login/Register buttons on the home screen should always land
  // back on the home screen after signing in - never straight into Football
  // Career Online, since that wasn't what was asked for.
  const handleGoLogin = () => { setPostAuthDestination('start'); setScreen('login'); };
  const handleGoRegister = () => { setPostAuthDestination('start'); setScreen('register'); };

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
      onGoLogin={handleGoLogin}
      onGoRegister={handleGoRegister}
      onLogout={handleLogout}
    />
  );
}
