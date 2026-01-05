import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
import { WorkOrderDetailClient } from './work-order-detail-client';
import { prisma } from '@loomi/shared';

export default async function WorkOrderDetailPage({ params }: { params: { id: string } }) {
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

  const workOrder = await prisma.workOrder.findFirst({
    where: { id: params.id, orgId: currentOrgId },
    include: {
      property: { select: { id: true, name: true } },
      unit: { select: { id: true, unitNumber: true } },
      contact: { select: { id: true, firstName: true, lastName: true, email: true } },
      vendor: { select: { id: true, firstName: true, lastName: true, email: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!workOrder) {
    redirect('/maintenance');
  }

  // Get audit log entries
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      orgId: currentOrgId,
      entityType: 'WorkOrder',
      entityId: workOrder.id,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <WorkOrderDetailClient
      user={session.user}
      orgs={memberships.map((m: { org: { id: string; name: string | null } }) => ({ id: m.org.id, name: m.org.name ?? '' }))}
      currentOrgId={currentOrgId}
      workOrder={workOrder}
      auditLogs={auditLogs}
    />
  );
}

