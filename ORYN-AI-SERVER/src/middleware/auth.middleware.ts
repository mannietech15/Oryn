import { Request, Response, NextFunction } from 'express';
import { defaultAuthService } from '../modules/auth/auth.service';
import { UnauthorizedError } from '../shared/errors/app-error';
import { User } from '../modules/auth/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Bearer authentication token missing in Authorization header.');
    }

    const token = authHeader.substring(7);
    const session = defaultAuthService.verifySession(token);
    req.user = session.user;
    next();
  } catch (err) {
    next(err);
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const session = defaultAuthService.verifySession(token);
      req.user = session.user;
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
}
