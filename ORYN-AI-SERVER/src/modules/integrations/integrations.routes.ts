import { Router } from 'express';
import { defaultIntegrationsController } from './integrations.controller';

const router = Router();

router.get('/integrations/status', defaultIntegrationsController.getStatus);
router.post('/integrations/:id/test', defaultIntegrationsController.testIntegration);

export default router;
