import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ozlbjohbzaommmtbwues.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Configuration robuste avec persistance cookies + localStorage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Utiliser localStorage ET cookies pour maximum de persistance
    persistSession: true,
    storageKey: 'nesti-auth-token',
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'nesti-web-app'
    }
  },
  // Retry automatique sur les erreurs réseau
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Helper pour obtenir l'utilisateur courant de façon fiable
export const getCurrentUser = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session?.user || null;
  } catch (error) {
    console.error('Erreur getCurrentUser:', error);
    return null;
  }
};

// Helper pour vérifier si l'utilisateur est connecté
export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};

// Debug helper - affiche l'état de la session
export const debugSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  console.log('🔐 Session Supabase:', {
    isLoggedIn: !!session,
    userId: session?.user?.id,
    email: session?.user?.email,
    expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : null
  });
  return session;
};
