import { getCurrentUserProfile, getUserPermissions } from '@/lib/auth/server';
import { getMenuItemsForRole } from '@/lib/navigation/menu-config';
import { DashboardNav } from '@/components/dashboard-nav';

interface ServerSideNavProps {
  onClose?: () => void;
}

export async function ServerSideNav({ onClose }: ServerSideNavProps) {
  // Get server-side user data and menu items
  const profile = await getCurrentUserProfile();
  const permissions = await getUserPermissions();
  const menuItems = profile ? getMenuItemsForRole(profile.role, permissions) : [];

  return (
    <DashboardNav 
      onClose={onClose}
      menuItems={menuItems}
      userProfile={profile}
    />
  );
}