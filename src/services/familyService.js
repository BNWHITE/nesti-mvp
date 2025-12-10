import supabase from '../config/supabase';

/**
 * Family Service
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

      // Create family
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert([{
          name: familyData.name,
          description: familyData.description || '',
          emoji: familyData.emoji || '👨‍👩‍👧‍👦',
          created_by: user.id,
        }])
        .select()
        .single();

      if (familyError) throw familyError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('family_members')
        .insert([{
          family_id: family.id,
          user_id: user.id,
          role: 'admin',
        }]);

      if (memberError) throw memberError;

      return { data: family, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get user's families
   */
  async getUserFamilies() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('family_members')
        .select(`
          *,
          families (
            id,
            name,
            description,
            emoji,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      return { data: data.map(item => item.families), error: null };
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
        .from('family_members')
        .select(`
          *,
          profiles (
            id,
            email,
            first_name,
            last_name,
            full_name,
            avatar_url
          )
        `)
        .eq('family_id', familyId);

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Invite member to family
   */
  async inviteMember(familyId, userId, role = 'parent') {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .insert([{
          family_id: familyId,
          user_id: userId,
          role: role,
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
   * Update member role
   */
  async updateMemberRole(familyId, userId, newRole) {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .update({ role: newRole })
        .eq('family_id', familyId)
        .eq('user_id', userId)
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
  async removeMember(familyId, userId) {
    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('family_id', familyId)
        .eq('user_id', userId);

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
      const { data, error } = await supabase
        .from('families')
        .update(updates)
        .eq('id', familyId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};
