import { Module } from '@nestjs/common';
import { AppConfigModule } from 'src/config/app/app-config.module';
// import { cryptoPriceProvider } from './crypto-price.provider';
import { CRYPTO_PRICE_SERVICE_TOKEN } from 'src/common/constants';
import { CacheManagerModule } from 'src/cache-manager/cache-manager.module';
import { CryptoPriceService } from './crypto-price.service';
@Module({
  imports: [AppConfigModule, CacheManagerModule],
  providers: [
    {
      provide: CRYPTO_PRICE_SERVICE_TOKEN,
      useClass: CryptoPriceService,
    },
  ],
  // providers: [cryptoPriceProvider],
  exports: [CRYPTO_PRICE_SERVICE_TOKEN],
})
export class CryptoPriceModule {}
