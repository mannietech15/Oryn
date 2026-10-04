import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UnauthorizedError } from '../../shared/errors/app-error';

const JWT_SECRET = process.env.JWT_SECRET || 'oryn_jwt_super_secure_key_prod_2026_98x7a6b5c4d3e2f1';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'oryn_jwt_refresh_super_secure_key_prod_2026_1a2b3c4d5e6f7g8h';

export interface TokenPayload {
  userId: string;
  email: string;
  orgId: string;
  role: string;
}

export class TokenService {
  /**
   * Generates a short-lived access token (15 minutes).
   */
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  }

  /**
   * Generates a long-lived refresh token (7 days).
   */
  static generateRefreshToken(payload: Pick<TokenPayload, 'userId'>): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  }

  /**
   * Generates an opaque random token for HITL consent actions or email verifications.
   */
  static generateOpaqueToken(prefix = 'oryn_act_'): string {
    return `${prefix}${crypto.randomBytes(32).toString('hex')}`;
  }

  /**
   * Verifies an access token and returns the typed payload.
   */
  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Access token has expired.');
      }
      throw new UnauthorizedError('Invalid access token.');
    }
  }

  /**
   * Verifies a refresh token.
   */
  static verifyRefreshToken(token: string): Pick<TokenPayload, 'userId'> {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET) as Pick<TokenPayload, 'userId'>;
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token.');
    }
  }
}
