// src/App.js (VERSION DE DÉVELOPPEMENT SANS AUTHENTIFICATION)

import './App.css';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import Header from './components/Header';
import Navigation from './components/Navigation';
import FeedPage from './pages/FeedPage';
import AgendaPage from './pages/AgendaPage';
import NestPage from './pages/NestPage';
import DiscoveriesPage from './pages/DiscoveriesPage';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import CreatePost from './components/CreatePost';
import Onboarding from './pages/Onboarding';

function App() {
  // --- VALEURS STATIQUES POUR BYPASSER L'AUTH ET L'ONBOARDING ---
  const TEST_USER = { 
    id: 'bypassed-user-id', 
    email: 'test@nesti.app',
    first_name: 'Dev'
  };
  const TEST_FAMILY_ID = 'bypassed-family-id'; // Doit être une chaîne de caractères
  // --- FIN VALEURS STATIQUES ---

  const [darkMode, setDarkMode] = useState(false);
  
  // Remplacer null par TEST_USER pour simuler l'authentification
  const [user, setUser] = useState(TEST_USER); 
  
  // Remplacer null par TEST_FAMILY_ID pour simuler la jointure familiale
  const [familyId, setFamilyId] = useState(TEST_FAMILY_ID);
  
  // Remplacer false par true pour simuler le profil complété
  const [profileComplete, setProfileComplete] = useState(true); 

  const [familyName, setFamilyName] = useState('Nest de Développement');
  const [activeTab, setActiveTab] = useState('feed');
  const [showSettings, setShowSettings] = useState(false); 
  const [loading, setLoading] = useState(false); // Désactiver le chargement initial

  // La logique fetchUserData et useEffect/onAuthStateChange est désactivée
  // pour éviter tout blocage lié à la BDD / RLS / Auth.

  const toggleDarkMode = () => setDarkMode(prev => !prev);
  
  const handlePostCreated = () => {
    console.log('Nouveau post créé');
  };

  const renderPage = () => {
    // Si l'utilisateur est simulé, rendre la page principale
    if (!user) return null; // Ne devrait jamais arriver en mode dev

    switch (activeTab) {
      case 'feed':
        return (
          <>
            <FeedPage user={user} familyId={familyId} />
            <CreatePost user={user} familyId={familyId} onPostCreated={handlePostCreated} />
          </>
        );
      case 'agenda':
        return <AgendaPage user={user} familyId={familyId} />;
      case 'nest':
        return <NestPage user={user} familyId={familyId} familyName={familyName} />;
      case 'discover':
        return <DiscoveriesPage user={user} familyId={familyId} />;
      case 'chat':
        return <ChatPage user={user} familyId={familyId} />;
      default:
        return <FeedPage user={user} familyId={familyId} />;
    }
  };

  // --- RENDU EN MODE BYPASS ---

  // Afficher directement l'application si l'utilisateur est simulé
  return (
    <div className={`app ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="app-container">
        
        {/* Header est affiché car user, familyId et profileComplete sont true */}
        <Header 
          user={user} 
          familyName={familyName}
          onSettingsOpen={() => setShowSettings(true)}
          isDarkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        
        <main className="main-content">
          {renderPage()}
        </main>
        
        <Navigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        
        {showSettings && (
          <SettingsPage 
            user={user} 
            onClose={() => setShowSettings(false)} 
            isDarkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        )}
      </div>
    </div>
  );
}

export default App;
