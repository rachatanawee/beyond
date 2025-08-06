# การเพิ่มหน้าจอใหม่ใน Sidebar

## 🚀 **ขั้นตอนการเพิ่มหน้าจอใหม่**

### **1. เพิ่ม Icon ใหม่ (ถ้าจำเป็น)**

แก้ไขไฟล์ `src/lib/navigation/icon-map.ts`:

```typescript
import { 
  // ... existing icons
  CreditCard,    // เพิ่ม icon ใหม่
  Package,
  Truck,
} from 'lucide-react';

export const iconMap = {
  // ... existing icons
  CreditCard,    // เพิ่มใน map
  Package,
  Truck,
} as const;
```

### **2. เพิ่ม Menu Item ใน Configuration**

แก้ไขไฟล์ `src/lib/navigation/menu-config.ts`:

#### **เพิ่มหน้าจอย่อยใน Section ที่มีอยู่:**

```typescript
{
  id: 'admin-section',
  name: 'Administration',
  children: [
    // ... existing items
    {
      id: 'permission-management',
      name: 'Permission Management',
      href: '/admin/permissions',
      iconName: 'Lock',
      description: 'Manage user permissions and roles',
      requiredRoles: ['admin'],
      requiredPermissions: ['admin.access'],
    },
  ],
},
```

#### **เพิ่ม Section ใหม่ทั้งหมด:**

```typescript
{
  id: 'ecommerce',
  name: 'E-commerce',
  href: '#',
  iconName: 'ShoppingCart',
  description: 'E-commerce management',
  requiredRoles: ['admin', 'moderator'],
  children: [
    {
      id: 'products',
      name: 'Products',
      href: '/ecommerce/products',
      iconName: 'Package',
      description: 'Manage products',
      requiredRoles: ['admin', 'moderator'],
    },
    {
      id: 'orders',
      name: 'Orders',
      href: '/ecommerce/orders',
      iconName: 'Truck',
      description: 'Manage orders',
      requiredRoles: ['admin', 'moderator'],
    },
  ],
},
```

### **3. สร้างหน้าจอใหม่**

#### **Server Component Page:**

สร้างไฟล์ `src/app/[locale]/admin/permissions/page.tsx`:

```typescript
import { getCurrentUserProfile } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { PermissionManagementClient } from '@/components/admin/PermissionManagementClient';

export default async function PermissionManagementPage() {
  const profile = await getCurrentUserProfile();
  
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  return <PermissionManagementClient profile={profile} />;
}
```

#### **Client Component:**

สร้างไฟล์ `src/components/admin/PermissionManagementClient.tsx`:

```typescript
'use client';

import { usePageTitle } from '@/hooks/usePageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PermissionManagementClientProps {
  profile: {
    id: string;
    role: string;
    full_name?: string;
  };
}

export function PermissionManagementClient({ profile }: PermissionManagementClientProps) {
  usePageTitle('Permission Management');

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold">Permission Management</h2>
      {/* Your page content here */}
    </div>
  );
}
```

## 🎯 **ตัวอย่างการใช้งาน**

### **หน้าจอสำหรับ Admin เท่านั้น:**

```typescript
{
  id: 'admin-only-page',
  name: 'Admin Only',
  href: '/admin/admin-only',
  iconName: 'Shield',
  description: 'Admin only functionality',
  requiredRoles: ['admin'],
  requiredPermissions: ['admin.access'],
}
```

### **หน้าจอสำหรับ Moderator และ Admin:**

```typescript
{
  id: 'moderation-page',
  name: 'Moderation',
  href: '/moderation/content',
  iconName: 'Lock',
  description: 'Content moderation',
  requiredRoles: ['admin', 'moderator'],
}
```

### **หน้าจอสำหรับทุกคน:**

```typescript
{
  id: 'public-page',
  name: 'Public Page',
  href: '/dashboard/public',
  iconName: 'Home',
  description: 'Available to all users',
  // ไม่ต้องระบุ requiredRoles หรือ requiredPermissions
}
```

## 🔧 **คุณสมบัติพิเศษ**

### **Badge Notification:**

```typescript
{
  id: 'notifications',
  name: 'Notifications',
  href: '/dashboard/notifications',
  iconName: 'Bell',
  badge: {
    text: '3',
    variant: 'destructive',
  },
}
```

### **Nested Menu (Sub-menu):**

```typescript
{
  id: 'parent-menu',
  name: 'Parent Menu',
  href: '#',
  iconName: 'Database',
  children: [
    {
      id: 'child-1',
      name: 'Child Page 1',
      href: '/parent/child1',
      iconName: 'FileText',
    },
    {
      id: 'child-2',
      name: 'Child Page 2',
      href: '/parent/child2',
      iconName: 'BarChart3',
    },
  ],
}
```

## ✅ **Checklist การเพิ่มหน้าจอใหม่**

- [ ] เพิ่ม icon ใน `icon-map.ts` (ถ้าจำเป็น)
- [ ] เพิ่ม menu item ใน `menu-config.ts`
- [ ] กำหนด `requiredRoles` และ `requiredPermissions` ที่เหมาะสม
- [ ] สร้าง Server Component page
- [ ] สร้าง Client Component (ถ้าจำเป็น)
- [ ] ทดสอบการแสดงผลตาม role
- [ ] ทดสอบ navigation และ permissions

## 🎨 **Tips และ Best Practices**

1. **ใช้ Icon ที่เหมาะสม**: เลือก icon จาก Lucide React ที่สื่อความหมายชัดเจน
2. **กำหนด Permissions อย่างระมัดระวัง**: ใช้ `requiredRoles` และ `requiredPermissions` ให้เหมาะสม
3. **ใช้ Server Components**: สำหรับการตรวจสอบ authentication และ authorization
4. **Nested Menu**: ใช้สำหรับจัดกลุ่มหน้าจอที่เกี่ยวข้องกัน
5. **Descriptive Names**: ใช้ชื่อและคำอธิบายที่ชัดเจน

## 🔄 **การอัปเดตแบบ Real-time**

ระบบจะอัปเดต sidebar อัตโนมัติเมื่อ:
- User login/logout
- Role ของ user เปลี่ยนแปลง
- Permission เปลี่ยนแปลง

ไม่จำเป็นต้อง restart server หรือ clear cache!