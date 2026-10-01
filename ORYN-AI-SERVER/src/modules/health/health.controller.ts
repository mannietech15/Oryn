import { Request, Response } from 'express';

export class HealthController {
  getRoot = (_req: Request, res: Response): void => {
    res.send(
      '<h1>ORYN AI Server is running (NVIDIA/OpenRouter)</h1><p>Visit <code>/api/health</code> for status.</p>'
    );
  };

  getHealth = (_req: Request, res: Response): void => {
    res.json({
      status: 'ok',
      model: 'dynamic',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  };
}

export const defaultHealthController = new HealthController();
