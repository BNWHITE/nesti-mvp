import { supabase } from '../lib/supabaseClient';

/**
 * Service pour gérer les commentaires sur les posts
 */

// Helper pour logger uniquement en développement
const logError = (message, error) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(message, error);
  }
};

/**
 * Récupérer les commentaires d'un post/message
 */
export async function getComments(messageId) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', messageId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // Enrichir avec les infos utilisateur si possible
    const enrichedData = await Promise.all((data || []).map(async (comment) => {
      try {
        const { data: userData } = await supabase
          .from('user_profiles')
          .select('id, first_name, email, avatar_url')
          .eq('id', comment.author_id)
          .single();
        return { ...comment, user: userData };
      } catch {
        return { ...comment, user: null };
      }
    }));
    
    return { data: enrichedData, error: null };
  } catch (error) {
    logError('Error fetching comments:', error);
    return { data: null, error };
  }
}

/**
 * Ajouter un commentaire
 */
export async function addComment(messageId, userId, content) {
  try {
    // Insérer le commentaire sans JOIN
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: messageId,
          author_id: userId,
          content: content
        }
      ])
      .select('*')
      .single();

    if (error) throw error;
    
    // Récupérer les infos utilisateur séparément
    let user = null;
    try {
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('id, first_name, email, avatar_url')
        .eq('id', userId)
        .single();
      user = userData;
    } catch {
      // Ignorer si pas de profil
    }
    
    return { data: { ...data, user }, error: null };
  } catch (error) {
    logError('Error adding comment:', error);
    console.error('Détails erreur commentaire:', error);
    return { data: null, error };
  }
}

/**
 * Supprimer un commentaire
 */
export async function deleteComment(commentId, userId) {
  try {
    // Vérifier que l'utilisateur est l'auteur
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('author_id')
      .eq('id', commentId)
      .single();

    if (fetchError) throw fetchError;
    
    if (comment.author_id !== userId) {
      throw new Error('Unauthorized: You can only delete your own comments');
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    logError('Error deleting comment:', error);
    return { success: false, error };
  }
}

/**
 * Compter les commentaires d'un post/message
 */
export async function getCommentCount(messageId) {
  try {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', messageId);

    if (error) throw error;
    return { count, error: null };
  } catch (error) {
    logError('Error counting comments:', error);
    return { count: 0, error };
  }
}
