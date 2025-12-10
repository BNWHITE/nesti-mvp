import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import MonNest from "./pages/MonNest";
import Agenda from "./pages/Agenda";
import Discover from "./pages/Discover";
import NestiIA from "./pages/NestiIA";
import Auth from "./pages/Auth";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import "./App.css";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

// App Routes Component
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/" replace /> : <Auth />} 
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div className="app">
              <div className="app-container">
                <Header />
                <main className="main">
                  <Home />
                </main>
                <BottomNav />
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mon-nest"
        element={
          <ProtectedRoute>
            <div className="app">
              <div className="app-container">
                <Header />
                <main className="main">
                  <MonNest />
                </main>
                <BottomNav />
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agenda"
        element={
          <ProtectedRoute>
            <div className="app">
              <div className="app-container">
                <Header />
                <main className="main">
                  <Agenda />
                </main>
                <BottomNav />
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/decouvertes"
        element={
          <ProtectedRoute>
            <div className="app">
              <div className="app-container">
                <Header />
                <main className="main">
                  <Discover />
                </main>
                <BottomNav />
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/nesti-ia"
        element={
          <ProtectedRoute>
            <div className="app">
              <div className="app-container">
                <Header />
                <main className="main">
                  <NestiIA />
                </main>
                <BottomNav />
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
