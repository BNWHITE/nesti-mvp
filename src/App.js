// bnwhite/nesti-mvp/nesti-mvp-660c1dbb2ccb48e2c2fb34c1f4482ae22063e948/src/App.js
import SettingsPage from './pages/SettingsPage';
// ASSUREZ-VOUS QUE CE NOM DE FICHIER CORRESPOND À CELUI QUE VOUS AVEZ SAUVEGARDÉ
import OnboardingPage from './pages/OnboardingPage'; 
import CreatePost from './components/CreatePost';

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


function App() {
  const [user, setUser] = useState(null);
  const [familyId, setFamilyId] = useState(null);
  const [familyName, setFamilyName] = useState('');
  const [activeTab, setActiveTab] = useState('feed');
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // États pour l'authentification
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const fetchUserData = useCallback(async (userId) => {
    try {
      // Réinitialiser au cas où l'utilisateur change de session/se déconnecte
      setFamilyId(null);
      setFamilyName('');
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('family_id, first_name')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      if (userData?.family_id) {
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
      // Si userData.family_id est null, familyId restera null. C'est le nouveau point de blocage pour l'Onboarding.
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  const checkUser = useCallback(async () => {
    try {
      console.log('🔍 Checking user...');
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 User:', user);
      
      setUser(user);
      if (user) {
        console.log('📦 Fetching user data...');
        await fetchUserData(user.id);
      }
    } catch (error) {
      console.error('❌ Error checking user:', error);
    } finally {
      console.log('✅ Loading complete');
      setLoading(false);
    }
  }, [fetchUserData]);

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        // En cas de déconnexion
        setFamilyId(null);
        setFamilyName('');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [checkUser, fetchUserData]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (isSignUp) {
        // Inscription
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          alert('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
        }
      } else {
        // Connexion
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        // L'état de l'utilisateur sera mis à jour par onAuthStateChange
      }
    } catch (error) {
      console.error('Auth error:', error);
      setAuthError(error.message || 'Une erreur est survenue');
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePostCreated = () => {
    console.log('Nouveau post créé');
  };

  const renderPage = () => {
    // CORRECTION APPLIQUÉE ICI: Si l'utilisateur est connecté mais sans familyId, on affiche l'onboarding.
    if (!user) return null; 

    if (!familyId) {
      // Si l'utilisateur est connecté mais sans famille, affiche l'onboarding
      return <FamilyOnboarding user={user} setFamilyId={setFamilyId} setFamilyName={setFamilyName} />;
    }

    // Le reste de l'application (seulement si user ET familyId sont présents)
    switch (activeTab) {
      case 'feed':
        return (
          <>
            <FeedPage user={user} familyId={familyId} />
            <CreatePost 
              user={user} 
              familyId={familyId} 
              onPostCreated={handlePostCreated} 
            />
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

  // Écran de chargement
  if (loading) {
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

  // Écran de connexion/inscription
  if (!user) {
    return (
      <div className="app">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo">
                <span>N</span>
              </div>
              <h1>{isSignUp ? 'Créer un compte' : 'Bienvenue sur Nesti'}</h1>
              <p>L'application qui rapproche votre famille</p>
            </div>

            <form onSubmit={handleAuth} className="auth-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  disabled={authLoading}
                />
              </div>

              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={authLoading}
                  minLength={6}
                />
              </div>

              {authError && (
                <div className="auth-error">
                  {authError}
                </div>
              )}

              <button 
                type="submit" 
                className="auth-button"
                disabled={authLoading}
              >
                {authLoading ? 'Chargement...' : (isSignUp ? 'Créer mon compte' : 'Se connecter')}
              </button>
            </form>

            <div className="auth-switch">
              <button 
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthError('');
                }}
                className="switch-button"
              >
                {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Application principale (y compris l'Onboarding)
  return (
    <div className="app">
      <div className="app-container">
        {/* CORRECTION APPLIQUÉE ICI: Affichage conditionnel du Header et de la Navigation
        pour ne pas les montrer sur l'écran d'Onboarding */}
        {familyId && (
          <Header 
            user={user} 
            familyName={familyName}
            onSettingsOpen={() => setShowSettings(true)} 
          />
        )}
        
        <main className="main-content">
          {renderPage()}
        </main>
        
        {familyId && (
          <Navigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        )}
        
        {showSettings && familyId && (
          <SettingsPage 
            user={user} 
            onClose={() => setShowSettings(false)} 
          />
        )}
      </div>
    </div>
  );
}

export default App;
