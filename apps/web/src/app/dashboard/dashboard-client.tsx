'use client';

import { AppShell } from '@loomi/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@loomi/ui';
import { Badge } from '@loomi/ui';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Building2, Home, Wrench, TrendingUp, ArrowRight } from 'lucide-react';

interface DashboardClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  stats: {
    properties: number;
    units: number;
    workOrders: number;
    planName: string;
    planPrice?: number;
  };
}

export function DashboardClient({ user, orgs, currentOrgId, stats }: DashboardClientProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  };

  const handleOrgChange = (orgId: string) => {
    // TODO: Implement org switching
    router.refresh();
  };

  const statCards = [
    {
      title: 'Properties',
      value: stats.properties,
      icon: Building2,
      description: 'Total properties',
      href: '/properties',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Units',
      value: stats.units,
      icon: Home,
      description: 'Total units',
      href: '/properties',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Open Work Orders',
      value: stats.workOrders,
      icon: Wrench,
      description: 'Requires attention',
      href: '/maintenance',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <AppShell
      user={user}
      orgs={orgs}
      currentOrgId={currentOrgId}
      onOrgChange={handleOrgChange}
      onSignOut={handleSignOut}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">Dashboard</h1>
            <p className="text-white/80 mt-2">Welcome back, {user.name || user.email}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(stat.href)}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`${stat.bgColor} p-2 rounded-lg`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Plan & Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your subscription details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.planName}</p>
                  {stats.planPrice && (
                    <p className="text-sm text-white/80 mt-1">
                      ${stats.planPrice.toFixed(2)}/month
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="text-sm">
                  Active
                </Badge>
              </div>
              <a
                href="/settings/usage"
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                View usage details
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => router.push('/charges/new')}
                className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-center justify-between group"
              >
                <span className="text-sm font-medium">Post New Charge</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </button>
              <button
                onClick={() => router.push('/maintenance')}
                className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-center justify-between group"
              >
                <span className="text-sm font-medium">View Work Orders</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </button>
              <button
                onClick={() => router.push('/people/new')}
                className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-center justify-between group"
              >
                <span className="text-sm font-medium">Add Contact</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

