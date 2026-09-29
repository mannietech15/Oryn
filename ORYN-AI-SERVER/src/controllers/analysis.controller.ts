import { Request, Response } from 'express';
import { AnalysisService } from '../services/analysis.service';

export class AnalysisController {
  static async analyze(req: Request, res: Response) {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { prompt, model, language } = req.body as { prompt?: string; model?: string; language?: string };

    try {
      const result = await AnalysisService.analyzeFile(req.file, prompt, model, language);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
