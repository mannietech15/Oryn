export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  location?: string;
  industry?: string;
  avatar?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface AuthSessionData {
  token: string;
  user: UserProfile;
  expiresAt: string;
}

const TOKEN_KEY = 'oryn_auth_token';
const USER_KEY = 'oryn_auth_user';
const LOGGED_OUT_KEY = 'oryn_auth_logged_out';

export class ClientAuthService {
  private token: string | null = null;
  private user: UserProfile | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);
      if (savedUser) {
        try {
          this.user = JSON.parse(savedUser);
        } catch {
          this.user = null;
        }
      }
    }
  }

  public getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem(TOKEN_KEY);
    }
    return this.token;
  }

  public getUser(): UserProfile | null {
    if (!this.user && typeof window !== 'undefined') {
      const saved = localStorage.getItem(USER_KEY);
      if (saved) {
        try {
          this.user = JSON.parse(saved);
        } catch {
          /* noop */
        }
      }
    }
    return this.user;
  }

  public isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      const isLoggedOut = localStorage.getItem(LOGGED_OUT_KEY) === 'true';
      if (isLoggedOut) return false;
      return !!this.getToken() || !!this.getUser();
    }
    return false;
  }

  public async login(email: string, password: string): Promise<AuthSessionData> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Authentication failed. Please verify your credentials.');
    }

    const session: AuthSessionData = data.data;
    this.setSession(session.token, session.user);
    return session;
  }

  public async register(payload: {
    name: string;
    email: string;
    password: string;
    organization?: string;
    location?: string;
    industry?: string;
  }): Promise<AuthSessionData> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Registration failed.');
    }

    const session: AuthSessionData = data.data;
    this.setSession(session.token, session.user);
    return session;
  }

  public async logout(): Promise<void> {
    const token = this.getToken();
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });
    } catch {
      // Continue clearing client session even if network is offline
    }
    this.clearSession();
  }

  public async getMe(): Promise<UserProfile | null> {
    const token = this.getToken();

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
      if (response.ok) {
        const res = await response.json();
        if (res.data?.user) {
          const fetchedUser: UserProfile = res.data.user;
          this.user = fetchedUser;
          localStorage.setItem(USER_KEY, JSON.stringify(fetchedUser));
          if (fetchedUser.name) localStorage.setItem('oryn_profile_name', fetchedUser.name);
          if (fetchedUser.email) localStorage.setItem('oryn_profile_email', fetchedUser.email);
          if (fetchedUser.location) localStorage.setItem('oryn_profile_location', fetchedUser.location);
          if (fetchedUser.industry) localStorage.setItem('oryn_profile_industry', fetchedUser.industry);
          return fetchedUser;
        }
      }
    } catch {
      // Retain existing cached user if offline
    }
    return this.getUser();
  }

  public setSession(token: string, user: UserProfile): void {
    this.token = token;
    this.user = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      if (user.name) localStorage.setItem('oryn_profile_name', user.name);
      if (user.email) localStorage.setItem('oryn_profile_email', user.email);
      if (user.location) localStorage.setItem('oryn_profile_location', user.location);
      if (user.industry) localStorage.setItem('oryn_profile_industry', user.industry);
      localStorage.removeItem(LOGGED_OUT_KEY);
    }
  }

  public clearSession(): void {
    this.token = null;
    this.user = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem('oryn_profile_name');
      localStorage.removeItem('oryn_profile_email');
      localStorage.removeItem('oryn_profile_location');
      localStorage.removeItem('oryn_profile_industry');
      localStorage.setItem(LOGGED_OUT_KEY, 'true');
    }
  }
}

export const authService = new ClientAuthService();
