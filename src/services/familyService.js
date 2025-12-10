import supabase from '../config/supabase';

/**
 * Family Service - Adapted for existing database schema
 * Handles all family-related operations with privacy-by-design
 */

// Helper function to get user profile
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Helper function to create family
export const createFamily = async ({ family_name, user_id, user_email, user_first_name }) => {
  try {
    console.log('Starting family creation for user:', user_id);
    
    // Step 1: Check if user profile already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user_id)
      .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when no rows

    console.log('Existing user check:', { existingUser, checkError });

    // Step 2: Create family first (this should work with RLS)
    const { data: family, error: familyError } = await supabase
      .from('families')
      .insert([{
        family_name: family_name,
        // subscription_type removed - not in the actual database schema
      }])
      .select()
      .single();

    if (familyError) {
      console.error('Family creation error:', familyError);
      throw new Error(`Impossible de créer la famille: ${familyError.message}`);
    }

    console.log('Family created successfully:', family);

    // Step 3: Create or update user profile with the family_id
    if (!existingUser) {
      // Create new user profile
      // Note: RLS policy should allow authenticated users to insert their own profile
      console.log('Creating new user profile');
      
      // First, try to create with minimal required fields
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert([{
          id: user_id,
          email: user_email,
          first_name: user_first_name || user_email.split('@')[0],
          family_id: family.id,
          role: 'parent'
          // age is nullable, so we don't include it
        }])
        .select()
        .maybeSingle(); // Use maybeSingle to handle potential RLS issues

      if (createUserError) {
        console.error('User creation error:', createUserError);
        console.error('Error details:', JSON.stringify(createUserError, null, 2));
        
        // If RLS policy blocks the insert, the user might need to be created differently
        // or the RLS policy needs to be adjusted in Supabase
        // Try to clean up the family if user creation fails
        await supabase.from('families').delete().eq('id', family.id);
        
        // Provide helpful error message
        if (createUserError.message.includes('row-level security')) {
          throw new Error(`Configuration de sécurité: Veuillez contacter le support. Les politiques de sécurité de la base de données empêchent la création du profil.`);
        }
        
        throw new Error(`Erreur lors de la création du profil: ${createUserError.message}`);
      }
      console.log('User profile created:', newUser);
    } else {
      // Update existing user with family_id
      console.log('Updating existing user profile');
      const { data: updatedUser, error: userError } = await supabase
        .from('users')
        .update({ 
          family_id: family.id,
          first_name: user_first_name || existingUser.first_name,
          role: existingUser.role || 'parent'
        })
        .eq('id', user_id)
        .select()
        .single();

      if (userError) {
        console.error('User update error:', userError);
        // Try to clean up the family if user update fails
        await supabase.from('families').delete().eq('id', family.id);
        throw new Error(`Erreur lors de la mise à jour du profil: ${userError.message}`);
      }
      console.log('User profile updated:', updatedUser);
    }

    return family;
  } catch (error) {
    console.error('Error in createFamily:', error);
    // Return more specific error message
    if (error.message) {
      throw error;
    } else {
      throw new Error('Erreur lors de la création de votre famille. Vérifiez votre connexion.');
    }
  }
};

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
