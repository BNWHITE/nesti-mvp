import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import Feed from './pages/FeedPage';
import Agenda from './pages/AgendaPage';
import MonNest from './pages/NestPage';
import Decouvertes from './pages/DiscoveriesPage';
import NestiIA from './pages/ChatPage';
import Onboarding from './pages/Onboarding';
import Settings from './pages/SettingsPage';
import SplashScreen from './pages/SplashScreen'; // Si existant
import Layout from './components/Layout'; // Créer ce composant pour la navbar

const queryClient = new QueryClient();

// Composant Layout simple avec navigation
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {children}
      {/* Ajoutez ici votre BottomNav importée */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 py-3 flex justify-around items-center z-50">
         {/* Liens vers /feed, /agenda, /mon-nest, etc. */}
         <a href="/feed" className="flex flex-col items-center text-xs text-gray-500">🏠 Feed</a>
         <a href="/agenda" className="flex flex-col items-center text-xs text-gray-500">📅 Agenda</a>
         <a href="/mon-nest" className="flex flex-col items-center text-xs text-gray-500">👨‍👩‍👧‍👦 Nest</a>
         <a href="/decouvertes" className="flex flex-col items-center text-xs text-gray-500">🔍 Découvertes</a>
         <a href="/nesti-ia" className="flex flex-col items-center text-xs text-gray-500">🤖 IA</a>
      </nav>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/feed" />} />
          <Route path="/onboarding" element={<Onboarding />} />
          
          <Route path="/feed" element={<AppLayout><Feed /></AppLayout>} />
          <Route path="/agenda" element={<AppLayout><Agenda /></AppLayout>} />
          <Route path="/mon-nest" element={<AppLayout><MonNest /></AppLayout>} />
          <Route path="/decouvertes" element={<AppLayout><Decouvertes /></AppLayout>} />
          <Route path="/nesti-ia" element={<AppLayout><NestiIA /></AppLayout>} />
          <Route path="/reglages" element={<AppLayout><Settings /></AppLayout>} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
