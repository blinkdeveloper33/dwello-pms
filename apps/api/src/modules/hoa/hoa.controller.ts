import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HoaService } from './hoa.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';

@ApiTags('HOA/Condo')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('hoa')
export class HoaController {
  constructor(private readonly hoaService: HoaService) {}

  // Violations
  @Get('violations')
  @ApiOperation({ summary: 'List violations' })
  async getViolations(
    @CurrentOrg() orgId: string,
    @Query('propertyId') propertyId?: string,
    @Query('unitId') unitId?: string,
    @Query('status') status?: string
  ) {
    return this.hoaService.getViolations(orgId, { propertyId, unitId, status });
  }

  @Post('violations')
  @ApiOperation({ summary: 'Create violation' })
  async createViolation(
    @CurrentOrg() orgId: string,
    @Body() data: { propertyId: string; unitId?: string; contactId?: string; type: string; description: string }
  ) {
    return this.hoaService.createViolation(orgId, data);
  }

  @Get('violations/:id')
  @ApiOperation({ summary: 'Get violation' })
  async getViolation(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.hoaService.getViolation(orgId, id);
  }

  @Put('violations/:id')
  @ApiOperation({ summary: 'Update violation' })
  async updateViolation(
    @CurrentOrg() orgId: string,
    @Param('id') id: string,
    @Body() data: { status?: string; description?: string }
  ) {
    return this.hoaService.updateViolation(orgId, id, data);
  }

  @Post('violations/:id/steps')
  @ApiOperation({ summary: 'Add violation step' })
  async addViolationStep(
    @CurrentOrg() orgId: string,
    @Param('id') id: string,
    @Body() data: { type: string; description: string; amount?: number }
  ) {
    return this.hoaService.addViolationStep(orgId, id, data);
  }

  @Post('violations/:id/fines')
  @ApiOperation({ summary: 'Create fine' })
  async createFine(
    @CurrentOrg() orgId: string,
    @Param('id') id: string,
    @Body() data: { amount: number; description: string; chargeId?: string }
  ) {
    return this.hoaService.createFine(orgId, id, data);
  }

  // Architectural Requests
  @Get('architectural-requests')
  @ApiOperation({ summary: 'List architectural requests' })
  async getArchitecturalRequests(
    @CurrentOrg() orgId: string,
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: string
  ) {
    return this.hoaService.getArchitecturalRequests(orgId, { propertyId, status });
  }

  @Post('architectural-requests')
  @ApiOperation({ summary: 'Create architectural request' })
  async createArchitecturalRequest(
    @CurrentOrg() orgId: string,
    @Body() data: { propertyId: string; unitId?: string; contactId?: string; title: string; description: string }
  ) {
    return this.hoaService.createArchitecturalRequest(orgId, data);
  }

  @Get('architectural-requests/:id')
  @ApiOperation({ summary: 'Get architectural request' })
  async getArchitecturalRequest(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.hoaService.getArchitecturalRequest(orgId, id);
  }

  @Put('architectural-requests/:id')
  @ApiOperation({ summary: 'Update architectural request' })
  async updateArchitecturalRequest(
    @CurrentOrg() orgId: string,
    @Param('id') id: string,
    @Body() data: { status?: string; title?: string; description?: string }
  ) {
    return this.hoaService.updateArchitecturalRequest(orgId, id, data);
  }

  @Post('architectural-requests/:id/approvals')
  @ApiOperation({ summary: 'Add architectural approval' })
  async addArchitecturalApproval(
    @CurrentOrg() orgId: string,
    @Param('id') id: string,
    @Body() data: { membershipId: string; decision: string; comments?: string }
  ) {
    return this.hoaService.addArchitecturalApproval(orgId, id, data.membershipId, data);
  }

  // Amenities
  @Get('amenities')
  @ApiOperation({ summary: 'List amenities' })
  async getAmenities(@CurrentOrg() orgId: string, @Query('propertyId') propertyId?: string) {
    return this.hoaService.getAmenities(orgId, propertyId);
  }

  @Post('amenities')
  @ApiOperation({ summary: 'Create amenity' })
  async createAmenity(
    @CurrentOrg() orgId: string,
    @Body() data: { propertyId: string; name: string; description?: string; rules?: any }
  ) {
    return this.hoaService.createAmenity(orgId, data);
  }

  @Get('amenities/:id')
  @ApiOperation({ summary: 'Get amenity' })
  async getAmenity(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.hoaService.getAmenity(orgId, id);
  }

  @Put('amenities/:id')
  @ApiOperation({ summary: 'Update amenity' })
  async updateAmenity(
    @CurrentOrg() orgId: string,
    @Param('id') id: string,
    @Body() data: { name?: string; description?: string; rules?: any }
  ) {
    return this.hoaService.updateAmenity(orgId, id, data);
  }

  // Reservations
  @Get('reservations')
  @ApiOperation({ summary: 'List reservations' })
  async getReservations(
    @CurrentOrg() orgId: string,
    @Query('amenityId') amenityId?: string,
    @Query('contactId') contactId?: string,
    @Query('status') status?: string
  ) {
    return this.hoaService.getReservations(orgId, { amenityId, contactId, status });
  }

  @Post('reservations')
  @ApiOperation({ summary: 'Create reservation' })
  async createReservation(
    @CurrentOrg() orgId: string,
    @Body() data: { amenityId: string; contactId?: string; startTime: Date; endTime: Date }
  ) {
    return this.hoaService.createReservation(orgId, data);
  }

  @Put('reservations/:id')
  @ApiOperation({ summary: 'Update reservation' })
  async updateReservation(
    @CurrentOrg() orgId: string,
    @Param('id') id: string,
    @Body() data: { status?: string; startTime?: Date; endTime?: Date }
  ) {
    return this.hoaService.updateReservation(orgId, id, data);
  }
}

