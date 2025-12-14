import { supabase } from '../lib/supabaseClient';

/**
 * Invitation Service
 * Manages family invitation links and codes
 */

/**
 * Generate a unique invitation code
 * @returns {string} Invitation code
 */
const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking chars
  let code = 'NEST-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Create a family invitation link
 * @param {string} familyId - Family ID
 * @param {string} createdBy - User ID creating the invitation
 * @param {number} maxUses - Maximum number of uses (default: 1)
 * @param {number} expiryDays - Days until expiry (default: 7)
 * @returns {Promise} Created invitation
 */
export const createInvitation = async (familyId, createdBy, maxUses = 1, expiryDays = 7) => {
  try {
    const inviteCode = generateInviteCode();
    const inviteLink = `${window.location.origin}/join?code=${inviteCode}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const { data, error } = await supabase
      .from('family_invitations')
      .insert([{
        family_id: familyId,
        invite_code: inviteCode,
        invite_link: inviteLink,
        expires_at: expiresAt.toISOString(),
        max_uses: maxUses,
        uses_count: 0,
        created_by: createdBy
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating invitation:', error);
    return { data: null, error };
  }
};

/**
 * Get all invitations for a family
 * @param {string} familyId - Family ID
 * @returns {Promise} Invitation list
 */
export const getInvitations = async (familyId) => {
  try {
    const { data, error } = await supabase
      .from('family_invitations')
      .select(`
        *,
        creator:users!family_invitations_created_by_fkey (
          id,
          first_name,
          email
        )
      `)
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return { data: [], error };
  }
};

/**
 * Get active (valid) invitations for a family
 * @param {string} familyId - Family ID
 * @returns {Promise} Active invitation list
 */
export const getActiveInvitations = async (familyId) => {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('family_invitations')
      .select('*')
      .eq('family_id', familyId)
      .gt('expires_at', now)
      .filter('uses_count', 'lt', 'max_uses')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching active invitations:', error);
    return { data: [], error };
  }
};

/**
 * Validate an invitation code
 * @param {string} code - Invitation code
 * @returns {Promise} Invitation details if valid
 */
export const validateInvitation = async (code) => {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('family_invitations')
      .select(`
        *,
        family:families (
          id,
          family_name
        )
      `)
      .eq('invite_code', code)
      .gt('expires_at', now)
      .single();

    if (error) throw error;

    // Check if invitation has uses left
    if (data && data.uses_count >= data.max_uses) {
      return { data: null, error: { message: 'Cette invitation a atteint son nombre maximum d\'utilisations' } };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error validating invitation:', error);
    return { data: null, error: { message: 'Code d\'invitation invalide ou expiré' } };
  }
};

/**
 * Use an invitation code to join a family
 * @param {string} code - Invitation code
 * @param {string} userId - User ID joining the family
 * @returns {Promise} Result with family_id
 */
export const useInvitation = async (code, userId) => {
  try {
    // First validate the invitation
    const { data: invitation, error: validationError } = await validateInvitation(code);
    
    if (validationError || !invitation) {
      return { data: null, error: validationError };
    }

    // Call the database function to use the invitation code
    const { data: familyId, error: useError } = await supabase
      .rpc('use_invitation_code', { code });

    if (useError) throw useError;

    // Add user to the family with default role
    const { error: memberError } = await supabase
      .from('family_members')
      .insert([{
        family_id: familyId,
        user_id: userId,
        role: 'member',
        joined_at: new Date().toISOString()
      }]);

    if (memberError) throw memberError;

    return { data: { family_id: familyId, family_name: invitation.family.family_name }, error: null };
  } catch (error) {
    console.error('Error using invitation:', error);
    return { data: null, error };
  }
};

/**
 * Delete an invitation
 * @param {string} invitationId - Invitation ID
 * @returns {Promise}
 */
export const deleteInvitation = async (invitationId) => {
  try {
    const { error } = await supabase
      .from('family_invitations')
      .delete()
      .eq('id', invitationId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting invitation:', error);
    return { error };
  }
};

/**
 * Extend invitation expiry date
 * @param {string} invitationId - Invitation ID
 * @param {number} additionalDays - Additional days to add
 * @returns {Promise}
 */
export const extendInvitation = async (invitationId, additionalDays = 7) => {
  try {
    // Get current invitation
    const { data: current } = await supabase
      .from('family_invitations')
      .select('expires_at')
      .eq('id', invitationId)
      .single();

    if (!current) throw new Error('Invitation not found');

    const newExpiryDate = new Date(current.expires_at);
    newExpiryDate.setDate(newExpiryDate.getDate() + additionalDays);

    const { data, error } = await supabase
      .from('family_invitations')
      .update({ expires_at: newExpiryDate.toISOString() })
      .eq('id', invitationId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error extending invitation:', error);
    return { data: null, error };
  }
};

/**
 * Copy invitation link to clipboard
 * @param {string} inviteLink - Invitation link
 * @returns {Promise<boolean>} Success status
 */
export const copyInviteLinkToClipboard = async (inviteLink) => {
  try {
    await navigator.clipboard.writeText(inviteLink);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = inviteLink;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError);
      return false;
    }
  }
};

const invitationService = {
  createInvitation,
  getInvitations,
  getActiveInvitations,
  validateInvitation,
  useInvitation,
  deleteInvitation,
  extendInvitation,
  copyInviteLinkToClipboard
};

export default invitationService;
