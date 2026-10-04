import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PasswordService } from '../src/infrastructure/security/password.service';
import { TokenService } from '../src/infrastructure/security/token.service';
import { encryptSecret, decryptSecret } from '../src/infrastructure/security/encryption';
import { LoginSchema, RegisterSchema } from '../src/shared/validators/auth.validator';

describe('Production Security & Auth Suite', () => {
  it('should hash and verify passwords with Argon2/PBKDF2 securely', async () => {
    const password = 'SuperSecretEnterprisePassword2026!';
    const hash = await PasswordService.hash(password);

    assert.ok(hash.length > 20, 'Hash should be generated');
    const isMatch = await PasswordService.verify(password, hash);
    assert.strictEqual(isMatch, true, 'Correct password must verify');

    const isWrongMatch = await PasswordService.verify('WrongPassword123', hash);
    assert.strictEqual(isWrongMatch, false, 'Incorrect password must be rejected');
  });

  it('should generate and verify JWT access and refresh tokens', () => {
    const payload = {
      userId: 'usr_enterprise_001',
      email: 'founder@oryn.ai',
      orgId: 'org_core_99',
      role: 'SUPER_ADMIN',
    };

    const accessToken = TokenService.generateAccessToken(payload);
    assert.ok(accessToken.length > 30, 'Access token should be created');

    const verified = TokenService.verifyAccessToken(accessToken);
    assert.strictEqual(verified.email, payload.email);
    assert.strictEqual(verified.role, payload.role);
    assert.strictEqual(verified.orgId, payload.orgId);

    const refreshToken = TokenService.generateRefreshToken({ userId: payload.userId });
    const verifiedRefresh = TokenService.verifyRefreshToken(refreshToken);
    assert.strictEqual(verifiedRefresh.userId, payload.userId);
  });

  it('should encrypt and decrypt secrets with AES-256-GCM', () => {
    const secret = 'nvapi-SuperSecretNvidiaApiKeyForInference';
    const encrypted = encryptSecret(secret);

    assert.ok(encrypted.encryptedKey, 'Encrypted ciphertext exists');
    assert.ok(encrypted.iv, 'IV exists');
    assert.ok(encrypted.authTag, 'Auth tag exists');
    assert.notStrictEqual(encrypted.encryptedKey, secret);

    const decrypted = decryptSecret(encrypted);
    assert.strictEqual(decrypted, secret, 'Decrypted secret must match original plaintext');
  });

  it('should validate inputs using Zod schemas', () => {
    // Valid login
    const validLogin = LoginSchema.safeParse({
      email: 'admin@oryn.ai',
      password: 'password123',
    });
    assert.strictEqual(validLogin.success, true);

    // Invalid email login
    const invalidEmail = LoginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    assert.strictEqual(invalidEmail.success, false);

    // Valid register
    const validRegister = RegisterSchema.safeParse({
      name: 'Sarah Connor',
      email: 'sarah@oryn.ai',
      password: 'StrongPassword2026!',
      organization: 'Cyberdyne Systems',
      role: 'ORG_ADMIN',
    });
    assert.strictEqual(validRegister.success, true);

    // Short password rejection
    const shortPassword = RegisterSchema.safeParse({
      name: 'Sarah Connor',
      email: 'sarah@oryn.ai',
      password: 'short',
    });
    assert.strictEqual(shortPassword.success, false);
  });
});
