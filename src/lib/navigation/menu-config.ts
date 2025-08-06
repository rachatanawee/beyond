import type { IconName } from './icon-map';

export interface MenuItem {
  id: string;
  name: string;
  href: string;
  iconName: IconName;
  description?: string;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  children?: MenuItem[];
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
}

export const menuConfig: MenuItem[] = [
  // Dashboard - Available to all authenticated users
  {
    id: 'dashboard',
    name: 'Dashboard',
    href: '/dashboard',
    iconName: 'Home',
    description: 'Overview and quick actions',
  },
  
  // Analytics - Available to moderators and admins
  {
    id: 'analytics',
    name: 'Analytics',
    href: '/dashboard/analytics',
    iconName: 'BarChart3',
    description: 'View statistics and insights',
    requiredRoles: ['admin', 'moderator'],
    requiredPermissions: ['analytics.view'],
  },
  
  // Reports - Available to moderators and admins
  {
    id: 'reports',
    name: 'Reports',
    href: '/dashboard/reports',
    iconName: 'FileText',
    description: 'Generate and view reports',
    requiredRoles: ['admin', 'moderator'],
    requiredPermissions: ['reports.view'],
  },
  
  // Data Table Demos - Available to all users (for demo purposes)
  {
    id: 'data-demos',
    name: 'Data Tables',
    href: '#',
    iconName: 'Database',
    description: 'Data table demonstrations',
    children: [
      {
        id: 'basic-table',
        name: 'Basic Table',
        href: '/dashboard/data-table-demo',
        iconName: 'FileText',
        description: 'Simple data table with drag & drop',
      },
      {
        id: 'advanced-table',
        name: 'Advanced Table',
        href: '/dashboard/advanced-table-demo',
        iconName: 'BarChart3',
        description: 'Production-ready data table',
      },
    ],
  },
  
  // Notifications - Available to all users
  {
    id: 'notifications',
    name: 'Notifications',
    href: '/dashboard/notifications',
    iconName: 'Bell',
    description: 'View your notifications',
    badge: {
      text: '3',
      variant: 'destructive',
    },
  },
  
  // Administration Section - Only for admins
  {
    id: 'admin-section',
    name: 'Administration',
    href: '#',
    iconName: 'Shield',
    description: 'System administration',
    requiredRoles: ['admin'],
    requiredPermissions: ['admin.access'],
    children: [
      {
        id: 'admin-dashboard',
        name: 'Admin Panel',
        href: '/admin',
        iconName: 'Shield',
        description: 'Administrative overview',
        requiredRoles: ['admin'],
      },
      {
        id: 'user-management',
        name: 'User Management',
        href: '/admin/users',
        iconName: 'Users',
        description: 'Manage user accounts',
        requiredRoles: ['admin'],
        requiredPermissions: ['user.read'],
      },
      {
        id: 'system-settings',
        name: 'System Settings',
        href: '/admin/settings',
        iconName: 'Settings',
        description: 'Configure system settings',
        requiredRoles: ['admin'],
        requiredPermissions: ['system.manage'],
      },
      {
        id: 'audit-logs',
        name: 'Audit Logs',
        href: '/admin/logs',
        iconName: 'Activity',
        description: 'View system audit logs',
        requiredRoles: ['admin'],
      },
    ],
  },
  
  // Moderator Tools - Available to moderators and admins
  {
    id: 'moderation',
    name: 'Moderation',
    href: '#',
    iconName: 'Lock',
    description: 'Content moderation tools',
    requiredRoles: ['admin', 'moderator'],
    children: [
      {
        id: 'content-review',
        name: 'Content Review',
        href: '/moderation/content',
        iconName: 'FileText',
        description: 'Review flagged content',
        requiredRoles: ['admin', 'moderator'],
      },
      {
        id: 'user-reports',
        name: 'User Reports',
        href: '/moderation/reports',
        iconName: 'Mail',
        description: 'Handle user reports',
        requiredRoles: ['admin', 'moderator'],
      },
    ],
  },
  
  // Personal Section - Available to all users
  {
    id: 'personal',
    name: 'Personal',
    href: '#',
    iconName: 'User',
    description: 'Personal settings and preferences',
    children: [
      {
        id: 'profile',
        name: 'Profile',
        href: '/profile',
        iconName: 'User',
        description: 'Manage your profile',
      },
      {
        id: 'preferences',
        name: 'Preferences',
        href: '/dashboard/settings',
        iconName: 'Settings',
        description: 'App preferences and settings',
      },
    ],
  },
];

// Helper function to get menu items for a specific role
export const getMenuItemsForRole = (userRole: string, userPermissions: string[] = []): MenuItem[] => {
  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter(item => {
        // If no role requirements, show to everyone
        if (!item.requiredRoles && !item.requiredPermissions) {
          return true;
        }
        
        // Check role requirements
        if (item.requiredRoles && !item.requiredRoles.includes(userRole)) {
          return false;
        }
        
        // Check permission requirements
        if (item.requiredPermissions) {
          const hasRequiredPermission = item.requiredPermissions.some(permission =>
            userPermissions.includes(permission)
          );
          if (!hasRequiredPermission) {
            return false;
          }
        }
        
        return true;
      })
      .map(item => ({
        ...item,
        children: item.children ? filterMenuItems(item.children) : undefined,
      }))
      .filter(item => !item.children || item.children.length > 0); // Remove empty parent items
  };

  return filterMenuItems(menuConfig);
};