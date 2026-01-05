import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { PeopleClient } from './people-client';
import { prisma } from '@loomi/shared';

export default async function PeoplePage() {
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

  // Fetch contacts
  const contacts = await prisma.contact.findMany({
    where: { orgId: currentOrgId, deletedAt: null },
    include: {
      links: {
        include: {
          property: {
            select: {
              id: true,
              name: true,
            },
          },
          unit: {
            select: {
              id: true,
              unitNumber: true,
            },
          },
        },
      },
      _count: {
        select: {
          leases: true,
          workOrdersRequester: true,
          charges: true,
        },
      },
    },
    orderBy: [
      { lastName: 'asc' },
      { firstName: 'asc' },
    ],
  });

  return (
    <PeopleClient
      user={session.user}
      orgs={memberships.map((m: { org: { id: string; name: string | null } }) => ({ id: m.org.id, name: m.org.name ?? '' }))}
      currentOrgId={currentOrgId}
      initialContacts={contacts}
    />
  );
}

