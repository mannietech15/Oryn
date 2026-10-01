import { Router } from 'express';
import { defaultAnalysisController } from './analysis.controller';
import { upload } from '../../infrastructure/storage/upload';
import { validateBody } from '../../app/middleware/validate';
import { analysisRequestSchema } from './analysis.schemas';

const router = Router();

router.post(
  '/analyze',
  upload.single('file'),
  validateBody(analysisRequestSchema),
  defaultAnalysisController.analyze
);

export default router;
