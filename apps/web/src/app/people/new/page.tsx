import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { NewContactClient } from './new-contact-client';
import { prisma } from '@loomi/shared';

export default async function NewContactPage() {
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

  return (
    <NewContactClient
      user={session.user}
      orgs={memberships.map((m) => ({ id: m.org.id, name: m.org.name }))}
      currentOrgId={currentOrgId}
    />
  );
}

