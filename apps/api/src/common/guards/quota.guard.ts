import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { QuotasService } from '../../modules/quotas/quotas.service';

export const RequireQuota = (resource: string) => SetMetadata('quota_resource', resource);

@Injectable()
export class QuotaGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private quotasService: QuotasService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.get<string>('quota_resource', context.getHandler());
    if (!resource) {
      return true; // No quota check required
    }

    const request = context.switchToHttp().getRequest();
    const orgId = request.body?.orgId || request.params?.orgId || request.query?.orgId;

    if (!orgId) {
      throw new ForbiddenException('Org context missing');
    }

    const check = await this.quotasService.checkQuota(orgId, resource);

    if (!check.allowed) {
      throw new ForbiddenException(
        `Quota exceeded: You have ${check.current}/${check.limit} ${resource}. Please upgrade your plan.`
      );
    }

    return true;
  }
}

