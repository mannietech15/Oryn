import { Router } from 'express';
import { defaultAuthController } from './auth.controller';
import { authRateLimiter } from '../../middleware/rate-limit.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { LoginSchema, RegisterSchema } from '../../shared/validators/auth.validator';

const router = Router();

// Public authentication routes with brute-force rate limiting & strict Zod validation
router.post('/auth/login', authRateLimiter, validateBody(LoginSchema), defaultAuthController.login);
router.post('/auth/register', authRateLimiter, validateBody(RegisterSchema), defaultAuthController.register);
router.post('/auth/logout', defaultAuthController.logout);

// Session verification
router.get('/auth/me', defaultAuthController.me);
router.get('/auth/session', defaultAuthController.session);

export default router;
