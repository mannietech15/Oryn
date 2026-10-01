import { ErrorCode } from './error-codes';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    statusCode = 500,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    isOperational = true,
    details?: Record<string, any>
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 400, ErrorCode.VALIDATION_ERROR, true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details?: Record<string, any>) {
    super(message, 404, ErrorCode.NOT_FOUND, true, details);
  }
}

export class ProviderError extends AppError {
  public readonly provider: string;
  public readonly retryable: boolean;

  constructor(
    message: string,
    provider: string,
    code: ErrorCode = ErrorCode.PROVIDER_ERROR,
    statusCode = 502,
    retryable = false
  ) {
    super(message, statusCode, code, true, { provider, retryable });
    this.provider = provider;
    this.retryable = retryable;
  }
}

export class SecurityError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.AUTHORIZATION_ERROR) {
    super(message, 403, code, true);
  }
}
