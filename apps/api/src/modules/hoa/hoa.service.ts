import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@loomi/shared';

@Injectable()
export class HoaService {
  // Violations
  async getViolations(orgId: string, filters?: { propertyId?: string; unitId?: string; status?: string }): Promise<any[]> {
    const where: any = { property: { orgId } };

    if (filters?.propertyId) where.propertyId = filters.propertyId;
    if (filters?.unitId) where.unitId = filters.unitId;
    if (filters?.status) where.status = filters.status;

    return prisma.violation.findMany({
      where,
      include: {
        property: { select: { id: true, name: true } },
        unit: { select: { id: true, unitNumber: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        steps: { orderBy: { occurredAt: 'desc' } },
        fines: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createViolation(orgId: string, data: {
    propertyId: string;
    unitId?: string;
    contactId?: string;
    type: string;
    description: string;
  }): Promise<any> {
    const property = await prisma.property.findFirst({
      where: { id: data.propertyId, orgId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return prisma.violation.create({
      data: {
        orgId,
        propertyId: data.propertyId,
        unitId: data.unitId,
        contactId: data.contactId,
        type: data.type,
        description: data.description,
        status: 'open',
      },
      include: {
        property: true,
        unit: true,
        contact: true,
      },
    });
  }

  async getViolation(orgId: string, violationId: string): Promise<any> {
    const violation = await prisma.violation.findFirst({
      where: { id: violationId, property: { orgId } },
      include: {
        property: true,
        unit: true,
        contact: true,
        steps: { orderBy: { occurredAt: 'desc' } },
        fines: true,
      },
    });

    if (!violation) {
      throw new NotFoundException('Violation not found');
    }

    return violation;
  }

  async updateViolation(orgId: string, violationId: string, data: {
    status?: string;
    description?: string;
  }): Promise<any> {
    const violation = await prisma.violation.findFirst({
      where: { id: violationId, property: { orgId } },
    });

    if (!violation) {
      throw new NotFoundException('Violation not found');
    }

    return prisma.violation.update({
      where: { id: violationId },
      data,
      include: {
        property: true,
        unit: true,
        contact: true,
        steps: true,
        fines: true,
      },
    });
  }

  async addViolationStep(orgId: string, violationId: string, data: {
    type: string;
    description: string;
    amount?: number;
  }): Promise<any> {
    const violation = await prisma.violation.findFirst({
      where: { id: violationId, property: { orgId } },
    });

    if (!violation) {
      throw new NotFoundException('Violation not found');
    }

    return prisma.violationStep.create({
      data: {
        violation: { connect: { id: violationId } },
        type: data.type,
        description: data.description,
        amount: data.amount,
      },
    });
  }

  async createFine(orgId: string, violationId: string, data: {
    amount: number;
    description: string;
    chargeId?: string;
  }): Promise<any> {
    const violation = await prisma.violation.findFirst({
      where: { id: violationId, property: { orgId } },
    });

    if (!violation) {
      throw new NotFoundException('Violation not found');
    }

    return prisma.fine.create({
      data: {
        violation: { connect: { id: violationId } },
        charge: data.chargeId ? { connect: { id: data.chargeId } } : undefined,
        amount: data.amount,
        description: data.description,
      },
    });
  }

  // Architectural Requests
  async getArchitecturalRequests(orgId: string, filters?: { propertyId?: string; status?: string }): Promise<any[]> {
    const where: any = { property: { orgId } };

    if (filters?.propertyId) where.propertyId = filters.propertyId;
    if (filters?.status) where.status = filters.status;

    return prisma.architecturalRequest.findMany({
      where,
      include: {
        property: { select: { id: true, name: true } },
        unit: { select: { id: true, unitNumber: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        approvals: {
          include: {
            membership: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createArchitecturalRequest(orgId: string, data: {
    propertyId: string;
    unitId?: string;
    contactId?: string;
    title: string;
    description: string;
  }): Promise<any> {
    const property = await prisma.property.findFirst({
      where: { id: data.propertyId, orgId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return prisma.architecturalRequest.create({
      data: {
        orgId,
        propertyId: data.propertyId,
        unitId: data.unitId,
        contactId: data.contactId,
        title: data.title,
        description: data.description,
        status: 'pending',
      },
      include: {
        property: true,
        unit: true,
        contact: true,
      },
    });
  }

  async getArchitecturalRequest(orgId: string, requestId: string): Promise<any> {
    const request = await prisma.architecturalRequest.findFirst({
      where: { id: requestId, property: { orgId } },
      include: {
        property: true,
        unit: true,
        contact: true,
        approvals: {
          include: {
            membership: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Architectural request not found');
    }

    return request;
  }

  async updateArchitecturalRequest(orgId: string, requestId: string, data: {
    status?: string;
    title?: string;
    description?: string;
  }): Promise<any> {
    const request = await prisma.architecturalRequest.findFirst({
      where: { id: requestId, property: { orgId } },
    });

    if (!request) {
      throw new NotFoundException('Architectural request not found');
    }

    return prisma.architecturalRequest.update({
      where: { id: requestId },
      data: {
        ...data,
        reviewedAt: data.status && data.status !== 'pending' ? new Date() : undefined,
      },
      include: {
        property: true,
        unit: true,
        contact: true,
        approvals: true,
      },
    });
  }

  async addArchitecturalApproval(orgId: string, requestId: string, membershipId: string, data: {
    decision: string;
    comments?: string;
  }): Promise<any> {
    const request = await prisma.architecturalRequest.findFirst({
      where: { id: requestId, property: { orgId } },
    });

    if (!request) {
      throw new NotFoundException('Architectural request not found');
    }

    return prisma.architecturalApproval.create({
      data: {
        request: { connect: { id: requestId } },
        membership: { connect: { id: membershipId } },
        decision: data.decision,
        comments: data.comments,
      },
      include: {
        membership: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  // Amenities & Reservations
  async getAmenities(orgId: string, propertyId?: string): Promise<any[]> {
    const where: any = { property: { orgId } };

    if (propertyId) where.propertyId = propertyId;

    return prisma.amenity.findMany({
      where,
      include: {
        property: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAmenity(orgId: string, data: {
    propertyId: string;
    name: string;
    description?: string;
    rules?: any;
  }): Promise<any> {
    const property = await prisma.property.findFirst({
      where: { id: data.propertyId, orgId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return prisma.amenity.create({
      data: {
        orgId,
        propertyId: data.propertyId,
        name: data.name,
        description: data.description,
        rules: data.rules || {},
      },
      include: {
        property: true,
      },
    });
  }

  async getAmenity(orgId: string, amenityId: string): Promise<any> {
    const amenity = await prisma.amenity.findFirst({
      where: { id: amenityId, property: { orgId } },
      include: {
        property: true,
        reservations: {
          include: {
            contact: true,
          },
          orderBy: { startTime: 'desc' },
        },
      },
    });

    if (!amenity) {
      throw new NotFoundException('Amenity not found');
    }

    return amenity;
  }

  async updateAmenity(orgId: string, amenityId: string, data: {
    name?: string;
    description?: string;
    rules?: any;
  }): Promise<any> {
    const amenity = await prisma.amenity.findFirst({
      where: { id: amenityId, property: { orgId } },
    });

    if (!amenity) {
      throw new NotFoundException('Amenity not found');
    }

    return prisma.amenity.update({
      where: { id: amenityId },
      data,
      include: {
        property: true,
      },
    });
  }

  async getReservations(orgId: string, filters?: { amenityId?: string; contactId?: string; status?: string }): Promise<any[]> {
    const where: any = { amenity: { property: { orgId } } };

    if (filters?.amenityId) where.amenityId = filters.amenityId;
    if (filters?.contactId) where.contactId = filters.contactId;
    if (filters?.status) where.status = filters.status;

    return prisma.reservation.findMany({
      where,
      include: {
        amenity: {
          include: {
            property: { select: { id: true, name: true } },
          },
        },
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async createReservation(orgId: string, data: {
    amenityId: string;
    contactId?: string;
    startTime: Date;
    endTime: Date;
  }): Promise<any> {
    const amenity = await prisma.amenity.findFirst({
      where: { id: data.amenityId, property: { orgId } },
    });

    if (!amenity) {
      throw new NotFoundException('Amenity not found');
    }

    return prisma.reservation.create({
      data: {
        amenity: { connect: { id: data.amenityId } },
        contact: data.contactId ? { connect: { id: data.contactId } } : undefined,
        startTime: data.startTime,
        endTime: data.endTime,
        status: 'pending',
      },
      include: {
        amenity: {
          include: {
            property: true,
          },
        },
        contact: true,
      },
    });
  }

  async updateReservation(orgId: string, reservationId: string, data: {
    status?: string;
    startTime?: Date;
    endTime?: Date;
  }): Promise<any> {
    const reservation = await prisma.reservation.findFirst({
      where: { id: reservationId, amenity: { property: { orgId } } },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return prisma.reservation.update({
      where: { id: reservationId },
      data,
      include: {
        amenity: {
          include: {
            property: true,
          },
        },
        contact: true,
      },
    });
  }
}

