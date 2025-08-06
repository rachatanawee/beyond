import { DashboardLayoutClient } from '@/components/layout/DashboardLayoutClient';
import { getCurrentUserProfile, getUserPermissions } from '@/lib/auth/server';
import { getMenuItemsForRole } from '@/lib/navigation/menu-config';
import { PageTitleProvider } from '@/contexts/PageTitleContext';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get server-side user data and check admin access
  const profile = await getCurrentUserProfile();
  
  // Redirect if not admin
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  const permissions = await getUserPermissions();
  const menuItems = getMenuItemsForRole(profile.role, permissions);

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