import nodemailer from 'nodemailer';
import { ENV } from '../config/env';

export class EmailService {
  static async sendMail(to: string | string[], subject: string, body: string) {
    if (
      ENV.SMTP_HOST &&
      ENV.SMTP_USER &&
      ENV.SMTP_PASS &&
      ENV.SMTP_USER !== 'your_email@gmail.com'
    ) {
      const transporter = nodemailer.createTransport({
        host: ENV.SMTP_HOST,
        port: ENV.SMTP_PORT,
        secure: ENV.SMTP_PORT === 465,
        auth: {
          user: ENV.SMTP_USER,
          pass: ENV.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: `"Oryn AI" <${ENV.SMTP_USER}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject: subject || 'Message from Oryn AI',
        text: body,
        html: body.replace(/\n/g, '<br>'),
      });

      console.log('✅ Email dispatched via SMTP:', info.messageId);
      return { success: true, messageId: info.messageId };
    } else {
      console.log('--- MOCK EMAIL SENT ---');
      console.log(`To: ${Array.isArray(to) ? to.join(', ') : to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${body}`);
      console.log('-----------------------');
      return { success: true, messageId: 'mock-' + Date.now(), previewUrl: null };
    }
  }
}
