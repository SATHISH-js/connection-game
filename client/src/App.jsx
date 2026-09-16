import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GameProvider, useGame } from './context/GameContext';
import Toast from './components/Toast';

import Home from './pages/Home';
import HostLogin from './pages/HostLogin';
import HostDashboard from './pages/HostDashboard';
import Questions from './pages/Questions';
import Teams from './pages/Teams';
import LeaderboardPage from './pages/LeaderboardPage';
import TieBreakerPage from './pages/TieBreakerPage';
import AudioPage from './pages/AudioPage';
import SettingsPage from './pages/SettingsPage';
import LandingPageEditor from './pages/LandingPageEditor';
import Display from './pages/Display';

function ProtectedRoute({ children }) {
  const pin = sessionStorage.getItem('host_auth_pin') || localStorage.getItem('host_auth_pin');
  if (!pin) {
    return <Navigate to="/host-login" replace />;
  }
  if (!sessionStorage.getItem('host_auth_pin')) {
    sessionStorage.setItem('host_auth_pin', pin);
  }
  return children;
}

function AppContent() {
  const { toast } = useGame();

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/host-login" element={<HostLogin />} />
        <Route path="/host" element={<ProtectedRoute><HostDashboard /></ProtectedRoute>} />
        <Route path="/host/landing" element={<ProtectedRoute><LandingPageEditor /></ProtectedRoute>} />
        <Route path="/host/questions" element={<ProtectedRoute><Questions /></ProtectedRoute>} />
        <Route path="/host/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
        <Route path="/host/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
        <Route path="/host/tiebreaker" element={<ProtectedRoute><TieBreakerPage /></ProtectedRoute>} />
        <Route path="/host/audio" element={<ProtectedRoute><AudioPage /></ProtectedRoute>} />
        <Route path="/host/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/display" element={<Display />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast toast={toast} />
    </>
  );
}

export default function App() {
  const role = window.location.pathname.startsWith('/display')
    ? 'display'
    : window.location.pathname.startsWith('/host')
    ? 'host'
    : 'viewer';

  return (
    <Router>
      <GameProvider role={role}>
        <AppContent />
      </GameProvider>
    </Router>
  );
}
