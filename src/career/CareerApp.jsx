import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider, useGame } from './context/GameContext';

import StartPage from './pages/StartPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ClubPage from './pages/ClubPage';
import AllStatsPage from './pages/AllStatsPage';
import MessagesPage from './pages/MessagesPage';
import TransfersPage from './pages/TransfersPage';
import TrainingPage from './pages/TrainingPage';
import MoneyPage from './pages/MoneyPage';
import LeaguePage from './pages/LeaguePage';
import LeaguesPage from './pages/LeaguesPage';
import LeagueBrowsePage from './pages/LeagueBrowsePage';
import WorldMatchPage from './pages/WorldMatchPage';
import MatchReplayPage from './pages/MatchReplayPage';
import TopScorersPage from './pages/TopScorersPage';
import GamesPage from './pages/GamesPage';
import UsersPage from './pages/UsersPage';
import AdminPage from './pages/AdminPage';
import PlayMatchPage from './pages/PlayMatchPage';
import LiveResultPage from './pages/LiveResultPage';
import NewsPage from './pages/NewsPage';
import NationalTeamPage from './pages/NationalTeamPage';
import RetirementPage from './pages/RetirementPage';
import { ExitProvider } from './context/ExitContext';

// Sends the player to /start if no save exists yet, or /home if one does.
// 8-BAND: agar karyera "retired" bo'lsa, boshqa hech qanday sahifa
// ochilmaydi - /retirement'ga yuboriladi (u yerda foydalanuvchi yakuniy
// statistikasini ko'rib, "<Familiya> Jr." sifatida yangi karyera
// boshlaydi).
// 1-BOSQICH: ADMIN akkaunti butunlay boshqacha - u karyera o'ynamaydi, faqat
// "umumiy dunyo"ni boshqaradi va hammani kuzatadi. Shuning uchun admin hech
// qachon oddiy karyera sahifalariga (Home, Club, Training va h.k.) kira
// olmaydi va StartPage orqali o'ziga karyera ham ocholmaydi - har doim
// to'g'ridan-to'g'ri /admin'ga yuboriladi.
function RequirePlayer({ children, currentUser }) {
  const { player, ready } = useGame();
  if (!ready) return null;
  if (currentUser?.isAdmin) return <Navigate to="/admin" replace />;
  if (!player) return <Navigate to="/start" replace />;
  if (player.career?.retired) return <Navigate to="/retirement" replace />;
  return children;
}

function RedirectIfPlayerExists({ children, currentUser }) {
  const { player, ready } = useGame();
  if (!ready) return null;
  if (currentUser?.isAdmin) return <Navigate to="/admin" replace />;
  if (player) return <Navigate to="/home" replace />;
  return children;
}

// /retirement is only reachable while there IS a retired career to show;
// otherwise there's nothing to display, so send them where they belong.
function RequireRetired({ children }) {
  const { player, ready } = useGame();
  if (!ready) return null;
  if (!player) return <Navigate to="/start" replace />;
  if (!player.career?.retired) return <Navigate to="/home" replace />;
  return children;
}

function RootRedirect({ currentUser }) {
  const { player, ready } = useGame();
  if (!ready) return null;
  if (currentUser?.isAdmin) return <Navigate to="/admin" replace />;
  return <Navigate to={player ? '/home' : '/start'} replace />;
}

function LoadingGate({ children }) {
  const { ready } = useGame();
  if (!ready) {
    return (
      <div className="not-started" style={{ minHeight: '100vh' }}>
        <div className="icon">⏳</div>
        <div className="title">Karyerangiz yuklanmoqda...</div>
        <div className="desc">Serverdagi so'nggi holatingiz tekshirilmoqda.</div>
      </div>
    );
  }
  return children;
}

// currentUser — App.jsx'dan keladi, karyera saqlanmasini shu foydalanuvchi
// nomiga bog'lab turadi (har bir do'st o'z karyerasini ko'radi) va Users
// bo'limi qaysi hisob premiumligini bilishi uchun ishlatiladi.
export default function CareerApp({ currentUser, onExit }) {
  return (
    <div className="career-app">
      <GameProvider username={currentUser.username}>
        <ExitProvider onExit={onExit} currentUser={currentUser}>
          <HashRouter>
            <LoadingGate>
              <Routes>
                <Route path="/" element={<RootRedirect currentUser={currentUser} />} />
                <Route path="/start" element={<RedirectIfPlayerExists currentUser={currentUser}><StartPage /></RedirectIfPlayerExists>} />
                <Route path="/retirement" element={<RequireRetired><RetirementPage /></RequireRetired>} />
                <Route path="/home" element={<RequirePlayer currentUser={currentUser}><HomePage /></RequirePlayer>} />
                <Route path="/profile" element={<RequirePlayer currentUser={currentUser}><ProfilePage /></RequirePlayer>} />
                <Route path="/club" element={<RequirePlayer currentUser={currentUser}><ClubPage /></RequirePlayer>} />
                <Route path="/all-stats" element={<RequirePlayer currentUser={currentUser}><AllStatsPage /></RequirePlayer>} />
                <Route path="/messages" element={<RequirePlayer currentUser={currentUser}><MessagesPage /></RequirePlayer>} />
                <Route path="/transfers" element={<RequirePlayer currentUser={currentUser}><TransfersPage /></RequirePlayer>} />
                <Route path="/training" element={<RequirePlayer currentUser={currentUser}><TrainingPage /></RequirePlayer>} />
                <Route path="/money" element={<RequirePlayer currentUser={currentUser}><MoneyPage /></RequirePlayer>} />
                <Route path="/league" element={<RequirePlayer currentUser={currentUser}><LeaguePage /></RequirePlayer>} />
                <Route path="/leagues" element={<RequirePlayer currentUser={currentUser}><LeaguesPage /></RequirePlayer>} />
                <Route path="/leagues/:leagueId" element={<RequirePlayer currentUser={currentUser}><LeagueBrowsePage /></RequirePlayer>} />
                <Route path="/world-match" element={<RequirePlayer currentUser={currentUser}><WorldMatchPage /></RequirePlayer>} />
                <Route path="/leagues/:leagueId/replay" element={<RequirePlayer currentUser={currentUser}><MatchReplayPage /></RequirePlayer>} />
                <Route path="/top-scorers" element={<RequirePlayer currentUser={currentUser}><TopScorersPage /></RequirePlayer>} />
                <Route path="/games" element={<RequirePlayer currentUser={currentUser}><GamesPage /></RequirePlayer>} />
                <Route path="/play-match" element={<RequirePlayer currentUser={currentUser}><PlayMatchPage /></RequirePlayer>} />
                <Route path="/live-result" element={<RequirePlayer currentUser={currentUser}><LiveResultPage /></RequirePlayer>} />
                <Route path="/users" element={<RequirePlayer currentUser={currentUser}><UsersPage currentUser={currentUser} /></RequirePlayer>} />
                <Route path="/news" element={<RequirePlayer currentUser={currentUser}><NewsPage /></RequirePlayer>} />
                <Route path="/national-team" element={<RequirePlayer currentUser={currentUser}><NationalTeamPage /></RequirePlayer>} />
                {currentUser.isAdmin && (
                  <Route path="/admin" element={<AdminPage currentUser={currentUser} />} />
                )}
                <Route path="*" element={<RootRedirect currentUser={currentUser} />} />
              </Routes>
            </LoadingGate>
          </HashRouter>
        </ExitProvider>
      </GameProvider>
    </div>
  );
}
