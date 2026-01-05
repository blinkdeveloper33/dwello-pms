import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
import { NewChargeClient } from './new-charge-client';
import { prisma } from '@loomi/shared';

export default async function NewChargePage() {
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

  const [properties, contacts] = await Promise.all([
    prisma.property.findMany({
      where: { orgId: currentOrgId },
      include: {
        units: {
          select: { id: true, unitNumber: true },
        },
      },
    }),
    prisma.contact.findMany({
      where: { orgId: currentOrgId, type: 'resident' },
      select: { id: true, firstName: true, lastName: true, email: true },
    }),
  ]);

  return (
    <NewChargeClient
      user={session.user}
      orgs={memberships.map((m) => ({ id: m.org.id, name: m.org.name }))}
      currentOrgId={currentOrgId}
      properties={properties}
      contacts={contacts}
    />
  );
}

