import { Request, Response, NextFunction } from 'express';
import { EmailService, defaultEmailService } from './email.service';
import { EmailRequestDto } from './email.types';

export class EmailController {
  constructor(private emailService: EmailService = defaultEmailService) {}

  sendEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { to, subject, body, message, content, draftId } = req.body as EmailRequestDto & { draftId?: string };
      const emailBody = body || message || content || '';
      const emailSubject = subject || 'Message from Oryn AI';

      const result = await this.emailService.sendMail(to, emailSubject, emailBody, draftId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  stageDraft = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { to, subject, body, message, content } = req.body as EmailRequestDto;
      const emailBody = body || message || content || '';
      const emailSubject = subject || 'Message from Oryn AI';

      const draft = this.emailService.stageDraft(to, emailSubject, emailBody);
      res.status(201).json(draft);
    } catch (err) {
      next(err);
    }
  };

  confirmDraft = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const logs = this.emailService.getEmailLogs(100);
      const draft = logs.find(d => d.id === id);

      if (!draft) {
        res.status(404).json({ error: 'Staged email draft not found' });
        return;
      }

      const result = await this.emailService.sendMail(draft.to, draft.subject, draft.body, draft.id);
      res.json({ ...result, draftId: id });
    } catch (err) {
      next(err);
    }
  };

  getStatus = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status = await this.emailService.verifyTransport();
      res.json(status);
    } catch (err) {
      next(err);
    }
  };

  getLogs = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const logs = this.emailService.getEmailLogs();
      res.json(logs);
    } catch (err) {
      next(err);
    }
  };
}

export const defaultEmailController = new EmailController();
