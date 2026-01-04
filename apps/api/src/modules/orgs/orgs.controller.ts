import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrgsService } from './orgs.service';

@ApiTags('orgs')
@Controller('orgs')
export class OrgsController {
  constructor(private readonly orgsService: OrgsService) {}

  @Post()
  @ApiOperation({ summary: 'Create organization' })
  async createOrg(@Body() body: { userId: string; name: string; slug: string; planId?: string }) {
    return this.orgsService.createOrg(body.userId, body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization' })
  async getOrg(@Param('id') id: string): Promise<any> {
    return this.orgsService.getOrg(id);
  }
}

