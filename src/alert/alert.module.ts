import { Module } from '@nestjs/common';
import { AlertService } from './alert.service';
import { BullModule } from '@nestjs/bull';
import { AlertProcessor } from './processors/alert.processor';
import { MailService } from './mail.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'alerts',
      defaultJobOptions: {
        attempts: 3,
        delay: 10000,
        removeOnComplete: true,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    }),
  ],
  providers: [AlertService, AlertProcessor, MailService],
  exports: [AlertService],
})
export class AlertModule {}
