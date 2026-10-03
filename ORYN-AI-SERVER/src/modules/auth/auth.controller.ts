import { Request, Response, NextFunction } from 'express';
import { AuthService, defaultAuthService } from './auth.service';

export class AuthController {
  constructor(private authService: AuthService = defaultAuthService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const session = await this.authService.login({ email, password });
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
      const { name, email, password, organization, role } = req.body;
      const session = await this.authService.register({ name, email, password, organization, role });
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
