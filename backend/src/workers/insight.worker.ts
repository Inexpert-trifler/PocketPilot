// src/workers/insight.worker.ts
// Background worker for AI insight generation.

import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../config/redis';
import { InsightGenerationJobData } from '../types';
import { generateInsightsForUser } from '../ai/insights.engine';
import { detectSubscriptions } from '../analytics/subscription.detector';
import { notifyUser } from '../services/websocket.service';
import { logger } from '../utils/logger';

async function processInsightJob(job: Job<InsightGenerationJobData>): Promise<void> {
  const { userId, triggerType } = job.data;

  logger.info(`Generating insights for user ${userId} (trigger: ${triggerType})`);

  await job.updateProgress(20);

  try {
    // Run subscription detection alongside insight generation
    const [insightCount] = await Promise.all([
      generateInsightsForUser(userId),
      detectSubscriptions(userId),
    ]);

    await job.updateProgress(100);
    logger.info(`Insight job complete — ${insightCount} insights generated`);

    // Notify user in real-time if connected via WebSockets
    if (insightCount > 0) {
      notifyUser(userId, 'NEW_INSIGHTS', { count: insightCount });
    }
  } catch (error) {
    logger.error(`Failed to process insights for user ${userId}:`, error);
    throw error;
  }
}

export function startInsightWorker(): Worker<InsightGenerationJobData> {
  const worker = new Worker<InsightGenerationJobData>(
    'insight-generation',
    processInsightJob,
    {
      connection: getRedisClient(),
      concurrency: 2, // AI calls are expensive — keep low
    }
  );

  worker.on('completed', (job) =>
    logger.info(`Insight job ${job.id} completed`)
  );
  worker.on('failed', (job, err) =>
    logger.error(`Insight job ${job?.id} failed:`, err)
  );

  return worker;
}
