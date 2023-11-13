import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrackerModule } from './tracker/tracker.module';
import { PriceCheckerModule } from './price-checker/price-checker.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AlertModule } from './alert/alert.module';
import { BullModule } from '@nestjs/bull';
import { CacheProviderModule } from './providers/cache/cache-provider.module';
import { DatabaseProviderModule } from './providers/database/database-provider.module';
import { AppConfigModule } from './config/app/app-config.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    CacheProviderModule,
    DatabaseProviderModule,
    ScheduleModule.forRoot(),
    TrackerModule,
    PriceCheckerModule,
    AlertModule,
    AppConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
