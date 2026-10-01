import { Router } from 'express';
import { defaultChatController } from './chat.controller';
import { validateBody } from '../../app/middleware/validate';
import { chatRequestSchema } from './chat.schemas';

const router = Router();

router.post('/chat', validateBody(chatRequestSchema), defaultChatController.handleChat);

export default router;
