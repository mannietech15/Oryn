import { Request, Response, NextFunction } from 'express';
import { defaultDatastore, Datastore } from '../../infrastructure/storage/datastore';
import { NotFoundError } from '../../shared/errors/app-error';

export class AutomationController {
  constructor(private datastore: Datastore = defaultDatastore) {}

  getWorkflows = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workflows = this.datastore.getWorkflows();
      const stats = this.datastore.getWorkflowStats();
      res.json({ workflows, stats });
    } catch (err) {
      next(err);
    }
  };

  getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = Number(req.query.limit) || 30;
      const logs = this.datastore.getWorkflowExecutionLogs(limit);
      res.json(logs);
    } catch (err) {
      next(err);
    }
  };

  getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = this.datastore.getWorkflowStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  };

  toggleWorkflow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const wf = this.datastore.getWorkflow(id);
      if (!wf) throw new NotFoundError(`Workflow '${id}' not found`);

      const nextStatus = wf.status === 'active' ? 'paused' : 'active';
      const updated = this.datastore.updateWorkflow(id, { status: nextStatus });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };

  runWorkflow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();
    try {
      const { id } = req.params;
      const wf = this.datastore.getWorkflow(id);
      if (!wf) throw new NotFoundError(`Workflow '${id}' not found`);

      // Simulate real execution timing based on steps
      const durationMs = 80 + Math.floor(Math.random() * 120) + wf.steps.length * 40;

      // Log execution record
      const executionRecord = this.datastore.logWorkflowExecution({
        workflowId: wf.id,
        workflowName: wf.name,
        trigger: 'Manual Console Dispatch',
        durationMs,
        status: 'success',
        stepsCompleted: wf.steps.length,
        totalSteps: wf.steps.length,
        error: null
      });

      // Also log task telemetry
      this.datastore.logTask({
        type: 'automation',
        model: 'engine/pipeline-runner',
        latencyMs: durationMs,
        tokensUsed: 0,
        status: 'success'
      });

      res.json({
        success: true,
        execution: executionRecord,
        message: `Workflow '${wf.name}' executed successfully in ${durationMs}ms.`
      });
    } catch (err: any) {
      const { id } = req.params;
      const wf = this.datastore.getWorkflow(id);
      if (wf) {
        this.datastore.logWorkflowExecution({
          workflowId: wf.id,
          workflowName: wf.name,
          trigger: 'Manual Console Dispatch',
          durationMs: Date.now() - startTime,
          status: 'failure',
          stepsCompleted: 0,
          totalSteps: wf.steps.length,
          error: err.message
        });
      }
      next(err);
    }
  };
}

export const defaultAutomationController = new AutomationController();
