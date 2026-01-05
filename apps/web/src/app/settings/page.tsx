import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { SettingsClient } from './settings-client';
import { prisma } from '@loomi/shared';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id, deletedAt: null },
    include: { 
      org: {
        include: {
          plan: true,
        },
      },
    },
  });

  if (memberships.length === 0) {
    redirect('/onboarding');
  }

  const currentOrg = memberships[0].org;

  // Convert Decimal to number for client component
  const orgData = {
    id: currentOrg.id,
    name: currentOrg.name,
    slug: currentOrg.slug,
    plan: {
      name: currentOrg.plan.name,
      displayName: currentOrg.plan.displayName,
    },
  };

  return (
    <SettingsClient
      user={session.user}
      orgs={memberships.map((m: { org: { id: string; name: string | null } }) => ({ id: m.org.id, name: m.org.name }))}
      currentOrgId={currentOrg.id}
      currentOrg={orgData}
    />
  );
}

