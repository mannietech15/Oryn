import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { DashboardCommandBody } from '../types';

export class DashboardController {
  static getAnalytics(_req: Request, res: Response) {
    res.json(DashboardService.getAnalytics());
  }

  static async handleCommand(req: Request, res: Response) {
    const { query, context } = req.body as DashboardCommandBody;
    if (!query?.trim()) {
      res.status(400).json({ error: 'query is required' });
      return;
    }
    const result = await DashboardService.handleCommand(query, context);
    res.json(result);
  }

  static async getBriefing(_req: Request, res: Response) {
    const briefing = await DashboardService.getBriefing();
    res.json(briefing);
  }

  static async getAlerts(_req: Request, res: Response) {
    const alerts = await DashboardService.getAlerts();
    res.json(alerts);
  }

  static getGoals(_req: Request, res: Response) {
    res.json(DashboardService.getGoals());
  }

  static async getGoalAction(req: Request, res: Response) {
    const { id } = req.params;
    const result = await DashboardService.getGoalRecommendation(id);
    if (!result) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }
    res.json({ recommendation: result.recommendation, goalId: id });
  }

  static getHealthScore(_req: Request, res: Response) {
    res.json(DashboardService.getHealthScore());
  }
}
