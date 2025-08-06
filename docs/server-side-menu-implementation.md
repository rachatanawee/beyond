# Server-Side Menu Implementation Guide

## Overview
การแสดงผลเมนูตาม Role โดยใช้ Server Component ใน Next.js 14+ ช่วยให้เราสามารถ:
- ตรวจสอบสิทธิ์ผู้ใช้ที่ server-side
- แสดงเมนูที่เหมาะสมตาม role ของผู้ใช้
- ลดการโหลดข้อมูลที่ไม่จำเป็นไปยัง client
- เพิ่มความปลอดภัยโดยไม่เปิดเผยข้อมูลที่ไม่ควรเห็น

## Architecture

### 1. Server Components
- `src/app/[locale]/dashboard/layout.tsx` - Main dashboard layout (Server Component)
- `src/app/[locale]/admin/layout.tsx` - Admin layout with role checking (Server Component)
- `src/lib/auth/server.ts` - Server-side authentication utilities
- `src/lib/auth/role-guard.tsx` - Role-based access control components

### 2. Client Components
- `src/components/layout/DashboardLayoutClient.tsx` - Client-side UI interactions
- `src/components/dashboard-nav.tsx` - Navigation component with interactivity
- `src/components/dashboard/DashboardClient.tsx` - Dashboard client interactions

### 3. Menu Configuration
- `src/lib/navigation/menu-config.ts` - Centralized menu configuration with role requirements

## Implementation Examples

### 1. Server-Side Layout with Role-Based Menu

```typescript
// src/app/[locale]/dashboard/layout.tsx
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
```

### 2. Role Guard Components

```typescript
// src/lib/auth/role-guard.tsx
import { getCurrentUserProfile, getUserPermissions } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export async function AdminOnly({ children, fallback }: { 
  children: ReactNode; 
  fallback?: ReactNode 
}) {
  const profile = await getCurrentUserProfile();
  
  if (!profile || profile.role !== 'admin') {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

export async function ModeratorOrAdmin({ children, fallback }: { 
  children: ReactNode; 
  fallback?: ReactNode 
}) {
  const profile = await getCurrentUserProfile();
  
  if (!profile || !['admin', 'moderator'].includes(profile.role)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
```

### 3. Server-Side Page with Role-Based Content

```typescript
// src/app/[locale]/dashboard/page.tsx
import { getCurrentUserProfile } from '@/lib/auth/server';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { AdminOnly, ModeratorOrAdmin } from '@/lib/auth/role-guard';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const profile = await getCurrentUserProfile();
  
  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
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

      {/* Role-specific content */}
      {profile.role === 'admin' && (
        <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
          <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
            Administrator Dashboard
          </h3>
          <p className="text-sm text-red-600 dark:text-red-300 mb-4">
            You have full system access and can manage all users and settings.
          </p>
          <div className="flex gap-2">
            <a 
              href="/admin" 
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Admin Panel
            </a>
            <a 
              href="/admin/users" 
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              User Management
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 4. Menu Configuration with Role Requirements

```typescript
// src/lib/navigation/menu-config.ts
export interface MenuItem {
  id: string;
  name: string;
  href: string;
  icon: any;
  description?: string;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  children?: MenuItem[];
}

export const menuConfig: MenuItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview and quick actions',
  },
  {
    id: 'admin-section',
    name: 'Administration',
    href: '#',
    icon: Shield,
    description: 'System administration',
    requiredRoles: ['admin'],
    requiredPermissions: ['admin.access'],
    children: [
      {
        id: 'user-management',
        name: 'User Management',
        href: '/admin/users',
        icon: Users,
        description: 'Manage user accounts',
        requiredRoles: ['admin'],
        requiredPermissions: ['user.read'],
      },
    ],
  },
];

// Helper function to filter menu items by role
export const getMenuItemsForRole = (userRole: string, userPermissions: string[] = []): MenuItem[] => {
  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter(item => {
        if (!item.requiredRoles && !item.requiredPermissions) {
          return true;
        }
        
        if (item.requiredRoles && !item.requiredRoles.includes(userRole)) {
          return false;
        }
        
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
      .filter(item => !item.children || item.children.length > 0);
  };

  return filterMenuItems(menuConfig);
};
```

## Benefits

### 1. Security
- Role checking happens on the server
- Sensitive menu items are never sent to unauthorized clients
- Reduces attack surface by not exposing admin routes to regular users

### 2. Performance
- Menu items are filtered server-side
- Reduces client-side JavaScript bundle size
- Faster initial page load

### 3. SEO & Accessibility
- Server-rendered content is immediately available
- Better SEO for public pages
- Improved accessibility with proper server-side rendering

### 4. Developer Experience
- Clear separation between server and client logic
- Type-safe role checking
- Centralized menu configuration

## Usage Patterns

### 1. Layout-Level Role Checking
```typescript
// Entire layout requires admin role
export default async function AdminLayout({ children }) {
  const profile = await getCurrentUserProfile();
  
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
```

### 2. Component-Level Role Checking
```typescript
// Individual components check roles
<AdminOnly fallback={<div>Access Denied</div>}>
  <AdminPanel />
</AdminOnly>
```

### 3. Conditional Menu Items
```typescript
// Menu items filtered by role and permissions
const menuItems = getMenuItemsForRole(profile.role, permissions);
```

## Best Practices

1. **Always validate on server-side** - Never rely solely on client-side role checking
2. **Use fallback components** - Provide appropriate fallbacks for unauthorized access
3. **Cache user data** - Use React's `cache()` function to avoid duplicate database calls
4. **Centralize role logic** - Keep role definitions and checks in dedicated utilities
5. **Type safety** - Use TypeScript interfaces for consistent role and permission types

## Migration from Client-Side

1. Move authentication checks from `useEffect` to server components
2. Replace client-side role hooks with server-side utilities
3. Convert interactive components to client components with 'use client'
4. Pass server-side data as props to client components

## Troubleshooting

### Profile Not Found Error

If you encounter the error `"JSON object requested, multiple (or no) rows returned"`, this means the user profile doesn't exist in the database. The system now automatically handles this by:

1. **Auto-creating profiles**: When a profile is not found, the system automatically creates one with default values
2. **Proper error handling**: The `ensureUserProfile` function handles missing profiles gracefully
3. **Login statistics**: The system tracks login counts and last login times

### Key Files for Profile Management

- `src/lib/auth/profile-utils.ts` - Profile creation and management utilities
- `src/lib/auth/server.ts` - Server-side authentication with auto-profile creation
- `src/lib/auth/login-middleware.ts` - Middleware for tracking login statistics

### Database Schema Requirements

Make sure your `profiles` table has the correct structure:

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending')),
    -- other fields...
);
```

### Common Issues and Solutions

1. **Profile query uses wrong field**: Make sure to use `user_id` not `id` when querying profiles
2. **Missing profile trigger**: Ensure the `handle_new_user()` trigger is properly set up
3. **RLS policies**: Verify that Row Level Security policies allow profile creation and access

### Error Handling Best Practices

```typescript
// Always handle profile creation gracefully
export const getCurrentUserProfile = cache(async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const profile = await ensureUserProfile(user);
    return profile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
});
```## Seri
alization Issues

### Problem: React Components in Server-to-Client Props

When passing menu items from Server Components to Client Components, you may encounter the error:
```
Only plain objects can be passed to Client Components from Server Components. 
Classes or other objects with methods are not supported.
```

This happens because React components (like Lucide icons) contain methods and cannot be serialized.

### Solution: Icon Name Mapping

Instead of passing React components directly, we use icon names and resolve them on the client side:

#### 1. Icon Mapping System

```typescript
// src/lib/navigation/icon-map.ts
import { Home, BarChart3, FileText, /* ... */ } from 'lucide-react';

export const iconMap = {
  Home,
  BarChart3,
  FileText,
  // ... other icons
} as const;

export type IconName = keyof typeof iconMap;

export function getIconComponent(iconName: string) {
  return iconMap[iconName as IconName] || Home;
}
```

#### 2. Updated Menu Configuration

```typescript
// src/lib/navigation/menu-config.ts
export interface MenuItem {
  id: string;
  name: string;
  href: string;
  iconName: IconName; // Use string instead of React component
  // ... other properties
}

export const menuConfig: MenuItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    href: '/dashboard',
    iconName: 'Home', // String reference instead of component
    description: 'Overview and quick actions',
  },
  // ... other menu items
];
```

#### 3. Client-Side Icon Resolution

```typescript
// In client components
import { getIconComponent } from '@/lib/navigation/icon-map';

function NavigationItem({ item }: { item: MenuItem }) {
  const IconComponent = getIconComponent(item.iconName);
  
  return (
    <div>
      <IconComponent className="h-5 w-5" />
      <span>{item.name}</span>
    </div>
  );
}
```

### Benefits of This Approach

1. **Serializable**: Menu items can be safely passed from server to client
2. **Type Safe**: TypeScript ensures only valid icon names are used
3. **Performance**: Icons are only loaded on the client when needed
4. **Maintainable**: Centralized icon management

### Migration Steps

1. Create the icon mapping file (`src/lib/navigation/icon-map.ts`)
2. Update menu configuration to use `iconName` instead of `icon`
3. Update client components to resolve icons using `getIconComponent`
4. Test that all icons render correctly

This approach ensures that your Server Components can safely pass menu data to Client Components without serialization errors.