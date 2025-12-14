import { supabase } from '../lib/supabaseClient';

/**
 * Member Service - Complete member management
 * Handles invitations, role updates, member removal
 */

/**
 * Get all family members
 */
export const getFamilyMembers = async (family_id) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('family_id', family_id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching family members:', error);
    return { data: [], error };
  }
};

/**
 * Invite a new member (creates invitation record)
 * For MVP, we'll use a simple approach - just add email to a JSON field in family_messages
 */
export const inviteMember = async ({ family_id, email, role, invited_by, message }) => {
  try {
    const invitationData = {
      email,
      role,
      invited_by,
      message: message || 'Rejoignez notre famille sur Nesti !',
      status: 'pending',
      invited_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('family_messages')
      .insert([{
        family_id,
        sender_id: invited_by,
        message_text: JSON.stringify(invitationData),
        message_type: 'invitation'
      }])
      .select()
      .single();

    if (error) throw error;

    // In a full implementation, you would send an email here
    console.log('Invitation sent to:', email);

    return { data, error: null };
  } catch (error) {
    console.error('Error inviting member:', error);
    return { data: null, error };
  }
};

/**
 * Get pending invitations
 */
export const getPendingInvitations = async (family_id) => {
  try {
    const { data, error } = await supabase
      .from('family_messages')
      .select(`
        id,
        message_text,
        created_at,
        sender_id,
        users!family_messages_sender_id_fkey (
          first_name,
          email
        )
      `)
      .eq('family_id', family_id)
      .eq('message_type', 'invitation')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const invitations = data.map(msg => {
      const invitationData = JSON.parse(msg.message_text);
      return {
        id: msg.id,
        ...invitationData,
        invited_by_name: msg.users?.first_name || 'Un membre',
        created_at: msg.created_at
      };
    });

    return { data: invitations.filter(inv => inv.status === 'pending'), error: null };
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return { data: [], error };
  }
};

/**
 * Update member role
 */
export const updateMemberRole = async (user_id, new_role) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role: new_role })
      .eq('id', user_id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating member role:', error);
    return { data: null, error };
  }
};

/**
 * Update member info
 */
export const updateMemberInfo = async (user_id, updates) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user_id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating member info:', error);
    return { data: null, error };
  }
};

/**
 * Remove member from family
 */
export const removeMember = async (user_id) => {
  try {
    // Set family_id to null instead of deleting the user
    const { data, error } = await supabase
      .from('users')
      .update({ family_id: null })
      .eq('id', user_id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error removing member:', error);
    return { data: null, error };
  }
};

/**
 * Get member details
 */
export const getMemberDetails = async (user_id) => {
  try {
    const { data, error} = await supabase
      .from('users')
      .select('*')
      .eq('id', user_id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching member details:', error);
    return { data: null, error };
  }
};

/**
 * Cancel invitation
 */
export const cancelInvitation = async (invitation_id) => {
  try {
    const { error } = await supabase
      .from('family_messages')
      .delete()
      .eq('id', invitation_id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error canceling invitation:', error);
    return { error };
  }
};

/**
 * Accept invitation (when user signs up with invitation link)
 */
export const acceptInvitation = async (invitation_id, user_id) => {
  try {
    // Get invitation details
    const { data: invitation } = await supabase
      .from('family_messages')
      .select('message_text, family_id')
      .eq('id', invitation_id)
      .single();

    if (!invitation) throw new Error('Invitation not found');

    const invitationData = JSON.parse(invitation.message_text);

    // Update user with family_id and role
    await supabase
      .from('users')
      .update({
        family_id: invitation.family_id,
        role: invitationData.role
      })
      .eq('id', user_id);

    // Update invitation status
    invitationData.status = 'accepted';
    await supabase
      .from('family_messages')
      .update({ message_text: JSON.stringify(invitationData) })
      .eq('id', invitation_id);

    return { error: null };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return { error };
  }
};

const memberService = {
  getFamilyMembers,
  inviteMember,
  getPendingInvitations,
  updateMemberRole,
  updateMemberInfo,
  removeMember,
  getMemberDetails,
  cancelInvitation,
  acceptInvitation
};

export default memberService;
