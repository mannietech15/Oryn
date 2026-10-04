import { Request, Response, NextFunction } from 'express';
import { OrganizationService, defaultOrganizationService } from './organization.service';
import { ValidationError } from '../../shared/errors/app-error';

export class OrganizationController {
  constructor(private organizationService: OrganizationService = defaultOrganizationService) {}

  getOrganization = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = (req as any).user?.orgId;
      const org = await this.organizationService.getOrganization(orgId);
      res.json(org);
    } catch (err) {
      next(err);
    }
  };

  updateCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { company, employees, teams } = req.body;
      const orgId = (req as any).user?.orgId;

      const updated = await this.organizationService.updateCompany({
        orgId,
        company,
        employees,
        teams,
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  };

  addEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, role } = req.body;
      if (!name || !email) {
        throw new ValidationError('Name and email are required to add a team member.');
      }
      const orgId = (req as any).user?.orgId;
      const created = await this.organizationService.addEmployee({ name, email, role, orgId });
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  };
}

export const defaultOrganizationController = new OrganizationController();
