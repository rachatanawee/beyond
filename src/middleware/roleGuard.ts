import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Define route permissions
const routePermissions: Record<string, { roles?: string[]; permissions?: string[] }> = {
  '/admin': { roles: ['admin'] },
  '/admin/users': { roles: ['admin'], permissions: ['user.read'] },
  '/admin/settings': { roles: ['admin'], permissions: ['system.manage'] },
  '/admin/logs': { roles: ['admin'] },
  '/moderation': { roles: ['admin', 'moderator'] },
  '/moderation/content': { roles: ['admin', 'moderator'] },
  '/moderation/reports': { roles: ['admin', 'moderator'] },
  '/dashboard/analytics': { roles: ['admin', 'moderator'], permissions: ['analytics.view'] },
  '/dashboard/reports': { roles: ['admin', 'moderator'], permissions: ['reports.view'] },
};

export async function roleGuard(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if route requires specific roles/permissions
  const routeConfig = Object.entries(routePermissions).find(([route]) => 
    pathname.startsWith(route)
  );
  
  if (!routeConfig) {
    // Route doesn't require specific permissions
    return NextResponse.next();
  }
  
  const [, config] = routeConfig;
  
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single();
    
    if (profileError || !profile) {
      // Redirect to profile setup if profile doesn't exist
      return NextResponse.redirect(new URL('/profile', request.url));
    }
    
    // Check if user account is active
    if (profile.status !== 'active') {
      return NextResponse.redirect(new URL('/account-suspended', request.url));
    }
    
    // Check role requirements
    if (config.roles && !config.roles.includes(profile.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    // For permission checks, we'll need to implement a more complex system
    // For now, we'll just check roles
    
    return NextResponse.next();
    
  } catch (error) {
    console.error('Role guard error:', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
}

// Helper function to check if a route requires authentication
export function requiresAuth(pathname: string): boolean {
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
  return !publicRoutes.some(route => pathname.startsWith(route));
}

// Helper function to check if a route requires specific roles
export function requiresRole(pathname: string): string[] | null {
  const routeConfig = Object.entries(routePermissions).find(([route]) => 
    pathname.startsWith(route)
  );
  
  return routeConfig ? routeConfig[1].roles || null : null;
}