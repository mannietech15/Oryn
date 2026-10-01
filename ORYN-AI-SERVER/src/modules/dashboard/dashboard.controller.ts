import { Request, Response, NextFunction } from 'express';
import { DashboardService, defaultDashboardService } from './dashboard.service';
import { NotFoundError } from '../../shared/errors/app-error';

export class DashboardController {
  constructor(private dashboardService: DashboardService = defaultDashboardService) {}

  getAnalytics = (_req: Request, res: Response): void => {
    res.json(this.dashboardService.getAnalytics());
  };

  handleCommand = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query, context } = req.body;
      const result = await this.dashboardService.handleCommand(query, context);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getBriefing = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const briefing = await this.dashboardService.getBriefing();
      res.json(briefing);
    } catch (err) {
      next(err);
    }
  };

  getAlerts = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const alerts = await this.dashboardService.getAlerts();
      res.json(alerts);
    } catch (err) {
      next(err);
    }
  };

  getGoals = (_req: Request, res: Response): void => {
    res.json(this.dashboardService.getGoals());
  };

  getGoalAction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.dashboardService.getGoalRecommendation(id);
      if (!result) {
        throw new NotFoundError(`Goal with id '${id}' not found`);
      }
      res.json({ recommendation: result.recommendation, goalId: id });
    } catch (err) {
      next(err);
    }
  };

  getHealthScore = (_req: Request, res: Response): void => {
    res.json(this.dashboardService.getHealthScore());
  };
}

export const defaultDashboardController = new DashboardController();
