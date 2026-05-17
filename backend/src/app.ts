// src/app.ts
// Express application factory — pure setup, no I/O side effects.
// Keeps app.ts testable and server.ts responsible for I/O.

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { morganStream } from './utils/logger';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';

// Routes
import authRoutes         from './routes/auth.routes';
import transactionRoutes  from './routes/transaction.routes';
import uploadRoutes       from './routes/upload.routes';
import goalsRoutes        from './routes/goals.routes';
import insightsRoutes     from './routes/insights.routes';
import subscriptionRoutes from './routes/subscriptions.routes';
import budgetRoutes       from './routes/budget.routes';

import { initSentry } from './config/sentry';
import * as Sentry from '@sentry/node';

export function createApp() {
  initSentry();
  const app = express();

  // ── Security headers ───────────────────────────────────────────
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // ── CORS ───────────────────────────────────────────────────────
  app.use(cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // ── Body parsing ───────────────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // ── Compression ─────────────────────────────────────────────────
  app.use(compression());

  // ── Request logging ─────────────────────────────────────────────
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
      stream: morganStream,
    }));
  }

  // ── Global rate limiting ────────────────────────────────────────
  const globalLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later' },
  });
  app.use(globalLimiter);

  // ── Auth-specific stricter rate limit ───────────────────────────
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 10,
    message: { success: false, message: 'Too many auth attempts, please try again in 15 minutes' },
  });

  // ── Health check ────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      version: env.API_VERSION,
      timestamp: new Date().toISOString(),
      env: env.NODE_ENV,
    });
  });

  // ── API v1 routes ────────────────────────────────────────────────
  const v1 = `/api/${env.API_VERSION}`;

  app.use(`${v1}/auth`,          authLimiter, authRoutes);
  app.use(`${v1}/transactions`,  transactionRoutes);
  app.use(`${v1}/uploads`,       uploadRoutes);
  app.use(`${v1}/goals`,         goalsRoutes);
  app.use(`${v1}/insights`,      insightsRoutes);
  app.use(`${v1}/subscriptions`, subscriptionRoutes);
  app.use(`${v1}/budgets`,       budgetRoutes);

  // ── 404 & Global error handler ──────────────────────────────────
  app.use(notFoundHandler);
  
  if (process.env.SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app);
  }
  
  app.use(globalErrorHandler);

  return app;
}
