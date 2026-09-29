import { Router } from 'express';
import { EmailController } from '../controllers/email.controller';

const router = Router();
router.post('/send-email', EmailController.sendEmail);
export default router;
