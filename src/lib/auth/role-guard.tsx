import { getCurrentUserProfile, getUserPermissions } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  redirectTo?: string;
  fallback?: ReactNode;
}

export async function RoleGuard({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  redirectTo = '/dashboard',
  fallback = null,
}: RoleGuardProps) {
  const profile = await getCurrentUserProfile();
  
  // If no user profile, redirect to login or dashboard
  if (!profile) {
    redirect('/login');
  }

  // Check role requirements
  if (requiredRoles.length > 0 && !requiredRoles.includes(profile.role)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    redirect(redirectTo);
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const permissions = await getUserPermissions();
    const hasRequiredPermission = requiredPermissions.some(permission =>
      permissions.includes(permission)
    );
    
    if (!hasRequiredPermission) {
      if (fallback) {
        return <>{fallback}</>;
      }
      redirect(redirectTo);
    }
  }

  return <>{children}</>;
}

// Helper components for common role checks
export async function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard 
      requiredRoles={['admin']} 
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
}

export async function ModeratorOrAdmin({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard 
      requiredRoles={['admin', 'moderator']} 
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
}

export async function WithPermission({ 
  children, 
  permission, 
  fallback 
}: { 
  children: ReactNode; 
  permission: string; 
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard 
      requiredPermissions={[permission]} 
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
}