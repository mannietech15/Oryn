import { Router } from 'express';
import { defaultAutomationController } from './automation.controller';

const router = Router();

router.get('/automations', defaultAutomationController.getWorkflows);
router.get('/automations/logs', defaultAutomationController.getLogs);
router.get('/automations/stats', defaultAutomationController.getStats);
router.post('/automations/:id/toggle', defaultAutomationController.toggleWorkflow);
router.post('/automations/:id/run', defaultAutomationController.runWorkflow);

export default router;
