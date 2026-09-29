import express from 'express';
import cors from 'cors';
import path from 'path';
import { ENV, ALLOWED_ORIGINS } from './config/env';
import apiRoutes from './routes';
import healthRoutes from './routes/health.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Global Middleware
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());

// Mount Health Routes (Root & /api/health)
app.use('/', healthRoutes);

// Mount Modular API Routes
app.use('/', apiRoutes);

// Production Static Client Serving
if (ENV.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// Centralized Error Handling
app.use(errorHandler);

// Bootstrap Server
app.listen(ENV.PORT, () => {
  console.log(`✅ ORYN Enterprise Server running on http://localhost:${ENV.PORT}`);
  console.log(`🔑 NVIDIA Inference Model: ${ENV.DEFAULT_MODEL}`);
});

export default app;
