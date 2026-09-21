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
function RequirePlayer({ children }) {
  const { player, ready } = useGame();
  if (!ready) return null;
  if (!player) return <Navigate to="/start" replace />;
  if (player.career?.retired) return <Navigate to="/retirement" replace />;
  return children;
}

function RedirectIfPlayerExists({ children }) {
  const { player, ready } = useGame();
  if (!ready) return null;
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

function RootRedirect() {
  const { player, ready } = useGame();
  if (!ready) return null;
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
                <Route path="/" element={<RootRedirect />} />
                <Route path="/start" element={<RedirectIfPlayerExists><StartPage /></RedirectIfPlayerExists>} />
                <Route path="/retirement" element={<RequireRetired><RetirementPage /></RequireRetired>} />
                <Route path="/home" element={<RequirePlayer><HomePage /></RequirePlayer>} />
                <Route path="/profile" element={<RequirePlayer><ProfilePage /></RequirePlayer>} />
                <Route path="/club" element={<RequirePlayer><ClubPage /></RequirePlayer>} />
                <Route path="/all-stats" element={<RequirePlayer><AllStatsPage /></RequirePlayer>} />
                <Route path="/messages" element={<RequirePlayer><MessagesPage /></RequirePlayer>} />
                <Route path="/transfers" element={<RequirePlayer><TransfersPage /></RequirePlayer>} />
                <Route path="/training" element={<RequirePlayer><TrainingPage /></RequirePlayer>} />
                <Route path="/money" element={<RequirePlayer><MoneyPage /></RequirePlayer>} />
                <Route path="/league" element={<RequirePlayer><LeaguePage /></RequirePlayer>} />
                <Route path="/leagues" element={<RequirePlayer><LeaguesPage /></RequirePlayer>} />
                <Route path="/leagues/:leagueId" element={<RequirePlayer><LeagueBrowsePage /></RequirePlayer>} />
                <Route path="/world-match" element={<RequirePlayer><WorldMatchPage /></RequirePlayer>} />
                <Route path="/leagues/:leagueId/replay" element={<RequirePlayer><MatchReplayPage /></RequirePlayer>} />
                <Route path="/top-scorers" element={<RequirePlayer><TopScorersPage /></RequirePlayer>} />
                <Route path="/games" element={<RequirePlayer><GamesPage /></RequirePlayer>} />
                <Route path="/play-match" element={<RequirePlayer><PlayMatchPage /></RequirePlayer>} />
                <Route path="/live-result" element={<RequirePlayer><LiveResultPage /></RequirePlayer>} />
                <Route path="/users" element={<RequirePlayer><UsersPage currentUser={currentUser} /></RequirePlayer>} />
                <Route path="/news" element={<RequirePlayer><NewsPage /></RequirePlayer>} />
                <Route path="/national-team" element={<RequirePlayer><NationalTeamPage /></RequirePlayer>} />
                {currentUser.isAdmin && (
                  <Route path="/admin" element={<RequirePlayer><AdminPage currentUser={currentUser} /></RequirePlayer>} />
                )}
                <Route path="*" element={<RootRedirect />} />
              </Routes>
            </LoadingGate>
          </HashRouter>
        </ExitProvider>
      </GameProvider>
    </div>
  );
}
