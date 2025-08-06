import { getCurrentUserProfile } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';
import { adminService } from '@/lib/services/adminService';
import type { UserWithAdmin } from '@/types/admin';

export default async function AdminDashboard() {
  // Server-side authentication and authorization
  const profile = await getCurrentUserProfile();

  // Redirect if not admin
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get server-side data
  const usersResult = await adminService.getAllUsers();
  const users: UserWithAdmin[] = usersResult.data || [];
  const totalUsers = users.length;
  const activeUsers = users.filter((u: UserWithAdmin) => u.status === 'active').length;
  const suspendedUsers = users.filter((u: UserWithAdmin) => u.status === 'suspended').length;
  const bannedUsers = users.filter((u: UserWithAdmin) => u.status === 'banned').length;

  const stats = {
    totalUsers,
    activeUsers,
    suspendedUsers,
    bannedUsers,
  };

  return (
    <AdminDashboardClient
      stats={stats}
      users={users.slice(0, 5)} // Show only recent 5 users
      profile={profile}
    />
  );
}