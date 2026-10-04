import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('A valid corporate email address is required.').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must contain at least 2 characters.').trim(),
  email: z.string().email('A valid corporate email address is required.').trim().toLowerCase(),
  password: z.string().min(8, 'Production password must contain at least 8 characters.'),
  organization: z.string().min(2, 'Organization name must contain at least 2 characters.').optional(),
  role: z.enum(['SUPER_ADMIN', 'ORG_ADMIN', 'OPERATOR', 'AUDITOR', 'VIEWER']).optional(),
  location: z.string().optional(),
  industry: z.string().optional(),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required.'),
});
