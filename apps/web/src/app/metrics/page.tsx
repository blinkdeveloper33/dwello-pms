import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { MetricsClient } from './metrics-client';
import { prisma } from '@loomi/shared';

export default async function MetricsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Get user's current org
  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id, deletedAt: null },
    include: {
      org: true,
    },
  });

  if (memberships.length === 0) {
    redirect('/onboarding');
  }

  const currentOrgId = memberships[0].orgId;

  // Get metrics data for the last 6 months
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  // Monthly revenue (payments)
  const payments = await prisma.payment.findMany({
    where: {
      orgId: currentOrgId,
      status: 'completed',
      createdAt: { gte: sixMonthsAgo },
    },
    select: {
      amount: true,
      createdAt: true,
    },
  });

  // Monthly charges posted
  const charges = await prisma.charge.findMany({
    where: {
      orgId: currentOrgId,
      createdAt: { gte: sixMonthsAgo },
    },
    select: {
      amount: true,
      status: true,
      createdAt: true,
    },
  });

  // Work orders by status
  const workOrders = await prisma.workOrder.findMany({
    where: {
      orgId: currentOrgId,
    },
    select: {
      status: true,
      priority: true,
      createdAt: true,
    },
  });

  // Group data by month
  const monthlyData: Record<string, { revenue: number; charges: number; paid: number; pending: number }> = {};
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(now.getMonth() - i);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    monthlyData[monthKey] = { revenue: 0, charges: 0, paid: 0, pending: 0 };
  }

  payments.forEach((payment: { createdAt: Date | string; amount: number | string }) => {
    const monthKey = new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (monthlyData[monthKey]) {
      monthlyData[monthKey].revenue += Number(payment.amount);
    }
  });

  charges.forEach((charge) => {
    const monthKey = new Date(charge.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (monthlyData[monthKey]) {
      monthlyData[monthKey].charges += Number(charge.amount);
      if (charge.status === 'paid') {
        monthlyData[monthKey].paid += Number(charge.amount);
      } else {
        monthlyData[monthKey].pending += Number(charge.amount);
      }
    }
  });

  const revenueChartData = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    charges: data.charges,
  }));

  const collectionChartData = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    paid: data.paid,
    pending: data.pending,
  }));

  // Work orders by status
  const workOrderStatusData = [
    { status: 'Open', count: workOrders.filter((wo) => wo.status === 'open').length },
    { status: 'Assigned', count: workOrders.filter((wo) => wo.status === 'assigned').length },
    { status: 'In Progress', count: workOrders.filter((wo) => wo.status === 'in_progress').length },
    { status: 'Completed', count: workOrders.filter((wo) => wo.status === 'completed').length },
    { status: 'Cancelled', count: workOrders.filter((wo) => wo.status === 'cancelled').length },
  ];

  // Work orders by priority
  const workOrderPriorityData = [
    { priority: 'Low', count: workOrders.filter((wo) => wo.priority === 'low').length },
    { priority: 'Medium', count: workOrders.filter((wo) => wo.priority === 'medium').length },
    { priority: 'High', count: workOrders.filter((wo) => wo.priority === 'high').length },
    { priority: 'Urgent', count: workOrders.filter((wo) => wo.priority === 'urgent').length },
  ];

  // Calculate totals
  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalCharges = charges.reduce((sum, c) => sum + Number(c.amount), 0);
  const totalPaid = charges.filter((c) => c.status === 'paid').reduce((sum, c) => sum + Number(c.amount), 0);
  const collectionRate = totalCharges > 0 ? (totalPaid / totalCharges) * 100 : 0;

  return (
    <MetricsClient
      user={session.user}
      orgs={memberships.map((m: { org: { id: string; name: string | null } }) => ({ id: m.org.id, name: m.org.name }))}
      currentOrgId={currentOrgId}
      metrics={{
        revenueChartData,
        collectionChartData,
        workOrderStatusData,
        workOrderPriorityData,
        totalRevenue,
        totalCharges,
        totalPaid,
        collectionRate,
        totalWorkOrders: workOrders.length,
      }}
    />
  );
}

