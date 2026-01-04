import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "../api/auth/[...nextauth]/authOptions"';
import { ApiKeysClient } from './api-keys-client';
import { prisma } from '@loomi/shared';

export default async function ApiKeysPage() {
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

  const apiKeys = await prisma.apiKey.findMany({
    where: { orgId: currentOrgId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <ApiKeysClient
      user={session.user}
      orgs={memberships.map((m) => ({ id: m.org.id, name: m.org.name }))}
      currentOrgId={currentOrgId}
      initialApiKeys={apiKeys}
    />
  );
}

