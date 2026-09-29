import { Router } from 'express';
import chatRoutes from './chat.routes';
import dashboardRoutes from './dashboard.routes';
import emailRoutes from './email.routes';
import analysisRoutes from './analysis.routes';
import downloadRoutes from './download.routes';

const router = Router();

router.use('/api', chatRoutes);
router.use('/api', dashboardRoutes);
router.use('/api', emailRoutes);
router.use('/api', analysisRoutes);
router.use('/api', downloadRoutes);

export default router;
