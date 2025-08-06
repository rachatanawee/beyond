'use client';

import { usePageTitle } from '@/hooks/usePageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Users, Shield, Settings, Eye, Edit, Trash2, Plus } from 'lucide-react';

interface PermissionManagementClientProps {
  profile: {
    id: string;
    role: string;
    full_name?: string;
  };
}

export function PermissionManagementClient({ profile }: PermissionManagementClientProps) {
  usePageTitle('Permission Management');

  // Mock data for demonstration
  const roles = [
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access with all permissions',
      userCount: 2,
      permissions: [
        'user.create', 'user.read', 'user.update', 'user.delete',
        'admin.access', 'system.manage', 'reports.view', 'analytics.view'
      ]
    },
    {
      id: 'moderator',
      name: 'Moderator',
      description: 'Content moderation and user management',
      userCount: 5,
      permissions: [
        'user.read', 'user.update', 'reports.view', 'analytics.view'
      ]
    },
    {
      id: 'user',
      name: 'User',
      description: 'Standard user with basic permissions',
      userCount: 150,
      permissions: [
        'profile.read', 'profile.update'
      ]
    }
  ];

  const allPermissions = [
    { id: 'user.create', name: 'Create Users', category: 'User Management' },
    { id: 'user.read', name: 'View Users', category: 'User Management' },
    { id: 'user.update', name: 'Update Users', category: 'User Management' },
    { id: 'user.delete', name: 'Delete Users', category: 'User Management' },
    { id: 'admin.access', name: 'Admin Access', category: 'Administration' },
    { id: 'system.manage', name: 'System Management', category: 'Administration' },
    { id: 'reports.view', name: 'View Reports', category: 'Analytics' },
    { id: 'analytics.view', name: 'View Analytics', category: 'Analytics' },
    { id: 'profile.read', name: 'View Profile', category: 'Profile' },
    { id: 'profile.update', name: 'Update Profile', category: 'Profile' },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Permission Management</h2>
            <p className="text-muted-foreground">
              Manage roles and permissions for your application
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </div>
        </div>

        {/* Current User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Your Current Permissions
            </CardTitle>
            <CardDescription>
              You are logged in as <strong>{profile.full_name || 'Admin'}</strong> with <strong>{profile.role}</strong> role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {roles.find(r => r.id === profile.role)?.permissions.map((permission) => (
                <Badge key={permission} variant="default" className="text-xs">
                  {permission}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Roles Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {role.id === 'admin' && <Shield className="h-5 w-5 text-red-500" />}
                    {role.id === 'moderator' && <Users className="h-5 w-5 text-blue-500" />}
                    {role.id === 'user' && <Users className="h-5 w-5 text-green-500" />}
                    {role.name}
                  </CardTitle>
                  <Badge variant="outline">{role.userCount} users</Badge>
                </div>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Permissions ({role.permissions.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {role.id !== 'admin' && (
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* All Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>All Available Permissions</CardTitle>
            <CardDescription>
              Complete list of permissions available in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(
                allPermissions.reduce((acc, permission) => {
                  if (!acc[permission.category]) {
                    acc[permission.category] = [];
                  }
                  acc[permission.category].push(permission);
                  return acc;
                }, {} as Record<string, typeof allPermissions>)
              ).map(([category, permissions]) => (
                <div key={category}>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {category}
                  </h4>
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 ml-6">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">{permission.name}</p>
                          <p className="text-xs text-muted-foreground">{permission.id}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {roles.filter(r => r.permissions.includes(permission.id)).length} roles
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}