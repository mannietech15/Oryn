import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/app-error';
import { Logger } from '../../infrastructure/logging/logger';

const logger = new Logger('ErrorHandler');

export function errorHandler(
  err: Error | AppError | any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // If response has already started streaming, delegate to default express handler
  if (res.headersSent) {
    logger.warn('Headers already sent, delegating to default handler', { error: err.message });
    return _next(err);
  }

  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : err.status || 500;
  const errorCode = isAppError ? err.code : 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Internal server error';

  logger.error('Unhandled or operational error', {
    code: errorCode,
    statusCode,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Preserve frontend compatibility: client checks `data.error` or HTTP status
  res.status(statusCode).json({
    success: false,
    error: message,
    code: errorCode,
    ...(err.details ? { details: err.details } : {}),
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
