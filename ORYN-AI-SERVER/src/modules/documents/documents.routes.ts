import { Router } from 'express';
import { defaultDocumentsController } from './documents.controller';
import { upload } from '../../infrastructure/storage/upload';

const router = Router();

router.get('/documents', defaultDocumentsController.getDocuments);
router.post('/documents/upload', upload.single('file'), defaultDocumentsController.uploadAndAnalyze);
router.delete('/documents/:id', defaultDocumentsController.deleteDocument);

export default router;
