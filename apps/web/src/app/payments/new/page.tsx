import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
import { NewPaymentClient } from './new-payment-client';
import { prisma } from '@loomi/shared';

export default async function NewPaymentPage() {
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

  const [charges, contacts] = await Promise.all([
    prisma.charge.findMany({
      where: { orgId: currentOrgId },
      include: {
        property: { select: { id: true, name: true } },
        unit: { select: { id: true, unitNumber: true } },
      },
      orderBy: { dueDate: 'desc' },
    }),
    prisma.contact.findMany({
      where: { orgId: currentOrgId },
      select: { id: true, firstName: true, lastName: true, email: true },
    }),
  ]);

  return (
    <NewPaymentClient
      user={session.user}
      orgs={memberships.map((m: { org: { id: string; name: string | null } }) => ({ id: m.org.id, name: m.org.name }))}
      currentOrgId={currentOrgId}
      charges={charges.map((c: { id: string; description: string; amount: number | string; status: string; property: { id: string; name: string } | null; unit: { id: string; unitNumber: string } | null }) => ({
        id: c.id,
        description: c.description,
        amount: Number(c.amount),
        status: c.status,
        property: c.property,
        unit: c.unit,
      }))}
      contacts={contacts}
    />
  );
}

