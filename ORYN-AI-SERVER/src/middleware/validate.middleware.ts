import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../shared/errors/app-error';

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        const errorMessages = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return next(new ValidationError(`Validation failed: ${errorMessages}`));
      }
      next(err);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      (req as any).query = schema.parse(req.query);
      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        const errorMessages = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return next(new ValidationError(`Query validation failed: ${errorMessages}`));
      }
      next(err);
    }
  };
}
