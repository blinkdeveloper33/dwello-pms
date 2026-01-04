import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "../api/auth/[...nextauth]/authOptions"';
import { InboxClient } from './inbox-client';
import { prisma } from '@loomi/shared';

export default async function InboxPage() {
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

  // Get unified inbox items (work orders, communications, etc.)
  const workOrders = await prisma.workOrder.findMany({
    where: { orgId: currentOrgId },
    include: {
      property: { select: { id: true, name: true } },
      unit: { select: { id: true, unitNumber: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const communications = await prisma.communication.findMany({
    where: { orgId: currentOrgId },
    include: {
      property: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <InboxClient
      user={session.user}
      orgs={memberships.map((m) => ({ id: m.org.id, name: m.org.name }))}
      currentOrgId={currentOrgId}
      initialWorkOrders={workOrders}
      initialCommunications={communications}
    />
  );
}

