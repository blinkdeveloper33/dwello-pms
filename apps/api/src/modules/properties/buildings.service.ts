import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@loomi/shared';

@Injectable()
export class BuildingsService {
  async getBuildings(orgId: string, propertyId: string): Promise<any[]> {
    // Verify property belongs to org
    const property = await prisma.property.findFirst({
      where: { id: propertyId, orgId, deletedAt: null },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return prisma.building.findMany({
      where: { propertyId, deletedAt: null },
      include: {
        _count: {
          select: { units: { where: { deletedAt: null } } },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createBuilding(orgId: string, propertyId: string, data: { name: string; address?: string }): Promise<any> {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, orgId, deletedAt: null },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return prisma.building.create({
      data: {
        propertyId,
        name: data.name,
        address: data.address,
      },
    });
  }

  async updateBuilding(orgId: string, buildingId: string, data: { name?: string; address?: string }): Promise<any> {
    const building = await prisma.building.findFirst({
      where: { id: buildingId, deletedAt: null },
      include: { property: true },
    });

    if (!building || building.property.orgId !== orgId) {
      throw new NotFoundException('Building not found');
    }

    return prisma.building.update({
      where: { id: buildingId },
      data,
    });
  }

  async deleteBuilding(orgId: string, buildingId: string): Promise<void> {
    const building = await prisma.building.findFirst({
      where: { id: buildingId, deletedAt: null },
      include: { property: true },
    });

    if (!building || building.property.orgId !== orgId) {
      throw new NotFoundException('Building not found');
    }

    await prisma.building.update({
      where: { id: buildingId },
      data: { deletedAt: new Date() },
    });
  }
}

