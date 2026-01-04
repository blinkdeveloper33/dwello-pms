import { Injectable, ForbiddenException } from '@nestjs/common';
import { prisma } from '@loomi/shared';
import { QuotasService } from '../quotas/quotas.service';

@Injectable()
export class PropertiesService {
  constructor(private quotasService: QuotasService) {}

  async createProperty(orgId: string, data: any) {
    // Check quota
    const quotaCheck = await this.quotasService.checkQuota(orgId, 'max_properties');
    if (!quotaCheck.allowed) {
      throw new ForbiddenException(
        `Quota exceeded: You have ${quotaCheck.current}/${quotaCheck.limit} properties. Please upgrade your plan.`
      );
    }

    return prisma.property.create({
      data: {
        ...data,
        orgId,
      },
    });
  }

  async getProperties(
    orgId: string,
    pagination?: { page?: number; limit?: number }
  ): Promise<{ data: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const where = { orgId, deletedAt: null };
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          buildings: {
            where: { deletedAt: null },
          },
          _count: {
            select: {
              units: {
                where: { deletedAt: null },
              },
            },
          },
        },
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProperty(orgId: string, propertyId: string): Promise<any> {
    return prisma.property.findFirst({
      where: { id: propertyId, orgId, deletedAt: null },
      include: {
        buildings: {
          where: { deletedAt: null },
          include: {
            _count: {
              select: { units: { where: { deletedAt: null } } },
            },
          },
        },
        units: {
          where: { deletedAt: null },
        },
      },
    });
  }

  async updateProperty(orgId: string, propertyId: string, data: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    propertyType?: string;
  }): Promise<any> {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, orgId, deletedAt: null },
    });

    if (!property) {
      throw new ForbiddenException('Property not found');
    }

    return prisma.property.update({
      where: { id: propertyId },
      data,
    });
  }

  async deleteProperty(orgId: string, propertyId: string): Promise<void> {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, orgId, deletedAt: null },
    });

    if (!property) {
      throw new ForbiddenException('Property not found');
    }

    await prisma.property.update({
      where: { id: propertyId },
      data: { deletedAt: new Date() },
    });
  }
}

