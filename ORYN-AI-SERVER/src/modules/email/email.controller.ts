import { Request, Response, NextFunction } from 'express';
import { EmailService, defaultEmailService } from './email.service';
import { EmailRequestDto } from './email.types';

export class EmailController {
  constructor(private emailService: EmailService = defaultEmailService) {}

  sendEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { to, subject, body, message, content } = req.body as EmailRequestDto;
      const emailBody = body || message || content || '';
      const emailSubject = subject || 'Message from Oryn AI';

      const result = await this.emailService.sendMail(to, emailSubject, emailBody);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export const defaultEmailController = new EmailController();
