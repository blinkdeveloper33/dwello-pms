import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "../../../api/auth/[...nextauth]/authOptions";
import { ReconciliationClient } from './reconciliation-client';
import { prisma } from '@loomi/shared';

export default async function ReconciliationPage({ params }: { params: { id: string } }) {
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

  const reconciliation = await prisma.reconciliation.findFirst({
    where: { id: params.id, orgId: currentOrgId },
    include: {
      bankAccount: { select: { id: true, name: true } },
      lines: {
        include: {
          bankTransaction: { select: { id: true, date: true, description: true, amount: true } },
          journalEntry: { select: { id: true, date: true, description: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!reconciliation) {
    redirect('/accounting/reconciliations');
  }

  const bankTransactions = await prisma.bankTransaction.findMany({
    where: {
      bankAccountId: reconciliation.bankAccountId,
      reconciled: false,
    },
    orderBy: { date: 'desc' },
  });

  return (
    <ReconciliationClient
      user={session.user}
      orgs={memberships.map((m: { org: { id: string; name: string | null } }) => ({ id: m.org.id, name: m.org.name }))}
      currentOrgId={currentOrgId}
      reconciliation={reconciliation}
      unmatchedTransactions={bankTransactions}
    />
  );
}

