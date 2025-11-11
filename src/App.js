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

  const fetchUserData = useCallback(async (userId) => {
    try {
      // Récupérer les infos utilisateur et famille
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('family_id, first_name')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      if (userData?.family_id) {
        setFamilyId(userData.family_id);
        
        // Récupérer le nom de la famille
        const { data: familyData, error: familyError } = await supabase
          .from('families')
          .select('family_name')
          .eq('id', userData.family_id)
          .single();

        if (!familyError && familyData) {
          setFamilyName(familyData.family_name);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  const checkUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await fetchUserData(user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
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
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [checkUser, fetchUserData]);

  const handlePostCreated = () => {
    console.log('Nouveau post créé');
  };

  const renderPage = () => {
    if (!user || !familyId) return null;

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
        </div>
      </div>
    );
  }

  // Écran de connexion
  if (!user) {
    return (
      <div className="app">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo">
                <span>N</span>
              </div>
              <h1>Bienvenue sur Nesti</h1>
              <p>L'application qui rapproche votre famille</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="auth-button"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Application principale
  return (
    <div className="app">
      <div className="app-container">
        <Header 
          user={user} 
          familyName={familyName}
          onSettingsOpen={() => setShowSettings(true)} 
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
          />
        )}
      </div>
    </div>
  );
}

export default App;
