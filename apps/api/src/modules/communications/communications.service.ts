import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@loomi/shared';

@Injectable()
export class CommunicationsService {
  async getTemplates(orgId: string): Promise<any[]> {
    return prisma.template.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTemplate(orgId: string, data: {
    name: string;
    type: string;
    subject?: string;
    body: string;
    variables?: any;
  }): Promise<any> {
    return prisma.template.create({
      data: {
        orgId,
        name: data.name,
        type: data.type,
        subject: data.subject,
        body: data.body,
        variables: data.variables || {},
      },
    });
  }

  async getTemplate(orgId: string, templateId: string): Promise<any> {
    const template = await prisma.template.findFirst({
      where: { id: templateId, orgId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async updateTemplate(orgId: string, templateId: string, data: {
    name?: string;
    subject?: string;
    body?: string;
    variables?: any;
  }): Promise<any> {
    const template = await prisma.template.findFirst({
      where: { id: templateId, orgId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return prisma.template.update({
      where: { id: templateId },
      data,
    });
  }

  async deleteTemplate(orgId: string, templateId: string): Promise<void> {
    const template = await prisma.template.findFirst({
      where: { id: templateId, orgId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    await prisma.template.delete({
      where: { id: templateId },
    });
  }

  async getCommunications(
    orgId: string,
    filters?: { propertyId?: string; type?: string; status?: string },
    pagination?: { page?: number; limit?: number }
  ): Promise<{ data: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const where: any = { orgId };

    if (filters?.propertyId) where.propertyId = filters.propertyId;
    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.communication.findMany({
        where,
        include: {
          property: { select: { id: true, name: true } },
          template: { select: { id: true, name: true } },
          deliveries: {
            include: {
              contact: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.communication.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createCommunication(orgId: string, data: {
    propertyId?: string;
    templateId?: string;
    type: string;
    subject?: string;
    body: string;
    scheduledAt?: Date;
    contactIds?: string[];
  }): Promise<any> {
    const communication = await prisma.communication.create({
      data: {
        org: { connect: { id: orgId } },
        property: data.propertyId ? { connect: { id: data.propertyId } } : undefined,
        template: data.templateId ? { connect: { id: data.templateId } } : undefined,
        type: data.type,
        subject: data.subject,
        body: data.body,
        status: data.scheduledAt ? 'scheduled' : 'draft',
        scheduledAt: data.scheduledAt,
      },
      include: {
        property: true,
        template: true,
      },
    });

    // Create deliveries if contactIds provided
    if (data.contactIds && data.contactIds.length > 0) {
      const contacts = await prisma.contact.findMany({
        where: { id: { in: data.contactIds }, orgId },
        select: { id: true, email: true, phone: true },
      });

      await prisma.delivery.createMany({
        data: contacts.map(contact => ({
          communicationId: communication.id,
          contactId: contact.id,
          email: contact.email || undefined,
          phone: contact.phone || undefined,
          status: 'pending',
        })),
      });
    }

    return prisma.communication.findUnique({
      where: { id: communication.id },
      include: {
        property: true,
        template: true,
        deliveries: {
          include: {
            contact: true,
          },
        },
      },
    });
  }

  async getCommunication(orgId: string, communicationId: string): Promise<any> {
    const communication = await prisma.communication.findFirst({
      where: { id: communicationId, orgId },
      include: {
        property: true,
        template: true,
        deliveries: {
          include: {
            contact: true,
          },
        },
      },
    });

    if (!communication) {
      throw new NotFoundException('Communication not found');
    }

    return communication;
  }

  async updateCommunication(orgId: string, communicationId: string, data: {
    subject?: string;
    body?: string;
    status?: string;
    scheduledAt?: Date;
  }): Promise<any> {
    const communication = await prisma.communication.findFirst({
      where: { id: communicationId, orgId },
    });

    if (!communication) {
      throw new NotFoundException('Communication not found');
    }

    return prisma.communication.update({
      where: { id: communicationId },
      data,
      include: {
        property: true,
        template: true,
        deliveries: {
          include: {
            contact: true,
          },
        },
      },
    });
  }

  async sendCommunication(orgId: string, communicationId: string): Promise<any> {
    const communication = await prisma.communication.findFirst({
      where: { id: communicationId, orgId },
      include: {
        deliveries: true,
      },
    });

    if (!communication) {
      throw new NotFoundException('Communication not found');
    }

    // Update status to sending
    await prisma.communication.update({
      where: { id: communicationId },
      data: {
        status: 'sending',
        sentAt: new Date(),
      },
    });

    // In a real implementation, this would trigger email/SMS sending
    // For now, we'll mark deliveries as sent
    await prisma.delivery.updateMany({
      where: { communicationId },
      data: {
        status: 'sent',
        deliveredAt: new Date(),
      },
    });

    return prisma.communication.update({
      where: { id: communicationId },
      data: { status: 'sent' },
      include: {
        property: true,
        template: true,
        deliveries: {
          include: {
            contact: true,
          },
        },
      },
    });
  }

  async getUnifiedInbox(orgId: string, filters?: { type?: string; status?: string }): Promise<any[]> {
    const where: any = { orgId };

    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;

    return prisma.communication.findMany({
      where,
      include: {
        property: { select: { id: true, name: true } },
        template: { select: { id: true, name: true } },
        deliveries: {
          include: {
            contact: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit for inbox view
    });
  }
}

