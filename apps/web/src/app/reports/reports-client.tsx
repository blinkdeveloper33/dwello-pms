'use client';

import { useRouter } from 'next/navigation';
import { AppShell, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@loomi/ui';
import { BarChart3, DollarSign, Wrench, FileText, TrendingUp } from 'lucide-react';

interface ReportsClientProps {
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
    charges: number;
    payments: number;
    workOrders: number;
  };
}

export function ReportsClient({
  user,
  orgs,
  currentOrgId,
  stats,
}: ReportsClientProps) {
  const router = useRouter();

  const handleOrgChange = (orgId: string) => {
    router.push(`/reports?org=${orgId}`);
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
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="mt-1 text-sm text-white/80">View analytics and generate reports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Properties</p>
                  <p className="text-2xl font-bold">{stats.properties}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Units</p>
                  <p className="text-2xl font-bold">{stats.units}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Work Orders</p>
                  <p className="text-2xl font-bold">{stats.workOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Total Charges</p>
                  <p className="text-2xl font-bold">{stats.charges}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold">{stats.payments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Total Work Orders</p>
                  <p className="text-2xl font-bold">{stats.workOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>Generate detailed reports for your portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-md hover:bg-gray-50 cursor-pointer">
                <FileText className="h-6 w-6 text-gray-400 mb-2" />
                <h3 className="font-medium">Financial Report</h3>
                <p className="text-sm text-gray-600 mt-1">Charges, payments, and outstanding balances</p>
              </div>
              <div className="p-4 border rounded-md hover:bg-gray-50 cursor-pointer">
                <Wrench className="h-6 w-6 text-gray-400 mb-2" />
                <h3 className="font-medium">Maintenance Report</h3>
                <p className="text-sm text-gray-600 mt-1">Work orders by status and property</p>
              </div>
              <div className="p-4 border rounded-md hover:bg-gray-50 cursor-pointer">
                <TrendingUp className="h-6 w-6 text-gray-400 mb-2" />
                <h3 className="font-medium">Occupancy Report</h3>
                <p className="text-sm text-gray-600 mt-1">Unit occupancy and lease status</p>
              </div>
              <div className="p-4 border rounded-md hover:bg-gray-50 cursor-pointer">
                <BarChart3 className="h-6 w-6 text-gray-400 mb-2" />
                <h3 className="font-medium">Custom Report</h3>
                <p className="text-sm text-gray-600 mt-1">Create a custom report with your filters</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

