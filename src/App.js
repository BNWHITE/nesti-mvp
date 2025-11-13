// bnwhite/nesti-mvp/.../src/App.js

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
import OnboardingPage from './pages/OnboardingPage'; // Assurez-vous d'avoir ce nom de fichier

function App() {
  const [user, setUser] = useState(null);
  const [familyId, setFamilyId] = useState(null);
  const [familyName, setFamilyName] = useState('');
  const [activeTab, setActiveTab] = useState('feed');
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // NOUVEL ÉTAT: Pour gérer le cas où l'utilisateur est inscrit mais sans prénom/famille
  const [profileComplete, setProfileComplete] = useState(false); 
  
  // États pour l'authentification
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const fetchUserData = useCallback(async (userId) => {
    try {
      setFamilyId(null); 
      setFamilyName('');
      setProfileComplete(false); // Réinitialisation

      // La table 'users' est maintenant la table 'user_profiles' pour le prénom/famille.
      const { data: userData, error: userError } = await supabase
        .from('user_profiles') // MODIFIÉ: Utilisation de la table user_profiles
        .select('family_id, first_name')
        .eq('id', userId)
        .maybeSingle(); // Utiliser maybeSingle pour mieux gérer 'No rows found'

      if (userError) throw userError;
      
      if (userData) {
          // L'utilisateur est dans la table des profils
          setProfileComplete(!!userData.first_name); // Profil complet si un prénom existe
          
          if (userData.family_id) {
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
      } else {
        // Cas d'un nouvel utilisateur inscrit (Supabase Auth) mais pas encore dans user_profiles
        // Ceci est normal juste après l'inscription.
        setProfileComplete(false);
      }
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
    // Suppression du checkUser initial pour ne dépendre que de onAuthStateChange
    // checkUser(); 
    
    // Ajout d'un timer pour s'assurer que setLoading(false) est appelé même si Supabase traîne
    const timeoutId = setTimeout(() => {
      if(loading) setLoading(false);
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user || null;
      setUser(authUser);

      if (authUser) {
        await fetchUserData(authUser.id);
      } else {
        // Déconnexion
        setFamilyId(null);
        setFamilyName('');
        setProfileComplete(false);
      }
      setLoading(false);
      clearTimeout(timeoutId); // Arrêter le timer si l'état est mis à jour
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [fetchUserData]); // RETIRER checkUser des dépendances

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (isSignUp) {
        // Inscription
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        // La fonction onAuthStateChange gère la connexion post-signup
        alert('Compte créé ! Vérifiez votre email pour confirmer, puis connectez-vous.');

      } else {
        // Connexion
        const { error } = await supabase.auth.signInWithPassword({
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
    if (!user) return null;

    // NOUVELLE LOGIQUE: Profil incomplet (prénom/nom manquant)
    if (!profileComplete) {
      // L'utilisateur doit d'abord compléter son profil (Nom/Prénom)
      return (
        <OnboardingPage 
          user={user} 
          setFamilyId={setFamilyId} 
          setFamilyName={setFamilyName} 
          setProfileComplete={setProfileComplete} // Passer la fonction de mise à jour
          initialView="profile" // Nouveau prop pour démarrer sur la vue Profil
        />
      );
    }

    // Utilisateur connecté AVEC prénom mais SANS famille
    if (!familyId) {
      // L'utilisateur peut créer/rejoindre une famille
      return (
        <OnboardingPage 
          user={user} 
          setFamilyId={setFamilyId} 
          setFamilyName={familyName} 
          setProfileComplete={setProfileComplete} 
          initialView="family" // Démarrer sur la vue Famille
        />
      );
    }

    // Utilisateur connecté AVEC prénom ET AVEC famille
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
    // ... (Code de l'écran de chargement inchangé)
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
    // ... (Code de l'écran d'authentification inchangé)
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

  // Application principale
  return (
    <div className="app">
      <div className="app-container">
        {/* Header et Navigation conditionnels à la famille (et au profil complet) */}
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
