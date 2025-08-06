import { getCurrentUserProfile, hasRole, hasPermission } from '@/lib/auth/server';
import { ReactNode } from 'react';

interface RoleBasedWrapperProps {
  children: ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallback?: ReactNode;
  requireAll?: boolean; // If true, user must have ALL roles/permissions. If false, user needs ANY.
}

export async function RoleBasedWrapper({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallback = null,
  requireAll = false,
}: RoleBasedWrapperProps) {
  const profile = await getCurrentUserProfile();
  
  // If no user, don't show content
  if (!profile) {
    return <>{fallback}</>;
  }

  // Check role requirements
  if (requiredRoles.length > 0) {
    const roleChecks = await Promise.all(
      requiredRoles.map(role => hasRole(role))
    );
    
    const hasRequiredRole = requireAll 
      ? roleChecks.every(Boolean) 
      : roleChecks.some(Boolean);
    
    if (!hasRequiredRole) {
      return <>{fallback}</>;
    }
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const permissionChecks = await Promise.all(
      requiredPermissions.map(permission => hasPermission(permission))
    );
    
    const hasRequiredPermission = requireAll
      ? permissionChecks.every(Boolean)
      : permissionChecks.some(Boolean);
    
    if (!hasRequiredPermission) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}