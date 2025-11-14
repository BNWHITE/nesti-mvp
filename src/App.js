// src/App.js (VERSION FINALE AVEC CONNEXION GOOGLE SIMPLIFIÉE)

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
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [familyId, setFamilyId] = useState(null);
  const [familyName, setFamilyName] = useState('');
  const [activeTab, setActiveTab] = useState('feed');
  const [showSettings, setShowSettings] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false); 
  // Suppression des états email, password, isSignUp, authError, authLoading
  const [authLoading, setAuthLoading] = useState(false); 

  const toggleDarkMode = () => setDarkMode(prev => !prev);
  
  const fetchUserData = useCallback(async (userId) => {
    // ... (Logique inchangée) ...
    try {
      setFamilyId(null); 
      setFamilyName('');
      setProfileComplete(false); 

      const { data: userData, error: userError } = await supabase
        .from('user_profiles') 
        .select('family_id, first_name, role') 
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
    const timeoutId = setTimeout(() => {
      if(loading) setLoading(false);
    }, 5000); 

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user || null;
      setUser(authUser);
      clearTimeout(timeoutId);

      if (authUser) {
        // user.id et user.email sont disponibles
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

  // NOUVELLE FONCTION SIMPLIFIÉE POUR GOOGLE SIGN-IN
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // L'URL de redirection doit pointer vers votre domaine Vercel ou localhost
          redirectTo: window.location.origin, 
        },
      });

      if (error) throw error;

    } catch (error) {
      console.error('Erreur de connexion Google:', error);
      alert('Erreur lors de la connexion via Google. Assurez-vous que Google est activé dans votre dashboard Supabase.');
    } finally {
      setAuthLoading(false);
    }
  };


  const handlePostCreated = () => {
    console.log('Nouveau post créé');
  };

  const renderPage = () => {
    if (!user) return null;

    if (!profileComplete) {
      return (
        <Onboarding 
          user={user} 
          setProfileComplete={setProfileComplete} 
          setFamilyId={setFamilyId}
          setFamilyName={familyName}
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

    // Application principale
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

  if (loading) {
    // Rendu loading
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="loading-logo">
            <span>N</span>
          </div>
          <p className="loading-text">Chargement de votre espace familial...</p>
          <button 
            onClick={() => setLoading(false)} 
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Passer au login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    // Rendu Auth SIMPLIFIÉ
    return (
      <div className="app">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo">
                <span>N</span>
              </div>
              <h1>Bienvenue sur Nesti</h1>
              <p>Connectez-vous pour commencer l'organisation familiale.</p>
            </div>
            
            {/* BOUTON GOOGLE */}
            <button 
              onClick={handleGoogleSignIn}
              className="google-auth-button"
              disabled={authLoading}
            >
              {authLoading ? 'Connexion en cours...' : 'G Continuer avec Google'}
            </button>

            <div className="auth-footer">
                <p>Simple et sécurisé via votre compte Google.</p>
            </div>

          </div>
        </div>
      </div>
    );
  }

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
