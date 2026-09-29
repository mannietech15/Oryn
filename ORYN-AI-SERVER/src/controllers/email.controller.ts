import { Request, Response } from 'express';
import { EmailService } from '../services/email.service';
import { EmailRequestBody } from '../types';

export class EmailController {
  static async sendEmail(req: Request, res: Response) {
    const { to, subject, body, message, content } = req.body as EmailRequestBody;
    if (!to) {
      res.status(400).json({ error: 'Missing to field' });
      return;
    }
    const emailBody = body || message || content || '';
    const emailSubject = subject || 'Message from Oryn AI';

    try {
      const result = await EmailService.sendMail(to, emailSubject, emailBody);
      res.json(result);
    } catch (err: any) {
      console.error('Error sending email:', err);
      res.status(500).json({ error: err.message });
    }
  }
}
