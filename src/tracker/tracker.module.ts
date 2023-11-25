import { Module } from '@nestjs/common';
import { TrackerService } from './tracker.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tracker } from './entities';
import { TrackerController } from './tracker.controller';
import { AlertModule } from 'src/alert/alert.module';
import { CacheManagerModule } from 'src/cache-manager/cache-manager.module';
import { CryptoPriceModule } from 'src/crypto-price/crypto-price.module';

@Module({
  imports: [
    CacheManagerModule,
    AlertModule,
    CryptoPriceModule,
    TypeOrmModule.forFeature([Tracker]),
  ],
  providers: [TrackerService],
  controllers: [TrackerController],
  exports: [TrackerService],
})
export class TrackerModule {}
