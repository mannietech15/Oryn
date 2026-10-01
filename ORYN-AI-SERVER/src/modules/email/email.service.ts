import nodemailer from 'nodemailer';
import { ENV } from '../../config/env';
import { EmailResultDto } from './email.types';
import { Logger } from '../../infrastructure/logging/logger';

const logger = new Logger('EmailService');

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter(): void {
    if (
      ENV.SMTP_HOST &&
      ENV.SMTP_USER &&
      ENV.SMTP_PASS &&
      ENV.SMTP_USER !== 'your_email@gmail.com'
    ) {
      this.transporter = nodemailer.createTransport({
        host: ENV.SMTP_HOST,
        port: ENV.SMTP_PORT,
        secure: ENV.SMTP_PORT === 465,
        auth: {
          user: ENV.SMTP_USER,
          pass: ENV.SMTP_PASS,
        },
      });
      logger.info('Configured active SMTP transport', { host: ENV.SMTP_HOST, port: ENV.SMTP_PORT });
    } else {
      logger.info('Using Mock email dispatcher (SMTP credentials not configured)');
    }
  }

  async sendMail(to: string | string[], subject: string, body: string): Promise<EmailResultDto> {
    const recipient = Array.isArray(to) ? to.join(', ') : to;
    const finalSubject = subject || 'Message from Oryn AI';

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: `"Oryn AI" <${ENV.SMTP_USER}>`,
          to: recipient,
          subject: finalSubject,
          text: body,
          html: body.replace(/\n/g, '<br>'),
        });

        logger.info('Email dispatched via SMTP', { messageId: info.messageId, to: recipient });
        return { success: true, messageId: info.messageId };
      } catch (err: any) {
        logger.error('Failed to send email via SMTP', { error: err.message });
        throw err;
      }
    }

    // Mock dispatch mode
    logger.info('Mock email sent', { to: recipient, subject: finalSubject, length: body.length });
    return {
      success: true,
      messageId: `mock-${Date.now()}`,
      previewUrl: null,
    };
  }
}

export const defaultEmailService = new EmailService();
