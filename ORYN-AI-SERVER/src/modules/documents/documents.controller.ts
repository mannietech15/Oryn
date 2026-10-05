import { Request, Response, NextFunction } from 'express';
import { defaultDocumentsService, DocumentsService } from './documents.service';
import { defaultAnalysisService, AnalysisService } from '../analysis/analysis.service';
import { defaultDatastore, Datastore } from '../../infrastructure/storage/datastore';
import { ValidationError, NotFoundError } from '../../shared/errors/app-error';
import { ENV } from '../../config/env';

export class DocumentsController {
  constructor(
    private documentsService: DocumentsService = defaultDocumentsService,
    private analysisService: AnalysisService = defaultAnalysisService,
    private datastore: Datastore = defaultDatastore
  ) {}

  getDocuments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = (req as any).user?.orgId;
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const tag = typeof req.query.tag === 'string' ? req.query.tag : undefined;
      const documents = await this.documentsService.getDocuments(orgId, search, tag);
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

      const orgId = (req as any).user?.orgId;
      const doc = await this.documentsService.addDocument({
        name: req.file.originalname,
        type: ext,
        size: sizeStr,
        tags: ['Analyzed', ext],
        aiSummary: analysisResult.analysis,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        orgId
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
      const orgId = (req as any).user?.orgId;
      await this.documentsService.deleteDocument(id, orgId);

      res.json({ success: true, id });
    } catch (err) {
      next(err);
    }
  };
}

export const defaultDocumentsController = new DocumentsController();

