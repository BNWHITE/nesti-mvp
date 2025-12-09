import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MonNest from "./pages/MonNest";
import Agenda from "./pages/Agenda";
import Discover from "./pages/Discover";
import NestiIA from "./pages/NestiIA";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <div className="app-container">
          <Header />
          <main className="main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/mon-nest" element={<MonNest />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/decouvertes" element={<Discover />} />
              <Route path="/nesti-ia" element={<NestiIA />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </div>
    </Router>
  );
}

export default App;
