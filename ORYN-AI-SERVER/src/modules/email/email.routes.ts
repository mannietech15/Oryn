import { Router } from 'express';
import { defaultEmailController } from './email.controller';
import { validateBody } from '../../app/middleware/validate';
import { emailRequestSchema } from './email.schemas';

const router = Router();

router.post('/send-email', validateBody(emailRequestSchema), defaultEmailController.sendEmail);
router.post('/email/draft', validateBody(emailRequestSchema), defaultEmailController.stageDraft);
router.post('/email/confirm/:id', defaultEmailController.confirmDraft);
router.get('/email/status', defaultEmailController.getStatus);
router.get('/email/logs', defaultEmailController.getLogs);

export default router;
