'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Calendar,
  Settings,
  BarChart3,
  Bell,
  Shield,
  User,
  Clock,
  TrendingUp,
  FileText,
  Zap
} from 'lucide-react';

interface DashboardClientProps {
  profile: {
    id: string;
    role: string;
    full_name?: string;
    avatar_url?: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
    last_login_at?: string;
    login_count?: number;
  };
}

export function DashboardClient({ profile }: DashboardClientProps) {
  const t = useTranslations('Dashboard');
  
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? t('goodMorning') : currentHour < 18 ? t('goodAfternoon') : t('goodEvening');

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {greeting}, {profile?.full_name || 'User'}!
          </h2>
          <p className="text-muted-foreground">
            {t('welcomeBack')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/profile">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge variant={profile?.status === 'active' ? 'default' : 'secondary'}>
                    {profile?.status || 'Active'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your account is in good standing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Member Since</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {profile?.created_at ? new Date(profile.created_at).getFullYear() : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Role</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  <Badge variant={profile?.role === 'admin' ? 'destructive' : 'outline'}>
                    {profile?.role || 'User'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {profile?.role === 'admin' ? 'Administrator privileges' : 'Standard user access'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Login Count</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {profile?.login_count || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total sessions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Quick Actions */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Frequently used features and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link href="/profile">
                    <Settings className="h-6 w-6 mb-2" />
                    Edit Profile
                    <span className="text-xs text-muted-foreground">Update your information</span>
                  </Link>
                </Button>

                {profile?.role === 'admin' && (
                  <Button asChild variant="outline" className="h-20 flex-col">
                    <Link href="/admin">
                      <Shield className="h-6 w-6 mb-2" />
                      Admin Panel
                      <span className="text-xs text-muted-foreground">Manage system</span>
                    </Link>
                  </Button>
                )}

                <Button variant="outline" className="h-20 flex-col">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Analytics
                  <span className="text-xs text-muted-foreground">View statistics</span>
                </Button>

                <Button variant="outline" className="h-20 flex-col">
                  <Bell className="h-6 w-6 mb-2" />
                  Notifications
                  <span className="text-xs text-muted-foreground">Manage alerts</span>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest actions and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile?.avatar_url || undefined} alt="Avatar" />
                      <AvatarFallback>
                        {profile?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Profile updated
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.updated_at ? new Date(profile.updated_at).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      <Clock className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Last login
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.last_login_at ? new Date(profile.last_login_at).toLocaleString() : 'First time login'}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      <Activity className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>
                        <Calendar className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Account created
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      <Zap className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile?.login_count || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4h</div>
                <p className="text-xs text-muted-foreground">
                  Average daily usage
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Features Used</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Out of 20 available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89%</div>
                <p className="text-xs text-muted-foreground">
                  Above average
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                Generate and download your activity reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Activity Report</p>
                    <p className="text-sm text-muted-foreground">Your complete activity history</p>
                  </div>
                </div>
                <Button variant="outline">Download</Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Analytics Report</p>
                    <p className="text-sm text-muted-foreground">Detailed usage analytics</p>
                  </div>
                </div>
                <Button variant="outline">Download</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push notifications</p>
                    <p className="text-sm text-muted-foreground">Browser push notifications</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Security alerts</p>
                    <p className="text-sm text-muted-foreground">Important security notifications</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}