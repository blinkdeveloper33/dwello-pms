import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@loomi/shared';

@Injectable()
export class PaymentsService {
  async getPayments(
    orgId: string,
    filters?: { contactId?: string; invoiceId?: string; status?: string },
    pagination?: { page?: number; limit?: number }
  ): Promise<{ data: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const where: any = { orgId };

    if (filters?.contactId) where.contactId = filters.contactId;
    if (filters?.invoiceId) where.invoiceId = filters.invoiceId;
    if (filters?.status) where.status = filters.status;

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          contact: { select: { id: true, firstName: true, lastName: true } },
          invoice: { select: { id: true, number: true } },
          charge: { select: { id: true, description: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createPayment(orgId: string, data: {
    invoiceId?: string;
    chargeId?: string;
    contactId?: string;
    amount: number;
    method: string;
    paymentMethodId?: string;
  }): Promise<any> {
    // Use transaction for financial operations
    return await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          orgId,
          invoiceId: data.invoiceId,
          chargeId: data.chargeId,
          contactId: data.contactId,
          amount: data.amount,
          method: data.method,
          paymentMethodId: data.paymentMethodId,
          status: 'completed',
          processedAt: new Date(),
        },
        include: {
          contact: true,
          invoice: true,
          charge: true,
        },
      });

      // Update charge status if fully paid
      if (data.chargeId) {
        const charge = await tx.charge.findUnique({
          where: { id: data.chargeId },
          include: { payments: true },
        });

        if (charge) {
          const totalPaid = charge.payments
            .filter((p) => p.status === 'completed')
            .reduce((sum, p) => sum + Number(p.amount), 0);

          if (totalPaid >= Number(charge.amount)) {
            await tx.charge.update({
              where: { id: data.chargeId },
              data: { status: 'paid' },
            });
          }
        }
      }

      // Create receipt
      const receipt = await tx.receipt.create({
        data: {
          paymentId: payment.id,
          pdfUrl: `/api/payments/${payment.id}/receipt.pdf`, // Stub - would generate actual PDF
        },
      });

      return { ...payment, receipt };
    });
  }

  async getPaymentReceipt(orgId: string, paymentId: string): Promise<any> {
    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, orgId },
      include: {
        contact: true,
        charge: {
          include: {
            property: true,
            unit: true,
          },
        },
        receipt: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
}

