import supabase from '../config/supabase';

/**
 * Role Service - Handles role-based permissions
 * Roles: admin, parent, teen, child, grandparent
 */

// Role hierarchy and permissions
export const ROLES = {
  ADMIN: 'admin',
  PARENT: 'parent',
  TEEN: 'teen',
  CHILD: 'child',
  GRANDPARENT: 'grandparent'
};

// Permissions by role
export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    canInviteMembers: true,
    canRemoveMembers: true,
    canEditMembers: true,
    canCreateEvents: true,
    canDeleteEvents: true,
    canManageFamily: true,
    canViewAllPosts: true,
    canDeletePosts: true,
    canModerateContent: true
  },
  [ROLES.PARENT]: {
    canInviteMembers: true,
    canRemoveMembers: false,
    canEditMembers: true,
    canCreateEvents: true,
    canDeleteEvents: true,
    canManageFamily: false,
    canViewAllPosts: true,
    canDeletePosts: true,
    canModerateContent: true
  },
  [ROLES.TEEN]: {
    canInviteMembers: false,
    canRemoveMembers: false,
    canEditMembers: false,
    canCreateEvents: true,
    canDeleteEvents: false,
    canManageFamily: false,
    canViewAllPosts: true,
    canDeletePosts: false,
    canModerateContent: false
  },
  [ROLES.CHILD]: {
    canInviteMembers: false,
    canRemoveMembers: false,
    canEditMembers: false,
    canCreateEvents: false,
    canDeleteEvents: false,
    canManageFamily: false,
    canViewAllPosts: true,
    canDeletePosts: false,
    canModerateContent: false
  },
  [ROLES.GRANDPARENT]: {
    canInviteMembers: false,
    canRemoveMembers: false,
    canEditMembers: false,
    canCreateEvents: true,
    canDeleteEvents: false,
    canManageFamily: false,
    canViewAllPosts: true,
    canDeletePosts: false,
    canModerateContent: false
  }
};

/**
 * Check if user has permission
 */
export const hasPermission = (userRole, permission) => {
  const rolePermissions = PERMISSIONS[userRole];
  return rolePermissions ? rolePermissions[permission] : false;
};

/**
 * Get user role
 */
export const getUserRole = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data?.role || ROLES.CHILD;
  } catch (error) {
    console.error('Error getting user role:', error);
    return ROLES.CHILD;
  }
};

/**
 * Check if user can perform action
 */
export const canPerformAction = async (userId, permission) => {
  const role = await getUserRole(userId);
  return hasPermission(role, permission);
};

/**
 * Get role display name in French
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [ROLES.ADMIN]: 'Admin',
    [ROLES.PARENT]: 'Parent',
    [ROLES.TEEN]: 'Ado',
    [ROLES.CHILD]: 'Enfant',
    [ROLES.GRANDPARENT]: 'Grand-parent'
  };
  return roleNames[role] || role;
};

/**
 * Get role color class
 */
export const getRoleColorClass = (role) => {
  const roleColors = {
    [ROLES.ADMIN]: 'role-admin',
    [ROLES.PARENT]: 'role-parent',
    [ROLES.TEEN]: 'role-teen',
    [ROLES.CHILD]: 'role-child',
    [ROLES.GRANDPARENT]: 'role-grandparent'
  };
  return roleColors[role] || 'role-default';
};

export default {
  ROLES,
  PERMISSIONS,
  hasPermission,
  getUserRole,
  canPerformAction,
  getRoleDisplayName,
  getRoleColorClass
};
