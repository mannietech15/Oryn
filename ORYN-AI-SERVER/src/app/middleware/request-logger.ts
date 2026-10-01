import { Request, Response, NextFunction } from 'express';
import { Logger } from '../../infrastructure/logging/logger';

const logger = new Logger('HTTP');

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = (req.headers['x-request-id'] as string) || Math.random().toString(36).substring(2, 10);
  req.headers['x-request-id'] = requestId;

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl || req.url} ${res.statusCode}`, {
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs,
    });
  });

  next();
}
