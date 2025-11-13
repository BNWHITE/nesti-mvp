// bnwhite/nesti-mvp/.../src/App.js (VERSION FINALE)

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
import OnboardingPage from './pages/OnboardingPage'; 
// Assurez-vous que l'import OnboardingPage correspond à votre nom de fichier

function App() {
  const [user, setUser] = useState(null);
  const [familyId, setFamilyId] = useState(null);
  const [familyName, setFamilyName] = useState('');
  const [activeTab, setActiveTab] = useState('feed');
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // ÉTAT CRITIQUE: Vrai si first_name est présent dans user_profiles
  const [profileComplete, setProfileComplete] = useState(false); 
  
  // États pour l'authentification
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const fetchUserData = useCallback(async (userId) => {
    try {
      // Réinitialisation des états
      setFamilyId(null); 
      setFamilyName('');
      setProfileComplete(false); 

      // 1. Récupérer le profil utilisateur dans la table 'user_profiles'
      const { data: userData, error: userError } = await supabase
        .from('user_profiles') 
        .select('family_id, first_name')
        .eq('id', userId)
        .maybeSingle(); 

      if (userError) {
          console.error("Supabase Error fetching profile:", userError);
          throw userError;
      }
      
      if (userData) {
          // 2. Vérifier si le profil est complété (présence du prénom)
          const isProfileComplete = !!userData.first_name;
          setProfileComplete(isProfileComplete); 
          
          if (isProfileComplete && userData.family_id) {
            setFamilyId(userData.family_id);
            
            // 3. Récupérer le nom de la famille
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
      // Si userData est null, le profil n'a pas encore été créé (juste après signup).
      // profileComplete reste false, ce qui force l'OnboardingPage.
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []); // Aucune dépendance ici, car setFamilyId, etc. sont les setters de App.js

  // Utilisation de onAuthStateChange uniquement pour la robustesse
  useEffect(() => {
    
    // Simuler la fin du chargement après 5s si Supabase est trop lent
    const timeoutId = setTimeout(() => {
      if(loading) setLoading(false);
    }, 5000); 

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user || null;
      setUser(authUser);
      clearTimeout(timeoutId); // Arrêter le timer

      if (authUser) {
        await fetchUserData(authUser.id);
      } else {
        // Déconnexion ou pas d'utilisateur
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
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (isSignUp) {
        // Inscription: on laisse onAuthStateChange gérer l'état après confirmation d'email
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Compte créé ! Vérifiez votre email pour confirmer, puis connectez-vous.');
        
      } else {
        // Connexion: on laisse onAuthStateChange gérer l'état après connexion
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      console.error('Auth error:', error);
      setAuthError(error.message || 'Une erreur est survenue');
    } finally {
      setAuthLoading(false);
    }
  };

  const renderPage = () => {
    if (!user) return null;

    // ÉTAPE 1: Compléter le profil (Nom/Prénom)
    if (!profileComplete) {
      return (
        <OnboardingPage 
          user={user} 
          setProfileComplete={setProfileComplete} 
          setFamilyId={setFamilyId}
          setFamilyName={setFamilyName}
          initialView="profile" 
        />
      );
    }

    // ÉTAPE 2: Créer/Rejoindre une famille
    if (!familyId) {
      return (
        <OnboardingPage 
          user={user} 
          setProfileComplete={setProfileComplete} 
          setFamilyId={setFamilyId} 
          setFamilyName={setFamilyName}
          initialView="family" 
        />
      );
    }

    // ÉTAPE 3: Application principale
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

  // ... (Écran de chargement et Écran d'authentification inchangés) ...
  
  if (loading) {
    // ... (Rendu de l'écran de chargement) ...
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
    // ... (Rendu de l'écran de connexion/inscription) ...
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


  // Application principale (inclut l'Onboarding)
  return (
    <div className="app">
      <div className="app-container">
        {/* Header et Navigation visibles UNIQUEMENT lorsque le profil ET la famille sont configurés */}
        {familyId && profileComplete && (
          <Header 
            user={user} 
            familyName={familyName}
            onSettingsOpen={() => setShowSettings(true)} 
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
        
        {showSettings && familyId && profileComplete && (
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
