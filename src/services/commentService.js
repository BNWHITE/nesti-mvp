import { supabase } from '../lib/supabaseClient';
import { createNotification } from './notificationService';

/**
 * Service pour gérer les commentaires sur les posts
 */

/**
 * Récupérer les commentaires d'un post (avec réponses)
 */
export async function getComments(postId) {
  try {
    // Récupérer tous les commentaires (parents et réponses)
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // Enrichir avec les infos utilisateur et compteur de likes
    const enrichedData = await Promise.all((data || []).map(async (comment) => {
      // Info utilisateur
      let user = null;
      try {
        const { data: userData } = await supabase
          .from('user_profiles')
          .select('id, first_name, avatar_url')
          .eq('id', comment.author_id)
          .maybeSingle();
        user = userData;
      } catch { /* ignore */ }
      
      // Compteur de likes
      let likesCount = 0;
      try {
        const { count } = await supabase
          .from('comment_reactions')
          .select('*', { count: 'exact', head: true })
          .eq('comment_id', comment.id);
        likesCount = count || 0;
      } catch { /* ignore */ }
      
      return { ...comment, user, likes_count: likesCount };
    }));
    
    // Organiser en arbre (commentaires parents avec leurs réponses)
    const parentComments = enrichedData.filter(c => !c.parent_id);
    const replies = enrichedData.filter(c => c.parent_id);
    
    const commentsWithReplies = parentComments.map(parent => ({
      ...parent,
      replies: replies.filter(r => r.parent_id === parent.id)
    }));
    
    return { data: commentsWithReplies, error: null };
  } catch (error) {
    console.error('Error fetching comments:', error);
    return { data: [], error };
  }
}

/**
 * Ajouter un commentaire (ou réponse)
 */
export async function addComment(postId, userId, content, parentId = null) {
  try {
    const insertData = {
      post_id: postId,
      author_id: userId,
      content: content
    };
    
    if (parentId) {
      insertData.parent_id = parentId;
    }
    
    const { data, error } = await supabase
      .from('comments')
      .insert([insertData])
      .select('*')
      .single();

    if (error) throw error;
    
    // Récupérer l'auteur du post pour la notification
    try {
      const { data: post } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();
      
      if (post && post.author_id !== userId) {
        await createNotification({
          userId: post.author_id,
          actorId: userId,
          type: parentId ? 'reply' : 'comment',
          postId: postId,
          commentId: data.id,
          message: content.substring(0, 100)
        });
      }
      
      // Si c'est une réponse, notifier l'auteur du commentaire parent
      if (parentId) {
        const { data: parentComment } = await supabase
          .from('comments')
          .select('author_id')
          .eq('id', parentId)
          .single();
        
        if (parentComment && parentComment.author_id !== userId) {
          await createNotification({
            userId: parentComment.author_id,
            actorId: userId,
            type: 'reply',
            postId: postId,
            commentId: data.id,
            message: content.substring(0, 100)
          });
        }
      }
    } catch { /* ignore notification errors */ }
    
    return { data: { ...data, user: null, likes_count: 0, replies: [] }, error: null };
  } catch (error) {
    console.error('Error adding comment:', error);
    return { data: null, error };
  }
}

/**
 * Liker un commentaire
 */
export async function likeComment(commentId, userId) {
  try {
    const { error } = await supabase
      .from('comment_reactions')
      .insert([{ comment_id: commentId, user_id: userId }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Déjà liké, on unlike
        return unlikeComment(commentId, userId);
      }
      throw error;
    }
    
    // Notifier l'auteur du commentaire
    try {
      const { data: comment } = await supabase
        .from('comments')
        .select('author_id, post_id')
        .eq('id', commentId)
        .single();
      
      if (comment && comment.author_id !== userId) {
        await createNotification({
          userId: comment.author_id,
          actorId: userId,
          type: 'like_comment',
          postId: comment.post_id,
          commentId: commentId
        });
      }
    } catch { /* ignore */ }
    
    return { liked: true, error: null };
  } catch (error) {
    console.error('Error liking comment:', error);
    return { liked: false, error };
  }
}

/**
 * Unliker un commentaire
 */
export async function unlikeComment(commentId, userId) {
  try {
    const { error } = await supabase
      .from('comment_reactions')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId);

    if (error) throw error;
    return { liked: false, error: null };
  } catch (error) {
    console.error('Error unliking comment:', error);
    return { liked: true, error };
  }
}

/**
 * Vérifier si l'utilisateur a liké un commentaire
 */
export async function hasUserLikedComment(commentId, userId) {
  try {
    const { data } = await supabase
      .from('comment_reactions')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .maybeSingle();
    
    return { hasLiked: !!data, error: null };
  } catch (error) {
    return { hasLiked: false, error };
  }
}

/**
 * Supprimer un commentaire
 */
export async function deleteComment(commentId, userId) {
  try {
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('author_id')
      .eq('id', commentId)
      .single();

    if (fetchError) throw fetchError;
    
    if (comment.author_id !== userId) {
      throw new Error('Unauthorized');
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
 * Modifier un commentaire
 */
export async function updateComment(commentId, userId, newContent) {
  try {
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('author_id')
      .eq('id', commentId)
      .single();

    if (fetchError) throw fetchError;
    
    if (comment.author_id !== userId) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
      .from('comments')
      .update({ 
        content: newContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating comment:', error);
    return { data: null, error };
  }
}
