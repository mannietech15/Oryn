import { Router } from 'express';
import { AnalysisController } from '../controllers/analysis.controller';
import { upload } from '../middleware/upload';

const router = Router();
router.post('/analyze', upload.single('file'), AnalysisController.analyze);
export default router;
