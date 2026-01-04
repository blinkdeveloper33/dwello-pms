import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommunicationsService } from './communications.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';

@ApiTags('Communications')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('communications')
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  @Get('templates')
  @ApiOperation({ summary: 'List templates' })
  async getTemplates(@CurrentOrg() orgId: string) {
    return this.communicationsService.getTemplates(orgId);
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create template' })
  async createTemplate(
    @CurrentOrg() orgId: string,
    @Body() data: { name: string; type: string; subject?: string; body: string; variables?: any }
  ) {
    return this.communicationsService.createTemplate(orgId, data);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get template' })
  async getTemplate(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.communicationsService.getTemplate(orgId, id);
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'Update template' })
  async updateTemplate(
    @CurrentOrg() orgId: string,
    @Param('id') id: string,
    @Body() data: { name?: string; subject?: string; body?: string; variables?: any }
  ) {
    return this.communicationsService.updateTemplate(orgId, id, data);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete template' })
  async deleteTemplate(@CurrentOrg() orgId: string, @Param('id') id: string) {
    await this.communicationsService.deleteTemplate(orgId, id);
    return { success: true };
  }

  @Get()
  @ApiOperation({ summary: 'List communications' })
  async getCommunications(
    @CurrentOrg() orgId: string,
    @Query('propertyId') propertyId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.communicationsService.getCommunications(
      orgId,
      { propertyId, type, status },
      { page: page ? parseInt(page) : undefined, limit: limit ? parseInt(limit) : undefined }
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create communication' })
  async createCommunication(
    @CurrentOrg() orgId: string,
    @Body() data: {
      propertyId?: string;
      templateId?: string;
      type: string;
      subject?: string;
      body: string;
      scheduledAt?: Date;
      contactIds?: string[];
    }
  ) {
    return this.communicationsService.createCommunication(orgId, data);
  }

  @Get('inbox')
  @ApiOperation({ summary: 'Get unified inbox' })
  async getUnifiedInbox(
    @CurrentOrg() orgId: string,
    @Query('type') type?: string,
    @Query('status') status?: string
  ) {
    return this.communicationsService.getUnifiedInbox(orgId, { type, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get communication' })
  async getCommunication(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.communicationsService.getCommunication(orgId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update communication' })
  async updateCommunication(
    @CurrentOrg() orgId: string,
    @Param('id') id: string,
    @Body() data: { subject?: string; body?: string; status?: string; scheduledAt?: Date }
  ) {
    return this.communicationsService.updateCommunication(orgId, id, data);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send communication' })
  async sendCommunication(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.communicationsService.sendCommunication(orgId, id);
  }
}

