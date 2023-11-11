import { Module } from '@nestjs/common';
import { PriceCheckerService } from './price-checker.service';

@Module({
  providers: [PriceCheckerService],
  exports: [PriceCheckerService],
})
export class PriceCheckerModule {}
