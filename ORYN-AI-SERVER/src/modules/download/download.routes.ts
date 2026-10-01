import { Router } from 'express';
import { defaultDownloadController } from './download.controller';
import { validateQuery } from '../../app/middleware/validate';
import { downloadQuerySchema } from './download.schemas';

const router = Router();

router.get('/download', validateQuery(downloadQuerySchema), defaultDownloadController.download);

export default router;
