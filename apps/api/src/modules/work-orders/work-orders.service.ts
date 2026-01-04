import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@loomi/shared';

@Injectable()
export class WorkOrdersService {
  async getWorkOrders(
    orgId: string,
    filters?: { propertyId?: string; status?: string },
    pagination?: { page?: number; limit?: number }
  ): Promise<{ data: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const where: any = { orgId };

    if (filters?.propertyId) where.propertyId = filters.propertyId;
    if (filters?.status) where.status = filters.status;

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.workOrder.findMany({
        where,
        include: {
          property: { select: { id: true, name: true } },
          unit: { select: { id: true, unitNumber: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
          vendor: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.workOrder.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createWorkOrder(orgId: string, data: {
    propertyId: string;
    unitId?: string;
    contactId?: string;
    vendorId?: string;
    title: string;
    description?: string;
    priority: string;
    status?: string;
    permissionToEnter?: boolean;
    scheduledAt?: Date;
    attachmentIds?: string[]; // Document IDs for photos
  }): Promise<any> {
    const workOrder = await prisma.workOrder.create({
      data: {
        orgId,
        propertyId: data.propertyId,
        unitId: data.unitId,
        contactId: data.contactId,
        vendorId: data.vendorId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status || 'open',
        permissionToEnter: data.permissionToEnter || false,
        scheduledAt: data.scheduledAt,
      },
      include: {
        property: true,
        unit: true,
        contact: true,
        vendor: true,
        attachments: true,
      },
    });

    // Attach documents/photos if provided
    if (data.attachmentIds && data.attachmentIds.length > 0) {
      await prisma.workOrderAttachment.createMany({
        data: data.attachmentIds.map((docId) => ({
          workOrderId: workOrder.id,
          documentId: docId,
        })),
      });
    }

    return prisma.workOrder.findUnique({
      where: { id: workOrder.id },
      include: {
        property: true,
        unit: true,
        contact: true,
        vendor: true,
        attachments: {
          include: {
            document: true,
          },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async addComment(orgId: string, workOrderId: string, data: {
    userId?: string;
    content: string;
  }): Promise<any> {
    const workOrder = await prisma.workOrder.findFirst({
      where: { id: workOrderId, orgId },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    return prisma.workOrderComment.create({
      data: {
        workOrderId,
        userId: data.userId,
        content: data.content,
      },
    });
  }

  async addAttachment(orgId: string, workOrderId: string, documentId: string): Promise<any> {
    const workOrder = await prisma.workOrder.findFirst({
      where: { id: workOrderId, orgId },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    return prisma.workOrderAttachment.create({
      data: {
        workOrderId,
        documentId,
      },
      include: {
        document: true,
      },
    });
  }

  async updateWorkOrder(orgId: string, workOrderId: string, data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    vendorId?: string;
  }): Promise<any> {
    const workOrder = await prisma.workOrder.findFirst({
      where: { id: workOrderId, orgId },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    const updateData: any = {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
    };

    if (data.vendorId) {
      updateData.vendor = { connect: { id: data.vendorId } };
    }

    return prisma.workOrder.update({
      where: { id: workOrderId },
      data: updateData,
      include: {
        property: true,
        unit: true,
        contact: true,
        vendor: true,
      },
    });
  }
}

