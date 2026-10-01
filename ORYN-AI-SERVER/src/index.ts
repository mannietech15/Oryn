import { createApp } from './app/app';
import { ENV, validateEnvironment } from './config/env';
import { Logger } from './infrastructure/logging/logger';

const logger = new Logger('ServerBootstrap');

validateEnvironment();

const app = createApp();

app.listen(ENV.PORT, () => {
  logger.info(`✅ ORYN Enterprise AI Backend running on http://localhost:${ENV.PORT}`);
  logger.info(`🔑 NVIDIA Default Model: ${ENV.DEFAULT_MODEL}`);
  logger.info(`⚡ Node Environment: ${ENV.NODE_ENV}`);
});

export default app;
