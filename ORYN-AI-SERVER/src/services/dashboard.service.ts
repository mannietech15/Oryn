import { defaultDashboardService } from '../modules/dashboard/dashboard.service';

export class DashboardService {
  static getAnalytics() {
    return defaultDashboardService.getAnalytics();
  }

  static async handleCommand(query: string, context?: string) {
    return defaultDashboardService.handleCommand(query, context);
  }

  static async getBriefing() {
    return defaultDashboardService.getBriefing();
  }

  static async getAlerts() {
    return defaultDashboardService.getAlerts();
  }

  static getGoals() {
    return defaultDashboardService.getGoals();
  }

  static async getGoalRecommendation(id: string) {
    return defaultDashboardService.getGoalRecommendation(id);
  }

  static getHealthScore() {
    return defaultDashboardService.getHealthScore();
  }
}
