import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma } from '@loomi/shared';

@Injectable()
export class AccountingService {
  // Chart of Accounts
  async getChartOfAccounts(orgId: string): Promise<any[]> {
    return prisma.chartOfAccount.findMany({
      where: { orgId },
      include: {
        parent: true,
        children: true,
      },
      orderBy: { code: 'asc' },
    });
  }

  async createAccount(orgId: string, data: {
    code: string;
    name: string;
    type: string;
    parentId?: string;
  }): Promise<any> {
    // Check if code already exists
    const existing = await prisma.chartOfAccount.findFirst({
      where: { orgId, code: data.code },
    });

    if (existing) {
      throw new BadRequestException('Account code already exists');
    }

    return prisma.chartOfAccount.create({
      data: {
        orgId,
        parentId: data.parentId,
        code: data.code,
        name: data.name,
        type: data.type,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async updateAccount(orgId: string, accountId: string, data: {
    name?: string;
    type?: string;
  }): Promise<any> {
    const account = await prisma.chartOfAccount.findFirst({
      where: { id: accountId, orgId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return prisma.chartOfAccount.update({
      where: { id: accountId },
      data,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  // Journals
  async getJournals(orgId: string, filters?: { status?: string }): Promise<any[]> {
    const where: any = { orgId };

    if (filters?.status) where.status = filters.status;

    return prisma.journal.findMany({
      where,
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async createJournal(orgId: string, data: {
    number: string;
    date: Date;
    description?: string;
    lines: Array<{
      accountId: string;
      debit?: number;
      credit?: number;
      description?: string;
    }>;
  }): Promise<any> {
    // Validate double-entry accounting
    const totalDebits = data.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredits = data.lines.reduce((sum, line) => sum + (line.credit || 0), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new BadRequestException('Debits and credits must balance');
    }

    return prisma.journal.create({
      data: {
        org: { connect: { id: orgId } },
        number: data.number,
        date: data.date,
        description: data.description,
        status: 'draft',
        lines: {
          create: data.lines.map(line => ({
            account: { connect: { id: line.accountId } },
            debit: line.debit || null,
            credit: line.credit || null,
            description: line.description,
          })),
        },
      },
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
    });
  }

  async getJournal(orgId: string, journalId: string): Promise<any> {
    const journal = await prisma.journal.findFirst({
      where: { id: journalId, orgId },
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
    });

    if (!journal) {
      throw new NotFoundException('Journal not found');
    }

    return journal;
  }

  async postJournal(orgId: string, journalId: string): Promise<any> {
    const journal = await prisma.journal.findFirst({
      where: { id: journalId, orgId },
    });

    if (!journal) {
      throw new NotFoundException('Journal not found');
    }

    if (journal.status === 'posted') {
      throw new BadRequestException('Journal already posted');
    }

    return prisma.journal.update({
      where: { id: journalId },
      data: { status: 'posted' },
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
    });
  }

  // AP Bills
  async getApBills(orgId: string, filters?: { vendorId?: string; status?: string }): Promise<any[]> {
    const where: any = { orgId };

    if (filters?.vendorId) where.vendorId = filters.vendorId;
    if (filters?.status) where.status = filters.status;

    return prisma.apBill.findMany({
      where,
      include: {
        vendor: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async createApBill(orgId: string, data: {
    vendorId?: string;
    invoiceNumber: string;
    amount: number;
    dueDate: Date;
  }): Promise<any> {
    return prisma.apBill.create({
      data: {
        org: { connect: { id: orgId } },
        vendor: data.vendorId ? { connect: { id: data.vendorId } } : undefined,
        invoiceNumber: data.invoiceNumber,
        amount: data.amount,
        dueDate: data.dueDate,
        status: 'pending',
      },
      include: {
        vendor: true,
      },
    });
  }

  async getApBill(orgId: string, billId: string): Promise<any> {
    const bill = await prisma.apBill.findFirst({
      where: { id: billId, orgId },
      include: {
        vendor: true,
      },
    });

    if (!bill) {
      throw new NotFoundException('AP Bill not found');
    }

    return bill;
  }

  async updateApBill(orgId: string, billId: string, data: {
    status?: string;
    approvedBy?: string;
  }): Promise<any> {
    const bill = await prisma.apBill.findFirst({
      where: { id: billId, orgId },
    });

    if (!bill) {
      throw new NotFoundException('AP Bill not found');
    }

    return prisma.apBill.update({
      where: { id: billId },
      data: {
        ...data,
        approvedAt: data.status === 'approved' ? new Date() : undefined,
      },
      include: {
        vendor: true,
      },
    });
  }

  // Bank Accounts
  async getBankAccounts(orgId: string): Promise<any[]> {
    return prisma.bankAccount.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createBankAccount(orgId: string, data: {
    name: string;
    accountNumber: string;
    routingNumber?: string;
    type: string;
  }): Promise<any> {
    return prisma.bankAccount.create({
      data: {
        org: { connect: { id: orgId } },
        name: data.name,
        accountNumber: data.accountNumber,
        routingNumber: data.routingNumber,
        type: data.type,
        isActive: true,
      },
    });
  }

  async getBankAccount(orgId: string, accountId: string): Promise<any> {
    const account = await prisma.bankAccount.findFirst({
      where: { id: accountId, orgId },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
          take: 100,
        },
      },
    });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    return account;
  }

  async importBankTransactions(orgId: string, accountId: string, transactions: Array<{
    date: Date;
    description: string;
    amount: number;
    balance?: number;
    reference?: string;
  }>): Promise<any> {
    const account = await prisma.bankAccount.findFirst({
      where: { id: accountId, orgId },
    });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    await prisma.bankTransaction.createMany({
      data: transactions.map(t => ({
        bankAccountId: accountId,
        date: t.date,
        description: t.description,
        amount: t.amount,
        balance: t.balance || null,
        reference: t.reference,
      })),
    });

    return this.getBankAccount(orgId, accountId);
  }

  // Reconciliations
  async getReconciliations(orgId: string, bankAccountId?: string): Promise<any[]> {
    const where: any = { orgId };

    if (bankAccountId) where.bankAccountId = bankAccountId;

    return prisma.reconciliation.findMany({
      where,
      include: {
        bankAccount: true,
        lines: {
          include: {
            bankTransaction: true,
            journalLine: {
              include: {
                account: true,
              },
            },
          },
        },
      },
      orderBy: { statementDate: 'desc' },
    });
  }

  async createReconciliation(orgId: string, data: {
    bankAccountId: string;
    statementDate: Date;
    statementBalance: number;
  }): Promise<any> {
    const account = await prisma.bankAccount.findFirst({
      where: { id: data.bankAccountId, orgId },
    });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    return prisma.reconciliation.create({
      data: {
        org: { connect: { id: orgId } },
        bankAccount: { connect: { id: data.bankAccountId } },
        statementDate: data.statementDate,
        statementBalance: data.statementBalance,
        status: 'draft',
      },
      include: {
        bankAccount: true,
        lines: true,
      },
    });
  }

  async getReconciliation(orgId: string, reconciliationId: string): Promise<any> {
    const reconciliation = await prisma.reconciliation.findFirst({
      where: { id: reconciliationId, orgId },
      include: {
        bankAccount: true,
        lines: {
          include: {
            bankTransaction: true,
            journalLine: {
              include: {
                account: true,
              },
            },
          },
        },
      },
    });

    if (!reconciliation) {
      throw new NotFoundException('Reconciliation not found');
    }

    return reconciliation;
  }

  async addReconciliationLine(orgId: string, reconciliationId: string, data: {
    bankTransactionId?: string;
    journalLineId?: string;
    amount: number;
    description: string;
  }): Promise<any> {
    const reconciliation = await prisma.reconciliation.findFirst({
      where: { id: reconciliationId, orgId },
    });

    if (!reconciliation) {
      throw new NotFoundException('Reconciliation not found');
    }

    return prisma.reconciliationLine.create({
      data: {
        reconciliation: { connect: { id: reconciliationId } },
        bankTransaction: data.bankTransactionId ? { connect: { id: data.bankTransactionId } } : undefined,
        journalLine: data.journalLineId ? { connect: { id: data.journalLineId } } : undefined,
        amount: data.amount,
        description: data.description,
      },
    });
  }

  async completeReconciliation(orgId: string, reconciliationId: string): Promise<any> {
    const reconciliation = await prisma.reconciliation.findFirst({
      where: { id: reconciliationId, orgId },
    });

    if (!reconciliation) {
      throw new NotFoundException('Reconciliation not found');
    }

    return prisma.reconciliation.update({
      where: { id: reconciliationId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
      include: {
        bankAccount: true,
        lines: true,
      },
    });
  }

  // Owner Statements
  async getOwnerStatements(orgId: string, filters?: { contactId?: string; propertyId?: string }): Promise<any[]> {
    const where: any = { orgId };

    if (filters?.contactId) where.contactId = filters.contactId;
    if (filters?.propertyId) where.propertyId = filters.propertyId;

    return prisma.ownerStatement.findMany({
      where,
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        property: { select: { id: true, name: true } },
        payoutBatch: true,
      },
      orderBy: { periodEnd: 'desc' },
    });
  }

  async createOwnerStatement(orgId: string, data: {
    contactId: string;
    propertyId?: string;
    periodStart: Date;
    periodEnd: Date;
    totalIncome: number;
    totalExpenses: number;
    netAmount: number;
  }): Promise<any> {
    return prisma.ownerStatement.create({
      data: {
        org: { connect: { id: orgId } },
        contact: { connect: { id: data.contactId } },
        property: data.propertyId ? { connect: { id: data.propertyId } } : undefined,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        totalIncome: data.totalIncome,
        totalExpenses: data.totalExpenses,
        netAmount: data.netAmount,
        status: 'draft',
      },
      include: {
        contact: true,
        property: true,
      },
    });
  }

  async getOwnerStatement(orgId: string, statementId: string): Promise<any> {
    const statement = await prisma.ownerStatement.findFirst({
      where: { id: statementId, orgId },
      include: {
        contact: true,
        property: true,
        payoutBatch: true,
      },
    });

    if (!statement) {
      throw new NotFoundException('Owner statement not found');
    }

    return statement;
  }

  // Payout Batches
  async getPayoutBatches(orgId: string): Promise<any[]> {
    return prisma.payoutBatch.findMany({
      where: { orgId },
      include: {
        ownerStatements: {
          include: {
            contact: true,
            property: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPayoutBatch(orgId: string, data: {
    name: string;
    statementIds: string[];
  }): Promise<any> {
    const statements = await prisma.ownerStatement.findMany({
      where: { id: { in: data.statementIds }, orgId },
    });

    if (statements.length !== data.statementIds.length) {
      throw new BadRequestException('Some statements not found');
    }

    const totalAmount = statements.reduce((sum, s) => sum + Number(s.netAmount), 0);

    return prisma.payoutBatch.create({
      data: {
        org: { connect: { id: orgId } },
        name: data.name,
        totalAmount: totalAmount,
        status: 'draft',
        ownerStatements: {
          connect: data.statementIds.map(id => ({ id })),
        },
      },
      include: {
        ownerStatements: {
          include: {
            contact: true,
            property: true,
          },
        },
      },
    });
  }
}

