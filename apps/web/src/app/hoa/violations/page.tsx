import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { ViolationsClient } from './violations-client';
import { prisma } from '@loomi/shared';

export default async function ViolationsPage() {
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

  const violations = await prisma.violation.findMany({
    where: { orgId: currentOrgId },
    include: {
      property: { select: { id: true, name: true } },
      unit: { select: { id: true, unitNumber: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
      steps: { orderBy: { createdAt: 'asc' } },
      fines: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const properties = await prisma.property.findMany({
    where: { orgId: currentOrgId, propertyType: 'hoa' },
    include: {
      units: { select: { id: true, unitNumber: true } },
    },
  });

  return (
    <ViolationsClient
      user={session.user}
      orgs={memberships.map((m) => ({ id: m.org.id, name: m.org.name }))}
      currentOrgId={currentOrgId}
      initialViolations={violations}
      properties={properties}
    />
  );
}

