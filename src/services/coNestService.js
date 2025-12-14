import { supabase } from '../lib/supabaseClient';

/**
 * Co-Nest Service
 * Manages linked families (Co-Nests) that can share content and events
 */

/**
 * Get all Co-Nests for a family
 * @param {string} familyId - Family ID
 * @returns {Promise} Co-Nest data
 */
export const getCoNests = async (familyId) => {
  try {
    const { data, error } = await supabase
      .from('co_nests')
      .select(`
        *,
        family1:families!co_nests_family_id_1_fkey (
          id,
          family_name
        ),
        family2:families!co_nests_family_id_2_fkey (
          id,
          family_name
        )
      `)
      .or(`family_id_1.eq.${familyId},family_id_2.eq.${familyId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data to show the "other" family
    const transformedData = data?.map(coNest => {
      const isFamily1 = coNest.family_id_1 === familyId;
      return {
        id: coNest.id,
        connectedFamily: isFamily1 ? coNest.family2 : coNest.family1,
        status: coNest.status,
        created_at: coNest.created_at,
        created_by: coNest.created_by
      };
    }) || [];

    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Error fetching co-nests:', error);
    return { data: [], error };
  }
};

/**
 * Create a Co-Nest invitation
 * @param {string} familyId1 - First family ID (requester)
 * @param {string} familyId2 - Second family ID (invitee)
 * @param {string} createdBy - User ID creating the invitation
 * @returns {Promise} Created Co-Nest
 */
export const createCoNest = async (familyId1, familyId2, createdBy) => {
  try {
    // Ensure family IDs are in consistent order for database constraint
    // UUIDs are strings, so lexicographic comparison ensures consistent ordering
    const [fid1, fid2] = familyId1 < familyId2 ? [familyId1, familyId2] : [familyId2, familyId1];

    const { data, error } = await supabase
      .from('co_nests')
      .insert([{
        family_id_1: fid1,
        family_id_2: fid2,
        status: 'pending',
        created_by: createdBy
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating co-nest:', error);
    return { data: null, error };
  }
};

/**
 * Accept a Co-Nest invitation
 * @param {string} coNestId - Co-Nest ID
 * @returns {Promise} Updated Co-Nest
 */
export const acceptCoNest = async (coNestId) => {
  try {
    const { data, error } = await supabase
      .from('co_nests')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', coNestId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error accepting co-nest:', error);
    return { data: null, error };
  }
};

/**
 * Decline a Co-Nest invitation
 * @param {string} coNestId - Co-Nest ID
 * @returns {Promise} Updated Co-Nest
 */
export const declineCoNest = async (coNestId) => {
  try {
    const { data, error } = await supabase
      .from('co_nests')
      .update({ status: 'declined', updated_at: new Date().toISOString() })
      .eq('id', coNestId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error declining co-nest:', error);
    return { data: null, error };
  }
};

/**
 * Remove a Co-Nest connection
 * @param {string} coNestId - Co-Nest ID
 * @returns {Promise}
 */
export const removeCoNest = async (coNestId) => {
  try {
    const { error } = await supabase
      .from('co_nests')
      .delete()
      .eq('id', coNestId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error removing co-nest:', error);
    return { error };
  }
};

/**
 * Get shared events with Co-Nests
 * @param {string} coNestId - Co-Nest ID
 * @returns {Promise} Shared events
 */
export const getCoNestEvents = async (coNestId) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('shared_with_co_nest', coNestId)
      .eq('is_co_nest_event', true)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching co-nest events:', error);
    return { data: [], error };
  }
};

/**
 * Search for a family by code or name to create Co-Nest
 * @param {string} searchTerm - Search term (family code or name)
 * @returns {Promise} Family data
 */
export const searchFamily = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('families')
      .select('id, family_name, family_code')
      .or(`family_name.ilike.%${searchTerm}%,family_code.eq.${searchTerm}`)
      .limit(10);

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error searching families:', error);
    return { data: [], error };
  }
};

const coNestService = {
  getCoNests,
  createCoNest,
  acceptCoNest,
  declineCoNest,
  removeCoNest,
  getCoNestEvents,
  searchFamily
};

export default coNestService;
