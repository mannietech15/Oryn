import { Router } from 'express';
import { defaultAuthController } from './auth.controller';

const router = Router();

router.post('/auth/login', defaultAuthController.login);
router.post('/auth/register', defaultAuthController.register);
router.post('/auth/logout', defaultAuthController.logout);
router.get('/auth/me', defaultAuthController.me);
router.get('/auth/session', defaultAuthController.session);

export default router;
