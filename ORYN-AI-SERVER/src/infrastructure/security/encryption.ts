import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Derives a consistent 32-byte encryption key from the environment secret.
 */
function getMasterKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || 'oryn_enterprise_master_key_default_32bytes_sec!';
  return crypto.createHash('sha256').update(secret).digest();
}

export interface EncryptedPayload {
  encryptedKey: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypts sensitive text using AES-256-GCM.
 */
export function encryptSecret(plainText: string): EncryptedPayload {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getMasterKey(), iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encryptedKey: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

/**
 * Decrypts an AES-256-GCM encrypted payload.
 */
export function decryptSecret(payload: EncryptedPayload): string {
  const iv = Buffer.from(payload.iv, 'hex');
  const authTag = Buffer.from(payload.authTag, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, getMasterKey(), iv);

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(payload.encryptedKey, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
