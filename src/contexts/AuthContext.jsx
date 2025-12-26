import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import logger from '../lib/logger';

const AuthContext = createContext({});

// ================================
// 🔒 PRIVACY BY DESIGN - Fonctions de sécurité
// ================================

// Nettoyer toutes les données sensibles du navigateur
const clearSensitiveData = () => {
  // Supprimer localStorage (sauf préférences non-sensibles)
  const keysToKeep = ['theme', 'darkMode', 'language'];
  Object.keys(localStorage).forEach(key => {
    if (! keysToKeep.includes(key)) {
      localStorage.removeItem(key);
    }
  });
  
  // Supprimer sessionStorage
  sessionStorage.clear();
  
  // Vider le cache du navigateur si possible
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
};

// Empêcher le copier-coller de tokens/données sensibles
const preventDataLeakage = () => {
  document.addEventListener('copy', (e) => {
    const selection = window.getSelection().toString();
    // Bloquer si la sélection contient des patterns de tokens JWT
    if (selection.match(/eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*/)) {
      e.preventDefault();
      logger.warn('🔒 Copie de données sensibles bloquée');
    }
  });
};

// Nettoyer à la fermeture de la page
const setupSecurityListeners = () => {
  // Nettoyer quand l'utilisateur quitte la page
  window.addEventListener('beforeunload', () => {
    // Supprimer les données de session (pas les préférences)
    sessionStorage.clear();
  });
  
  // Détecter l'inactivité et déconnecter après 30 min
  let inactivityTimer;
  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      logger.warn('🔒 Déconnexion automatique pour inactivité');
      supabase.auth. signOut();
      clearSensitiveData();
      window.location.href = '/auth';
    }, 30 * 60 * 1000); // 30 minutes
  };
  
  ['mousedown', 'keydown', 'scroll', 'touchstart']. forEach(event => {
    document.addEventListener(event, resetInactivityTimer);
  });
  
  resetInactivityTimer();
  
  // Empêcher la fuite de données
  preventDataLeakage();
};

// ================================
// AUTH CONTEXT
// ================================

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // 🔒 Initialiser les protections de sécurité
    setupSecurityListeners();
    
    // Check active sessions and sets the user
    supabase.auth. getSession().then(({ data:  { session } }) => {
      setSession(session);
      setUser(session?. user ??  null);
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?. user ?? null);
      setLoading(false);
      
      // 🔒 Si déconnexion, nettoyer les données
      if (! session) {
        clearSensitiveData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) throw error;

      // Create user profile in the users table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: data.user. id,
            email: email,
            first_name: metadata.first_name || '',
            age: metadata.age || null,
            role:  metadata.role || 'parent',
          }]);
        
        if (profileError) {
          logger.error('Profile creation error:', profileError);
        }
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase. auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        if (error.message === 'Invalid login credentials') {
          error.message = 'Email ou mot de passe incorrect.  Vérifiez vos identifiants ou créez un compte si vous êtes nouveau.';
        } else if (error. message. includes('Email not confirmed')) {
          error.message = 'Veuillez confirmer votre email avant de vous connecter.  Vérifiez votre boîte de réception.';
        }
        throw error;
      }
      
      // Ensure user profile exists in users table
      if (data.user) {
        const { data: existingProfile } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user. id)
          .single();
        
        if (! existingProfile) {
          await supabase
            .from('users')
            .insert([{
              id: data. user.id,
              email: data. user.email,
              first_name:  data.user.user_metadata?.first_name || data.user.email.split('@')[0],
              role: 'parent',
            }]);
        }
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signInWithOAuth = async (provider) => {
    try {
      const { data, error } = await supabase.auth. signInWithOAuth({
        provider,
        options: {
          redirectTo:  window.location.origin,
        },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data:  null, error };
    }
  };

  // 🔒 DÉCONNEXION SÉCURISÉE
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // 🔒 Nettoyage complet des données sensibles
      clearSensitiveData();
      
      return { error: null };
    } catch (error) {
      // Même en cas d'erreur, nettoyer les données locales
      clearSensitiveData();
      return { error };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });
      if (error) throw error;
      return { data, error:  null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // 🔒 Fonction pour déconnecter toutes les sessions
  const logoutAllDevices = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      clearSensitiveData();
      window.location.href = '/auth';
    } catch (error) {
      logger.error('Logout all devices error:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updateProfile,
    logoutAllDevices, // 🔒 Nouvelle fonction
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
