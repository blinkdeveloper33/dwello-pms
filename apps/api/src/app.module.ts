import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { OrgsModule } from './modules/orgs/orgs.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { QuotasModule } from './modules/quotas/quotas.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { ChargesModule } from './modules/charges/charges.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { CommunicationsModule } from './modules/communications/communications.module';
import { HoaModule } from './modules/hoa/hoa.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { EnterpriseModule } from './modules/enterprise/enterprise.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuthModule,
    OrgsModule,
    PropertiesModule,
    QuotasModule,
    ContactsModule,
    DocumentsModule,
    ChargesModule,
    PaymentsModule,
    WorkOrdersModule,
    CommunicationsModule,
    HoaModule,
    AccountingModule,
    EnterpriseModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

