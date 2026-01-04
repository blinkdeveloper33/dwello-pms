import { Module } from '@nestjs/common';
import { HoaController } from './hoa.controller';
import { HoaService } from './hoa.service';

@Module({
  controllers: [HoaController],
  providers: [HoaService],
  exports: [HoaService],
})
export class HoaModule {}

