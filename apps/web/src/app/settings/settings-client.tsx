'use client';

import { useRouter } from 'next/navigation';
import { AppShell, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@loomi/ui';
import { Settings as SettingsIcon, Users, CreditCard, Shield, Bell } from 'lucide-react';

interface SettingsClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  currentOrg: {
    id: string;
    name: string;
    slug: string;
    plan: {
      name: string;
      displayName: string;
    };
  };
}

export function SettingsClient({
  user,
  orgs,
  currentOrgId,
  currentOrg,
}: SettingsClientProps) {
  const router = useRouter();

  const handleOrgChange = (orgId: string) => {
    router.push(`/settings?org=${orgId}`);
    router.refresh();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <AppShell
      user={user}
      orgs={orgs}
      currentOrgId={currentOrgId}
      onOrgChange={handleOrgChange}
      onSignOut={handleSignOut}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-sm text-white/80">Manage your organization settings</p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Organization Information</CardTitle>
                <CardDescription>Manage your organization details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Organization Name</label>
                  <p className="text-gray-900 mt-1">{currentOrg.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Slug</label>
                  <p className="text-gray-900 mt-1">{currentOrg.slug}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Current Plan</label>
                  <p className="text-gray-900 mt-1">{currentOrg.plan.displayName}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                </CardTitle>
                <CardDescription>Manage users and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Team management coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <div>
              <button
                onClick={() => router.push('/settings/billing')}
                className="w-full text-left p-4 border rounded-md hover:bg-gray-50 mb-4"
              >
                <h3 className="font-medium">Manage Billing & Subscription</h3>
                <p className="text-sm text-gray-600 mt-1">View plans, update subscription, and manage payment methods</p>
              </button>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Current Plan</label>
                      <p className="text-gray-900 mt-1 font-semibold">{currentOrg.plan.displayName}</p>
                    </div>
                    <Button onClick={() => router.push('/settings/billing')} className="w-full">
                      Manage Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage API keys, webhooks, and security settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <button
                    onClick={() => router.push('/settings/api-keys')}
                    className="w-full text-left p-4 border rounded-md hover:bg-gray-50"
                  >
                    <h3 className="font-medium">API Keys</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage API keys and access tokens</p>
                  </button>
                  <button
                    onClick={() => router.push('/settings/webhooks')}
                    className="w-full text-left p-4 border rounded-md hover:bg-gray-50"
                  >
                    <h3 className="font-medium">Webhooks</h3>
                    <p className="text-sm text-gray-600 mt-1">Configure webhook endpoints</p>
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Notification settings coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage">
            <Card>
              <CardHeader>
                <CardTitle>Usage & Quotas</CardTitle>
                <CardDescription>View your current usage and plan limits</CardDescription>
              </CardHeader>
              <CardContent>
                <button
                  onClick={() => router.push('/settings/usage')}
                  className="w-full text-left p-4 border rounded-md hover:bg-gray-50"
                >
                  <h3 className="font-medium">View Usage Details</h3>
                  <p className="text-sm text-gray-600 mt-1">See detailed usage statistics</p>
                </button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

