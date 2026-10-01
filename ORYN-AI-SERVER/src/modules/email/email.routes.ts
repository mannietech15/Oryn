import { Router } from 'express';
import { defaultEmailController } from './email.controller';
import { validateBody } from '../../app/middleware/validate';
import { emailRequestSchema } from './email.schemas';

const router = Router();

router.post('/send-email', validateBody(emailRequestSchema), defaultEmailController.sendEmail);

export default router;
