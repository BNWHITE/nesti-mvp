import { supabase } from '../lib/supabaseClient';

/**
 * Message Service - For existing database schema
 * Handles family messages and communication
 */

export const messageService = {
  /**
   * Get family messages
   */
  async getFamilyMessages(familyId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('family_messages')
        .select(`
          *,
          sender:users!sender_id (
            id,
            first_name,
            email,
            role
          )
        `)
        .eq('family_id', familyId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Send a message to family
   */
  async sendMessage(familyId, messageText, messageType = 'text', mediaUrl = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('family_messages')
        .insert([{
          family_id: familyId,
          sender_id: user.id,
          message_text: messageText,
          message_type: messageType,
          media_url: mediaUrl,
        }])
        .select(`
          *,
          sender:users!sender_id (
            id,
            first_name,
            email,
            role
          )
        `)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Share activity with family
   */
  async shareActivity(familyId, activityId, message) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('family_messages')
        .insert([{
          family_id: familyId,
          sender_id: user.id,
          message_text: message || `A partagé une activité`,
          message_type: 'activity_share',
        }])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Subscribe to real-time messages
   */
  subscribeToMessages(familyId, callback) {
    const subscription = supabase
      .channel(`family_messages:${familyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'family_messages',
          filter: `family_id=eq.${familyId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return subscription;
  },

  /**
   * Unsubscribe from messages
   */
  async unsubscribe(subscription) {
    if (subscription) {
      await supabase.removeChannel(subscription);
    }
  },
};
