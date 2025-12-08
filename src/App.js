import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MonNest from "./pages/MonNest";
import Agenda from "./pages/Agenda";
import Discover from "./pages/Discover";
import NestiIA from "./pages/NestiIA";
import Header from "./components/Header";
import "./App.css";

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;
