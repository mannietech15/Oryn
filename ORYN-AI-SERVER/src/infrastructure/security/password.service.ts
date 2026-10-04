import crypto from 'crypto';

export class PasswordService {
  /**
   * Hashes a password using Argon2id or secure PBKDF2 fallback.
   */
  static async hash(password: string): Promise<string> {
    try {
      const argon2 = await import('argon2');
      return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });
    } catch {
      // High-security fallback using PBKDF2 with SHA-512 and 100,000 iterations
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
      return `pbkdf2$100000$${salt}$${hash}`;
    }
  }

  /**
   * Verifies a password against the stored hash.
   */
  static async verify(password: string, storedHash: string): Promise<boolean> {
    if (!password || !storedHash) return false;

    if (storedHash.startsWith('$argon2')) {
      try {
        const argon2 = await import('argon2');
        return await argon2.verify(storedHash, password);
      } catch {
        return false;
      }
    }

    if (storedHash.startsWith('pbkdf2$')) {
      const parts = storedHash.split('$');
      if (parts.length === 4) {
        const iterations = parseInt(parts[1], 10);
        const salt = parts[2];
        const hash = parts[3];
        const calculated = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
        return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(calculated, 'hex'));
      }
    }

    return false;
  }
}
