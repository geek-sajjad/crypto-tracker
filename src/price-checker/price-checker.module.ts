import { Module } from '@nestjs/common';
import { AppConfigModule } from 'src/config/app/app-config.module';
import { priceCheckerProvider } from './price-checker.provider';
import { PRICE_CHECKER_SERVICE_TOKEN } from 'src/common/constants';
@Module({
  providers: [priceCheckerProvider],
  imports: [AppConfigModule],
  exports: [PRICE_CHECKER_SERVICE_TOKEN],
})
export class PriceCheckerModule {}
