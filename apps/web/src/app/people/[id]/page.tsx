import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from "../api/auth/[...nextauth]/authOptions"';
import { ContactDetailClient } from './contact-detail-client';
import { prisma } from '@loomi/shared';

export default async function ContactDetailPage({
  params,
}: {
  params: { id: string };
}) {
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

  // Fetch contact with all related data
  const contact = await prisma.contact.findFirst({
    where: {
      id: params.id,
      orgId: currentOrgId,
      deletedAt: null,
    },
    include: {
      links: {
        include: {
          property: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          unit: {
            select: {
              id: true,
              unitNumber: true,
              building: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      leases: {
        include: {
          property: {
            select: {
              id: true,
              name: true,
            },
          },
          unit: {
            select: {
              id: true,
              unitNumber: true,
            },
          },
        },
        orderBy: {
          startDate: 'desc',
        },
      },
      _count: {
        select: {
          workOrdersRequester: true,
          workOrdersVendor: true,
          charges: true,
          payments: true,
        },
      },
    },
  });

  if (!contact) {
    notFound();
  }

  return (
    <ContactDetailClient
      user={session.user}
      orgs={memberships.map((m) => ({ id: m.org.id, name: m.org.name }))}
      currentOrgId={currentOrgId}
      contact={contact}
    />
  );
}

