import { test, describe, it } from 'node:test';
import assert from 'node:assert';
import {
  AppError,
  ValidationError,
  SecurityError,
  NotFoundError,
  ProviderError,
} from '../../src/shared/errors/app-error';
import { ErrorCode } from '../../src/shared/errors/error-codes';

describe('AppError Hierarchy', () => {
  it('should initialize AppError with status code and error code', () => {
    const error = new AppError('Custom error', 400, ErrorCode.BAD_REQUEST, true, { detail: 123 });
    assert.strictEqual(error.message, 'Custom error');
    assert.strictEqual(error.statusCode, 400);
    assert.strictEqual(error.code, ErrorCode.BAD_REQUEST);
    assert.strictEqual(error.isOperational, true);
    assert.deepStrictEqual(error.details, { detail: 123 });
  });

  it('should initialize ValidationError with 400 and VALIDATION_ERROR code', () => {
    const error = new ValidationError('Invalid email format', { field: 'email' });
    assert.strictEqual(error.statusCode, 400);
    assert.strictEqual(error.code, ErrorCode.VALIDATION_ERROR);
    assert.strictEqual(error.name, 'ValidationError');
    assert.strictEqual(error.message, 'Invalid email format');
    assert.deepStrictEqual(error.details, { field: 'email' });
  });

  it('should initialize NotFoundError with 404', () => {
    const error = new NotFoundError('User not found');
    assert.strictEqual(error.statusCode, 404);
    assert.strictEqual(error.code, ErrorCode.NOT_FOUND);
    assert.strictEqual(error.name, 'NotFoundError');
  });

  it('should initialize ProviderError with provider name details', () => {
    const error = new ProviderError('Rate limit exceeded', 'nvidia', ErrorCode.PROVIDER_RATE_LIMITED);
    assert.strictEqual(error.statusCode, 502);
    assert.strictEqual(error.code, ErrorCode.PROVIDER_RATE_LIMITED);
    assert.strictEqual(error.provider, 'nvidia');
    assert.strictEqual(error.name, 'ProviderError');
  });

  it('should initialize SecurityError with 403', () => {
    const error = new SecurityError('Access denied', ErrorCode.AUTHORIZATION_ERROR);
    assert.strictEqual(error.statusCode, 403);
    assert.strictEqual(error.code, ErrorCode.AUTHORIZATION_ERROR);
    assert.strictEqual(error.name, 'SecurityError');
  });
});
