import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User, UserCredentials, LoginPayload, RegisterPayload, AuthSession } from './auth.types';
import { ValidationError, UnauthorizedError } from '../../shared/errors/app-error';
import { PasswordService } from '../../infrastructure/security/password.service';
import { TokenService } from '../../infrastructure/security/token.service';
import { prisma } from '../../infrastructure/database/prisma';
import { Logger } from '../../infrastructure/logging/logger';

const logger = new Logger('AuthService');

export class AuthService {
  private users: Map<string, User> = new Map();
  private credentials: Map<string, UserCredentials> = new Map();
  private sessions: Map<string, AuthSession> = new Map();
  private authStorePath = path.resolve(__dirname, '../../../data/oryn-auth.json');
  private isDatabaseReady = false;

  constructor() {
    this.seedDefaultUsers();
    this.loadAuthStore();
    this.initDatabase().catch((err) => {
      logger.warn('PostgreSQL database not yet synced, running on secured persistent cache', { error: err.message });
    });
  }

  private async initDatabase(): Promise<void> {
    try {
      await prisma.$connect();
      this.isDatabaseReady = true;
      logger.info('AuthService connected to PostgreSQL');
    } catch {
      this.isDatabaseReady = false;
    }
  }

  private loadAuthStore(): void {
    try {
      if (fs.existsSync(this.authStorePath)) {
        const raw = fs.readFileSync(this.authStorePath, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.users)) {
          data.users.forEach((u: User) => {
            if (u.email) this.users.set(u.email.toLowerCase(), u);
          });
        }
        if (Array.isArray(data.credentials)) {
          data.credentials.forEach((c: UserCredentials) => {
            if (c.email) this.credentials.set(c.email.toLowerCase(), c);
          });
        }
        if (Array.isArray(data.sessions)) {
          data.sessions.forEach((s: AuthSession) => {
            if (s.token && new Date(s.expiresAt).getTime() > Date.now()) {
              this.sessions.set(s.token, s);
            }
          });
        }
      }
    } catch (err: any) {
      logger.error('Failed to load auth datastore', { error: err.message });
    }
  }

  private saveAuthStore(): void {
    try {
      const data = {
        users: Array.from(this.users.values()),
        credentials: Array.from(this.credentials.values()),
        sessions: Array.from(this.sessions.values()),
      };
      fs.writeFileSync(this.authStorePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err: any) {
      logger.error('Failed to save auth datastore', { error: err.message });
    }
  }

  private async seedDefaultUsers(): Promise<void> {
    const defaultUser: User = {
      id: 'usr_mannietech_001',
      name: 'Mannie Tech',
      email: 'mannietech@oryn.ai',
      role: 'SUPER_ADMIN',
      organization: 'Oryn AI Global',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      createdAt: '2026-01-15T08:00:00.000Z',
      lastLoginAt: new Date().toISOString(),
    };

    const passwordHash = await PasswordService.hash('password123');

    this.users.set(defaultUser.email.toLowerCase(), defaultUser);
    this.credentials.set(defaultUser.email.toLowerCase(), {
      email: defaultUser.email.toLowerCase(),
      passwordHash,
      salt: 'argon2_managed',
    });

    const adminUser: User = {
      id: 'usr_admin_002',
      name: 'Oryn Core Admin',
      email: 'admin@oryn.ai',
      role: 'ORG_ADMIN',
      organization: 'Oryn AI Technologies',
      createdAt: '2026-01-01T00:00:00.000Z',
      lastLoginAt: new Date().toISOString(),
    };

    const adminHash = await PasswordService.hash('admin123');
    this.users.set(adminUser.email.toLowerCase(), adminUser);
    this.credentials.set(adminUser.email.toLowerCase(), {
      email: adminUser.email.toLowerCase(),
      passwordHash: adminHash,
      salt: 'argon2_managed',
    });
  }

  public async login(payload: LoginPayload): Promise<AuthSession> {
    const { email, password } = payload;
    if (!email || !password) {
      throw new ValidationError('Corporate email and password credentials are required.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = this.users.get(normalizedEmail);
    const creds = this.credentials.get(normalizedEmail);

    if (!user || !creds) {
      throw new UnauthorizedError('Invalid email or password provided.');
    }

    const isValid = await PasswordService.verify(password, creds.passwordHash);
    if (!isValid) {
      logger.warn(`Failed login attempt for email: ${normalizedEmail}`);
      throw new UnauthorizedError('Invalid email or password provided.');
    }

    user.lastLoginAt = new Date().toISOString();
    this.users.set(normalizedEmail, user);

    const token = TokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
      orgId: (user as any).orgId || 'org_default',
      role: user.role || 'OPERATOR',
    });

    const refreshToken = TokenService.generateRefreshToken({ userId: user.id });
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    const session: AuthSession = {
      token,
      user,
      expiresAt,
    };

    this.sessions.set(token, session);
    this.saveAuthStore();

    logger.info(`User successfully authenticated: ${normalizedEmail} [${user.role}]`);
    return session;
  }

  public async register(payload: RegisterPayload): Promise<AuthSession> {
    const { name, email, password, organization, role, location, industry } = payload;
    if (!email || !password || !name) {
      throw new ValidationError('Full name, corporate email, and password are required.');
    }

    if (password.length < 8) {
      throw new ValidationError('Password must contain at least 8 characters.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (this.users.has(normalizedEmail)) {
      throw new ValidationError(`An account with corporate email '${normalizedEmail}' already exists.`);
    }

    const passwordHash = await PasswordService.hash(password);

    const user: User = {
      id: `usr_${crypto.randomBytes(8).toString('hex')}`,
      name: name.trim(),
      email: normalizedEmail,
      role: role || 'OPERATOR',
      organization: organization?.trim() || 'Oryn Enterprise Workspace',
      location: location?.trim() || '',
      industry: industry?.trim() || '',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    this.users.set(normalizedEmail, user);
    this.credentials.set(normalizedEmail, {
      email: normalizedEmail,
      passwordHash,
      salt: 'argon2_managed',
    });

    const token = TokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
      orgId: (user as any).orgId || 'org_default',
      role: user.role || 'OPERATOR',
    });

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const session: AuthSession = {
      token,
      user,
      expiresAt,
    };

    this.sessions.set(token, session);
    this.saveAuthStore();

    logger.info(`New user registered: ${normalizedEmail} [${user.role}]`);
    return session;
  }

  public verifySession(token: string): AuthSession {
    if (!token) {
      throw new UnauthorizedError('No authentication token provided.');
    }

    // First verify JWT signature & expiration
    try {
      const decoded = TokenService.verifyAccessToken(token);
      const user = this.users.get(decoded.email.toLowerCase());
      if (user) {
        return {
          token,
          user,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        };
      }
    } catch (err: any) {
      // Check memory session fallback
      const session = this.sessions.get(token);
      if (session && new Date(session.expiresAt).getTime() > Date.now()) {
        return session;
      }
      throw new UnauthorizedError(err.message || 'Session expired or invalid.');
    }

    throw new UnauthorizedError('Session expired or invalid token.');
  }

  public logout(token: string): boolean {
    if (token) {
      this.sessions.delete(token);
      this.saveAuthStore();
    }
    return true;
  }

  public getUserProfile(token: string): User {
    const session = this.verifySession(token);
    return session.user;
  }
}

export const defaultAuthService = new AuthService();
