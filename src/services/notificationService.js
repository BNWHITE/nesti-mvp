import { supabase } from '../lib/supabaseClient';

/**
 * Service de notifications
 */

/**
 * Créer une notification
 */
export async function createNotification({ userId, actorId, type, postId = null, commentId = null, message = '' }) {
  // Ne pas notifier soi-même
  if (userId === actorId) return { data: null, error: null };
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        actor_id: actorId,
        type,
        post_id: postId,
        comment_id: commentId,
        message,
        is_read: false
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erreur création notification:', error);
    return { data: null, error };
  }
}

/**
 * Récupérer les notifications d'un utilisateur
 */
export async function getNotifications(userId, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    return { data: [], error };
  }
}

/**
 * Compter les notifications non lues
 */
export async function getUnreadCount(userId) {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Erreur comptage notifications:', error);
    return { count: 0, error };
  }
}

/**
 * Marquer une notification comme lue
 */
export async function markAsRead(notificationId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Erreur marquage notification:', error);
    return { error };
  }
}

/**
 * Marquer toutes les notifications comme lues
 */
export async function markAllAsRead(userId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Erreur marquage notifications:', error);
    return { error };
  }
}
