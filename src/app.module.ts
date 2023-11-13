import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrackerModule } from './tracker/tracker.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tracker } from './tracker/entities';
import { PriceCheckerModule } from './price-checker/price-checker.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { AlertModule } from './alert/alert.module';
import { BullModule } from '@nestjs/bull';
import { CacheProviderModule } from './providers/cache/cache-provider.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    CacheProviderModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'crypto-tracker',
      entities: [Tracker],
      synchronize: true,
      dropSchema: false,
    }),
    TrackerModule,
    PriceCheckerModule,
    AlertModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
