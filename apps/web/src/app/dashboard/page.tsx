import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/authOptions';
import { DashboardClient } from './dashboard-client';
import { prisma } from '@loomi/shared';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Get user's memberships
  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id, deletedAt: null },
    include: {
      org: {
        include: {
          plan: true,
        },
      },
    },
  });

  if (memberships.length === 0) {
    redirect('/onboarding');
  }

  const currentOrg = memberships[0].org;

  // Get stats
  const [propertyCount, unitCount, workOrderCount] = await Promise.all([
    prisma.property.count({ where: { orgId: currentOrg.id, deletedAt: null } }),
    prisma.unit.count({
      where: {
        property: { orgId: currentOrg.id },
        deletedAt: null,
      },
    }),
    prisma.workOrder.count({
      where: { orgId: currentOrg.id, status: { in: ['open', 'assigned', 'in_progress'] } },
    }),
  ]);

  return (
    <DashboardClient
      user={session.user}
      orgs={memberships.map((m: { org: { id: string; name: string | null } }) => ({ id: m.org.id, name: m.org.name }))}
      currentOrgId={currentOrg.id}
      stats={{
        properties: propertyCount,
        units: unitCount,
        workOrders: workOrderCount,
        planName: currentOrg.plan.displayName,
        planPrice: currentOrg.plan.price ? Number(currentOrg.plan.price) : 0,
      }}
    />
  );
}
