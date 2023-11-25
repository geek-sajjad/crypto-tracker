import { InjectQueue } from '@nestjs/bull';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Queue } from 'bull';
import { IMailAlert } from './interfaces';
import { ITrackersToGetNotified } from 'src/tracker/interfaces';
@Injectable()
export class AlertService {
  constructor(@InjectQueue('alerts') private readonly alertsQueue: Queue) {}

  async sendMailAlert(data: IMailAlert) {
    const job = await this.alertsQueue.add('mail', data);
    return { jobId: job.id };
  }

  async alertTrackers(trackers: Array<ITrackersToGetNotified>): Promise<void> {
    try {
      const notifyPromises = trackers.map(async (tracker) => {
        await this.sendMailAlert({
          subject: 'subject',
          email: tracker.notifyEmail,
          body: `crypto name: ${tracker.cryptoName} - current price: ${tracker.currentPrice}`,
        });
      });

      await Promise.all(notifyPromises);
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while alerting trackers',
      );
    }
  }
}
