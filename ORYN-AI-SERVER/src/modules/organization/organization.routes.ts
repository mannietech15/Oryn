import { Router } from 'express';
import { defaultOrganizationController } from './organization.controller';

const router = Router();

router.get('/organization', defaultOrganizationController.getOrganization);
router.put('/organization', defaultOrganizationController.updateCompany);
router.post('/organization/employees', defaultOrganizationController.addEmployee);

export default router;
