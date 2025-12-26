import { supabase } from '../lib/supabaseClient';

/**
 * Activity Service - For existing database schema
 * Handles activity suggestions and recommendations
 */

export const activityService = {
  /**
   * Get all activities
   */
  async getActivities(filters = {}) {
    try {
      let query = supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }
      if (filters.age_min) {
        query = query.gte('age_min', filters.age_min);
      }
      if (filters.age_max) {
        query = query.lte('age_max', filters.age_max);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get activity by ID
   */
  async getActivityById(activityId) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get user's activity suggestions
   */
  async getUserSuggestions(userId) {
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select(`
          *,
          activities (*)
        `)
        .eq('user_id', userId)
        .order('suggested_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Create activity suggestion for user
   */
  async createSuggestion(userId, activityId) {
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .insert([{
          user_id: userId,
          activity_id: activityId,
          status: 'pending',
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
   * Update suggestion status
   */
  async updateSuggestionStatus(suggestionId, status) {
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .update({ status })
        .eq('id', suggestionId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Create new activity (admin only)
   */
  async createActivity(activityData) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([activityData])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};
