import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChargesService } from './charges.service';

@ApiTags('charges')
@Controller('charges')
export class ChargesController {
  constructor(private readonly chargesService: ChargesService) {}

  @Get()
  @ApiOperation({ summary: 'List charges' })
  async listCharges(
    @Body() body: { orgId: string },
    @Query('propertyId') propertyId?: string,
    @Query('unitId') unitId?: string,
    @Query('contactId') contactId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<any> {
    return this.chargesService.getCharges(
      body.orgId,
      { propertyId, unitId, contactId, status },
      { page: page ? parseInt(page) : undefined, limit: limit ? parseInt(limit) : undefined }
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create charge' })
  async createCharge(
    @Body() body: {
      orgId: string;
      propertyId: string;
      unitId?: string;
      contactId?: string;
      leaseId?: string;
      type: string;
      description: string;
      amount: number;
      dueDate: string;
      isRecurring?: boolean;
      recurringSchedule?: {
        frequency: 'monthly' | 'quarterly' | 'yearly';
        dayOfMonth?: number;
        endDate?: string;
        occurrences?: number;
      };
    }
  ): Promise<any> {
    return this.chargesService.createCharge(body.orgId, {
      propertyId: body.propertyId,
      unitId: body.unitId,
      contactId: body.contactId,
      leaseId: body.leaseId,
      type: body.type,
      description: body.description,
      amount: body.amount,
      dueDate: new Date(body.dueDate),
      isRecurring: body.isRecurring,
      recurringSchedule: body.recurringSchedule ? {
        ...body.recurringSchedule,
        endDate: body.recurringSchedule.endDate ? new Date(body.recurringSchedule.endDate) : undefined,
      } : undefined,
    });
  }

  @Post(':id/generate-recurring')
  @ApiOperation({ summary: 'Generate recurring charges from template' })
  async generateRecurringCharges(
    @Body() body: { orgId: string },
    @Param('id') id: string
  ): Promise<any> {
    return this.chargesService.createRecurringCharges(body.orgId, id);
  }

  @Get('resident/:contactId/balance')
  @ApiOperation({ summary: 'Get resident balance' })
  async getResidentBalance(
    @Body() body: { orgId: string },
    @Param('contactId') contactId: string
  ): Promise<any> {
    return this.chargesService.getResidentBalance(body.orgId, contactId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update charge' })
  async updateCharge(
    @Param('id') id: string,
    @Body() body: {
      orgId: string;
      description?: string;
      amount?: number;
      dueDate?: string;
      status?: string;
    }
  ): Promise<any> {
    return this.chargesService.updateCharge(body.orgId, id, {
      description: body.description,
      amount: body.amount,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      status: body.status,
    });
  }
}

