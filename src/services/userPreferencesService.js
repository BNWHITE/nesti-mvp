import { supabase } from '../lib/supabaseClient';

/**
 * User Preferences Service
 * Handles saving and retrieving user preferences and accessibility needs
 */

/**
 * Save user accessibility needs
 * @param {string} userId - User ID
 * @param {Object} accessibilityNeeds - Accessibility preferences
 * @returns {Promise<Object>} Result
 */
export const saveAccessibilityNeeds = async (userId, accessibilityNeeds) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        accessibility_needs: accessibilityNeeds,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      // If column doesn't exist, warn but don't fail
      if (error.code === '42703') {
        console.warn('accessibility_needs column does not exist yet. Please run migrations.');
        return { data: null, error: null };
      }
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error saving accessibility needs:', error);
    return { data: null, error };
  }
};

/**
 * Save user activity preferences
 * @param {string} userId - User ID
 * @param {Array<string>} preferences - Array of preference IDs
 * @returns {Promise<Object>} Result
 */
export const saveActivityPreferences = async (userId, preferences) => {
  try {
    // First, delete existing preferences
    await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', userId);

    // Then insert new preferences
    if (preferences && preferences.length > 0) {
      const preferenceRecords = preferences.map(pref => ({
        user_id: userId,
        preference_type: 'activity',
        preference_value: pref,
        created_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('user_preferences')
        .insert(preferenceRecords)
        .select();

      if (error) throw error;
      return { data, error: null };
    }

    return { data: [], error: null };
  } catch (error) {
    console.error('Error saving activity preferences:', error);
    return { data: null, error };
  }
};

/**
 * Get user accessibility needs
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Accessibility needs
 */
export const getAccessibilityNeeds = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('accessibility_needs')
      .eq('id', userId)
      .single();

    if (error) {
      // If column doesn't exist, return null gracefully
      if (error.code === '42703') {
        console.warn('accessibility_needs column does not exist yet. Please run migrations.');
        return { data: null, error: null };
      }
      throw error;
    }
    return { data: data?.accessibility_needs || null, error: null };
  } catch (error) {
    console.error('Error getting accessibility needs:', error);
    return { data: null, error };
  }
};

/**
 * Get user activity preferences
 * @param {string} userId - User ID
 * @returns {Promise<Array<string>>} Array of preference values
 */
export const getActivityPreferences = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('preference_value')
      .eq('user_id', userId)
      .eq('preference_type', 'activity');

    if (error) throw error;
    return { 
      data: data ? data.map(p => p.preference_value) : [], 
      error: null 
    };
  } catch (error) {
    console.error('Error getting activity preferences:', error);
    return { data: [], error };
  }
};

/**
 * Complete onboarding - save all preferences
 * @param {string} userId - User ID
 * @param {Object} onboardingData - All onboarding data
 * @returns {Promise<Object>} Result
 */
export const completeOnboarding = async (userId, onboardingData) => {
  try {
    const { accessibilityNeeds, preferences } = onboardingData;

    // Save accessibility needs
    if (accessibilityNeeds) {
      await saveAccessibilityNeeds(userId, accessibilityNeeds);
    }

    // Save activity preferences
    if (preferences && preferences.length > 0) {
      await saveActivityPreferences(userId, preferences);
    }

    // Mark onboarding as complete in user profile
    await supabase
      .from('users')
      .update({
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    return { success: true, error: null };
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return { success: false, error };
  }
};

const userPreferencesService = {
  saveAccessibilityNeeds,
  saveActivityPreferences,
  getAccessibilityNeeds,
  getActivityPreferences,
  completeOnboarding
};

export default userPreferencesService;
