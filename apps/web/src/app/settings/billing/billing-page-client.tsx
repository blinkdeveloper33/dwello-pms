'use client';

import { useRouter } from 'next/navigation';
import { AppShell } from '@loomi/ui';
import { BillingClient } from './billing-client';

interface Plan {
  id: string;
  name: string;
  displayName: string;
  price: number;
  interval: string;
}

interface BillingPageClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  currentPlan: {
    name: string;
    displayName: string;
  };
  plans: Plan[];
  selectedPlanId?: string;
}

export function BillingPageClient({
  user,
  orgs,
  currentOrgId,
  currentPlan,
  plans,
  selectedPlanId,
}: BillingPageClientProps) {
  const router = useRouter();

  const handleOrgChange = (orgId: string) => {
    router.push(`/settings/billing?org=${orgId}`);
    router.refresh();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <AppShell
      user={user}
      orgs={orgs}
      currentOrgId={currentOrgId}
      onOrgChange={handleOrgChange}
      onSignOut={handleSignOut}
    >
      <BillingClient
        currentPlan={currentPlan}
        plans={plans}
        selectedPlanId={selectedPlanId}
      />
    </AppShell>
  );
}

