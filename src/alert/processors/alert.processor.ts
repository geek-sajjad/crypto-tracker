import { Process, Processor } from '@nestjs/bull';
import { IMailAlert } from '../interfaces';
import { Job } from 'bull';
import { MailService } from '../mail.service';

@Processor('alerts')
export class AlertProcessor {
  constructor(private mailService: MailService) {}

  @Process('mail')
  async sendTrackerMail(job: Job<IMailAlert>) {
    const mailData: IMailAlert = job.data;

    await this.mailService.sendEmail({
      body: mailData.body,
      email: mailData.email,
      subject: mailData.subject,
    });
  }
}
