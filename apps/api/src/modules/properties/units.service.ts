import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@loomi/shared';

@Injectable()
export class UnitsService {
  async getUnits(orgId: string, propertyId: string, buildingId?: string): Promise<any[]> {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, orgId, deletedAt: null },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const where: any = { propertyId, deletedAt: null };
    if (buildingId) {
      where.buildingId = buildingId;
    }

    return prisma.unit.findMany({
      where,
      include: {
        building: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { unitNumber: 'asc' },
    });
  }

  async createUnit(
    orgId: string,
    propertyId: string,
    data: {
      buildingId?: string;
      unitNumber: string;
      bedrooms?: number;
      bathrooms?: number;
      squareFeet?: number;
    }
  ): Promise<any> {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, orgId, deletedAt: null },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (data.buildingId) {
      const building = await prisma.building.findFirst({
        where: { id: data.buildingId, propertyId, deletedAt: null },
      });

      if (!building) {
        throw new NotFoundException('Building not found');
      }
    }

    return prisma.unit.create({
      data: {
        propertyId,
        buildingId: data.buildingId,
        unitNumber: data.unitNumber,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        squareFeet: data.squareFeet,
      },
      include: {
        building: true,
      },
    });
  }

  async updateUnit(
    orgId: string,
    unitId: string,
    data: {
      buildingId?: string;
      unitNumber?: string;
      bedrooms?: number;
      bathrooms?: number;
      squareFeet?: number;
    }
  ): Promise<any> {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, deletedAt: null },
      include: { property: true },
    });

    if (!unit || unit.property.orgId !== orgId) {
      throw new NotFoundException('Unit not found');
    }

    return prisma.unit.update({
      where: { id: unitId },
      data,
      include: {
        building: true,
        property: true,
      },
    });
  }

  async deleteUnit(orgId: string, unitId: string): Promise<void> {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, deletedAt: null },
      include: { property: true },
    });

    if (!unit || unit.property.orgId !== orgId) {
      throw new NotFoundException('Unit not found');
    }

    await prisma.unit.update({
      where: { id: unitId },
      data: { deletedAt: new Date() },
    });
  }
}

