import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { IMailAlert } from './interfaces';
@Injectable()
export class AlertService {
  constructor(@InjectQueue('alerts') private readonly alertsQueue: Queue) {}

  async sendMailAlert(data: IMailAlert) {
    const job = await this.alertsQueue.add('mail', data);
    return { jobId: job.id };
  }
}
