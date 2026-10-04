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
    const cookieToken = (req as any).cookies?.oryn_access_token;
    const authHeader = req.headers.authorization;
    const token = cookieToken || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined);

    if (!token) {
      throw new UnauthorizedError('Authentication required. Missing session cookie or Bearer authorization token.');
    }

    const session = defaultAuthService.verifySession(token);
    req.user = session.user;
    next();
  } catch (err) {
    next(err);
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const cookieToken = (req as any).cookies?.oryn_access_token;
    const authHeader = req.headers.authorization;
    const token = cookieToken || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined);

    if (token) {
      const session = defaultAuthService.verifySession(token);
      req.user = session.user;
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
}
