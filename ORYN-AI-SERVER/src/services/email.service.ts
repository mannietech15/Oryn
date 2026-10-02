import { defaultEmailService } from '../modules/email/email.service';

export class EmailService {
  static async sendMail(to: string | string[], subject: string, body: string) {
    return defaultEmailService.sendMail(to, subject, body);
  }

  static async verifyTransport() {
    return defaultEmailService.verifyTransport();
  }

  static stageDraft(to: string | string[], subject: string, body: string) {
    return defaultEmailService.stageDraft(to, subject, body);
  }
}
