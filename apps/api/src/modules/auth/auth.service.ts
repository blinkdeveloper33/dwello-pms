import { Injectable } from '@nestjs/common';
import { prisma } from '@loomi/shared';

@Injectable()
export class AuthService {
  async validateUser(email: string, password: string): Promise<any> {
    // TODO: Implement proper password validation
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    // For MVP, allow any user
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async getUserMemberships(userId: string): Promise<any[]> {
    return prisma.membership.findMany({
      where: { userId, deletedAt: null },
      include: {
        org: {
          include: {
            plan: true,
          },
        },
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }
}

