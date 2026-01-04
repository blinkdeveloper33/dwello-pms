import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'List documents' })
  async listDocuments(
    @Body() body: { orgId: string },
    @Query('propertyId') propertyId?: string,
    @Query('mimeType') mimeType?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<any> {
    return this.documentsService.getDocuments(
      body.orgId,
      { propertyId, mimeType },
      { page: page ? parseInt(page) : undefined, limit: limit ? parseInt(limit) : undefined }
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document' })
  async getDocument(
    @Param('id') id: string,
    @Body() body: { orgId: string }
  ): Promise<any> {
    return this.documentsService.getDocument(body.orgId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create document' })
  async createDocument(
    @Body() body: {
      orgId: string;
      propertyId?: string;
      folderId?: string;
      name: string;
      fileName: string;
      fileUrl: string;
      fileSize: number;
      mimeType: string;
      uploadedBy?: string;
      permissions?: string[];
    }
  ): Promise<any> {
    return this.documentsService.createDocument(body.orgId, {
      propertyId: body.propertyId,
      folderId: body.folderId,
      name: body.name,
      fileName: body.fileName,
      fileUrl: body.fileUrl,
      fileSize: body.fileSize,
      mimeType: body.mimeType,
      uploadedBy: body.uploadedBy,
      permissions: body.permissions,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update document' })
  async updateDocument(
    @Param('id') id: string,
    @Body() body: {
      orgId: string;
      name?: string;
      permissions?: string[];
    }
  ): Promise<any> {
    return this.documentsService.updateDocument(body.orgId, id, {
      name: body.name,
      permissions: body.permissions,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  async deleteDocument(
    @Param('id') id: string,
    @Body() body: { orgId: string }
  ): Promise<void> {
    return this.documentsService.deleteDocument(body.orgId, id);
  }
}

