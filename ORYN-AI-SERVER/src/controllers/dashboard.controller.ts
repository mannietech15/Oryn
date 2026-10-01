import { defaultDashboardController } from '../modules/dashboard/dashboard.controller';

export class DashboardController {
  static getAnalytics = defaultDashboardController.getAnalytics;
  static handleCommand = defaultDashboardController.handleCommand;
  static getBriefing = defaultDashboardController.getBriefing;
  static getAlerts = defaultDashboardController.getAlerts;
  static getGoals = defaultDashboardController.getGoals;
  static getGoalAction = defaultDashboardController.getGoalAction;
  static getHealthScore = defaultDashboardController.getHealthScore;
}
