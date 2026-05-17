// src/controllers/insights.controller.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../config/database';
import { sendSuccess } from '../utils/response';
import { enqueueInsightGeneration } from '../queues';

export async function listInsights(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const insights = await prisma.insight.findMany({
      where: {
        userId: req.user!.id,
        isDismissed: false,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: 20,
    });
    sendSuccess(res, insights);
  } catch (err) { next(err); }
}

export async function markRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.insight.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { isRead: true },
    });
    sendSuccess(res, null, 'Insight marked as read');
  } catch (err) { next(err); }
}

export async function dismiss(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.insight.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { isDismissed: true },
    });
    sendSuccess(res, null, 'Insight dismissed');
  } catch (err) { next(err); }
}

export async function triggerRefresh(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const jobId = await enqueueInsightGeneration({
      userId: req.user!.id,
      triggerType: 'manual',
    });
    sendSuccess(res, { jobId }, 'Insight generation queued');
  } catch (err) { next(err); }
}
