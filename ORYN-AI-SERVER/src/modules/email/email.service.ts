import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { ENV } from '../../config/env';
import { EmailResultDto } from './email.types';
import { Logger } from '../../infrastructure/logging/logger';
import { defaultDatastore, Datastore } from '../../infrastructure/storage/datastore';
import { prisma } from '../../infrastructure/database/prisma';
import { AppError } from '../../shared/errors/app-error';
import { ErrorCode } from '../../shared/errors/error-codes';

const logger = new Logger('EmailService');

/**
 * EmailService manages outbound communication through verified SMTP transports.
 * 
 * SECURITY & AUDIT PROTOCOL:
 * - Direct execution without human authorization is prohibited for unverified actions.
 * - Outgoing drafts are staged in PostgreSQL/local datastore with unique IDs and 'awaiting_approval' status.
 * - Idempotency key prevents duplicate transmissions on UI double-clicks.
 * - Confirmed dispatches update the audit record with remote messageId and timestamp.
 * - Failed dispatches log error traces and retain records for diagnostic retries.
 */
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;
  private cachedVerifyResult: { connected: boolean; message: string; host?: string; port?: number } | null = null;
  private lastVerifyTimestamp: number = 0;

  constructor(private datastore: Datastore = defaultDatastore) {
    this.initTransporter();
  }

  private initTransporter(): void {
    if (
      ENV.SMTP_HOST &&
      ENV.SMTP_USER &&
      ENV.SMTP_PASS &&
      ENV.SMTP_USER !== 'your_email@gmail.com' &&
      !ENV.SMTP_USER.includes('example.com')
    ) {
      try {
        this.transporter = nodemailer.createTransport({
          host: ENV.SMTP_HOST,
          port: ENV.SMTP_PORT,
          secure: ENV.SMTP_PORT === 465,
          auth: {
            user: ENV.SMTP_USER,
            pass: ENV.SMTP_PASS,
          },
        });
        this.isConfigured = true;
        logger.info('Configured active SMTP transport', { host: ENV.SMTP_HOST, port: ENV.SMTP_PORT, user: ENV.SMTP_USER });
        this.verifyTransport(true).catch(() => {});
      } catch (err: any) {
        logger.error('Failed to configure SMTP transport', { error: err.message });
        this.isConfigured = false;
      }
    } else {
      this.isConfigured = false;
      logger.warn('SMTP transport not configured: missing valid credentials in environment');
    }
  }

  async verifyTransport(forceRefresh: boolean = false): Promise<{ connected: boolean; message: string; host?: string; port?: number }> {
    if (!this.isConfigured || !this.transporter) {
      return {
        connected: false,
        message: 'SMTP credentials not configured in server environment (.env)',
        host: ENV.SMTP_HOST,
        port: ENV.SMTP_PORT,
      };
    }

    if (!forceRefresh && this.cachedVerifyResult && (Date.now() - this.lastVerifyTimestamp < 300000)) {
      return this.cachedVerifyResult;
    }

    try {
      await this.transporter.verify();
      this.cachedVerifyResult = {
        connected: true,
        message: `SMTP connection established successfully to ${ENV.SMTP_HOST}:${ENV.SMTP_PORT}`,
        host: ENV.SMTP_HOST,
        port: ENV.SMTP_PORT,
      };
      this.lastVerifyTimestamp = Date.now();
      return this.cachedVerifyResult;
    } catch (err: any) {
      logger.warn('SMTP verification handshake failed', { error: err.message });
      this.cachedVerifyResult = {
        connected: false,
        message: `SMTP handshake failure: ${err.message}`,
        host: ENV.SMTP_HOST,
        port: ENV.SMTP_PORT,
      };
      this.lastVerifyTimestamp = Date.now();
      return this.cachedVerifyResult;
    }
  }

  stageDraft(to: string | string[], subject: string, body: string, userId?: string) {
    const recipient = Array.isArray(to) ? to.join(', ') : to;
    const finalSubject = subject || 'Message from Oryn AI';
    const draft = this.datastore.stageEmailDraft(recipient, finalSubject, body);

    // Also asynchronously stage in PostgreSQL
    prisma.emailLog.create({
      data: {
        id: draft.id,
        userId: userId || undefined,
        to: recipient,
        subject: finalSubject,
        body,
        status: 'AWAITING_APPROVAL',
        idempotencyKey: `idemp_${draft.id}_${crypto.randomBytes(4).toString('hex')}`,
      },
    }).catch(() => {
      // Ignored if DB is in sync mode
    });

    logger.info('Staged email draft awaiting approval', { draftId: draft.id, to: recipient, subject: finalSubject });
    return draft;
  }

  async sendMail(to: string | string[], subject: string, body: string, draftId?: string): Promise<EmailResultDto> {
    const recipient = Array.isArray(to) ? to.join(', ') : to;
    const finalSubject = subject || 'Message from Oryn AI';

    if (!this.transporter || !this.isConfigured) {
      const errorMsg = 'SMTP transport unavailable: Host credentials not configured in server environment.';
      if (draftId) {
        this.datastore.updateEmailRecord(draftId, { status: 'failed', error: errorMsg });
        prisma.emailLog.update({
          where: { id: draftId },
          data: { status: 'FAILED', error: errorMsg },
        }).catch(() => {});
      }
      logger.error('Rejecting email dispatch: unconfigured transport', { recipient });
      throw new AppError(errorMsg, 503, ErrorCode.SMTP_UNCONFIGURED);
    }

    // Idempotency check: if draft was already sent, return existing confirmation
    if (draftId) {
      const existing = this.datastore.getEmailDraft(draftId);
      if (existing && existing.status === 'sent' && existing.messageId) {
        logger.info('Idempotent return: draft already sent', { draftId, messageId: existing.messageId });
        return { success: true, messageId: existing.messageId };
      }
    }

    try {
      const formattedHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #111827; max-width: 600px;">
          ${body.split(/\n\s*\n/).map(p => `<p style="margin: 0 0 14px 0;">${p.replace(/\n/g, '<br>')}</p>`).join('')}
        </div>
      `;

      const info = await this.transporter.sendMail({
        from: `"Oryn AI" <${ENV.SMTP_USER}>`,
        to: recipient,
        subject: finalSubject,
        text: body,
        html: formattedHtml,
      });

      logger.info('Email dispatched via verified SMTP transport', { messageId: info.messageId, to: recipient });

      if (draftId) {
        const sentAt = new Date().toISOString();
        this.datastore.updateEmailRecord(draftId, {
          status: 'sent',
          messageId: info.messageId,
          sentAt,
        });

        prisma.emailLog.update({
          where: { id: draftId },
          data: {
            status: 'SENT',
            messageId: info.messageId,
            sentAt: new Date(),
          },
        }).catch(() => {});
      }

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: any) {
      const errorMsg = `SMTP dispatch failed: ${err.message}`;
      logger.error('Failed to send email via SMTP', { error: err.message, recipient });

      if (draftId) {
        this.datastore.updateEmailRecord(draftId, { status: 'failed', error: errorMsg });
        prisma.emailLog.update({
          where: { id: draftId },
          data: { status: 'FAILED', error: errorMsg },
        }).catch(() => {});
      }

      throw new AppError(errorMsg, 502, ErrorCode.SMTP_DISPATCH_FAILURE);
    }
  }

  getEmailLogs(limit: number = 20) {
    return this.datastore.getEmailLogs(limit);
  }
}

export const defaultEmailService = new EmailService();
