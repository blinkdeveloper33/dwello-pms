import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
import { NewCommunicationClient } from './new-communication-client';
import { prisma } from '@loomi/shared';

export default async function NewCommunicationPage() {
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

  const [properties, templates] = await Promise.all([
    prisma.property.findMany({
      where: { orgId: currentOrgId },
      select: { id: true, name: true },
    }),
    prisma.template.findMany({
      where: { orgId: currentOrgId },
      select: { id: true, name: true, type: true, subject: true },
    }),
  ]);

  return (
    <NewCommunicationClient
      user={session.user}
      orgs={memberships.map((m: { org: { id: string; name: string | null } }) => ({ id: m.org.id, name: m.org.name }))}
      currentOrgId={currentOrgId}
      properties={properties}
      templates={templates}
    />
  );
}

