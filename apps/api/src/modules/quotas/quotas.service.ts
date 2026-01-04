import { Injectable } from '@nestjs/common';
import { prisma } from '@loomi/shared';

@Injectable()
export class QuotasService {
  async getOrgQuotas(orgId: string) {
    const org = await prisma.org.findUnique({
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

    if (!org) {
      throw new Error('Org not found');
    }

    return org.plan.quotas;
  }

  async checkQuota(orgId: string, resource: string): Promise<{ allowed: boolean; current: number; limit: number }> {
    const quotas = await this.getOrgQuotas(orgId);
    const quota = quotas.find((q) => q.resource === resource);

    if (!quota) {
      // No quota = unlimited
      return { allowed: true, current: 0, limit: 999999 };
    }

    // Get current usage
    let current = 0;
    switch (resource) {
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
        // Count messages in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        current = await prisma.delivery.count({
          where: {
            communication: { orgId },
            createdAt: { gte: thirtyDaysAgo },
          },
        });
        break;
      default:
        current = 0;
    }

    return {
      allowed: current < quota.limit,
      current,
      limit: quota.limit,
    };
  }

  async recordUsage(orgId: string, resource: string, quantity: number = 1, metadata?: any): Promise<any> {
    return prisma.usageEvent.create({
      data: {
        orgId,
        resource,
        quantity,
        metadata: metadata || {},
      },
    });
  }
}

