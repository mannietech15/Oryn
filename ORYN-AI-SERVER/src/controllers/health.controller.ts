import { Request, Response } from 'express';

export class HealthController {
  static getRoot(_req: Request, res: Response) {
    res.send('<h1>ORYN AI Server is running (NVIDIA/OpenRouter)</h1><p>Visit <code>/api/health</code> for status.</p>');
  }

  static getHealth(_req: Request, res: Response) {
    res.json({ status: 'ok', model: 'dynamic' });
  }
}
