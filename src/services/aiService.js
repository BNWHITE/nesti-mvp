import { supabase } from '../lib/supabaseClient';

/**
 * AI Service - Personalized activity suggestions
 * Uses user preferences and family context for recommendations
 */

/**
 * Get personalized activity recommendations
 */
export const getPersonalizedRecommendations = async (user_id, family_id, preferences = []) => {
  try {
    // Get user profile
    const { data: user } = await supabase
      .from('users')
      .select('age, role')
      .eq('id', user_id)
      .single();

    // Get family members to understand family composition
    const { data: familyMembers } = await supabase
      .from('users')
      .select('age, role')
      .eq('family_id', family_id);

    // Get all activities
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate match score for each activity
    const scoredActivities = activities.map(activity => {
      let score = 0;
      const reasons = [];

      // Age matching (40% weight)
      if (user?.age) {
        if (activity.age_min && activity.age_max) {
          if (user.age >= activity.age_min && user.age <= activity.age_max) {
            score += 40;
            reasons.push('Adapté à votre âge');
          } else {
            const ageDiff = Math.min(
              Math.abs(user.age - activity.age_min),
              Math.abs(user.age - activity.age_max)
            );
            score += Math.max(0, 40 - (ageDiff * 5));
          }
        } else {
          score += 20; // Partial score if no age restriction
        }
      } else {
        score += 20;
      }

      // Preference matching (35% weight)
      if (preferences && preferences.length > 0) {
        const categoryMatch = preferences.some(pref => 
          activity.category?.toLowerCase().includes(pref.toLowerCase()) ||
          activity.title?.toLowerCase().includes(pref.toLowerCase()) ||
          activity.description?.toLowerCase().includes(pref.toLowerCase())
        );
        
        if (categoryMatch) {
          score += 35;
          reasons.push('Correspond à vos préférences');
        } else {
          score += 10;
        }
      } else {
        score += 17.5; // Half score if no preferences
      }

      // Difficulty matching based on age/role (15% weight)
      if (activity.difficulty) {
        if (user?.role === 'parent' && activity.difficulty === 'moyen') {
          score += 15;
          reasons.push('Difficulté adaptée');
        } else if (user?.role === 'teen' && (activity.difficulty === 'facile' || activity.difficulty === 'moyen')) {
          score += 15;
          reasons.push('Difficulté adaptée');
        } else if (user?.role === 'child' && activity.difficulty === 'facile') {
          score += 15;
          reasons.push('Difficulté adaptée');
        } else {
          score += 7.5;
        }
      } else {
        score += 7.5;
      }

      // Family size matching (10% weight)
      if (familyMembers && familyMembers.length > 0) {
        // Activities good for families get bonus
        if (activity.category === 'inclusion' || activity.category === 'confiance') {
          score += 10;
          reasons.push('Parfait pour toute la famille');
        } else {
          score += 5;
        }
      } else {
        score += 5;
      }

      // Normalize score to 0-100
      score = Math.min(100, Math.max(0, score));

      return {
        ...activity,
        matchScore: Math.round(score),
        matchReasons: reasons
      };
    });

    // Sort by match score
    scoredActivities.sort((a, b) => b.matchScore - a.matchScore);

    return { data: scoredActivities, error: null };
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return { data: [], error };
  }
};

/**
 * Get activity suggestions based on family context
 */
export const getFamilySuggestions = async (family_id) => {
  try {
    // Get family members
    const { data: members } = await supabase
      .from('users')
      .select('age, role')
      .eq('family_id', family_id);

    if (!members || members.length === 0) {
      return { data: [], error: null };
    }

    // Determine family composition
    const hasChildren = members.some(m => m.role === 'child');
    const hasTeens = members.some(m => m.role === 'teen');
    const familySize = members.length;

    // Get activities suitable for family
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filter and score activities for family context
    const familyActivities = activities.map(activity => {
      let score = 50; // Base score

      // Category bonus for family activities
      if (activity.category === 'inclusion') score += 20;
      if (activity.category === 'confiance') score += 15;
      if (activity.category === 'dialogue') score += 15;

      // Age range bonus (suitable for diverse ages)
      if (activity.age_min && activity.age_max) {
        const ageRange = activity.age_max - activity.age_min;
        if (ageRange >= 30) score += 20; // Wide age range
      }

      // Family size consideration
      if (familySize >= 4) {
        if (activity.title?.toLowerCase().includes('famille') ||
            activity.description?.toLowerCase().includes('famille') ||
            activity.description?.toLowerCase().includes('ensemble')) {
          score += 15;
        }
      }

      return {
        ...activity,
        familyScore: Math.min(100, score)
      };
    });

    // Sort by family score
    familyActivities.sort((a, b) => b.familyScore - a.familyScore);

    return { data: familyActivities.slice(0, 10), error: null };
  } catch (error) {
    console.error('Error getting family suggestions:', error);
    return { data: [], error };
  }
};

/**
 * Create activity suggestion for user
 */
export const createActivitySuggestion = async (user_id, activity_id) => {
  try {
    const { data, error } = await supabase
      .from('suggestions')
      .insert([{
        user_id,
        activity_id,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating suggestion:', error);
    return { data: null, error };
  }
};

/**
 * Update suggestion status
 */
export const updateSuggestionStatus = async (suggestion_id, status) => {
  try {
    const { data, error } = await supabase
      .from('suggestions')
      .update({ status })
      .eq('id', suggestion_id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating suggestion status:', error);
    return { data: null, error };
  }
};

/**
 * Get user's activity history (completed suggestions)
 */
export const getUserActivityHistory = async (user_id) => {
  try {
    const { data, error } = await supabase
      .from('suggestions')
      .select(`
        *,
        activities (*)
      `)
      .eq('user_id', user_id)
      .eq('status', 'completed')
      .order('suggested_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching activity history:', error);
    return { data: [], error };
  }
};

/**
 * Generate daily suggestions for user
 */
export const generateDailySuggestions = async (user_id, family_id, count = 3) => {
  try {
    // Get user preferences from a preferences field (to be added) or use defaults
    const preferences = ['sport', 'art', 'cuisine']; // TODO: Get from user profile

    const { data: recommendations } = await getPersonalizedRecommendations(
      user_id,
      family_id,
      preferences
    );

    // Take top N recommendations
    const topRecommendations = recommendations.slice(0, count);

    // Create suggestions for each
    for (const activity of topRecommendations) {
      await createActivitySuggestion(user_id, activity.id);
    }

    return { data: topRecommendations, error: null };
  } catch (error) {
    console.error('Error generating daily suggestions:', error);
    return { data: [], error };
  }
};

export default {
  getPersonalizedRecommendations,
  getFamilySuggestions,
  createActivitySuggestion,
  updateSuggestionStatus,
  getUserActivityHistory,
  generateDailySuggestions
};
