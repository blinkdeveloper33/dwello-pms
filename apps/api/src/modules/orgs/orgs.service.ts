import { Injectable } from '@nestjs/common';
import { prisma } from '@loomi/shared';

@Injectable()
export class OrgsService {
  async createOrg(userId: string, data: { name: string; slug: string; planId?: string }) {
    // Default to starter plan if not provided
    const starterPlan = await prisma.plan.findUnique({
      where: { name: 'starter' },
    });

    if (!starterPlan) {
      throw new Error('Starter plan not found');
    }

    const org = await prisma.org.create({
      data: {
        name: data.name,
        slug: data.slug,
        planId: data.planId || starterPlan.id,
      },
    });

    // Create admin role
    const adminRole = await prisma.role.create({
      data: {
        orgId: org.id,
        name: 'Admin',
        description: 'Full access',
        isSystem: true,
        permissions: {
          create: (await prisma.permission.findMany()).map((p) => ({
            permissionId: p.id,
          })),
        },
      },
    });

    // Create membership
    await prisma.membership.create({
      data: {
        orgId: org.id,
        userId,
        roleId: adminRole.id,
      },
    });

    return org;
  }

  async getOrg(orgId: string): Promise<any> {
    return prisma.org.findUnique({
      where: { id: orgId },
      include: {
        plan: {
          include: {
            quotas: true,
            featureFlags: true,
          },
        },
      },
    });
  }
}

