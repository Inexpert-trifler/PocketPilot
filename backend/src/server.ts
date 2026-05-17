// src/server.ts
// Server entrypoint — orchestrates startup, graceful shutdown, and workers.

import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { startFileWorker } from './workers/file.worker';
import { startInsightWorker } from './workers/insight.worker';
import { logger } from './utils/logger';
import { initWebSocket } from './services/websocket.service';

async function bootstrap(): Promise<void> {
  logger.info(`🚀 Starting ${env.APP_NAME} backend (${env.NODE_ENV})`);

  // ── Connect to infrastructure ──────────────────────────────────
  await connectDatabase();
  logger.info('✅ PostgreSQL connected');

  await connectRedis();
  // Redis logs its own connection message

  // ── Start background workers ────────────────────────────────────
  const fileWorker    = startFileWorker();
  const insightWorker = startInsightWorker();
  logger.info('✅ Background workers started');

  // ── Start HTTP server & WebSockets ───────────────────────────────
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`✅ HTTP server listening on port ${env.PORT}`);
    logger.info(`📡 API base: http://localhost:${env.PORT}/api/${env.API_VERSION}`);
  });
  
  // Initialize WebSockets
  initWebSocket(server);

  // ── Graceful shutdown ────────────────────────────────────────────
  async function shutdown(signal: string): Promise<void> {
    logger.info(`${signal} received — shutting down gracefully...`);

    server.close(async () => {
      logger.info('HTTP server closed');

      await fileWorker.close();
      await insightWorker.close();
      logger.info('Workers stopped');

      await disconnectDatabase();
      logger.info('Database disconnected');

      process.exit(0);
    });

    // Force exit after 30s
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30_000);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception:', err);
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  logger.error('Bootstrap failed:', err);
  process.exit(1);
});
