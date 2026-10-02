import { Router } from 'express';
import chatRoutes from '../modules/chat/chat.routes';
import analysisRoutes from '../modules/analysis/analysis.routes';
import dashboardRoutes from '../modules/dashboard/dashboard.routes';
import emailRoutes from '../modules/email/email.routes';
import downloadRoutes from '../modules/download/download.routes';
import healthRoutes from '../modules/health/health.routes';
import financialsRoutes from '../modules/financials/financials.routes';
import automationRoutes from '../modules/automation/automation.routes';
import integrationsRoutes from '../modules/integrations/integrations.routes';
import documentsRoutes from '../modules/documents/documents.routes';
import organizationRoutes from '../modules/organization/organization.routes';
import calendarRoutes from '../modules/calendar/calendar.routes';
import ecosystemRoutes from '../modules/ecosystem/ecosystem.routes';

const router = Router();

// Mount Health Check Routes
router.use('/', healthRoutes);

// Mount Modular API Routes under /api
router.use('/api', chatRoutes);
router.use('/api', analysisRoutes);
router.use('/api', dashboardRoutes);
router.use('/api', emailRoutes);
router.use('/api', downloadRoutes);
router.use('/api', financialsRoutes);
router.use('/api', automationRoutes);
router.use('/api', integrationsRoutes);
router.use('/api', documentsRoutes);
router.use('/api', organizationRoutes);
router.use('/api', calendarRoutes);
router.use('/api', ecosystemRoutes);

export default router;
