import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrackerModule } from './tracker/tracker.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tracker } from './tracker/entities';
import { PriceCheckerModule } from './price-checker/price-checker.module';

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
