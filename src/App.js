import React from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import MonNest from "./pages/MonNest";
import Agenda from "./pages/Agenda";
import Discover from "./pages/Discover";
import NestiIA from "./pages/NestiIA";
import Settings from "./pages/Settings";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import "./styles/theme.css";
import "./styles/components.css";
import "./App.css";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/" || path === "/home") return "home";
    if (path === "/agenda") return "agenda";
    if (path === "/mon-nest") return "nest";
    if (path === "/decouvertes") return "discover";
    if (path === "/nesti-ia") return "chat";
    return "home";
  };

  const handleTabChange = (tabId) => {
    const routes = {
      home: "/",
      agenda: "/agenda",
      nest: "/mon-nest",
      discover: "/decouvertes",
      chat: "/nesti-ia"
    };
    navigate(routes[tabId] || "/");
  };

  return (
    <div className="app">
      <div className="app-container">
        <Header />
        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/mon-nest" element={<MonNest />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/decouvertes" element={<Discover />} />
            <Route path="/nesti-ia" element={<NestiIA />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <BottomNav activeTab={getActiveTab()} onTabChange={handleTabChange} />
      </div>
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
