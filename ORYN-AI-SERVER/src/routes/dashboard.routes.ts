import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();
router.get('/analytics', DashboardController.getAnalytics);
router.post('/dashboard/command', DashboardController.handleCommand);
router.get('/dashboard/briefing', DashboardController.getBriefing);
router.get('/dashboard/alerts', DashboardController.getAlerts);
router.get('/dashboard/goals', DashboardController.getGoals);
router.post('/dashboard/goals/:id/action', DashboardController.getGoalAction);
router.get('/dashboard/health-score', DashboardController.getHealthScore);
export default router;
