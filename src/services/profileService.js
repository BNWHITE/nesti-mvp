import { supabase } from '../lib/supabaseClient';

/**
 * Service pour gérer les profils utilisateurs
 */

/**
 * Récupérer le profil d'un utilisateur
 */
export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { data: null, error };
  }
}

/**
 * Mettre à jour le profil utilisateur
 */
export async function updateUserProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { data: null, error };
  }
}

/**
 * Mettre à jour l'avatar
 */
export async function updateAvatar(userId, avatarUrl) {
  return updateUserProfile(userId, { avatar_url: avatarUrl });
}

/**
 * Mettre à jour les informations personnelles
 */
export async function updatePersonalInfo(userId, { name, bio, phone }) {
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (bio !== undefined) updates.bio = bio;
  if (phone !== undefined) updates.phone = phone;

  return updateUserProfile(userId, updates);
}

/**
 * Mettre à jour les préférences de notification
 */
export async function updateNotificationPreferences(userId, preferences) {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return { data: null, error };
  }
}

/**
 * Récupérer les préférences de l'utilisateur
 */
export async function getUserSettings(userId) {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Si aucun paramètre n'existe, retourner des valeurs par défaut
    if (error && error.code === 'PGRST116') {
      return {
        data: {
          push_notifications: true,
          email_notifications: true,
          sound_enabled: true,
          vibration_enabled: true,
          profile_visibility: 'family',
          who_can_see_posts: 'family',
          who_can_comment: 'family'
        },
        error: null
      };
    }

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return { data: null, error };
  }
}

/**
 * Mettre à jour le rôle d'un membre
 */
export async function updateMemberRole(userId, newRole) {
  return updateUserProfile(userId, { role: newRole });
}

/**
 * Supprimer un membre de la famille
 */
export async function removeFamilyMember(userId, familyId) {
  try {
    // Supprimer l'association famille-membre
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('user_id', userId)
      .eq('family_id', familyId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error removing family member:', error);
    return { success: false, error };
  }
}

/**
 * Mettre à jour les informations d'un membre
 */
export async function updateFamilyMember(userId, updates) {
  return updateUserProfile(userId, updates);
}
