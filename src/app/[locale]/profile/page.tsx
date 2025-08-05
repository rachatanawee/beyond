'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
// import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { ProfileUpdateData } from '@/types/profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardNav } from '@/components/dashboard-nav';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Shield,
  Camera,
  Save,
  AlertCircle,
  CheckCircle,
  Settings,
  Lock,
  Bell
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ProfilePage() {
  const { user, profile, profileLoading, updateProfile, uploadAvatar } = useAuth();
  const { isAdmin, refreshAdminStatus } = useAdmin();
  // const t = useTranslations('Profile');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('Profile');

  const [formData, setFormData] = useState<ProfileUpdateData>({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    website: profile?.website || '',
    location: profile?.location || '',
    phone: profile?.phone || '',
    date_of_birth: profile?.date_of_birth || '',
    preferred_language: profile?.preferred_language || 'en',
  });

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        website: profile.website || '',
        location: profile.location || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        preferred_language: profile.preferred_language || 'en',
      });
    }
  }, [profile]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [avatarUploading, setAvatarUploading] = useState(false);

  if (!user) {
    router.push('/login');
    return null;
  }

  if (profileLoading) {
    return (
      <div className="flex min-h-screen">
        <DashboardNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg">Loading profile...</div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await updateProfile(formData);

    if (error) {
      setMessage('Error updating profile');
      setMessageType('error');
    } else {
      setMessage('Profile updated successfully!');
      setMessageType('success');
    }

    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    const { error } = await uploadAvatar(file);

    if (error) {
      setMessage('Error uploading avatar');
      setMessageType('error');
    } else {
      setMessage('Avatar updated successfully!');
      setMessageType('success');
    }

    setAvatarUploading(false);
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const checkDatabaseProfile = async () => {
    if (!user) return;
    
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      console.log('Direct database query result:', { data, error });
      
      if (data) {
        setMessage(`Database Profile: Role=${data.role}, Status=${data.status}`);
        setMessageType('success');
      } else {
        setMessage(`Database Error: ${error?.message || 'Profile not found'}`);
        setMessageType('error');
      }
    } catch (err) {
      console.error('Database check error:', err);
      setMessage(`Check failed: ${err}`);
      setMessageType('error');
    }
  };

  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      <main className="flex-1 overflow-y-auto">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight"> {t('title')}</h2>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>
          </div>

          {message && (
            <Alert className={messageType === 'error' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'}>
              {messageType === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              )}
              <AlertDescription className={messageType === 'error' ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid gap-6">
                {/* Profile Overview Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Overview</CardTitle>
                    <CardDescription>
                      Your public profile information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profile?.avatar_url || undefined} alt="Profile picture" />
                        <AvatarFallback className="text-lg">
                          {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div>
                          <h3 className="text-lg font-medium">
                            {profile?.full_name || 'No name set'}
                          </h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={avatarUploading}
                          >
                            <Camera className="mr-2 h-4 w-4" />
                            {avatarUploading ? 'Uploading...' : 'Change Avatar'}
                          </Button>
                          <Badge variant={
                            profile?.status === 'active' ? 'default' :
                              profile?.status === 'suspended' ? 'destructive' :
                                profile?.status === 'banned' ? 'destructive' :
                                  'secondary'
                          }>
                            {profile?.status || 'Active'}
                          </Badge>
                        </div>
                        {profile?.status === 'suspended' && profile?.suspended_until && (
                          <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            <AlertDescription className="text-orange-800 dark:text-orange-200">
                              Account suspended until {new Date(profile.suspended_until).toLocaleDateString()}
                              {profile.suspension_reason && `: ${profile.suspension_reason}`}
                            </AlertDescription>
                          </Alert>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Profile Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              value={user.email || ''}
                              disabled
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="full_name">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="full_name"
                              type="text"
                              value={formData.full_name || ''}
                              onChange={(e) => handleInputChange('full_name', e.target.value)}
                              className="pl-10"
                              placeholder="Enter your full name"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone || ''}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="pl-10"
                              placeholder="Enter your phone number"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="location"
                              type="text"
                              value={formData.location || ''}
                              onChange={(e) => handleInputChange('location', e.target.value)}
                              className="pl-10"
                              placeholder="Enter your location"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="website"
                              type="url"
                              value={formData.website || ''}
                              onChange={(e) => handleInputChange('website', e.target.value)}
                              className="pl-10"
                              placeholder="https://your-website.com"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="date_of_birth">Date of Birth</Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="date_of_birth"
                              type="date"
                              value={formData.date_of_birth || ''}
                              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={formData.bio || ''}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            placeholder="Tell us about yourself..."
                            rows={3}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit" disabled={loading}>
                          <Save className="mr-2 h-4 w-4" />
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Account Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Your account details and status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
                          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Member Since</p>
                          <p className="text-sm text-muted-foreground">
                            {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900">
                          <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Account Role</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {profile?.role || 'User'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900">
                          <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Login Count</p>
                          <p className="text-sm text-muted-foreground">
                            {profile?.login_count || 0} sessions
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-100 rounded-lg dark:bg-orange-900">
                          <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Last Login</p>
                          <p className="text-sm text-muted-foreground">
                            {profile?.last_login_at ? new Date(profile.last_login_at).toLocaleString() : 'First time'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security and privacy
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Change Password</p>
                        <p className="text-sm text-muted-foreground">
                          Update your password to keep your account secure
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Change</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Enable</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Settings className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Login Sessions</p>
                        <p className="text-sm text-muted-foreground">
                          Manage your active login sessions
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Manage</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Customize your experience and notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Preferred Language</Label>
                    <Select
                      value={formData.preferred_language}
                      onValueChange={(value) => handleInputChange('preferred_language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="th">ไทย (Thai)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Debug Admin Status */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                      <h4 className="font-medium mb-2">Debug: Admin Status</h4>
                      <div className="text-sm space-y-1">
                        <div>User ID: {user?.id}</div>
                        <div>Profile ID: {profile?.id}</div>
                        <div>Profile User ID: {profile?.user_id}</div>
                        <div>Profile Role: {profile?.role}</div>
                        <div>Profile Status: {profile?.status}</div>
                        <div>Is Admin (Context): {String(isAdmin)}</div>
                        <div>Should Show Admin: {String(profile?.role === 'admin' && profile?.status === 'active')}</div>
                        <div>Profile Loading: {String(profileLoading)}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive updates and notifications via email
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>

                  <div className="flex justify-between">
                    {process.env.NODE_ENV === 'development' && (
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          onClick={refreshAdminStatus}
                          type="button"
                        >
                          Refresh Admin Status
                        </Button>
                        <Button
                          variant="outline"
                          onClick={checkDatabaseProfile}
                          type="button"
                        >
                          Check Database
                        </Button>
                      </div>
                    )}
                    <Button onClick={handleSubmit} disabled={loading}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}