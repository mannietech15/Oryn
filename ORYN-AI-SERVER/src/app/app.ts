import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import { ENV, ALLOWED_ORIGINS } from '../config/env';
import appRoutes from './routes';
import { requestLogger } from './middleware/request-logger';
import { errorHandler } from './middleware/error-handler';
import { NotFoundError } from '../shared/errors/app-error';

export function createApp(): Express {
  const app = express();

  // Security & Core Middleware
  app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
  app.use(express.json({ limit: '5mb' }));
  app.use(requestLogger);

  // Mount Application Routes
  app.use('/', appRoutes);

  // Production Static Client Serving
  if (ENV.NODE_ENV === 'production') {
    const staticDir = path.join(__dirname, '../../../ORYN-AI-CLIENT/dist');
    app.use(express.static(staticDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(staticDir, 'index.html'));
    });
  }

  // 404 Catch-all for undefined API routes
  app.use('/api/*', (req, _res, next) => {
    next(new NotFoundError(`Endpoint '${req.originalUrl}' not found.`));
  });

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
}
