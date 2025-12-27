import { supabase } from '../lib/supabaseClient';

/**
 * Service pour gérer les posts (CRUD)
 */

/**
 * Créer un nouveau post
 */
export async function createPost(userId, familyId, content, options = {}) {
  try {
    const postData = {
      author_id: userId,
      family_id: familyId,
      content: content,
      emoji: options.emoji || '📝',
      image_url: options.imageUrl || null,
      video_url: options.videoUrl || null,
      thumbnail_url: options.thumbnailUrl || null
    };

    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erreur création post:', error);
    return { data: null, error };
  }
}

/**
 * Modifier un post (seulement l'auteur peut modifier)
 */
export async function updatePost(postId, userId, updates) {
  try {
    // Vérifier que l'utilisateur est l'auteur
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (fetchError) throw fetchError;
    if (post.author_id !== userId) {
      return { data: null, error: { message: 'Non autorisé' } };
    }

    const allowedUpdates = {};
    if (updates.content !== undefined) allowedUpdates.content = updates.content;
    if (updates.emoji !== undefined) allowedUpdates.emoji = updates.emoji;
    if (updates.imageUrl !== undefined) allowedUpdates.image_url = updates.imageUrl;
    if (updates.videoUrl !== undefined) allowedUpdates.video_url = updates.videoUrl;
    allowedUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('posts')
      .update(allowedUpdates)
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erreur modification post:', error);
    return { data: null, error };
  }
}

/**
 * Supprimer un post (seulement l'auteur peut supprimer)
 */
export async function deletePost(postId, userId) {
  try {
    // Vérifier que l'utilisateur est l'auteur
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (fetchError) throw fetchError;
    if (post.author_id !== userId) {
      return { success: false, error: { message: 'Non autorisé' } };
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Erreur suppression post:', error);
    return { success: false, error };
  }
}

/**
 * Récupérer les posts d'une famille
 */
export async function getFamilyPosts(familyId, limit = 20) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Erreur chargement posts:', error);
    return { data: [], error };
  }
}
