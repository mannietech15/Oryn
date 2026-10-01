import { Request, Response, NextFunction } from 'express';
import { ValidatorRule } from '../../shared/utils/validator';

export function validateBody<T>(rule: ValidatorRule<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = rule(req.body, 'body');
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function validateQuery<T>(rule: ValidatorRule<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.query = rule(req.query, 'query') as any;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function validateParams<T>(rule: ValidatorRule<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.params = rule(req.params, 'params') as any;
      next();
    } catch (err) {
      next(err);
    }
  };
}
