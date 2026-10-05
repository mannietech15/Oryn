import { Router } from 'express';
import { defaultOrganizationController } from './organization.controller';

const router = Router();

router.get('/organization', defaultOrganizationController.getOrganization);
router.put('/organization', defaultOrganizationController.updateCompany);
router.post('/organization/employees', defaultOrganizationController.addEmployee);
router.delete('/organization/employees/:id', defaultOrganizationController.removeEmployee);
router.delete('/organization/departments/:id', defaultOrganizationController.deleteDepartment);

export default router;
