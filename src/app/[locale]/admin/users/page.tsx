"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import { useRouter } from "@/i18n/routing";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTranslations } from 'next-intl';
// import { useErrorHandler } from '@/hooks/useErrorHandler'; // TODO: Implement error handling
import { UserWithAdmin } from "@/types/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  Users,
  Search,
  Download,
  Trash2,
  Ban,
  UserCheck,
  UserX,
  Clock,
  Mail,
  UserPlus,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Edit,
} from "lucide-react";

type NewUserFormState = {
  email: string;
  password: string;
  full_name: string;
  role: 'user' | 'admin' | 'moderator';
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred. Please try again.';
};

export default function UserMaintenancePage() {
  const { profile: authProfile, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading, profile: adminProfile, users, adminService, refreshUsers } = useAdmin();
  const router = useRouter();
  const t = useTranslations('Admin');
  // const { handleAsyncOperation } = useErrorHandler(); // TODO: Implement error handling
  usePageTitle(t('manageUsers'));
  // Wait for both auth and admin contexts to finish loading
  const loading = authLoading || adminLoading;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserWithAdmin | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<NewUserFormState>({
    email: "",
    password: "",
    full_name: "",
    role: "user",
  });
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendUntil, setSuspendUntil] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [createUserError, setCreateUserError] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editUserError, setEditUserError] = useState("");
  const [editUser, setEditUser] = useState<UserWithAdmin | null>(null);

  // Combine profiles and create a more robust authorization check, similar to DashboardNav
  const profile = adminProfile || authProfile;
  const isAuthorized = isAdmin || (profile?.role === 'admin' && profile?.status === 'active');

  // Debug logging
  console.log('UserMaintenance Debug:', {
    authLoading,
    adminLoading,
    loading,
    isAdmin,
    profileRole: profile?.role,
    profileStatus: profile?.status,
    isAuthorized
  });

  useEffect(() => {
    if (!loading && !isAuthorized) {
      console.log('UserMaintenance - Not authorized, redirecting to home');
      router.push("/");
    }
  }, [isAuthorized, loading, router]);



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t('loading', { defaultValue: 'Loading...' })}</div>
      </div>
    );
  }

  // After loading, if the user is not an admin, show access denied
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t('accessDenied', { defaultValue: 'Access Denied' })}</h2>
          <p className="text-muted-foreground">{t('adminRequired')}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Debug: isAdmin={String(isAdmin)}, role={profile?.role}, status={profile?.status}
          </p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });



  const handleUpdateRole = async (
    userId: string,
    newRole: "user" | "admin" | "moderator"
  ) => {
    setIsLoading(true);
    const { error } = await adminService.updateUserRole(userId, newRole);

    if (error) {
      setMessage(`Failed to update role: ${getErrorMessage(error)}`);
      setMessageType("error");
    } else {
      setMessage("User role updated successfully");
      setMessageType("success");
      await refreshUsers();
    }
    setIsLoading(false);
  };

  const handleSuspendUser = async () => {
    if (!selectedUser || !suspendUntil || !suspendReason) return;

    setIsLoading(true);
    const { error } = await adminService.suspendUser({
      userId: selectedUser.user_id,
      suspendUntil,
      reason: suspendReason,
    });

    if (error) {
      setMessage(`Failed to suspend user: ${getErrorMessage(error)}`);
      setMessageType("error");
    } else {
      setMessage("User suspended successfully");
      setMessageType("success");
      await refreshUsers();
      setIsSuspendDialogOpen(false);
      setSuspendReason("");
      setSuspendUntil("");
    }
    setIsLoading(false);
  };

  const handleUnsuspendUser = async (userId: string) => {
    setIsLoading(true);
    const { error } = await adminService.unsuspendUser(userId);

    if (error) {
      setMessage(`Failed to unsuspend user: ${getErrorMessage(error)}`);
      setMessageType("error");
    } else {
      setMessage("User unsuspended successfully");
      setMessageType("success");
      await refreshUsers();
    }
    setIsLoading(false);
  };

  const handleBanUser = async (userId: string, reason: string) => {
    setIsLoading(true);
    const { error } = await adminService.banUser(userId, reason);

    if (error) {
      setMessage(`Failed to ban user: ${getErrorMessage(error)}`);
      setMessageType("error");
    } else {
      setMessage("User banned successfully");
      setMessageType("success");
      await refreshUsers();
    }
    setIsLoading(false);
  };

  const handleCreateUser = async () => {
    // Clear previous error
    setCreateUserError("");

    if (!newUser.email || !newUser.password || !newUser.full_name) {
      setCreateUserError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    const { error } = await adminService.createUser({
      email: newUser.email,
      password: newUser.password,
      full_name: newUser.full_name,
      role: newUser.role,
    });

    if (error) {
      setCreateUserError(getErrorMessage(error));
    } else {
      setMessage("User created successfully");
      setMessageType("success");
      await refreshUsers();
      setIsCreateDialogOpen(false);
      setNewUser({
        email: "",
        password: "",
        full_name: "",
        role: "user",
      });
      setCreateUserError(""); // Clear error on success
    }
    setIsLoading(false);
  };

  const handleEditUser = async () => {
    if (!editUser) return;

    // Clear previous error
    setEditUserError("");

    setIsLoading(true);
    const { error } = await adminService.updateUserProfile(editUser.user_id, {
      full_name: editUser.full_name || undefined,
      bio: editUser.bio || undefined,
      website: editUser.website || undefined,
      location: editUser.location || undefined,
      phone: editUser.phone || undefined,
      preferred_language: editUser.preferred_language,
      role: editUser.role,
      status: editUser.status
    });

    if (error) {
      setEditUserError(getErrorMessage(error));
    } else {
      setMessage("User updated successfully");
      setMessageType("success");
      await refreshUsers();
      setIsEditDialogOpen(false);
      setEditUser(null);
      setEditUserError(""); // Clear error on success
    }
    setIsLoading(false);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    const { error } = await adminService.deleteUser(selectedUser.user_id);

    if (error) {
      setMessage(`Failed to delete user: ${getErrorMessage(error)}`);
      setMessageType("error");
    } else {
      setMessage("User deleted successfully");
      setMessageType("success");
      await refreshUsers();
      setIsDeleteDialogOpen(false);
    }
    setIsLoading(false);
  };

  const exportUsers = async (format: "csv" | "json") => {
    setIsLoading(true);
    const { data, error } = await adminService.exportUsers(format);

    if (error || !data) {
      setMessage(`Failed to export users: ${getErrorMessage(error || 'No data returned')}`);
      setMessageType("error");
    } else {
      const blob = new Blob([data], {
        type: format === "csv" ? "text/csv" : "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      setMessage(`Users exported as ${format.toUpperCase()}`);
      setMessageType("success");
    }
    setIsLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Active
          </Badge>
        );
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      case "banned":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            Banned
          </Badge>
        );
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="default" className="bg-purple-100 text-purple-800">
            Admin
          </Badge>
        );
      case "moderator":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            Moderator
          </Badge>
        );
      case "user":
        return <Badge variant="outline">User</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {t('manageUsers')}
            </h2>
            <p className="text-muted-foreground">
              {t('manageUsersDescription')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => exportUsers("csv")}
              disabled={isLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              {t('exportCsv', { defaultValue: 'Export CSV' })}
            </Button>
            <Button
              variant="outline"
              onClick={() => exportUsers("json")}
              disabled={isLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              {t('exportJson', { defaultValue: 'Export JSON' })}
            </Button>
            <Button onClick={refreshUsers} disabled={isLoading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('refresh', { defaultValue: 'Refresh' })}
            </Button>
            <Button
              onClick={() => {
                setIsCreateDialogOpen(true);
                setCreateUserError(""); // Clear previous error
              }}
              disabled={isLoading}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {t('createUserButton', { defaultValue: 'Create User' })}
            </Button>
          </div>
        </div>

        {/* Alert Messages */}
        {message && (
          <Alert
            className={
              messageType === "error"
                ? "border-red-200 bg-red-50"
                : "border-green-200 bg-green-50"
            }
          >
            {messageType === "error" ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <AlertDescription
              className={
                messageType === "error" ? "text-red-800" : "text-green-800"
              }
            >
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>{t('filters', { defaultValue: 'Filters' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="search">{t('searchUsers', { defaultValue: 'Search Users' })}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder={t('searchPlaceholder', { defaultValue: 'Search by name or email...' })}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('statusFilter', { defaultValue: 'Status Filter' })}</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('allStatuses', { defaultValue: 'All Statuses' })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allStatuses', { defaultValue: 'All Statuses' })}</SelectItem>
                    <SelectItem value="active">{t('active', { defaultValue: 'Active' })}</SelectItem>
                    <SelectItem value="suspended">{t('suspended', { defaultValue: 'Suspended' })}</SelectItem>
                    <SelectItem value="banned">{t('banned', { defaultValue: 'Banned' })}</SelectItem>
                    <SelectItem value="pending">{t('pending', { defaultValue: 'Pending' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('roleFilter', { defaultValue: 'Role Filter' })}</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('allRoles', { defaultValue: 'All Roles' })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allRoles', { defaultValue: 'All Roles' })}</SelectItem>
                    <SelectItem value="user">{t('user')}</SelectItem>
                    <SelectItem value="moderator">{t('moderator', { defaultValue: 'Moderator' })}</SelectItem>
                    <SelectItem value="admin">{t('admin', { defaultValue: 'Admin' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('results', { defaultValue: 'Results' })}</Label>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{t('usersFound', { defaultValue: '{count} users found', count: filteredUsers.length })}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>{t('users', { defaultValue: 'Users' })} ({filteredUsers.length})</CardTitle>
            <CardDescription>
              {t('manageUsersDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={user.avatar_url || undefined}
                        alt="Avatar"
                      />
                      <AvatarFallback>
                        {user.full_name?.charAt(0) || user.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">
                          {user.full_name || t('noName', { defaultValue: 'No name' })}
                        </h4>
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        {user.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{user.location}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {t('joined', { defaultValue: 'Joined' })}{" "}
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {user.last_login_at && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {t('lastLogin', { defaultValue: 'Last login' })}{" "}
                              {new Date(
                                user.last_login_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <span>{t('logins', { defaultValue: 'Logins' })}: {user.login_count}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Role Selection */}
                    <Select
                      value={user.role}
                      onValueChange={(value) =>
                        handleUpdateRole(
                          user.user_id,
                          value as "user" | "admin" | "moderator"
                        )
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">{t('user')}</SelectItem>
                        <SelectItem value="moderator">{t('moderator', { defaultValue: 'Moderator' })}</SelectItem>
                        <SelectItem value="admin">{t('admin', { defaultValue: 'Admin' })}</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditUser(user);
                          setIsEditDialogOpen(true);
                          setEditUserError("");
                        }}
                        disabled={isLoading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {user.status === "suspended" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnsuspendUser(user.user_id)}
                          disabled={isLoading}
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsSuspendDialogOpen(true);
                          }}
                          disabled={isLoading}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleBanUser(user.user_id, "Banned by admin")
                        }
                        disabled={isLoading || user.status === "banned"}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDeleteDialogOpen(true);
                        }}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {t('noUsersFound', { defaultValue: 'No users found matching your criteria.' })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suspend User Dialog */}
      <Dialog
        open={isSuspendDialogOpen}
        onOpenChange={setIsSuspendDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('suspendUser')}</DialogTitle>
            <DialogDescription>
              {t('suspendUserDescription', {
                defaultValue: 'Suspend {name} temporarily.',
                name: selectedUser?.full_name || selectedUser?.email
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="suspend-until">{t('suspendUntil')}</Label>
              <Input
                id="suspend-until"
                type="datetime-local"
                value={suspendUntil}
                onChange={(e) => setSuspendUntil(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="suspend-reason">{t('reason')}</Label>
              <Textarea
                id="suspend-reason"
                placeholder={t('enterSuspendReason', { defaultValue: 'Enter reason for suspension...' })}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSuspendDialogOpen(false)}
            >
              {t('cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button
              onClick={handleSuspendUser}
              disabled={!suspendUntil || !suspendReason || isLoading}
            >
              {t('suspendUser')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setCreateUserError(""); // Clear error when closing
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Enter the details for the new user. An invitation will not be
              sent; you must provide the password to the user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {createUserError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{createUserError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="user@example.com"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-fullname">Full Name</Label>
              <Input
                id="new-fullname"
                type="text"
                placeholder="John Doe"
                value={newUser.full_name}
                onChange={(e) =>
                  setNewUser({ ...newUser, full_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-role">Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value as NewUserFormState['role'] })}
              >
                <SelectTrigger id="new-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setCreateUserError(""); // Clear error when canceling
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={isLoading}>
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditUserError("");
            setEditUser(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>
              Update user information and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {editUserError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{editUserError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-fullname">Full Name</Label>
                <Input
                  id="edit-fullname"
                  type="text"
                  value={editUser?.full_name || ""}
                  onChange={(e) =>
                    setEditUser(prev => prev ? { ...prev, full_name: e.target.value } : null)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email (Read-only)</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editUser?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={editUser?.phone || ""}
                  onChange={(e) =>
                    setEditUser(prev => prev ? { ...prev, phone: e.target.value } : null)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  type="text"
                  value={editUser?.location || ""}
                  onChange={(e) =>
                    setEditUser(prev => prev ? { ...prev, location: e.target.value } : null)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-website">Website</Label>
              <Input
                id="edit-website"
                type="url"
                value={editUser?.website || ""}
                onChange={(e) =>
                  setEditUser(prev => prev ? { ...prev, website: e.target.value } : null)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                value={editUser?.bio || ""}
                onChange={(e) =>
                  setEditUser(prev => prev ? { ...prev, bio: e.target.value } : null)
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editUser?.role || "user"}
                  onValueChange={(value) =>
                    setEditUser(prev => prev ? { ...prev, role: value as 'user' | 'admin' | 'moderator' } : null)
                  }
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editUser?.status || "active"}
                  onValueChange={(value) =>
                    setEditUser(prev => prev ? { ...prev, status: value as 'active' | 'suspended' | 'banned' | 'pending' } : null)
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-language">Language</Label>
                <Select
                  value={editUser?.preferred_language || "en"}
                  onValueChange={(value) =>
                    setEditUser(prev => prev ? { ...prev, preferred_language: value as 'en' | 'th' } : null)
                  }
                >
                  <SelectTrigger id="edit-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="th">ไทย</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditUserError("");
                setEditUser(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={isLoading}>
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete{" "}
              {selectedUser?.full_name || selectedUser?.email}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isLoading}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
