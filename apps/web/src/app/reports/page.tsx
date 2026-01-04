import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "../api/auth/[...nextauth]/authOptions"';
import { ReportsClient } from './reports-client';
import { prisma } from '@loomi/shared';

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id, deletedAt: null },
    include: { org: true },
  });

  if (memberships.length === 0) {
    redirect('/onboarding');
  }

  const currentOrgId = memberships[0].orgId;

  // Get stats for reports
  const [propertiesCount, unitsCount, chargesCount, paymentsCount, workOrdersCount] = await Promise.all([
    prisma.property.count({ where: { orgId: currentOrgId } }),
    prisma.unit.count({ where: { property: { orgId: currentOrgId } } }),
    prisma.charge.count({ where: { orgId: currentOrgId } }),
    prisma.payment.count({ where: { orgId: currentOrgId } }),
    prisma.workOrder.count({ where: { orgId: currentOrgId } }),
  ]);

  return (
    <ReportsClient
      user={session.user}
      orgs={memberships.map((m) => ({ id: m.org.id, name: m.org.name }))}
      currentOrgId={currentOrgId}
      stats={{
        properties: propertiesCount,
        units: unitsCount,
        charges: chargesCount,
        payments: paymentsCount,
        workOrders: workOrdersCount,
      }}
    />
  );
}

