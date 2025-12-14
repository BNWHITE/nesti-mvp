import { supabase } from '../lib/supabaseClient';

/**
 * Service pour gérer les commentaires sur les posts
 */

/**
 * Récupérer les commentaires d'un post
 */
export async function getComments(postId) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:users(id, name, email, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching comments:', error);
    return { data: null, error };
  }
}

/**
 * Ajouter un commentaire
 */
export async function addComment(postId, userId, content) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: postId,
          user_id: userId,
          content: content,
          created_at: new Date().toISOString()
        }
      ])
      .select(`
        *,
        user:users(id, name, email, avatar_url)
      `)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error adding comment:', error);
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
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (fetchError) throw fetchError;
    
    if (comment.user_id !== userId) {
      throw new Error('Unauthorized: You can only delete your own comments');
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return { success: false, error };
  }
}

/**
 * Compter les commentaires d'un post
 */
export async function getCommentCount(postId) {
  try {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) throw error;
    return { count, error: null };
  } catch (error) {
    console.error('Error counting comments:', error);
    return { count: 0, error };
  }
}
