import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { env } from './env';

export const initSentry = () => {
  if (env.NODE_ENV === 'test') return;

  // We are putting a dummy DSN here so it doesn't crash if the user hasn't set one yet
  // but in production, it requires a valid SENTRY_DSN in the .env file
  Sentry.init({
    dsn: process.env.SENTRY_DSN || 'https://public@sentry.example.com/1',
    integrations: [
      nodeProfilingIntegration(),
    ],
    // Tracing
    tracesSampleRate: 1.0, 
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
    environment: env.NODE_ENV,
    enabled: process.env.SENTRY_DSN !== undefined,
  });
};
