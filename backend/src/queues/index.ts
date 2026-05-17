// src/queues/index.ts
// BullMQ queue definitions — centralized queue registry.

import { Queue } from 'bullmq';
import { getRedisClient } from '../config/redis';
import { FileProcessingJobData, InsightGenerationJobData } from '../types';

const connection = { connection: getRedisClient() };

// ── Queue Definitions ─────────────────────────────────────────────

export const fileProcessingQueue = new Queue<FileProcessingJobData>(
  'file-processing',
  {
    ...connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 200,
    },
  }
);

export const insightGenerationQueue = new Queue<InsightGenerationJobData>(
  'insight-generation',
  {
    ...connection,
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'fixed', delay: 10000 },
      removeOnComplete: 50,
      removeOnFail: 100,
    },
  }
);

// ── Queue Helpers ─────────────────────────────────────────────────

export async function enqueueFileProcessing(data: FileProcessingJobData): Promise<string> {
  const job = await fileProcessingQueue.add('process-file', data, {
    priority: 1,
  });
  return job.id ?? '';
}

export async function enqueueInsightGeneration(
  data: InsightGenerationJobData
): Promise<string> {
  const job = await insightGenerationQueue.add('generate-insights', data, {
    delay: 2000, // Small delay to let transactions settle
  });
  return job.id ?? '';
}
