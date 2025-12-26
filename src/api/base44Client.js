// src/api/base44Client.js
import logger from '../lib/logger';
import { supabase } from '@/lib/supabaseClient';

// Helper pour mapper les noms d'entités vers les tables Supabase (snake_case)
const getTable = (entityName) => {
  const map = {
    UserProfile: 'user_profiles',
    Family: 'families',
    FamilyConnection: 'family_connections',
    FamilyPost: 'family_posts',
    PostReaction: 'post_reactions',
    PostComment: 'post_comments',
    FamilyEvent: 'family_events',
    Activity: 'activities',
    SavedActivity: 'saved_activities',
    ChatMessage: 'chat_messages',
    Suggestion: 'suggestions',
    Notification: 'notifications'
  };
  return map[entityName] || entityName.toLowerCase() + 's';
};

export const base44 = {
  auth: {
    me: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");
      return user;
    },
    logout: async () => await supabase.auth.signOut(),
  },
  entities: new Proxy({}, {
    get: (_, entityName) => ({
      filter: async (query = {}, orderBy = null, limit = null) => {
        let req = supabase.from(getTable(entityName)).select('*');
        
        // Gestion simple des filtres
        Object.keys(query).forEach(key => {
          if (Array.isArray(query[key])) {
             req = req.in(key, query[key]);
          } else {
             req = req.eq(key, query[key]);
          }
        });

        if (orderBy) {
          const ascending = !orderBy.startsWith('-');
          const col = ascending ? orderBy : orderBy.substring(1);
          req = req.order(col, { ascending });
        }
        if (limit) req = req.limit(limit);

        const { data, error } = await req;
        if (error) throw error;
        return data || [];
      },
      list: async (orderBy = null, limit = null) => {
        let req = supabase.from(getTable(entityName)).select('*');
        if (orderBy) {
          const ascending = !orderBy.startsWith('-');
          const col = ascending ? orderBy : orderBy.substring(1);
          req = req.order(col, { ascending });
        }
        if (limit) req = req.limit(limit);
        const { data, error } = await req;
        if (error) throw error;
        return data || [];
      },
      create: async (data) => {
        const { data: created, error } = await supabase.from(getTable(entityName)).insert(data).select().single();
        if (error) throw error;
        return created;
      },
      update: async (id, data) => {
        const { data: updated, error } = await supabase.from(getTable(entityName)).update(data).eq('id', id).select();
        if (error) throw error;
        return updated;
      },
      delete: async (id) => {
        const { error } = await supabase.from(getTable(entityName)).delete().eq('id', id);
        if (error) throw error;
        return true;
      }
    })
  }),
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const fileName = `${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage.from('uploads').upload(fileName, file);
        if (error) throw error;
        // Récupérer l'URL publique
        const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);
        return { file_url: publicUrl };
      },
      InvokeLLM: async (params) => {
        // Pour le MVP, on simule une réponse ou on appelle une Edge Function Supabase
        logger.log("Appel LLM simulé avec:", params);
        return "Ceci est une réponse simulée de Nesti IA. Connectez une Edge Function pour une vraie IA.";
      }
    }
  }
};
