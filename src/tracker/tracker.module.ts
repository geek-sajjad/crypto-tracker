import { Module } from '@nestjs/common';
import { TrackerService } from './tracker.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tracker } from './entities';
import { TrackerController } from './tracker.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tracker])],
  providers: [TrackerService],
  controllers: [TrackerController],
  exports: [TrackerService],
})
export class TrackerModule {}
