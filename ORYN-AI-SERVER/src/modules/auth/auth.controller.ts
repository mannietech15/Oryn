import { Request, Response, NextFunction } from 'express';
import { AuthService, defaultAuthService } from './auth.service';
import { defaultDatastore } from '../../infrastructure/storage/datastore';

export class AuthController {
  constructor(private authService: AuthService = defaultAuthService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const session = await this.authService.login({ email, password });
      if (session.user.organization) {
        const currentOrg = defaultDatastore.getOrganization();
        if (!currentOrg?.company?.name || currentOrg.company.name === 'Oryn AI Corp') {
          const baseCompany = currentOrg?.company || {
            industry: 'Enterprise AI & Workflow Systems',
            location: 'HQ: Global',
            foundedDate: new Date().toISOString().split('T')[0]
          };
          defaultDatastore.updateOrganization({
            company: {
              ...baseCompany,
              name: session.user.organization
            }
          });
        }
      }
      res.status(200).json({
        success: true,
        message: 'Successfully authenticated with Oryn Gateway.',
        data: session
      });
    } catch (err) {
      next(err);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password, organization, role, location, industry } = req.body;
      const session = await this.authService.register({ name, email, password, organization, role, location, industry });
      if (session.user.organization) {
        const currentOrg = defaultDatastore.getOrganization();
        const baseCompany = currentOrg?.company || {
          industry: industry ? industry.trim() : 'Technology & Workflow Automation',
          location: location ? location.trim() : 'HQ: Global Remote',
          foundedDate: new Date().toISOString().split('T')[0]
        };
        defaultDatastore.updateOrganization({
          company: {
            ...baseCompany,
            name: session.user.organization,
            location: location && location.trim() ? location.trim() : (session.user.location || baseCompany.location),
            industry: industry && industry.trim() ? industry.trim() : (session.user.industry || baseCompany.industry)
          }
        });
      }
      res.status(201).json({
        success: true,
        message: 'Corporate workspace identity registered successfully.',
        data: session
      });
    } catch (err) {
      next(err);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.query.token as string);
      const user = this.authService.getUserProfile(token);
      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (err) {
      next(err);
    }
  };

  session = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.query.token as string);
      const session = this.authService.verifySession(token);
      res.status(200).json({
        success: true,
        data: session
      });
    } catch (err) {
      next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.body?.token as string);
      if (token) {
        this.authService.logout(token);
      }
      res.status(200).json({
        success: true,
        message: 'Session revoked. User safely signed out.'
      });
    } catch (err) {
      next(err);
    }
  };
}

export const defaultAuthController = new AuthController();
