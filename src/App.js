// src/App.js (VERSION FINALE AVEC DARK MODE ET MODAL SETTINGS)

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
  const [darkMode, setDarkMode] = useState(false); // NOUVEAU: Dark Mode
  const [user, setUser] = useState(null);
  const [familyId, setFamilyId] = useState(null);
  const [familyName, setFamilyName] = useState('');
  const [activeTab, setActiveTab] = useState('feed');
  const [showSettings, setShowSettings] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false); 
  // ... (États d'authentification) ...
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const toggleDarkMode = () => setDarkMode(prev => !prev); // Fonction Dark Mode
  
  // NOTE: Les fonctions fetchUserData, useEffect, handleAuth, handlePostCreated
  // restent les dernières versions corrigées.

  const fetchUserData = useCallback(async (userId) => {
    // ... (Logique inchangée) ...
    try {
      setFamilyId(null); 
      setFamilyName('');
      setProfileComplete(false); 

      const { data: userData, error: userError } = await supabase
        .from('user_profiles') 
        .select('family_id, first_name')
        .eq('id', userId)
        .maybeSingle(); 

      if (userError) throw userError;
      
      if (userData) {
          const isProfileComplete = !!userData.first_name;
          setProfileComplete(isProfileComplete); 
          
          if (isProfileComplete && userData.family_id) {
            setFamilyId(userData.family_id);
            
            const { data: familyData, error: familyError } = await supabase
              .from('families')
              .select('family_name')
              .eq('id', userData.family_id)
              .single();

            if (!familyError && familyData) {
              setFamilyName(familyData.family_name);
            }
          }
      } 
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []); 

  useEffect(() => {
    // ... (Logique onAuthStateChange inchangée) ...
    const timeoutId = setTimeout(() => {
      if(loading) setLoading(false);
    }, 5000); 

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user || null;
      setUser(authUser);
      clearTimeout(timeoutId);

      if (authUser) {
        await fetchUserData(authUser.id);
      } else {
        setFamilyId(null);
        setFamilyName('');
        setProfileComplete(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [fetchUserData]); 

  const handleAuth = async (e) => {
    // ... (Logique inchangée) ...
  };
  
  const handlePostCreated = () => {
    console.log('Nouveau post créé');
  };

  const renderPage = () => {
    // ... (Logique inchangée de renderPage pour Onboarding, Feed, etc.) ...
    if (!user) return null;

    if (!profileComplete) {
      return (
        <Onboarding 
          user={user} 
          setProfileComplete={setProfileComplete} 
          setFamilyId={setFamilyId}
          setFamilyName={setFamilyName}
          initialView="profile" 
        />
      );
    }

    if (!familyId) {
      return (
        <Onboarding 
          user={user} 
          setProfileComplete={setProfileComplete} 
          setFamilyId={setFamilyId} 
          setFamilyName={familyName}
          initialView="family" 
        />
      );
    }

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

  // ... (Rendu loading et !user inchangé) ...

  return (
    <div className={`app ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="app-container">
        
        {familyId && profileComplete && (
          <Header 
            user={user} 
            familyName={familyName}
            onSettingsOpen={() => setShowSettings(true)}
            isDarkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        )}
        
        <main className="main-content">
          {renderPage()}
        </main>
        
        {familyId && profileComplete && (
          <Navigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        )}
        
        {/* FIX: SettingsPage en superposition (Modal) */}
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
