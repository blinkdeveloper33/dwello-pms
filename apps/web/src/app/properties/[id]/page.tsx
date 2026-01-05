import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
import { PropertyDetailClient } from './property-detail-client';
import { prisma } from '@loomi/shared';

export default async function PropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
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

  // Fetch property with all related data
  const property = await prisma.property.findFirst({
    where: {
      id: params.id,
      orgId: currentOrgId,
      deletedAt: null,
    },
    include: {
      buildings: {
        where: { deletedAt: null },
        include: {
          _count: {
            select: { units: { where: { deletedAt: null } } },
          },
        },
        orderBy: { name: 'asc' },
      },
      units: {
        where: { deletedAt: null },
        include: {
          building: true,
        },
        orderBy: { unitNumber: 'asc' },
      },
      _count: {
        select: {
          workOrders: true,
          contacts: true,
          documents: true,
        },
      },
    },
  });

  if (!property) {
    notFound();
  }

  // Convert Decimal fields to numbers for client component
  const propertyWithNumbers = {
    ...property,
    units: property.units.map((unit: any) => ({
      ...unit,
      bathrooms: unit.bathrooms ? Number(unit.bathrooms) : null,
      squareFeet: unit.squareFeet ? Number(unit.squareFeet) : null,
    })),
  };

  return (
    <PropertyDetailClient
      user={session.user}
      orgs={memberships.map((m: { org: { id: string; name: string | null } }) => ({ id: m.org.id, name: m.org.name }))}
      currentOrgId={currentOrgId}
      property={propertyWithNumbers}
    />
  );
}

