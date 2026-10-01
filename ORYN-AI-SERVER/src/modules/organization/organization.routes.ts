import { Router } from 'express';
import { defaultOrganizationController } from './organization.controller';

const router = Router();

router.get('/organization', defaultOrganizationController.getOrganization);
router.put('/organization', defaultOrganizationController.updateCompany);

export default router;
