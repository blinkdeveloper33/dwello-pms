import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
import { AmenitiesClient } from './amenities-client';
import { prisma } from '@loomi/shared';

export default async function AmenitiesPage() {
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

  const [amenities, reservations] = await Promise.all([
    prisma.amenity.findMany({
      where: { orgId: currentOrgId },
      orderBy: { name: 'asc' },
    }),
    prisma.reservation.findMany({
      where: { amenity: { orgId: currentOrgId } },
      include: {
        amenity: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { startTime: 'asc' },
    }),
  ]);

  return (
    <AmenitiesClient
      user={session.user}
      orgs={memberships.map((m: { org: { id: string; name: string | null } }) => ({ id: m.org.id, name: m.org.name ?? '' }))}
      currentOrgId={currentOrgId}
      amenities={amenities}
      reservations={reservations}
    />
  );
}

