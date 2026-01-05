import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
import { AppShell } from '@loomi/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@loomi/ui';
import { Button } from '@loomi/ui';
import { prisma } from '@loomi/shared';
import Link from 'next/link';

async function getUsageData(orgId: string) {
  const org = await prisma.org.findUnique({
    where: { id: orgId },
    include: {
      plan: {
        include: {
          quotas: true,
        },
      },
    },
  });

  if (!org) return null;

  const usage = await Promise.all(
    org.plan.quotas.map(async (quota) => {
      let current = 0;
      switch (quota.resource) {
        case 'max_units':
          current = await prisma.unit.count({
            where: {
              property: { orgId },
              deletedAt: null,
            },
          });
          break;
        case 'max_properties':
          current = await prisma.property.count({
            where: { orgId, deletedAt: null },
          });
          break;
        case 'max_users':
          current = await prisma.membership.count({
            where: { orgId, deletedAt: null },
          });
          break;
        case 'max_outbound_messages':
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          current = await prisma.delivery.count({
            where: {
              communication: { orgId },
              createdAt: { gte: thirtyDaysAgo },
            },
          });
          break;
      }

      const percentage = quota.limit > 0 ? (current / quota.limit) * 100 : 0;
      const isNearLimit = percentage >= 80;
      const isAtLimit = current >= quota.limit;

      return {
        resource: quota.resource,
        limit: quota.limit,
        current,
        remaining: Math.max(0, quota.limit - current),
        percentage,
        isNearLimit,
        isAtLimit,
      };
    })
  );

  return { plan: org.plan, usage };
}

export default async function UsagePage() {
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

  const currentOrg = memberships[0].org;
  const usageData = await getUsageData(currentOrg.id);

  if (!usageData) {
    return <div>Error loading usage data</div>;
  }

  const formatResourceName = (resource: string) => {
    return resource
      .replace('max_', '')
      .replace('_', ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <AppShell
      user={session.user}
      orgs={memberships.map((m: { org: { id: string; name: string | null } }) => ({ id: m.org.id, name: m.org.name }))}
      currentOrgId={currentOrg.id}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Usage & Quotas</h1>
          <p className="text-gray-600 mt-1">Monitor your plan usage and upgrade when needed</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Plan: {usageData.plan.displayName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {usageData.usage.map((item) => (
                <div key={item.resource} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{formatResourceName(item.resource)}</span>
                    <span className={item.isAtLimit ? 'text-red-600 font-semibold' : item.isNearLimit ? 'text-yellow-600' : 'text-gray-600'}>
                      {item.current} / {item.limit === 999999 ? 'Unlimited' : item.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        item.isAtLimit ? 'bg-red-600' : item.isNearLimit ? 'bg-yellow-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>
                  {item.isAtLimit && (
                    <p className="text-sm text-red-600 font-medium">
                      Quota exceeded! Please upgrade your plan to continue.
                    </p>
                  )}
                  {item.isNearLimit && !item.isAtLimit && (
                    <p className="text-sm text-yellow-600">Approaching limit. Consider upgrading.</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <Link href="/settings/billing">
                <Button className="w-full">Upgrade Plan</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

