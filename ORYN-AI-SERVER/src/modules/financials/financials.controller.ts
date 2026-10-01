import { Request, Response, NextFunction } from 'express';
import { defaultDatastore, Datastore } from '../../infrastructure/storage/datastore';
import { ValidationError } from '../../shared/errors/app-error';

export class FinancialsController {
  constructor(private datastore: Datastore = defaultDatastore) {}

  getLedger = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const entries = this.datastore.getFinancialEntries();
      const metrics = this.datastore.getFinancialMetrics();
      res.json({ entries, metrics });
    } catch (err) {
      next(err);
    }
  };

  addEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type, category, amount, date, note } = req.body;

      if (!type || !['revenue', 'expense'].includes(type)) {
        throw new ValidationError("Field 'type' must be 'revenue' or 'expense'");
      }
      if (!category || typeof category !== 'string') {
        throw new ValidationError("Field 'category' is required");
      }
      if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
        throw new ValidationError("Field 'amount' must be a positive number");
      }

      const entry = this.datastore.addFinancialEntry({
        type,
        category,
        amount,
        date: date || new Date().toISOString().split('T')[0],
        note: note || ''
      });

      const metrics = this.datastore.getFinancialMetrics();
      res.status(201).json({ entry, metrics });
    } catch (err) {
      next(err);
    }
  };
}

export const defaultFinancialsController = new FinancialsController();
