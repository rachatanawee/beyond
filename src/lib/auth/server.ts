import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';
import { ensureUserProfile } from './profile-utils';

// Cache the user session to avoid multiple database calls
export const getCurrentUser = cache(async () => {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
});

// Cache the user profile to avoid multiple database calls
export const getCurrentUserProfile = cache(async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const profile = await ensureUserProfile(user);
    return profile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
});

// Check if user has specific role
export const hasRole = async (requiredRole: string | string[]) => {
  const profile = await getCurrentUserProfile();
  if (!profile) return false;

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(profile.role);
};

// Check if user has any of the specified roles
export const hasAnyRole = async (roles: string[]) => {
  const profile = await getCurrentUserProfile();
  if (!profile) return false;

  return roles.includes(profile.role);
};

// Check if user is admin
export const isAdmin = async () => {
  return await hasRole('admin');
};

// Check if user is moderator or admin
export const isModerator = async () => {
  return await hasAnyRole(['admin', 'moderator']);
};

// Get user permissions based on role
export const getUserPermissions = async () => {
  const profile = await getCurrentUserProfile();
  if (!profile) return [];

  const permissions: string[] = [];

  switch (profile.role) {
    case 'admin':
      permissions.push(
        'user.create',
        'user.read',
        'user.update',
        'user.delete',
        'admin.access',
        'system.manage',
        'reports.view',
        'analytics.view'
      );
      break;
    case 'moderator':
      permissions.push(
        'user.read',
        'user.update',
        'reports.view',
        'analytics.view'
      );
      break;
    case 'user':
    default:
      permissions.push(
        'profile.read',
        'profile.update'
      );
      break;
  }

  return permissions;
};

// Check if user has specific permission
export const hasPermission = async (permission: string) => {
  const permissions = await getUserPermissions();
  return permissions.includes(permission);
};