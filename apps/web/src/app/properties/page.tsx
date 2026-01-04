import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "../api/auth/[...nextauth]/authOptions"';
import { PropertiesClient } from './properties-client';
import { prisma } from '@loomi/shared';

export default async function PropertiesPage() {
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

  // Fetch properties
  const properties = await prisma.property.findMany({
    where: { orgId: currentOrgId, deletedAt: null },
    include: {
      _count: {
        select: {
          units: { where: { deletedAt: null } },
          buildings: { where: { deletedAt: null } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <PropertiesClient
      user={session.user}
      orgs={memberships.map((m) => ({ id: m.org.id, name: m.org.name }))}
      currentOrgId={currentOrgId}
      initialProperties={properties}
    />
  );
}

