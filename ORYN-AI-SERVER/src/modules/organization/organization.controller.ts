import { Request, Response, NextFunction } from 'express';
import { defaultDatastore, Datastore } from '../../infrastructure/storage/datastore';

export class OrganizationController {
  constructor(private datastore: Datastore = defaultDatastore) {}

  getOrganization = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const org = this.datastore.getOrganization();
      res.json(org);
    } catch (err) {
      next(err);
    }
  };

  updateCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { company, employees, teams } = req.body;
      const patch: any = {};
      if (company) patch.company = company;
      if (employees) patch.employees = employees;
      if (teams) patch.teams = teams;

      const updated = this.datastore.updateOrganization(patch);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };
}

export const defaultOrganizationController = new OrganizationController();
