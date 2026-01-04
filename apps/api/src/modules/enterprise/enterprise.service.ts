import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@loomi/shared';
import * as crypto from 'crypto';

@Injectable()
export class EnterpriseService {
  // API Keys
  async getApiKeys(orgId: string): Promise<any[]> {
    return prisma.apiKey.findMany({
      where: { orgId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createApiKey(orgId: string, data: {
    name: string;
    rateLimit?: number;
  }): Promise<{ apiKey: any; key: string }> {
    // Generate API key
    const key = `loomi_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');

    const apiKey = await prisma.apiKey.create({
      data: {
        org: { connect: { id: orgId } },
        name: data.name,
        keyHash,
        rateLimit: data.rateLimit || 60,
      },
    });

    return { apiKey, key }; // Return key only once
  }

  async getApiKey(orgId: string, apiKeyId: string): Promise<any> {
    const apiKey = await prisma.apiKey.findFirst({
      where: { id: apiKeyId, orgId, deletedAt: null },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    return apiKey;
  }

  async updateApiKey(orgId: string, apiKeyId: string, data: {
    name?: string;
    rateLimit?: number;
  }): Promise<any> {
    const apiKey = await prisma.apiKey.findFirst({
      where: { id: apiKeyId, orgId, deletedAt: null },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    return prisma.apiKey.update({
      where: { id: apiKeyId },
      data,
    });
  }

  async deleteApiKey(orgId: string, apiKeyId: string): Promise<void> {
    const apiKey = await prisma.apiKey.findFirst({
      where: { id: apiKeyId, orgId, deletedAt: null },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: { deletedAt: new Date() },
    });
  }

  // Webhooks
  async getWebhooks(orgId: string): Promise<any[]> {
    return prisma.webhook.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createWebhook(orgId: string, data: {
    url: string;
    events: string[];
  }): Promise<{ webhook: any; secret: string }> {
    // Generate webhook secret
    const secret = crypto.randomBytes(32).toString('hex');

    const webhook = await prisma.webhook.create({
      data: {
        org: { connect: { id: orgId } },
        url: data.url,
        events: data.events,
        secret,
        isActive: true,
      },
    });

    return { webhook, secret }; // Return secret only once
  }

  async getWebhook(orgId: string, webhookId: string): Promise<any> {
    const webhook = await prisma.webhook.findFirst({
      where: { id: webhookId, orgId },
      include: {
        outbox: {
          where: { status: { in: ['pending', 'failed'] } },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return webhook;
  }

  async updateWebhook(orgId: string, webhookId: string, data: {
    url?: string;
    events?: string[];
    isActive?: boolean;
  }): Promise<any> {
    const webhook = await prisma.webhook.findFirst({
      where: { id: webhookId, orgId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return prisma.webhook.update({
      where: { id: webhookId },
      data,
    });
  }

  async deleteWebhook(orgId: string, webhookId: string): Promise<void> {
    const webhook = await prisma.webhook.findFirst({
      where: { id: webhookId, orgId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    await prisma.webhook.delete({
      where: { id: webhookId },
    });
  }

  async getWebhookOutbox(orgId: string, webhookId?: string): Promise<any[]> {
    const where: any = { webhook: { orgId } };

    if (webhookId) where.webhookId = webhookId;

    return prisma.webhookOutbox.findMany({
      where,
      include: {
        webhook: { select: { id: true, url: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  // Integrations
  async getIntegrations(orgId: string): Promise<any[]> {
    return prisma.integration.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createIntegration(orgId: string, data: {
    type: string;
    name: string;
    config: any;
  }): Promise<any> {
    // In production, config should be encrypted
    return prisma.integration.create({
      data: {
        org: { connect: { id: orgId } },
        type: data.type,
        name: data.name,
        config: data.config,
        isActive: true,
      },
    });
  }

  async getIntegration(orgId: string, integrationId: string): Promise<any> {
    const integration = await prisma.integration.findFirst({
      where: { id: integrationId, orgId },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    return integration;
  }

  async updateIntegration(orgId: string, integrationId: string, data: {
    name?: string;
    config?: any;
    isActive?: boolean;
  }): Promise<any> {
    const integration = await prisma.integration.findFirst({
      where: { id: integrationId, orgId },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    return prisma.integration.update({
      where: { id: integrationId },
      data,
    });
  }

  async deleteIntegration(orgId: string, integrationId: string): Promise<void> {
    const integration = await prisma.integration.findFirst({
      where: { id: integrationId, orgId },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    await prisma.integration.delete({
      where: { id: integrationId },
    });
  }

  // Audit Logs
  async getAuditLogs(
    orgId: string,
    filters?: {
      userId?: string;
      entityType?: string;
      entityId?: string;
      action?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<any[]> {
    const where: any = { orgId };

    if (filters?.userId) where.userId = filters.userId;
    if (filters?.entityType) where.entityType = filters.entityType;
    if (filters?.entityId) where.entityId = filters.entityId;
    if (filters?.action) where.action = filters.action;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    return prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  async createAuditLog(orgId: string, data: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<any> {
    return prisma.auditLog.create({
      data: {
        org: { connect: { id: orgId } },
        user: data.userId ? { connect: { id: data.userId } } : undefined,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        changes: data.changes || {},
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }
}

