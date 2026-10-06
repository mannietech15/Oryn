import { Request, Response, NextFunction } from 'express';
import { AnalysisService, defaultAnalysisService } from './analysis.service';
import { defaultDatastore } from '../../infrastructure/storage/datastore';
import { ValidationError } from '../../shared/errors/app-error';

export class AnalysisController {
  constructor(private analysisService: AnalysisService = defaultAnalysisService) {}

  analyze = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new ValidationError('No file uploaded. Please provide a file in the form field "file".');
      }

      const { prompt, model, language } = req.body;
      const result = await this.analysisService.analyzeFile(req.file, prompt, model, language);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getTelemetry = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metrics = defaultDatastore.getTaskMetrics();
      const logs = defaultDatastore.getTaskLogs(100);
      const latencies = logs.map(l => l.latencyMs).sort((a, b) => a - b);
      const p95LatencyMs = latencies.length > 0
        ? latencies[Math.floor(latencies.length * 0.95)] || latencies[latencies.length - 1]
        : null;
      const p50LatencyMs = latencies.length > 0
        ? latencies[Math.floor(latencies.length * 0.50)] || latencies[0]
        : null;
      
      const variance = latencies.length > 1
        ? Math.sqrt(latencies.reduce((acc, l) => acc + Math.pow(l - (metrics.avgLatencyMs || 200), 2), 0) / latencies.length)
        : 0;
      const confidence = latencies.length > 0
        ? Math.min(98, Math.max(75, Math.round(100 - (variance / (metrics.avgLatencyMs || 200)) * 25)))
        : 100;

      res.json({
        metrics,
        p95LatencyMs,
        p50LatencyMs,
        standardDeviation: Number(variance.toFixed(1)),
        confidenceScore: confidence
      });
    } catch (err) {
      next(err);
    }
  };
}

export const defaultAnalysisController = new AnalysisController();

