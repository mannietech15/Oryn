import { Request, Response, NextFunction } from 'express';
import { AnalysisService, defaultAnalysisService } from './analysis.service';
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
}

export const defaultAnalysisController = new AnalysisController();
