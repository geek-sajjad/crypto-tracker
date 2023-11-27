import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TrackerModule } from './tracker/tracker.module';
import { CryptoPriceModule } from './crypto-price/crypto-price.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AlertModule } from './alert/alert.module';
import { BullModule } from '@nestjs/bull';
import { CacheProviderModule } from './providers/cache/cache-provider.module';
import { DatabaseProviderModule } from './providers/database/database-provider.module';
import { AppConfigModule } from './config/app/app-config.module';
import { CacheManagerModule } from './cache-manager/cache-manager.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { BullProviderModule } from './providers/bull/bull-provider.module';

@Module({
  imports: [
    BullProviderModule,
    CacheProviderModule,
    DatabaseProviderModule,
    ScheduleModule.forRoot(),
    TrackerModule,
    CryptoPriceModule,
    AlertModule,
    AppConfigModule,
    CacheManagerModule,
  ],
  controllers: [AppController],
  providers: [
    // Don't change the order. order matters in this case
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
