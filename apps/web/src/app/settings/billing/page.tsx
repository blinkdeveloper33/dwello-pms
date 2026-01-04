import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "../api/auth/[...nextauth]/authOptions"';
import { BillingPageClient } from './billing-page-client';
import { prisma } from '@loomi/shared';

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { plan?: string };
}) {
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
  const plans = await prisma.plan.findMany({
    orderBy: { price: 'asc' },
  });

  return (
    <BillingPageClient
      user={session.user}
      orgs={memberships.map((m) => ({ id: m.org.id, name: m.org.name }))}
      currentOrgId={currentOrg.id}
      currentPlan={{
        name: currentOrg.plan.name,
        displayName: currentOrg.plan.displayName,
      }}
      plans={plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        displayName: plan.displayName,
        price: Number(plan.price),
        interval: plan.interval,
      }))}
      selectedPlanId={searchParams.plan}
    />
  );
}

