'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@loomi/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@loomi/ui';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@loomi/ui';
import { Badge } from '@loomi/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@loomi/ui';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { DollarSign, TrendingUp, AlertCircle, Wrench } from 'lucide-react';
import type { ChartConfig } from '@loomi/ui';

const revenueConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-1))',
  },
  charges: {
    label: 'Charges Posted',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const collectionConfig = {
  paid: {
    label: 'Paid',
    color: 'hsl(var(--chart-3))',
  },
  pending: {
    label: 'Pending',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

const workOrderStatusConfig = {
  open: {
    label: 'Open',
    color: 'hsl(var(--chart-1))',
  },
  assigned: {
    label: 'Assigned',
    color: 'hsl(var(--chart-2))',
  },
  in_progress: {
    label: 'In Progress',
    color: 'hsl(var(--chart-3))',
  },
  completed: {
    label: 'Completed',
    color: 'hsl(var(--chart-4))',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

interface MetricsClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  metrics: {
    revenueChartData: Array<{ month: string; revenue: number; charges: number }>;
    collectionChartData: Array<{ month: string; paid: number; pending: number }>;
    workOrderStatusData: Array<{ status: string; count: number }>;
    workOrderPriorityData: Array<{ priority: string; count: number }>;
    totalRevenue: number;
    totalCharges: number;
    totalPaid: number;
    collectionRate: number;
    totalWorkOrders: number;
  };
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function MetricsClient({
  user,
  orgs,
  currentOrgId,
  metrics,
}: MetricsClientProps) {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'6m' | '12m'>('6m');

  const handleOrgChange = (orgId: string) => {
    router.push(`/metrics?org=${orgId}`);
    router.refresh();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/auth/signin' });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">Metrics & Analytics</h1>
            <p className="text-white/80 mt-2">Track your property management performance</p>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">Last 6 months</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.collectionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(metrics.totalPaid)} of {formatCurrency(metrics.totalCharges)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(metrics.totalCharges - metrics.totalPaid)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Unpaid charges</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Work Orders</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalWorkOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">Total active</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="collection">Collection</TabsTrigger>
            <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
          </TabsList>

          {/* Revenue Chart */}
          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue vs Charges</CardTitle>
                <CardDescription>Track revenue collection against charges posted</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={revenueConfig} className="min-h-[300px] w-full">
                  <BarChart accessibilityLayer data={metrics.revenueChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                    <Bar dataKey="charges" fill="var(--color-charges)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collection Chart */}
          <TabsContent value="collection" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Collection Status</CardTitle>
                <CardDescription>Paid vs pending payments by month</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={collectionConfig} className="min-h-[300px] w-full">
                  <BarChart accessibilityLayer data={metrics.collectionChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="paid" fill="var(--color-paid)" radius={4} />
                    <Bar dataKey="pending" fill="var(--color-pending)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Work Orders Charts */}
          <TabsContent value="work-orders" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Work Orders by Status</CardTitle>
                  <CardDescription>Distribution of work orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={workOrderStatusConfig} className="min-h-[300px] w-full">
                    <PieChart>
                      <Pie
                        data={metrics.workOrderStatusData}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry: any) => `${entry.status}: ${entry.count}`}
                      >
                        {metrics.workOrderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Work Orders by Priority</CardTitle>
                  <CardDescription>Urgency distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={workOrderStatusConfig} className="min-h-[300px] w-full">
                    <BarChart accessibilityLayer data={metrics.workOrderPriorityData} layout="vertical">
                      <CartesianGrid horizontal={false} />
                      <XAxis type="number" tickLine={false} axisLine={false} />
                      <YAxis
                        dataKey="priority"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        width={80}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={4} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

