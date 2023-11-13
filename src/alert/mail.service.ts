import { Injectable } from '@nestjs/common';
import { IMailAlert } from './interfaces';

@Injectable()
export class MailService {
  constructor() {}

  async sendEmail(mail: IMailAlert) {
    // sending email
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(
          `sending email to: ${mail.email}, subject: ${mail.subject}, body: ${mail.body}`,
        );
        resolve(null);
      }, 1000);
    });
  }
}
