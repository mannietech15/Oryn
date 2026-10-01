import { Router } from 'express';
import { defaultHealthController } from './health.controller';

const router = Router();

router.get('/', defaultHealthController.getRoot);
router.get('/health', defaultHealthController.getHealth);
router.get('/api/health', defaultHealthController.getHealth);

export default router;
