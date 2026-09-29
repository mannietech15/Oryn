import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';

const router = Router();
router.post('/chat', ChatController.handleChat);
export default router;
