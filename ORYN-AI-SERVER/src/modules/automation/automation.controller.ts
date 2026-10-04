import { Request, Response, NextFunction } from 'express';
import { AutomationService, defaultAutomationService } from './automation.service';

export class AutomationController {
  constructor(private automationService: AutomationService = defaultAutomationService) {}

  getWorkflows = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = (req as any).user?.orgId;
      const data = await this.automationService.getWorkflows(orgId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = Number(req.query.limit) || 30;
      const orgId = (req as any).user?.orgId;
      const logs = await this.automationService.getLogs(orgId, limit);
      res.json(logs);
    } catch (err) {
      next(err);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = (req as any).user?.orgId;
      const stats = await this.automationService.getWorkflowStats(orgId);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  };

  toggleWorkflow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const orgId = (req as any).user?.orgId;
      const updated = await this.automationService.toggleWorkflow(id, orgId);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };

  runWorkflow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const orgId = (req as any).user?.orgId;
      const result = await this.automationService.runWorkflow(id, orgId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export const defaultAutomationController = new AutomationController();
