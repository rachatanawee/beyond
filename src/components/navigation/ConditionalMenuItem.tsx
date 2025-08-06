import { getCurrentUserProfile, getUserPermissions } from '@/lib/auth/server';
import { ReactNode } from 'react';

interface ConditionalMenuItemProps {
  children: ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallback?: ReactNode;
}

export async function ConditionalMenuItem({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallback = null,
}: ConditionalMenuItemProps) {
  const profile = await getCurrentUserProfile();
  
  // If no user profile, don't show the item
  if (!profile) {
    return fallback ? <>{fallback}</> : null;
  }

  // Check role requirements
  if (requiredRoles.length > 0 && !requiredRoles.includes(profile.role)) {
    return fallback ? <>{fallback}</> : null;
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const permissions = await getUserPermissions();
    const hasRequiredPermission = requiredPermissions.some(permission =>
      permissions.includes(permission)
    );
    
    if (!hasRequiredPermission) {
      return fallback ? <>{fallback}</> : null;
    }
  }

  return <>{children}</>;
}

// Helper components for common role checks
export async function AdminMenuItem({ children }: { children: ReactNode }) {
  return (
    <ConditionalMenuItem requiredRoles={['admin']}>
      {children}
    </ConditionalMenuItem>
  );
}

export async function ModeratorMenuItem({ children }: { children: ReactNode }) {
  return (
    <ConditionalMenuItem requiredRoles={['admin', 'moderator']}>
      {children}
    </ConditionalMenuItem>
  );
}