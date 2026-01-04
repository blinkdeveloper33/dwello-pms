import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@loomi/shared';

@Injectable()
export class ProfileService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          where: { deletedAt: null },
          include: {
            org: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      memberships: user.memberships.map((m) => ({
        orgId: m.org.id,
        orgName: m.org.name,
      })),
    };
  }

  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        updatedAt: true,
      },
    });
  }

  async uploadImage(userId: string, imageBase64: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // In production, upload to S3/Cloudinary/etc. and store URL
    // For now, store base64 (not recommended for production)
    const imageUrl = imageBase64;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
      select: {
        id: true,
        image: true,
      },
    });

    return {
      imageUrl: updated.image,
    };
  }
}

