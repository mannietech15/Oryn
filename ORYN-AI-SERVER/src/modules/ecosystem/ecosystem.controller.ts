import { Request, Response, NextFunction } from 'express';
import { defaultDatastore, Datastore } from '../../infrastructure/storage/datastore';
import { ValidationError, NotFoundError } from '../../shared/errors/app-error';

export class EcosystemController {
  constructor(private datastore: Datastore = defaultDatastore) {}

  getEcosystem = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = this.datastore.getEcosystemData();
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  joinCommunity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updated = this.datastore.toggleCommunityJoin(id);
      if (!updated) throw new NotFoundError(`Community '${id}' not found`);

      res.json(updated);
    } catch (err) {
      next(err);
    }
  };

  connectBusiness = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updated = this.datastore.toggleBusinessConnect(id);
      if (!updated) throw new NotFoundError(`Business '${id}' not found`);

      res.json(updated);
    } catch (err) {
      next(err);
    }
  };

  createCommunity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, description, tags, icon } = req.body;
      if (!name || typeof name !== 'string') {
        throw new ValidationError("Field 'name' is required");
      }
      if (!description || typeof description !== 'string') {
        throw new ValidationError("Field 'description' is required");
      }

      const created = this.datastore.addCommunity({
        name,
        description,
        tags: Array.isArray(tags) ? tags : ['Ecosystem'],
        icon: icon || '🌐'
      });

      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  };
}

export const defaultEcosystemController = new EcosystemController();
