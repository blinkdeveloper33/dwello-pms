import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "../../../api/auth/[...nextauth]/authOptions";
import { NewJournalClient } from './new-journal-client';
import { prisma } from '@loomi/shared';

export default async function NewJournalPage() {
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

  const accounts = await prisma.chartOfAccount.findMany({
    where: { orgId: currentOrgId },
    orderBy: [{ category: 'asc' }, { code: 'asc' }],
    select: { id: true, name: true, code: true, category: true },
  });

  return (
    <NewJournalClient
      user={session.user}
      orgs={memberships.map((m: { org: { id: string; name: string | null } }) => ({ id: m.org.id, name: m.org.name ?? '' }))}
      currentOrgId={currentOrgId}
      accounts={accounts}
    />
  );
}

