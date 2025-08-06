import { DashboardLayoutClient } from '@/components/layout/DashboardLayoutClient';
import { getCurrentUserProfile, getUserPermissions } from '@/lib/auth/server';
import { getMenuItemsForRole } from '@/lib/navigation/menu-config';
import { PageTitleProvider } from '@/contexts/PageTitleContext';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get server-side user data and menu items
  const profile = await getCurrentUserProfile();
  const permissions = await getUserPermissions();
  const menuItems = profile ? getMenuItemsForRole(profile.role, permissions) : [];

  return (
    <PageTitleProvider>
      <DashboardLayoutClient 
        menuItems={menuItems}
        userProfile={profile}
      >
        {children}
      </DashboardLayoutClient>
    </PageTitleProvider>
  );
}