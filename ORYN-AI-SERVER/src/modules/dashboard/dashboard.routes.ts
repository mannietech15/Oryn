import { Router } from 'express';
import { defaultDashboardController } from './dashboard.controller';
import { validateBody, validateParams } from '../../app/middleware/validate';
import { dashboardCommandSchema, goalActionParamSchema } from './dashboard.schemas';

const router = Router();

router.get('/analytics', defaultDashboardController.getAnalytics);
router.post(
  '/dashboard/command',
  validateBody(dashboardCommandSchema),
  defaultDashboardController.handleCommand
);
router.get('/dashboard/briefing', defaultDashboardController.getBriefing);
router.get('/dashboard/alerts', defaultDashboardController.getAlerts);
router.get('/dashboard/goals', defaultDashboardController.getGoals);
router.post(
  '/dashboard/goals/:id/action',
  validateParams(goalActionParamSchema),
  defaultDashboardController.getGoalAction
);
router.get('/dashboard/health-score', defaultDashboardController.getHealthScore);

export default router;
