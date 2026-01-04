import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EnterpriseService } from './enterprise.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';

@ApiTags('Enterprise')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('enterprise')
export class EnterpriseController {
  constructor(private readonly enterpriseService: EnterpriseService) {}

  // API Keys
  @Get('api-keys')
  @ApiOperation({ summary: 'List API keys' })
  async getApiKeys(@CurrentOrg() orgId: string) {
    return this.enterpriseService.getApiKeys(orgId);
  }

  @Post('api-keys')
  @ApiOperation({ summary: 'Create API key' })
  async createApiKey(
    @CurrentOrg() orgId: string,
    @Body() data: { name: string; rateLimit?: number }
  ) {
    return this.enterpriseService.createApiKey(orgId, data);
  }

  @Get('api-keys/:id')
  @ApiOperation({ summary: 'Get API key' })
  async getApiKey(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.enterpriseService.getApiKey(orgId, id);
  }

  @Put('api-keys/:id')
  @ApiOperation({ summary: 'Update API key' })
  async updateApiKey(
    @CurrentOrg() orgId: string,
    @Param('id') id: string,
    @Body() data: { name?: string; rateLimit?: number }
  ) {
    return this.enterpriseService.updateApiKey(orgId, id, data);
  }

  @Delete('api-keys/:id')
  @ApiOperation({ summary: 'Delete API key' })
  async deleteApiKey(@CurrentOrg() orgId: string, @Param('id') id: string) {
    await this.enterpriseService.deleteApiKey(orgId, id);
    return { success: true };
  }

  // Webhooks
  @Get('webhooks')
  @ApiOperation({ summary: 'List webhooks' })
  async getWebhooks(@CurrentOrg() orgId: string) {
    return this.enterpriseService.getWebhooks(orgId);
  }

  @Post('webhooks')
  @ApiOperation({ summary: 'Create webhook' })
  async createWebhook(
    @CurrentOrg() orgId: string,
    @Body() data: { url: string; events: string[] }
  ) {
    return this.enterpriseService.createWebhook(orgId, data);
  }

  @Get('webhooks/:id')
  @ApiOperation({ summary: 'Get webhook' })
  async getWebhook(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.enterpriseService.getWebhook(orgId, id);
  }

  @Put('webhooks/:id')
  @ApiOperation({ summary: 'Update webhook' })
  async updateWebhook(
    @CurrentOrg() orgId: string,
    @Param('id') id: string,
    @Body() data: { url?: string; events?: string[]; isActive?: boolean }
  ) {
    return this.enterpriseService.updateWebhook(orgId, id, data);
  }

  @Delete('webhooks/:id')
  @ApiOperation({ summary: 'Delete webhook' })
  async deleteWebhook(@CurrentOrg() orgId: string, @Param('id') id: string) {
    await this.enterpriseService.deleteWebhook(orgId, id);
    return { success: true };
  }

  @Get('webhooks/outbox')
  @ApiOperation({ summary: 'Get webhook outbox' })
  async getWebhookOutbox(@CurrentOrg() orgId: string, @Query('webhookId') webhookId?: string) {
    return this.enterpriseService.getWebhookOutbox(orgId, webhookId);
  }

  // Integrations
  @Get('integrations')
  @ApiOperation({ summary: 'List integrations' })
  async getIntegrations(@CurrentOrg() orgId: string) {
    return this.enterpriseService.getIntegrations(orgId);
  }

  @Post('integrations')
  @ApiOperation({ summary: 'Create integration' })
  async createIntegration(
    @CurrentOrg() orgId: string,
    @Body() data: { type: string; name: string; config: any }
  ) {
    return this.enterpriseService.createIntegration(orgId, data);
  }

  @Get('integrations/:id')
  @ApiOperation({ summary: 'Get integration' })
  async getIntegration(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.enterpriseService.getIntegration(orgId, id);
  }

  @Put('integrations/:id')
  @ApiOperation({ summary: 'Update integration' })
  async updateIntegration(
    @CurrentOrg() orgId: string,
    @Param('id') id: string,
    @Body() data: { name?: string; config?: any; isActive?: boolean }
  ) {
    return this.enterpriseService.updateIntegration(orgId, id, data);
  }

  @Delete('integrations/:id')
  @ApiOperation({ summary: 'Delete integration' })
  async deleteIntegration(@CurrentOrg() orgId: string, @Param('id') id: string) {
    await this.enterpriseService.deleteIntegration(orgId, id);
    return { success: true };
  }

  // Audit Logs
  @Get('audit-logs')
  @ApiOperation({ summary: 'List audit logs' })
  async getAuditLogs(
    @CurrentOrg() orgId: string,
    @Query('userId') userId?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.enterpriseService.getAuditLogs(orgId, {
      userId,
      entityType,
      entityId,
      action,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Post('audit-logs')
  @ApiOperation({ summary: 'Create audit log' })
  async createAuditLog(
    @CurrentOrg() orgId: string,
    @Body() data: {
      userId?: string;
      action: string;
      entityType: string;
      entityId?: string;
      changes?: any;
      ipAddress?: string;
      userAgent?: string;
    }
  ) {
    return this.enterpriseService.createAuditLog(orgId, data);
  }
}

