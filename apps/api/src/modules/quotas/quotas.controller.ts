import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuotasService } from './quotas.service';

@ApiTags('quotas')
@Controller('quotas')
export class QuotasController {
  constructor(private readonly quotasService: QuotasService) {}

  @Get('org/:orgId')
  @ApiOperation({ summary: 'Get org quotas and usage' })
  async getOrgQuotas(@Param('orgId') orgId: string) {
    const quotas = await this.quotasService.getOrgQuotas(orgId);
    const usage = await Promise.all(
      quotas.map(async (quota) => {
        const check = await this.quotasService.checkQuota(orgId, quota.resource);
        return {
          resource: quota.resource,
          limit: quota.limit,
          current: check.current,
          usage: check.current,
          remaining: Math.max(0, quota.limit - check.current),
          percentage: quota.limit > 0 ? (check.current / quota.limit) * 100 : 0,
        };
      })
    );
    return { quotas: usage };
  }
}

