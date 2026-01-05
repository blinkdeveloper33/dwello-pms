import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { WebhooksClient } from './webhooks-client';
import { prisma } from '@loomi/shared';

export default async function WebhooksPage() {
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

  const [webhooks, outbox] = await Promise.all([
    prisma.webhook.findMany({
      where: { orgId: currentOrgId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.webhookDelivery.findMany({
      where: { webhook: { orgId: currentOrgId } },
      include: {
        webhook: { select: { id: true, url: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

  return (
    <WebhooksClient
      user={session.user}
      orgs={memberships.map((m) => ({ id: m.org.id, name: m.org.name }))}
      currentOrgId={currentOrgId}
      initialWebhooks={webhooks}
      initialOutbox={outbox}
    />
  );
}

