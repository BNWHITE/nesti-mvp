import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import MonNest from "./pages/MonNest";
import Agenda from "./pages/Agenda";
import Discover from "./pages/Discover";
import NestiIA from "./pages/NestiIA";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import { getUserProfile } from "./services/familyService";
import "./App.css";

// Protected Route Component with Onboarding Check
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.id);
          // Check if user has completed onboarding (has family_id)
          setNeedsOnboarding(!profile?.family_id);
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          // If no profile exists, needs onboarding
          setNeedsOnboarding(true);
        }
      }
      setCheckingOnboarding(false);
    };

    checkOnboardingStatus();
  }, [user]);

  if (loading || checkingOnboarding) {
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

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
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
        path="/onboarding" 
        element={
          user ? <Onboarding /> : <Navigate to="/auth" replace />
        } 
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
