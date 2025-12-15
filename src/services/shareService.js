import { supabase } from '../lib/supabaseClient';

/**
 * Share Service - For sharing posts with family members
 */

export const shareService = {
  /**
   * Share a post with a specific family member
   * @param {string} postId - The ID of the post to share
   * @param {string} recipientId - The ID of the family member to share with
   * @param {string} message - Optional message to include with the share
   */
  async shareWithMember(postId, recipientId, message = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create a notification for the recipient
      const { data, error } = await supabase
        .from('post_shares')
        .insert([{
          post_id: postId,
          shared_by: user.id,
          shared_with: recipientId,
          message,
        }])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error sharing post:', error);
      return { data: null, error };
    }
  },

  /**
   * Get family members available for sharing
   * @param {string} familyId - The ID of the family
   */
  async getFamilyMembers(familyId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('family_members')
        .select(`
          *,
          user:profiles!user_id (
            id,
            first_name,
            email,
            avatar_url
          )
        `)
        .eq('family_id', familyId)
        .neq('user_id', user.id); // Exclude current user

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching family members:', error);
      return { data: null, error };
    }
  },

  /**
   * Get posts shared with the current user
   */
  async getSharedPosts() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('post_shares')
        .select(`
          *,
          post:posts (
            *,
            author:profiles!author_id (
              id,
              first_name,
              email,
              avatar_url
            )
          ),
          sharer:profiles!shared_by (
            id,
            first_name,
            email
          )
        `)
        .eq('shared_with', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching shared posts:', error);
      return { data: null, error };
    }
  },
};
