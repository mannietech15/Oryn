import { Router } from 'express';
import chatRoutes from '../modules/chat/chat.routes';
import analysisRoutes from '../modules/analysis/analysis.routes';
import dashboardRoutes from '../modules/dashboard/dashboard.routes';
import emailRoutes from '../modules/email/email.routes';
import downloadRoutes from '../modules/download/download.routes';
import healthRoutes from '../modules/health/health.routes';

const router = Router();

// Mount Health Check Routes
router.use('/', healthRoutes);

// Mount Modular API Routes under /api
router.use('/api', chatRoutes);
router.use('/api', analysisRoutes);
router.use('/api', dashboardRoutes);
router.use('/api', emailRoutes);
router.use('/api', downloadRoutes);

export default router;
