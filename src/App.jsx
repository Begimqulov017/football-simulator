import React, { useState, useEffect, Suspense, lazy } from 'react';
import { LandingPage } from './landing';
import { getCurrentUser, logout as authLogout } from './utils/auth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
// Performance: og'ir bo'limlar (Match Simulator va Career) faqat kerak bo'lganda yuklanadi,
// shuning uchun landing sahifa tez ochiladi.
const Home = lazy(() => import('./pages/Home'));
const FootballCareerOnline = lazy(() => import('./pages/FootballCareerOnline'));

function ScreenFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center font-sans bg-surface text-ink-muted text-sm gap-2">
      <span className="w-4 h-4 rounded-full border-2 border-surface-line border-t-brand motion-safe:animate-spin" />
      Yuklanmoqda…
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState('start'); // 'start' | 'login' | 'register' | 'matchsimulator' | 'career'
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Where login/register should send the person back to once they're signed
  // in - 'start' for the plain Login/Register buttons on the home screen,
  // 'career' only when they were sent to login *because* they tried to open
  // Football Career Online while logged out.
  const [postAuthDestination, setPostAuthDestination] = useState('start');

  // The login typed on one auth form is carried over when the person switches
  // to the other one (Login <-> Register), so they never retype it.
  const [authDraft, setAuthDraft] = useState('');

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
    setAuthDraft('');
    setScreen(postAuthDestination);
  };

  const leaveAuth = () => { setAuthDraft(''); setScreen('start'); };
  const switchToRegister = (u) => { setAuthDraft(typeof u === 'string' ? u : ''); setScreen('register'); };
  const switchToLogin = (u) => { setAuthDraft(typeof u === 'string' ? u : ''); setScreen('login'); };

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
  const handleGoLogin = () => { setPostAuthDestination('start'); setAuthDraft(''); setScreen('login'); };
  const handleGoRegister = () => { setPostAuthDestination('start'); setAuthDraft(''); setScreen('register'); };

  if (screen === 'matchsimulator') {
    return <Suspense fallback={<ScreenFallback />}><Home onExitToStart={() => setScreen('start')} /></Suspense>;
  }

  if (screen === 'login') {
    return (
      <LoginPage
        onSuccess={handleAuthSuccess}
        onGoRegister={switchToRegister}
        onBack={leaveAuth}
        initialUsername={authDraft}
      />
    );
  }

  if (screen === 'register') {
    return (
      <RegisterPage
        onSuccess={handleAuthSuccess}
        onGoLogin={switchToLogin}
        onBack={leaveAuth}
        initialUsername={authDraft}
      />
    );
  }

  if (screen === 'career') {
    if (!authChecked) return null; // sessiya hali tekshirilmoqda — miltillashning oldini olamiz
    if (!currentUser) { setScreen('login'); return null; }
    return <Suspense fallback={<ScreenFallback />}><FootballCareerOnline currentUser={currentUser} onBack={() => setScreen('start')} /></Suspense>;
  }

  return (
    <LandingPage
      currentUser={currentUser}
      onOpenMatchSimulator={() => setScreen('matchsimulator')}
      onOpenProSimulator={handleOpenPro}
      onGoLogin={handleGoLogin}
      onGoRegister={handleGoRegister}
      onLogout={handleLogout}
    />
  );
}
