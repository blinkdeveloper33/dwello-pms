import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AccountingService } from './accounting.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';

@ApiTags('Accounting')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  // Chart of Accounts
  @Get('accounts')
  @ApiOperation({ summary: 'List chart of accounts' })
  async getChartOfAccounts(@CurrentOrg() orgId: string) {
    return this.accountingService.getChartOfAccounts(orgId);
  }

  @Post('accounts')
  @ApiOperation({ summary: 'Create account' })
  async createAccount(
    @CurrentOrg() orgId: string,
    @Body() data: { code: string; name: string; type: string; parentId?: string }
  ) {
    return this.accountingService.createAccount(orgId, data);
  }

  @Put('accounts/:id')
  @ApiOperation({ summary: 'Update account' })
  async updateAccount(
    @CurrentOrg() orgId: string,
    @Param('id') id: string,
    @Body() data: { name?: string; type?: string }
  ) {
    return this.accountingService.updateAccount(orgId, id, data);
  }

  // Journals
  @Get('journals')
  @ApiOperation({ summary: 'List journals' })
  async getJournals(@CurrentOrg() orgId: string, @Query('status') status?: string) {
    return this.accountingService.getJournals(orgId, { status });
  }

  @Post('journals')
  @ApiOperation({ summary: 'Create journal' })
  async createJournal(
    @CurrentOrg() orgId: string,
    @Body() data: {
      number: string;
      date: Date;
      description?: string;
      lines: Array<{ accountId: string; debit?: number; credit?: number; description?: string }>;
    }
  ) {
    return this.accountingService.createJournal(orgId, data);
  }

  @Get('journals/:id')
  @ApiOperation({ summary: 'Get journal' })
  async getJournal(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.accountingService.getJournal(orgId, id);
  }

  @Post('journals/:id/post')
  @ApiOperation({ summary: 'Post journal' })
  async postJournal(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.accountingService.postJournal(orgId, id);
  }

  // AP Bills
  @Get('ap-bills')
  @ApiOperation({ summary: 'List AP bills' })
  async getApBills(
    @CurrentOrg() orgId: string,
    @Query('vendorId') vendorId?: string,
    @Query('status') status?: string
  ) {
    return this.accountingService.getApBills(orgId, { vendorId, status });
  }

  @Post('ap-bills')
  @ApiOperation({ summary: 'Create AP bill' })
  async createApBill(
    @CurrentOrg() orgId: string,
    @Body() data: { vendorId?: string; invoiceNumber: string; amount: number; dueDate: Date }
  ) {
    return this.accountingService.createApBill(orgId, data);
  }

  @Get('ap-bills/:id')
  @ApiOperation({ summary: 'Get AP bill' })
  async getApBill(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.accountingService.getApBill(orgId, id);
  }

  @Put('ap-bills/:id')
  @ApiOperation({ summary: 'Update AP bill' })
  async updateApBill(
    @CurrentOrg() orgId: string,
    @Param('id') id: string,
    @Body() data: { status?: string; approvedBy?: string }
  ) {
    return this.accountingService.updateApBill(orgId, id, data);
  }

  // Bank Accounts
  @Get('bank-accounts')
  @ApiOperation({ summary: 'List bank accounts' })
  async getBankAccounts(@CurrentOrg() orgId: string) {
    return this.accountingService.getBankAccounts(orgId);
  }

  @Post('bank-accounts')
  @ApiOperation({ summary: 'Create bank account' })
  async createBankAccount(
    @CurrentOrg() orgId: string,
    @Body() data: { name: string; accountNumber: string; routingNumber?: string; type: string }
  ) {
    return this.accountingService.createBankAccount(orgId, data);
  }

  @Get('bank-accounts/:id')
  @ApiOperation({ summary: 'Get bank account' })
  async getBankAccount(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.accountingService.getBankAccount(orgId, id);
  }

  @Post('bank-accounts/:id/transactions')
  @ApiOperation({ summary: 'Import bank transactions' })
  async importBankTransactions(
    @CurrentOrg() orgId: string,
    @Param('id') id: string,
    @Body() transactions: Array<{ date: Date; description: string; amount: number; balance?: number; reference?: string }>
  ) {
    return this.accountingService.importBankTransactions(orgId, id, transactions);
  }

  // Reconciliations
  @Get('reconciliations')
  @ApiOperation({ summary: 'List reconciliations' })
  async getReconciliations(@CurrentOrg() orgId: string, @Query('bankAccountId') bankAccountId?: string) {
    return this.accountingService.getReconciliations(orgId, bankAccountId);
  }

  @Post('reconciliations')
  @ApiOperation({ summary: 'Create reconciliation' })
  async createReconciliation(
    @CurrentOrg() orgId: string,
    @Body() data: { bankAccountId: string; statementDate: Date; statementBalance: number }
  ) {
    return this.accountingService.createReconciliation(orgId, data);
  }

  @Get('reconciliations/:id')
  @ApiOperation({ summary: 'Get reconciliation' })
  async getReconciliation(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.accountingService.getReconciliation(orgId, id);
  }

  @Post('reconciliations/:id/lines')
  @ApiOperation({ summary: 'Add reconciliation line' })
  async addReconciliationLine(
    @CurrentOrg() orgId: string,
    @Param('id') id: string,
    @Body() data: { bankTransactionId?: string; journalLineId?: string; amount: number; description: string }
  ) {
    return this.accountingService.addReconciliationLine(orgId, id, data);
  }

  @Post('reconciliations/:id/complete')
  @ApiOperation({ summary: 'Complete reconciliation' })
  async completeReconciliation(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.accountingService.completeReconciliation(orgId, id);
  }

  // Owner Statements
  @Get('owner-statements')
  @ApiOperation({ summary: 'List owner statements' })
  async getOwnerStatements(
    @CurrentOrg() orgId: string,
    @Query('contactId') contactId?: string,
    @Query('propertyId') propertyId?: string
  ) {
    return this.accountingService.getOwnerStatements(orgId, { contactId, propertyId });
  }

  @Post('owner-statements')
  @ApiOperation({ summary: 'Create owner statement' })
  async createOwnerStatement(
    @CurrentOrg() orgId: string,
    @Body() data: {
      contactId: string;
      propertyId?: string;
      periodStart: Date;
      periodEnd: Date;
      totalIncome: number;
      totalExpenses: number;
      netAmount: number;
    }
  ) {
    return this.accountingService.createOwnerStatement(orgId, data);
  }

  @Get('owner-statements/:id')
  @ApiOperation({ summary: 'Get owner statement' })
  async getOwnerStatement(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.accountingService.getOwnerStatement(orgId, id);
  }

  // Payout Batches
  @Get('payout-batches')
  @ApiOperation({ summary: 'List payout batches' })
  async getPayoutBatches(@CurrentOrg() orgId: string) {
    return this.accountingService.getPayoutBatches(orgId);
  }

  @Post('payout-batches')
  @ApiOperation({ summary: 'Create payout batch' })
  async createPayoutBatch(
    @CurrentOrg() orgId: string,
    @Body() data: { name: string; statementIds: string[] }
  ) {
    return this.accountingService.createPayoutBatch(orgId, data);
  }
}

