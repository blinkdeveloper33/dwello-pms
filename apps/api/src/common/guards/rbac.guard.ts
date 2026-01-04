import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { prisma } from '@loomi/shared';

export const RequirePermission = (permission: string) => SetMetadata('permission', permission);

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.get<string>('permission', context.getHandler());
    if (!permission) {
      return true; // No permission required
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const orgId = request.body?.orgId || request.params?.orgId || request.query?.orgId;

    if (!userId || !orgId) {
      throw new ForbiddenException('User or org context missing');
    }

    // Get user's membership
    const membership = await prisma.membership.findFirst({
      where: {
        userId,
        orgId,
        deletedAt: null,
      },
      include: {
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

    if (!membership) {
      throw new ForbiddenException('No membership found');
    }

    // Check if user has the required permission
    const hasPermission = membership.role?.permissions.some(
      (rp) => rp.permission.capability === permission
    );

    if (!hasPermission) {
      throw new ForbiddenException(`Missing required permission: ${permission}`);
    }

    return true;
  }
}

