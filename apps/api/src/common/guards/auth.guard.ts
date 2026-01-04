import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // For now, we'll accept requests with orgId in body/query/params
    // In production, this should validate JWT tokens
    const orgId = request.body?.orgId || request.query?.orgId || request.params?.orgId;
    
    if (!orgId) {
      throw new UnauthorizedException('Organization ID required');
    }
    
    return true;
  }
}

