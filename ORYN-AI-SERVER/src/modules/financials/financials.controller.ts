import { Request, Response, NextFunction } from 'express';
import { FinancialsService, defaultFinancialsService } from './financials.service';
import { ValidationError } from '../../shared/errors/app-error';

export class FinancialsController {
  constructor(private financialsService: FinancialsService = defaultFinancialsService) {}

  getLedger = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = (req as any).user?.orgId;
      const range = req.query.range as string | undefined;
      const data = await this.financialsService.getLedger(orgId, range);
      res.json(data);
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

      const orgId = (req as any).user?.orgId;
      const result = await this.financialsService.addEntry({
        type,
        category,
        amount,
        date,
        note,
        orgId,
      });

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };
}

export const defaultFinancialsController = new FinancialsController();
