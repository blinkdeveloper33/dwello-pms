import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'List payments' })
  async listPayments(
    @Body() body: { orgId: string },
    @Query('contactId') contactId?: string,
    @Query('invoiceId') invoiceId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<any> {
    return this.paymentsService.getPayments(
      body.orgId,
      { contactId, invoiceId, status },
      { page: page ? parseInt(page) : undefined, limit: limit ? parseInt(limit) : undefined }
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create payment' })
  async createPayment(
    @Body() body: {
      orgId: string;
      invoiceId?: string;
      chargeId?: string;
      contactId?: string;
      amount: number;
      method: string;
      paymentMethodId?: string;
    }
  ): Promise<any> {
    return this.paymentsService.createPayment(body.orgId, {
      invoiceId: body.invoiceId,
      chargeId: body.chargeId,
      contactId: body.contactId,
      amount: body.amount,
      method: body.method,
      paymentMethodId: body.paymentMethodId,
    });
  }

  @Get(':id/receipt')
  @ApiOperation({ summary: 'Get payment receipt' })
  async getReceipt(
    @Body() body: { orgId: string },
    @Param('id') id: string
  ): Promise<any> {
    return this.paymentsService.getPaymentReceipt(body.orgId, id);
  }
}

