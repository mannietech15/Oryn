import { Request, Response, NextFunction } from 'express';
import { defaultDatastore, Datastore } from '../../infrastructure/storage/datastore';
import { defaultAnalysisService, AnalysisService } from '../analysis/analysis.service';
import { ValidationError, NotFoundError } from '../../shared/errors/app-error';

import { ENV } from '../../config/env';

export class DocumentsController {
  constructor(
    private datastore: Datastore = defaultDatastore,
    private analysisService: AnalysisService = defaultAnalysisService
  ) {}

  getDocuments = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const documents = this.datastore.getDocuments();
      res.json(documents);
    } catch (err) {
      next(err);
    }
  };

  uploadAndAnalyze = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();
    try {
      if (!req.file) {
        throw new ValidationError('No document uploaded. Please provide a file field named "file".');
      }

      const prompt = req.body.prompt || 'Provide a concise 1-2 sentence business summary with key operational takeaways.';
      const analysisResult = await this.analysisService.analyzeFile(req.file, prompt);
      const latencyMs = Math.max(1, Date.now() - startTime);

      const extMatch = req.file.originalname.match(/\.([a-z0-9]+)$/i);
      const ext = extMatch ? extMatch[1].toUpperCase() : 'FILE';
      const sizeStr = req.file.size > 1024 * 1024
        ? `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(req.file.size / 1024)} KB`;

      const doc = this.datastore.addDocument({
        name: req.file.originalname,
        type: ext,
        size: sizeStr,
        tags: ['Analyzed', ext],
        aiSummary: analysisResult.analysis
      });

      // Calculate dynamic tokens from character length heuristics
      const promptTokens = Math.ceil(prompt.length / 4);
      const outputTokens = Math.ceil((analysisResult.analysis?.length || 0) / 4);
      const tokensUsed = Math.max(30, promptTokens + outputTokens);

      // Log AI task execution with real elapsed duration
      this.datastore.logTask({
        type: 'analysis',
        model: ENV.PRO_MODEL,
        latencyMs,
        tokensUsed,
        status: 'success'
      });

      res.status(201).json(doc);
    } catch (err) {
      next(err);
    }
  };

  deleteDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = this.datastore.deleteDocument(id);
      if (!deleted) throw new NotFoundError(`Document '${id}' not found`);

      res.json({ success: true, id });
    } catch (err) {
      next(err);
    }
  };
}

export const defaultDocumentsController = new DocumentsController();
