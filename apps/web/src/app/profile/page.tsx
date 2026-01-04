import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "../api/auth/[...nextauth]/authOptions"';
import { ProfileClient } from './profile-client';
import { prisma } from '@loomi/shared';

export default async function ProfilePage() {
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

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      memberships: {
        where: { deletedAt: null },
        include: {
          org: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <ProfileClient
      user={session.user}
      orgs={memberships.map((m) => ({ id: m.org.id, name: m.org.name }))}
      currentOrgId={currentOrgId}
      userData={{
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        memberships: user.memberships.map((m) => ({
          orgName: m.org.name,
        })),
      }}
    />
  );
}

