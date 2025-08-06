import { getCurrentUserProfile } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { PermissionManagementClient } from '@/components/admin/PermissionManagementClient';

export default async function PermissionManagementPage() {
  // Server-side authentication and authorization
  const profile = await getCurrentUserProfile();
  
  // Redirect if not admin
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <PermissionManagementClient profile={profile} />
  );
}