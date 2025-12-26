import { supabase } from '../lib/supabaseClient';

/**
 * Service pour gérer les likes/réactions sur les posts
 */

/**
 * Vérifier si l'utilisateur a déjà liké un post
 */
export async function hasUserLiked(postId, userId) {
  try {
    console.log('🔍 Vérification like:', { postId, userId });
    const { data, error } = await supabase
      .from('post_reactions')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .eq('reaction_type', 'like')
      .maybeSingle();

    if (error) {
      console.error('❌ Erreur hasUserLiked:', error);
      throw error;
    }
    console.log('✅ Résultat hasUserLiked:', !!data);
    return { hasLiked: !!data, error: null };
  } catch (error) {
    console.error('❌ Exception hasUserLiked:', error);
    return { hasLiked: false, error };
  }
}

/**
 * Ajouter un like à un post
 */
export async function likePost(postId, userId) {
  try {
    console.log('➕ Ajout like:', { postId, userId });
    const { data, error } = await supabase
      .from('post_reactions')
      .insert([
        {
          post_id: postId,
          user_id: userId,
          reaction_type: 'like'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur likePost:', error);
      // Si erreur de duplicata, le like existe déjà
      if (error.code === '23505') {
        return { data: null, error: null, alreadyLiked: true };
      }
      throw error;
    }
    console.log('✅ Like ajouté:', data);
    return { data, error: null, alreadyLiked: false };
  } catch (error) {
    console.error('❌ Exception likePost:', error);
    return { data: null, error, alreadyLiked: false };
  }
}

/**
 * Retirer un like d'un post
 */
export async function unlikePost(postId, userId) {
  try {
    console.log('➖ Suppression like:', { postId, userId });
    const { error } = await supabase
      .from('post_reactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)
      .eq('reaction_type', 'like');

    if (error) {
      console.error('❌ Erreur unlikePost:', error);
      throw error;
    }
    console.log('✅ Like supprimé');
    return { error: null };
  } catch (error) {
    console.error('❌ Exception unlikePost:', error);
    return { error };
  }
}

/**
 * Toggle like (ajouter si pas liké, retirer sinon)
 */
export async function toggleLike(postId, userId) {
  try {
    console.log('🔄 Toggle like:', { postId, userId });
    const { hasLiked, error: checkError } = await hasUserLiked(postId, userId);
    
    if (checkError) {
      console.error('❌ Erreur lors de la vérification:', checkError);
      return { liked: false, error: checkError };
    }
    
    if (hasLiked) {
      const { error } = await unlikePost(postId, userId);
      if (error) return { liked: true, error };
      return { liked: false, error: null };
    } else {
      const { error } = await likePost(postId, userId);
      if (error) return { liked: false, error };
      return { liked: true, error: null };
    }
  } catch (error) {
    console.error('❌ Exception toggleLike:', error);
    return { liked: false, error };
  }
}

/**
 * Compter les likes d'un post
 */
export async function getLikesCount(postId) {
  try {
    const { count, error } = await supabase
      .from('post_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .eq('reaction_type', 'like');

    if (error) throw error;
    return { count: count || 0, error: null };
  } catch (error) {
    logError('Error counting likes:', error);
    return { count: 0, error };
  }
}

/**
 * Récupérer les likes de l'utilisateur pour plusieurs posts
 */
export async function getUserLikesForPosts(postIds, userId) {
  try {
    const { data, error } = await supabase
      .from('post_reactions')
      .select('post_id')
      .in('post_id', postIds)
      .eq('user_id', userId)
      .eq('reaction_type', 'like');

    if (error) throw error;
    
    // Retourner un Set des post_ids likés
    const likedPostIds = new Set((data || []).map(r => r.post_id));
    return { likedPostIds, error: null };
  } catch (error) {
    logError('Error fetching user likes:', error);
    return { likedPostIds: new Set(), error };
  }
}
