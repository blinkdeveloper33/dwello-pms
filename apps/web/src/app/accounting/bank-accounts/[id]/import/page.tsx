import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { BankImportClient } from './bank-import-client';
import { prisma } from '@loomi/shared';

export default async function BankImportPage({ params }: { params: { id: string } }) {
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

  const bankAccount = await prisma.bankAccount.findFirst({
    where: { id: params.id, orgId: currentOrgId },
  });

  if (!bankAccount) {
    redirect('/accounting/bank-accounts');
  }

  return (
    <BankImportClient
      user={session.user}
      orgs={memberships.map((m) => ({ id: m.org.id, name: m.org.name }))}
      currentOrgId={currentOrgId}
      bankAccount={bankAccount}
    />
  );
}

