import { Router } from 'express';
import { DownloadController } from '../controllers/download.controller';

const router = Router();
router.get('/download', DownloadController.download);
export default router;
