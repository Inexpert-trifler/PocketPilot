// src/workers/file.worker.ts
// Background worker that processes uploaded files through the OCR + AI pipeline.

import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../config/redis';
import { prisma } from '../config/database';
import { FileProcessingJobData, ParsedTransaction } from '../types';
import { extractTextFromImage } from '../ocr/tesseract.ocr';
import { extractTextFromPdf } from '../ocr/pdf.parser';
import { parseCsvTransactions, parseTextTransactions } from '../parsers/transaction.parser';
import { categorizeTransaction } from '../ai/categorizer';
import { enqueueInsightGeneration } from '../queues';
import { UploadStatus } from '@prisma/client';
import { logger } from '../utils/logger';
import { env } from '../config/env';

// Use Node 18+ built-in fetch — no axios needed
async function downloadFile(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function processFile(job: Job<FileProcessingJobData>): Promise<void> {
  const { uploadId, userId, storageUrl, mimeType } = job.data;

  logger.info(`Processing file upload ${uploadId} for user ${userId}`);

  await prisma.upload.update({
    where: { id: uploadId },
    data: { status: UploadStatus.PROCESSING },
  });

  try {
    await job.updateProgress(10);
    const fileBuffer = await downloadFile(storageUrl);
    await job.updateProgress(30);

    let rawText = '';

    if (mimeType === 'text/csv') {
      const csv = fileBuffer.toString('utf-8');
      const transactions = parseCsvTransactions(csv);
      await persistTransactions(userId, uploadId, transactions);
    } else if (mimeType === 'application/pdf') {
      const pdfResult = await extractTextFromPdf(fileBuffer);
      rawText = pdfResult.text;
      const transactions = parseTextTransactions(rawText);
      await persistTransactions(userId, uploadId, transactions);
    } else if (mimeType.startsWith('image/')) {
      const ocrResult = await extractTextFromImage(fileBuffer);
      rawText = ocrResult.text;
      const transactions = parseTextTransactions(rawText);
      await persistTransactions(userId, uploadId, transactions);
    }

    await job.updateProgress(90);

    await prisma.upload.update({
      where: { id: uploadId },
      data: {
        status: UploadStatus.COMPLETED,
        processedAt: new Date(),
        metadata: { rawTextLength: rawText.length },
      },
    });

    await enqueueInsightGeneration({ userId, triggerType: 'upload' });
    await job.updateProgress(100);
    logger.info(`File ${uploadId} processed successfully`);
  } catch (err) {
    const errorMsg = (err as Error).message;
    logger.error(`File processing failed for ${uploadId}:`, err);
    await prisma.upload.update({
      where: { id: uploadId },
      data: { status: UploadStatus.FAILED, errorMessage: errorMsg },
    });
    throw err;
  }
}

async function persistTransactions(
  userId: string,
  uploadId: string,
  transactions: ParsedTransaction[]
): Promise<void> {
  if (transactions.length === 0) return;

  const categorized = await Promise.all(
    transactions.map(async (tx) => {
      const cat = await categorizeTransaction(
        tx.merchantName ?? tx.merchantRaw,
        tx.description ?? ''
      );
      return { tx, cat };
    })
  );

  await prisma.transaction.createMany({
    data: categorized.map(({ tx, cat }) => ({
      userId,
      uploadId,
      amount: tx.amount,
      type: tx.type,
      category: cat.category,
      merchantRaw: tx.merchantRaw,
      merchantName: tx.merchantName,
      description: tx.description,
      date: tx.date,
      currency: tx.currency ?? 'INR',
      isCategorizedAI: cat.method !== 'rule',
      confidence: cat.confidence,
    })),
    skipDuplicates: true,
  });

  logger.info(`Persisted ${categorized.length} transactions for upload ${uploadId}`);
}

// ── Worker Instance ───────────────────────────────────────────────

export function startFileWorker(): Worker<FileProcessingJobData> {
  const worker = new Worker<FileProcessingJobData>(
    'file-processing',
    processFile,
    {
      connection: getRedisClient(),
      concurrency: env.QUEUE_CONCURRENCY,
    }
  );

  worker.on('completed', (job) => logger.info(`File job ${job.id} completed`));
  worker.on('failed', (job, err) => logger.error(`File job ${job?.id} failed:`, err));

  return worker;
}
