'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useHydration } from '@/hooks/useHydration';
import { Link } from '@/i18n/routing';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  BarChart3,
  Settings,
  Users,
  Bell,
  FileText,
  Shield,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    name: 'Reports',
    href: '/dashboard/reports',
    icon: FileText,
  },
  {
    name: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell,
  },
];

export function DashboardNav() {
  const { user, profile: authProfile, signOut } = useAuth();
  const { isAdmin, loading: adminLoading, profile: adminProfile } = useAdmin();
  const pathname = usePathname();
  const hydrated = useHydration();

  // Use admin profile if available, fallback to auth profile
  const profile = adminProfile || authProfile;

  // Debug: log admin status
  console.log('DashboardNav - isAdmin:', isAdmin, 'adminLoading:', adminLoading, 'profile role:', profile?.role);

  // Prevent hydration mismatch by not showing admin section until hydrated and loaded
  const shouldShowAdmin = hydrated && !adminLoading && (isAdmin || (profile?.role === 'admin' && profile?.status === 'active'));

  const adminNavigation = [
    {
      name: 'Admin Panel',
      href: '/admin',
      icon: Shield,
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users,
    },
  ];

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-50 dark:bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold">Beyond</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                )}
              />
              {item.name}
            </Link>
          );
        })}

        {/* Admin Section */}
        {shouldShowAdmin && (
          <>
            <div className="pt-6">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administration
              </p>
            </div>
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}

        {/* Debug Admin Status */}
        {process.env.NODE_ENV === 'development' && (
          <div className="px-3 py-2 text-xs text-gray-500 space-y-1">
            <div>Debug Info:</div>
            <div>hydrated: {String(hydrated)}</div>
            <div>hasUser: {String(!!user)}</div>
            <div>hasAuthProfile: {String(!!authProfile)}</div>
            <div>hasAdminProfile: {String(!!adminProfile)}</div>
            <div>isAdmin: {String(isAdmin)}</div>
            <div>role: {profile?.role}</div>
            <div>status: {profile?.status}</div>
            <div>adminLoading: {String(adminLoading)}</div>
            <div>showAdmin: {String(shouldShowAdmin)}</div>
          </div>
        )}
      </nav>

      {/* User Menu */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4 dark:border-gray-700">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src={profile?.avatar_url} alt="Avatar" />
                <AvatarFallback>
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">
                  {profile?.full_name || user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}