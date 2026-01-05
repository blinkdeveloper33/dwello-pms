import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { CommunicationsClient } from './communications-client';
import { prisma } from '@loomi/shared';

export default async function CommunicationsPage() {
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

  const communications = await prisma.communication.findMany({
    where: { orgId: currentOrgId },
    include: {
      property: { select: { id: true, name: true } },
      template: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const templates = await prisma.template.findMany({
    where: { orgId: currentOrgId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <CommunicationsClient
      user={session.user}
      orgs={memberships.map((m) => ({ id: m.org.id, name: m.org.name }))}
      currentOrgId={currentOrgId}
      initialCommunications={communications}
      initialTemplates={templates}
    />
  );
}

