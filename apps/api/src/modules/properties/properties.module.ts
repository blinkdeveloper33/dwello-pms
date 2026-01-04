import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { BuildingsService } from './buildings.service';
import { UnitsService } from './units.service';
import { QuotasModule } from '../quotas/quotas.module';

@Module({
  imports: [QuotasModule],
  controllers: [PropertiesController],
  providers: [PropertiesService, BuildingsService, UnitsService],
  exports: [PropertiesService, BuildingsService, UnitsService],
})
export class PropertiesModule {}

