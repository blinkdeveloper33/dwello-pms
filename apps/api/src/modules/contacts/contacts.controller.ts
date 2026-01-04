import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';

@ApiTags('contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @ApiOperation({ summary: 'List contacts' })
  async listContacts(
    @Body() body: { orgId: string },
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<any> {
    return this.contactsService.getContacts(
      body.orgId,
      { type, search },
      { page: page ? parseInt(page) : undefined, limit: limit ? parseInt(limit) : undefined }
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contact' })
  async getContact(
    @Param('id') id: string,
    @Body() body: { orgId: string }
  ): Promise<any> {
    return this.contactsService.getContact(body.orgId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create contact' })
  async createContact(
    @Body() body: {
      orgId: string;
      type: string;
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
    }
  ): Promise<any> {
    return this.contactsService.createContact(body.orgId, {
      type: body.type,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update contact' })
  async updateContact(
    @Param('id') id: string,
    @Body() body: {
      orgId: string;
      type?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
    }
  ): Promise<any> {
    return this.contactsService.updateContact(body.orgId, id, {
      type: body.type,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete contact' })
  async deleteContact(
    @Param('id') id: string,
    @Body() body: { orgId: string }
  ): Promise<void> {
    return this.contactsService.deleteContact(body.orgId, id);
  }

  @Post(':id/link')
  @ApiOperation({ summary: 'Link contact to property/unit' })
  async linkContact(
    @Param('id') id: string,
    @Body() body: {
      orgId: string;
      propertyId: string;
      unitId?: string;
      role?: string;
    }
  ): Promise<any> {
    return this.contactsService.linkContactToProperty(
      body.orgId,
      id,
      body.propertyId,
      body.unitId,
      body.role
    );
  }
}

