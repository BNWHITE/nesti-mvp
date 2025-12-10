import supabase from '../config/supabase';

/**
 * Family Service - Adapted for existing database schema
 * Handles all family-related operations with privacy-by-design
 */

export const familyService = {
  /**
   * Create a new family
   */
  async createFamily(familyData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create family with existing schema
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert([{
          family_name: familyData.name || familyData.family_name,
          subscription_type: 'free',
        }])
        .select()
        .single();

      if (familyError) throw familyError;

      // Add creator as user in the family
      const { error: userError } = await supabase
        .from('users')
        .update({ family_id: family.id })
        .eq('id', user.id);

      if (userError) throw userError;

      return { data: family, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get user's family
   */
  async getUserFamily() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's family
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('family_id')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;
      if (!userData?.family_id) return { data: null, error: null };

      const { data: family, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('id', userData.family_id)
        .single();

      if (familyError) throw familyError;

      return { data: family, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get family members
   */
  async getFamilyMembers(familyId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('family_id', familyId);

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Update user role in family
   */
  async updateMemberRole(userId, newRole) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Remove member from family
   */
  async removeMember(userId) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ family_id: null })
        .eq('id', userId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  /**
   * Update family
   */
  async updateFamily(familyId, updates) {
    try {
      const updateData = {};
      if (updates.name) updateData.family_name = updates.name;
      if (updates.subscription_type) updateData.subscription_type = updates.subscription_type;

      const { data, error } = await supabase
        .from('families')
        .update(updateData)
        .eq('id', familyId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};
