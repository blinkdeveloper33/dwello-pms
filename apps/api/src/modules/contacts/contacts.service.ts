import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@loomi/shared';

@Injectable()
export class ContactsService {
  async getContacts(
    orgId: string,
    filters?: { type?: string; search?: string },
    pagination?: { page?: number; limit?: number }
  ): Promise<{ data: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const where: any = {
      orgId,
      deletedAt: null,
    };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: {
          links: {
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
          },
          _count: {
            select: {
              leases: true,
              workOrdersRequester: true,
              charges: true,
            },
          },
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' },
        ],
        skip,
        take: limit,
      }),
      prisma.contact.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getContact(orgId: string, contactId: string): Promise<any> {
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        orgId,
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
      throw new NotFoundException('Contact not found');
    }

    return contact;
  }

  async createContact(orgId: string, data: {
    type: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  }): Promise<any> {
    return prisma.contact.create({
      data: {
        ...data,
        orgId,
      },
      include: {
        links: true,
      },
    });
  }

  async updateContact(orgId: string, contactId: string, data: {
    type?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }): Promise<any> {
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        orgId,
        deletedAt: null,
      },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return prisma.contact.update({
      where: { id: contactId },
      data,
      include: {
        links: {
          include: {
            property: true,
            unit: true,
          },
        },
      },
    });
  }

  async deleteContact(orgId: string, contactId: string): Promise<void> {
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        orgId,
        deletedAt: null,
      },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    await prisma.contact.update({
      where: { id: contactId },
      data: { deletedAt: new Date() },
    });
  }

  async linkContactToProperty(
    orgId: string,
    contactId: string,
    propertyId: string,
    unitId?: string,
    role?: string
  ): Promise<any> {
    // Verify contact belongs to org
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        orgId,
        deletedAt: null,
      },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    // Verify property belongs to org
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        orgId,
        deletedAt: null,
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return prisma.contactLink.create({
      data: {
        contactId,
        propertyId,
        unitId,
        role,
      },
      include: {
        property: true,
        unit: true,
      },
    });
  }
}

