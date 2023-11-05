import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrackerService } from './tracker/tracker.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, TrackerService],
})
export class AppModule {}
