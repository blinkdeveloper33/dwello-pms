import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WorkOrdersService } from './work-orders.service';

@ApiTags('work-orders')
@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List work orders' })
  async listWorkOrders(
    @Body() body: { orgId: string },
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<any> {
    return this.workOrdersService.getWorkOrders(
      body.orgId,
      { propertyId, status },
      { page: page ? parseInt(page) : undefined, limit: limit ? parseInt(limit) : undefined }
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create work order' })
  async createWorkOrder(
    @Body() body: {
      orgId: string;
      propertyId: string;
      unitId?: string;
      contactId?: string;
      vendorId?: string;
      title: string;
      description?: string;
      priority: string;
      status?: string;
    }
  ): Promise<any> {
    return this.workOrdersService.createWorkOrder(body.orgId, {
      propertyId: body.propertyId,
      unitId: body.unitId,
      contactId: body.contactId,
      vendorId: body.vendorId,
      title: body.title,
      description: body.description,
      priority: body.priority,
      status: body.status,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update work order' })
  async updateWorkOrder(
    @Param('id') id: string,
    @Body() body: {
      orgId: string;
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      vendorId?: string;
    }
  ): Promise<any> {
    return this.workOrdersService.updateWorkOrder(body.orgId, id, {
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      vendorId: body.vendorId,
    });
  }
}

