import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { BuildingsService } from './buildings.service';
import { UnitsService } from './units.service';

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly buildingsService: BuildingsService,
    private readonly unitsService: UnitsService
  ) {}

  @Get()
  @ApiOperation({ summary: 'List properties' })
  async listProperties(
    @Body() body: { orgId: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.propertiesService.getProperties(
      body.orgId,
      { page: page ? parseInt(page) : undefined, limit: limit ? parseInt(limit) : undefined }
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create property' })
  async createProperty(@Body() body: { orgId: string; name: string; address: string; city: string; state: string; zip: string; propertyType: string }) {
    return this.propertiesService.createProperty(body.orgId, {
      name: body.name,
      address: body.address,
      city: body.city,
      state: body.state,
      zip: body.zip,
      propertyType: body.propertyType,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property' })
  async getProperty(@Param('id') id: string, @Body() body: { orgId: string }): Promise<any> {
    return this.propertiesService.getProperty(body.orgId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update property' })
  async updateProperty(
    @Param('id') id: string,
    @Body() body: { orgId: string; name?: string; address?: string; city?: string; state?: string; zip?: string; propertyType?: string }
  ): Promise<any> {
    return this.propertiesService.updateProperty(body.orgId, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete property' })
  async deleteProperty(@Param('id') id: string, @Body() body: { orgId: string }): Promise<void> {
    return this.propertiesService.deleteProperty(body.orgId, id);
  }

  // Buildings endpoints
  @Get(':propertyId/buildings')
  @ApiOperation({ summary: 'List buildings' })
  async listBuildings(@Param('propertyId') propertyId: string, @Body() body: { orgId: string }): Promise<any> {
    return this.buildingsService.getBuildings(body.orgId, propertyId);
  }

  @Post(':propertyId/buildings')
  @ApiOperation({ summary: 'Create building' })
  async createBuilding(
    @Param('propertyId') propertyId: string,
    @Body() body: { orgId: string; name: string; address?: string }
  ): Promise<any> {
    return this.buildingsService.createBuilding(body.orgId, propertyId, { name: body.name, address: body.address });
  }

  @Put('buildings/:id')
  @ApiOperation({ summary: 'Update building' })
  async updateBuilding(
    @Param('id') id: string,
    @Body() body: { orgId: string; name?: string; address?: string }
  ): Promise<any> {
    return this.buildingsService.updateBuilding(body.orgId, id, { name: body.name, address: body.address });
  }

  @Delete('buildings/:id')
  @ApiOperation({ summary: 'Delete building' })
  async deleteBuilding(@Param('id') id: string, @Body() body: { orgId: string }): Promise<void> {
    return this.buildingsService.deleteBuilding(body.orgId, id);
  }

  // Units endpoints
  @Get(':propertyId/units')
  @ApiOperation({ summary: 'List units' })
  async listUnits(
    @Param('propertyId') propertyId: string,
    @Body() body: { orgId: string },
    @Param('buildingId') buildingId?: string
  ): Promise<any> {
    return this.unitsService.getUnits(body.orgId, propertyId, buildingId);
  }

  @Post(':propertyId/units')
  @ApiOperation({ summary: 'Create unit' })
  async createUnit(
    @Param('propertyId') propertyId: string,
    @Body() body: {
      orgId: string;
      buildingId?: string;
      unitNumber: string;
      bedrooms?: number;
      bathrooms?: number;
      squareFeet?: number;
    }
  ): Promise<any> {
    return this.unitsService.createUnit(body.orgId, propertyId, {
      buildingId: body.buildingId,
      unitNumber: body.unitNumber,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      squareFeet: body.squareFeet,
    });
  }

  @Put('units/:id')
  @ApiOperation({ summary: 'Update unit' })
  async updateUnit(
    @Param('id') id: string,
    @Body() body: {
      orgId: string;
      buildingId?: string;
      unitNumber?: string;
      bedrooms?: number;
      bathrooms?: number;
      squareFeet?: number;
    }
  ): Promise<any> {
    return this.unitsService.updateUnit(body.orgId, id, {
      buildingId: body.buildingId,
      unitNumber: body.unitNumber,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      squareFeet: body.squareFeet,
    });
  }

  @Delete('units/:id')
  @ApiOperation({ summary: 'Delete unit' })
  async deleteUnit(@Param('id') id: string, @Body() body: { orgId: string }): Promise<void> {
    return this.unitsService.deleteUnit(body.orgId, id);
  }
}

