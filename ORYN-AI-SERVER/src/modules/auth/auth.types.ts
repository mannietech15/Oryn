export type UserRole = 'Verified Administrator' | 'Enterprise Administrator' | 'Quantitative Analyst' | 'Member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  avatar?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface UserCredentials {
  email: string;
  passwordHash: string;
  salt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  organization?: string;
  role?: UserRole;
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    user: User;
    expiresAt: string;
  };
}
