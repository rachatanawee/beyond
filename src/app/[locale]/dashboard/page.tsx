import { getCurrentUserProfile } from '@/lib/auth/server';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { AdminOnly, ModeratorOrAdmin } from '@/lib/auth/role-guard';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/routing';

export default async function Dashboard() {
  // Get server-side user data
  const profile = await getCurrentUserProfile();
  
  // Redirect if not authenticated
  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Pass profile data to client component */}
      <DashboardClient profile={profile} />
      
      {/* Server-side role-based content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Content available to all users */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">General Features</h3>
          <p className="text-sm text-muted-foreground">
            Available to all authenticated users
          </p>
        </div>

        {/* Content only for moderators and admins */}
        <ModeratorOrAdmin
          fallback={
            <div className="p-4 border rounded-lg opacity-50">
              <h3 className="font-semibold mb-2">Moderation Tools</h3>
              <p className="text-sm text-muted-foreground">
                Requires moderator or admin role
              </p>
            </div>
          }
        >
          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
            <h3 className="font-semibold mb-2">Moderation Tools</h3>
            <p className="text-sm text-muted-foreground">
              Content moderation and user management
            </p>
          </div>
        </ModeratorOrAdmin>

        {/* Content only for admins */}
        <AdminOnly
          fallback={
            <div className="p-4 border rounded-lg opacity-50">
              <h3 className="font-semibold mb-2">Admin Panel</h3>
              <p className="text-sm text-muted-foreground">
                Requires admin role
              </p>
            </div>
          }
        >
          <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
            <h3 className="font-semibold mb-2">Admin Panel</h3>
            <p className="text-sm text-muted-foreground">
              System administration and settings
            </p>
          </div>
        </AdminOnly>
      </div>

      {/* Role-specific quick actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Role-based Actions</h2>
        
        {/* Show different content based on role */}
        {profile.role === 'admin' && (
          <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
              Administrator Dashboard
            </h3>
            <p className="text-sm text-red-600 dark:text-red-300 mb-4">
              You have full system access and can manage all users and settings.
            </p>
            <div className="flex gap-2">
              <Link 
                href="/admin" 
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Admin Panel
              </Link>
              <Link 
                href="/admin/users" 
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                User Management
              </Link>
            </div>
          </div>
        )}

        {profile.role === 'moderator' && (
          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Moderator Dashboard
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-300 mb-4">
              You can moderate content and manage user reports.
            </p>
            <div className="flex gap-2">
              <Link 
                href="/moderation/content" 
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Content Review
              </Link>
              <Link 
                href="/moderation/reports" 
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                User Reports
              </Link>
            </div>
          </div>
        )}

        {profile.role === 'user' && (
          <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              User Dashboard
            </h3>
            <p className="text-sm text-green-600 dark:text-green-300 mb-4">
              Welcome! You have access to all standard user features.
            </p>
            <div className="flex gap-2">
              <Link 
                href="/profile" 
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Edit Profile
              </Link>
              <Link 
                href="/dashboard/settings" 
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Settings
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}