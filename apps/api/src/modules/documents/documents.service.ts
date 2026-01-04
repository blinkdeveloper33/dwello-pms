import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@loomi/shared';

@Injectable()
export class DocumentsService {
  async getDocuments(
    orgId: string,
    filters?: { propertyId?: string; mimeType?: string },
    pagination?: { page?: number; limit?: number }
  ): Promise<{ data: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const where: any = {
      orgId,
    };

    if (filters?.propertyId) {
      where.propertyId = filters.propertyId;
    }

    if (filters?.mimeType) {
      where.mimeType = { contains: filters.mimeType };
    }

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.document.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDocument(orgId: string, documentId: string): Promise<any> {
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        orgId,
      },
      include: {
        property: true,
        permissions: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
            membership: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async createDocument(orgId: string, data: {
    propertyId?: string;
    folderId?: string;
    name: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedBy?: string; // User ID
    permissions?: string[]; // Role IDs that can access
  }): Promise<any> {
    const document = await prisma.document.create({
      data: {
        org: { connect: { id: orgId } },
        property: data.propertyId ? { connect: { id: data.propertyId } } : undefined,
        folder: data.folderId ? { connect: { id: data.folderId } } : undefined,
        name: data.name,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        uploadedBy: data.uploadedBy,
        permissions: data.permissions
          ? {
              create: data.permissions.map((roleId) => ({
                roleId,
                permission: 'read',
              })),
            }
          : undefined,
      },
      include: {
        property: true,
        folder: true,
        permissions: {
          include: {
            role: true,
          },
        },
      },
    });

    return document;
  }

  async updateDocument(orgId: string, documentId: string, data: {
    name?: string;
    permissions?: string[];
  }): Promise<any> {
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        orgId,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Update permissions if provided
    if (data.permissions) {
      await prisma.documentPermission.deleteMany({
        where: { documentId },
      });

      await prisma.documentPermission.createMany({
        data: data.permissions.map((roleId) => ({
          documentId,
          roleId,
          permission: 'read',
        })),
      });
    }

    return prisma.document.update({
      where: { id: documentId },
      data: {
        name: data.name,
      },
      include: {
        property: true,
        permissions: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async deleteDocument(orgId: string, documentId: string): Promise<void> {
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        orgId,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await prisma.document.delete({
      where: { id: documentId },
    });
  }
}

