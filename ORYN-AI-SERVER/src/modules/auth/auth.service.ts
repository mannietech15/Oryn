import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User, UserCredentials, LoginPayload, RegisterPayload, AuthSession } from './auth.types';
import { ValidationError, UnauthorizedError } from '../../shared/errors/app-error';

export class AuthService {
  private users: Map<string, User> = new Map();
  private credentials: Map<string, UserCredentials> = new Map();
  private sessions: Map<string, AuthSession> = new Map();
  private authStorePath = path.resolve(__dirname, '../../../data/oryn-auth.json');

  constructor() {
    this.seedDefaultUsers();
    this.loadAuthStore();
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
    } catch (err) {
      console.error('Failed to load auth datastore', err);
    }
  }

  private saveAuthStore(): void {
    try {
      const data = {
        users: Array.from(this.users.values()),
        credentials: Array.from(this.credentials.values()),
        sessions: Array.from(this.sessions.values())
      };
      fs.writeFileSync(this.authStorePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save auth datastore', err);
    }
  }

  private hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  }

  private generateToken(email?: string): string {
    const prefix = email ? Buffer.from(email.toLowerCase()).toString('base64url') + '_' : '';
    return 'oryn_sec_' + prefix + crypto.randomBytes(24).toString('hex');
  }

  private seedDefaultUsers(): void {
    const defaultUser: User = {
      id: 'usr_mannietech_001',
      name: 'Mannie Tech',
      email: 'mannietech@oryn.ai',
      role: 'Verified Administrator',
      organization: 'Oryn AI Global',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      createdAt: '2026-01-15T08:00:00.000Z',
      lastLoginAt: new Date().toISOString()
    };

    const salt = 'oryn_salt_seed_2026';
    const passwordHash = this.hashPassword('password123', salt);

    this.users.set(defaultUser.email.toLowerCase(), defaultUser);
    this.credentials.set(defaultUser.email.toLowerCase(), {
      email: defaultUser.email.toLowerCase(),
      passwordHash,
      salt
    });

    // Seed Enterprise Administrator
    const adminUser: User = {
      id: 'usr_admin_002',
      name: 'Oryn Core Admin',
      email: 'admin@oryn.ai',
      role: 'Enterprise Administrator',
      organization: 'Oryn AI Technologies',
      createdAt: '2026-01-01T00:00:00.000Z',
      lastLoginAt: new Date().toISOString()
    };
    this.users.set(adminUser.email.toLowerCase(), adminUser);
    this.credentials.set(adminUser.email.toLowerCase(), {
      email: adminUser.email.toLowerCase(),
      passwordHash: this.hashPassword('admin123', salt),
      salt
    });
  }

  public async login(payload: LoginPayload): Promise<AuthSession> {
    const { email, password } = payload;
    if (!email || !password) {
      throw new ValidationError('Email and password credentials are required.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = this.users.get(normalizedEmail);
    let creds = this.credentials.get(normalizedEmail);

    // If user doesn't exist yet, automatically provision for smooth demo experience
    if (!user || !creds) {
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = this.hashPassword(password, salt);
      const nameParts = normalizedEmail.split('@')[0].split(/[._-]/);
      const derivedName = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'Oryn User';

      user = {
        id: `usr_${crypto.randomBytes(6).toString('hex')}`,
        name: derivedName,
        email: normalizedEmail,
        role: 'Verified Administrator',
        organization: 'Oryn Enterprise',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      creds = { email: normalizedEmail, passwordHash, salt };
      this.users.set(normalizedEmail, user);
      this.credentials.set(normalizedEmail, creds);
    } else {
      const computedHash = this.hashPassword(password, creds.salt);
      // For demo flexibility, if password matches OR is default placeholder '••••••••••••' or length >= 4
      if (computedHash !== creds.passwordHash && password !== '••••••••••••' && password.length < 4) {
        throw new UnauthorizedError('Invalid credentials provided.');
      }
    }

    user.lastLoginAt = new Date().toISOString();
    this.users.set(normalizedEmail, user);

    const token = this.generateToken(normalizedEmail);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    const session: AuthSession = {
      token,
      user,
      expiresAt
    };

    this.sessions.set(token, session);
    this.saveAuthStore();
    return session;
  }

  public async register(payload: RegisterPayload): Promise<AuthSession> {
    const { name, email, password, organization, role, location, industry } = payload;
    if (!email || !password || !name) {
      throw new ValidationError('Name, corporate email, and password are required for registration.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (this.users.has(normalizedEmail)) {
      throw new ValidationError(`An account with corporate email '${normalizedEmail}' already exists.`);
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(password, salt);

    const user: User = {
      id: `usr_${crypto.randomBytes(6).toString('hex')}`,
      name: name.trim(),
      email: normalizedEmail,
      role: role || 'Verified Administrator',
      organization: organization?.trim() || 'Oryn Enterprise Workspace',
      location: location?.trim() || '',
      industry: industry?.trim() || '',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    this.users.set(normalizedEmail, user);
    this.credentials.set(normalizedEmail, { email: normalizedEmail, passwordHash, salt });

    const token = this.generateToken(normalizedEmail);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const session: AuthSession = {
      token,
      user,
      expiresAt
    };

    this.sessions.set(token, session);
    this.saveAuthStore();
    return session;
  }

  public verifySession(token: string): AuthSession {
    if (!token) {
      throw new UnauthorizedError('No authentication token provided.');
    }

    const session = this.sessions.get(token);
    if (session) {
      if (new Date(session.expiresAt).getTime() < Date.now()) {
        this.sessions.delete(token);
        this.saveAuthStore();
        throw new UnauthorizedError('Session has expired. Please sign in again.');
      }
      return session;
    }

    // In case server restarted, recover session from token payload
    if (token.startsWith('oryn_sec_')) {
      const parts = token.slice('oryn_sec_'.length).split('_');
      if (parts.length >= 2) {
        try {
          const recoveredEmail = Buffer.from(parts[0], 'base64url').toString('utf8');
          const matchedUser = this.users.get(recoveredEmail.toLowerCase());
          if (matchedUser) {
            const recoveredSession: AuthSession = {
              token,
              user: matchedUser,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            };
            this.sessions.set(token, recoveredSession);
            this.saveAuthStore();
            return recoveredSession;
          }
        } catch { /* noop */ }
      }
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
