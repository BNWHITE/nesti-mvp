// src/services/likeService.js - VERSION SIMPLIFIÉE ET ROBUSTE
import { supabase, getCurrentUser, debugSession } from '../lib/supabaseClient';

/**
 * Toggle like sur un post - VERSION ULTRA-SIMPLE
 * @param {string} postId - ID du post
 * @returns {Promise<{liked: boolean, count: number, error: Error|null}>}
 */
export async function toggleLike(postId) {
  try {
    // 1. Vérifier la session
    const user = await getCurrentUser();
    if (!user) {
      console.error('❌ toggleLike: Utilisateur non connecté');
      await debugSession();
      return { liked: false, count: 0, error: new Error('Non connecté') };
    }
    
    console.log('🔄 toggleLike:', { postId, userId: user.id });
    
    // 2. Vérifier si déjà liké
    const { data: existingLike, error: checkError } = await supabase
      .from('post_reactions')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .eq('reaction_type', 'like')
      .maybeSingle();
    
    if (checkError) {
      console.error('❌ Erreur vérification like:', checkError);
      return { liked: false, count: 0, error: checkError };
    }
    
    let liked = false;
    
    if (existingLike) {
      // 3a. Retirer le like
      console.log('➖ Retrait du like...');
      const { error: deleteError } = await supabase
        .from('post_reactions')
        .delete()
        .eq('id', existingLike.id);
      
      if (deleteError) {
        console.error('❌ Erreur suppression like:', deleteError);
        return { liked: true, count: 0, error: deleteError };
      }
      liked = false;
    } else {
      // 3b. Ajouter le like
      console.log('➕ Ajout du like...');
      const { error: insertError } = await supabase
        .from('post_reactions')
        .insert({
          post_id: postId,
          user_id: user.id,
          reaction_type: 'like'
        });
      
      if (insertError) {
        console.error('❌ Erreur ajout like:', insertError);
        return { liked: false, count: 0, error: insertError };
      }
      liked = true;
    }
    
    // 4. Compter les likes
    const { count, error: countError } = await supabase
      .from('post_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .eq('reaction_type', 'like');
    
    if (countError) {
      console.error('❌ Erreur comptage likes:', countError);
    }
    
    console.log('✅ toggleLike réussi:', { liked, count: count || 0 });
    return { liked, count: count || 0, error: null };
    
  } catch (error) {
    console.error('❌ toggleLike exception:', error);
    return { liked: false, count: 0, error };
  }
}

/**
 * Obtenir les likes de l'utilisateur pour une liste de posts
 * @param {string[]} postIds - Liste des IDs de posts
 * @returns {Promise<{likedPostIds: Set<string>, error: Error|null}>}
 */
export async function getUserLikesForPosts(postIds) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { likedPostIds: new Set(), error: null };
    }
    
    if (!postIds || postIds.length === 0) {
      return { likedPostIds: new Set(), error: null };
    }
    
    const { data, error } = await supabase
      .from('post_reactions')
      .select('post_id')
      .eq('user_id', user.id)
      .eq('reaction_type', 'like')
      .in('post_id', postIds);
    
    if (error) {
      console.error('❌ getUserLikesForPosts:', error);
      return { likedPostIds: new Set(), error };
    }
    
    const likedPostIds = new Set(data?.map(r => r.post_id) || []);
    console.log('📊 Likes utilisateur:', likedPostIds.size, 'posts');
    return { likedPostIds, error: null };
    
  } catch (error) {
    console.error('❌ getUserLikesForPosts exception:', error);
    return { likedPostIds: new Set(), error };
  }
}

/**
 * Compter les likes d'un post
 * @param {string} postId - ID du post
 * @returns {Promise<number>}
 */
export async function getLikeCount(postId) {
  try {
    const { count, error } = await supabase
      .from('post_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .eq('reaction_type', 'like');
    
    if (error) {
      console.error('❌ getLikeCount:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('❌ getLikeCount exception:', error);
    return 0;
  }
}

/**
 * Vérifier si l'utilisateur a liké un post
 * @param {string} postId - ID du post
 * @returns {Promise<boolean>}
 */
export async function hasUserLiked(postId) {
  try {
    const user = await getCurrentUser();
    if (!user) return false;
    
    const { data, error } = await supabase
      .from('post_reactions')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .eq('reaction_type', 'like')
      .maybeSingle();
    
    if (error) {
      console.error('❌ hasUserLiked:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('❌ hasUserLiked exception:', error);
    return false;
  }
}

// Alias pour compatibilité
export const getLikesCount = getLikeCount;
