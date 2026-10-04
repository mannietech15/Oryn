import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../shared/errors/app-error';

export type UserRole = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'OPERATOR' | 'AUDITOR' | 'VIEWER';

/**
 * Middleware to enforce Role-Based Access Control (RBAC).
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required to access this resource.'));
    }

    const userRole = (req.user.role || 'OPERATOR').toUpperCase() as UserRole;

    // SuperAdmin has bypass access to all operations
    if (userRole === 'SUPER_ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      return next(
        new ForbiddenError(
          `Access forbidden: Role '${userRole}' does not possess required privileges [${allowedRoles.join(', ')}].`
        )
      );
    }

    next();
  };
}

/**
 * Middleware ensuring an operation is scoped strictly to the requesting user's organization.
 */
export function enforceTenantIsolation(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required for tenancy verification.'));
  }

  // Inject user's orgId into request params or query if not present
  const targetOrgId = req.params.orgId || req.body.orgId || req.query.orgId;
  const userOrgId = (req.user as any).orgId;

  if (targetOrgId && userOrgId && targetOrgId !== userOrgId && req.user.role !== 'SUPER_ADMIN') {
    return next(new ForbiddenError('Access denied: Cross-organization data access is strictly prohibited.'));
  }

  next();
};
