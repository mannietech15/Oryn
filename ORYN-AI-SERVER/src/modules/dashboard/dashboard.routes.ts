import { Router } from 'express';
import { defaultDashboardController } from './dashboard.controller';
import { validateBody, validateParams } from '../../app/middleware/validate';
import { dashboardCommandSchema, goalActionParamSchema } from './dashboard.schemas';

const router = Router();

router.get('/analytics', defaultDashboardController.getAnalytics);
router.get('/analytics/forecast', defaultDashboardController.getForecast);
router.post(
  '/dashboard/command',
  validateBody(dashboardCommandSchema),
  defaultDashboardController.handleCommand
);
router.get('/dashboard/briefing', defaultDashboardController.getBriefing);
router.get('/dashboard/alerts', defaultDashboardController.getAlerts);
router.post('/dashboard/alerts/:id/dismiss', defaultDashboardController.dismissAlert);

router.get('/dashboard/goals', defaultDashboardController.getGoals);
router.post('/dashboard/goals', defaultDashboardController.createGoal);
router.patch('/dashboard/goals/:id', defaultDashboardController.updateGoal);
router.delete('/dashboard/goals/:id', defaultDashboardController.deleteGoal);
router.post(
  '/dashboard/goals/:id/action',
  validateParams(goalActionParamSchema),
  defaultDashboardController.getGoalAction
);
router.get('/dashboard/health-score', defaultDashboardController.getHealthScore);

export default router;
