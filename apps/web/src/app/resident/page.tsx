import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { ResidentPortalClient } from './resident-portal-client';
import { prisma } from '@loomi/shared';

export default async function ResidentPortalPage() {
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

  // Find resident contact for this user
  const residentContact = await prisma.contact.findFirst({
    where: {
      orgId: currentOrgId,
      email: session.user.email,
      type: 'resident',
    },
    include: {
      links: {
        include: {
          property: { select: { id: true, name: true } },
          unit: { select: { id: true, unitNumber: true } },
        },
      },
    },
  });

  if (!residentContact) {
    // If no resident contact found, show empty state
    return (
      <ResidentPortalClient
        user={session.user}
        orgs={memberships.map((m: { org: { id: string; name: string | null } }) => ({ id: m.org.id, name: m.org.name ?? '' }))}
        currentOrgId={currentOrgId}
        residentContact={null}
        balance={0}
        charges={[]}
        payments={[]}
        documents={[]}
      />
    );
  }

  // Get balance and charges
  const charges = await prisma.charge.findMany({
    where: {
      orgId: currentOrgId,
      contactId: residentContact.id,
      status: { in: ['pending', 'overdue'] },
    },
    include: {
      property: { select: { id: true, name: true } },
      unit: { select: { id: true, unitNumber: true } },
    },
    orderBy: { dueDate: 'asc' },
  });

  const payments = await prisma.payment.findMany({
    where: {
      orgId: currentOrgId,
      contactId: residentContact.id,
    },
    include: {
      charge: { select: { id: true, description: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const balance = charges.reduce((sum: number, charge: any) => sum + Number(charge.amount), 0);

  // Get documents
  const contactLinks = await prisma.contactLink.findMany({
    where: { contactId: residentContact.id },
    select: { propertyId: true, unitId: true },
  });

  const propertyIds = contactLinks.map((link: { propertyId: string | null; unitId: string | null }) => link.propertyId).filter(Boolean) as string[];
  const unitIds = contactLinks.map((link: { propertyId: string | null; unitId: string | null }) => link.unitId).filter(Boolean) as string[];

  const documents = await prisma.document.findMany({
    where: {
      orgId: currentOrgId,
      ...(propertyIds.length > 0 ? {
        propertyId: { in: propertyIds },
      } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <ResidentPortalClient
      user={session.user}
      orgs={memberships.map((m: { org: { id: string; name: string | null } }) => ({ id: m.org.id, name: m.org.name ?? '' }))}
      currentOrgId={currentOrgId}
      residentContact={residentContact}
      balance={balance}
      charges={charges.map((c: any) => ({
        id: c.id,
        description: c.description,
        amount: Number(c.amount),
        status: c.status,
        property: c.property,
        unit: c.unit,
      }))}
      payments={payments}
      documents={documents}
    />
  );
}

