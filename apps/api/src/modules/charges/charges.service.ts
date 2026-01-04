import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@loomi/shared';

@Injectable()
export class ChargesService {
  async getCharges(
    orgId: string,
    filters?: { propertyId?: string; unitId?: string; contactId?: string; status?: string },
    pagination?: { page?: number; limit?: number }
  ): Promise<{ data: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const where: any = { orgId };

    if (filters?.propertyId) where.propertyId = filters.propertyId;
    if (filters?.unitId) where.unitId = filters.unitId;
    if (filters?.contactId) where.contactId = filters.contactId;
    if (filters?.status) where.status = filters.status;

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.charge.findMany({
        where,
        include: {
          property: { select: { id: true, name: true } },
          unit: { select: { id: true, unitNumber: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { dueDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.charge.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createCharge(orgId: string, data: {
    propertyId: string;
    unitId?: string;
    contactId?: string;
    leaseId?: string;
    type: string;
    description: string;
    amount: number;
    dueDate: Date;
    isRecurring?: boolean;
    recurringSchedule?: {
      frequency: 'monthly' | 'quarterly' | 'yearly';
      dayOfMonth?: number;
      endDate?: Date;
      occurrences?: number;
    };
  }): Promise<any> {
    return prisma.charge.create({
      data: {
        orgId,
        propertyId: data.propertyId,
        unitId: data.unitId,
        contactId: data.contactId,
        leaseId: data.leaseId,
        type: data.type,
        description: data.description,
        amount: data.amount,
        dueDate: data.dueDate,
        isRecurring: data.isRecurring || false,
        recurringSchedule: data.recurringSchedule || null,
      },
      include: {
        property: true,
        unit: true,
        contact: true,
        lease: true,
      },
    });
  }

  async createRecurringCharges(orgId: string, chargeId: string): Promise<any[]> {
    const template = await prisma.charge.findFirst({
      where: { id: chargeId, orgId, isRecurring: true },
    });

    if (!template || !template.recurringSchedule) {
      throw new Error('Recurring charge template not found');
    }

    const schedule = template.recurringSchedule as any;
    const charges: any[] = [];
    const startDate = new Date(template.dueDate);
    let currentDate = new Date(startDate);
    const endDate = schedule.endDate ? new Date(schedule.endDate) : null;
    let count = 0;
    const maxOccurrences = schedule.occurrences || 12;

    while ((!endDate || currentDate <= endDate) && count < maxOccurrences) {
      if (count > 0) {
        // Calculate next due date based on frequency
        if (schedule.frequency === 'monthly') {
          currentDate = new Date(currentDate);
          currentDate.setMonth(currentDate.getMonth() + 1);
          if (schedule.dayOfMonth) {
            currentDate.setDate(schedule.dayOfMonth);
          }
        } else if (schedule.frequency === 'quarterly') {
          currentDate = new Date(currentDate);
          currentDate.setMonth(currentDate.getMonth() + 3);
        } else if (schedule.frequency === 'yearly') {
          currentDate = new Date(currentDate);
          currentDate.setFullYear(currentDate.getFullYear() + 1);
        }
      }

      if (endDate && currentDate > endDate) break;

      const charge = await prisma.charge.create({
        data: {
          orgId,
          propertyId: template.propertyId,
          unitId: template.unitId,
          contactId: template.contactId,
          leaseId: template.leaseId,
          type: template.type,
          description: template.description,
          amount: template.amount,
          dueDate: currentDate,
          isRecurring: false, // Individual instances are not recurring
          recurringSchedule: null,
        },
        include: {
          property: true,
          unit: true,
          contact: true,
        },
      });

      charges.push(charge);
      count++;
    }

    return charges;
  }

  async getResidentBalance(orgId: string, contactId: string): Promise<{
    totalDue: number;
    overdue: number;
    pending: number;
    charges: any[];
  }> {
    const charges = await prisma.charge.findMany({
      where: {
        orgId,
        contactId,
        status: { in: ['pending', 'overdue'] },
      },
      include: {
        property: { select: { id: true, name: true } },
        unit: { select: { id: true, unitNumber: true } },
        payments: {
          select: { id: true, amount: true, status: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    const totalDue = charges.reduce((sum, charge) => {
      const paid = charge.payments
        .filter((p: any) => p.status === 'completed')
        .reduce((s: number, p: any) => s + Number(p.amount), 0);
      return sum + (Number(charge.amount) - paid);
    }, 0);

    const overdue = charges
      .filter((c) => c.status === 'overdue' || new Date(c.dueDate) < new Date())
      .reduce((sum, charge) => {
        const paid = charge.payments
          .filter((p: any) => p.status === 'completed')
          .reduce((s: number, p: any) => s + Number(p.amount), 0);
        return sum + (Number(charge.amount) - paid);
      }, 0);

    return {
      totalDue,
      overdue,
      pending: totalDue - overdue,
      charges,
    };
  }

  async updateCharge(orgId: string, chargeId: string, data: {
    description?: string;
    amount?: number;
    dueDate?: Date;
    status?: string;
  }): Promise<any> {
    const charge = await prisma.charge.findFirst({
      where: { id: chargeId, orgId },
    });

    if (!charge) {
      throw new NotFoundException('Charge not found');
    }

    return prisma.charge.update({
      where: { id: chargeId },
      data,
    });
  }
}

