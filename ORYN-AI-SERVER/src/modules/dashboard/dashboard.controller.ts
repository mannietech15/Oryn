import { Request, Response, NextFunction } from 'express';
import { DashboardService, defaultDashboardService } from './dashboard.service';
import { NotFoundError } from '../../shared/errors/app-error';

export class DashboardController {
  constructor(private dashboardService: DashboardService = defaultDashboardService) {}

  getAnalytics = (req: Request, res: Response): void => {
    const range = req.query.range as string | undefined;
    res.json(this.dashboardService.getAnalytics(range));
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

  getGoals = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const goals = await this.dashboardService.getGoals();
      res.json(goals);
    } catch (err) {
      next(err);
    }
  };

  createGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const created = await this.dashboardService.createGoal(req.body);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  };

  updateGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await this.dashboardService.updateGoal(id, req.body);
      res.json({ success });
    } catch (err) {
      next(err);
    }
  };

  deleteGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await this.dashboardService.deleteGoal(id);
      res.json({ success });
    } catch (err) {
      next(err);
    }
  };

  dismissAlert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await this.dashboardService.dismissAlert(id);
      res.json({ success });
    } catch (err) {
      next(err);
    }
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

  getHealthScore = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const health = await this.dashboardService.getHealthScore();
      res.json(health);
    } catch (err) {
      next(err);
    }
  };
}

export const defaultDashboardController = new DashboardController();
