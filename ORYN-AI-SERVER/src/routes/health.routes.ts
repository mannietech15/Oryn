import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

const router = Router();
router.get('/', HealthController.getRoot);
router.get('/api/health', HealthController.getHealth);
export default router;
