import React from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import MonNest from "./pages/MonNest";
import Agenda from "./pages/Agenda";
import Discover from "./pages/Discover";
import NestiIA from "./pages/NestiIA";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import "./App.css";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active tab based on current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'feed';
    if (path === '/agenda') return 'agenda';
    if (path === '/mon-nest') return 'nest';
    if (path === '/decouvertes') return 'discover';
    if (path === '/nesti-ia') return 'chat';
    return 'feed';
  };

  const handleTabChange = (tabId) => {
    const routes = {
      feed: '/',
      agenda: '/agenda',
      nest: '/mon-nest',
      discover: '/decouvertes',
      chat: '/nesti-ia'
    };
    navigate(routes[tabId] || '/');
  };

  const isOnboardingPage = location.pathname === '/onboarding';

  return (
    <div className="app">
      {!isOnboardingPage && <Header />}
      <main className={`app-main ${isOnboardingPage ? 'no-padding' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mon-nest" element={<MonNest />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/decouvertes" element={<Discover />} />
          <Route path="/nesti-ia" element={<NestiIA />} />
          <Route path="/settings" element={<Settings />} />
          <Route 
            path="/onboarding" 
            element={
              <Onboarding 
                onComplete={() => navigate('/')} 
              />
            } 
          />
        </Routes>
      </main>
      {!isOnboardingPage && (
        <BottomNav 
          activeTab={getActiveTab()} 
          onTabChange={handleTabChange} 
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
