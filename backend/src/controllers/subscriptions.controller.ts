// src/controllers/subscriptions.controller.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../config/database';
import { sendSuccess } from '../utils/response';
import { enqueueInsightGeneration } from '../queues';

export async function listSubscriptions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.user!.id },
      orderBy: { amount: 'desc' },
    });

    const totalMonthly = subscriptions
      .filter((s) => s.isActive)
      .reduce((sum, s) => {
        // Normalize to monthly cost
        const monthlyAmount = s.intervalDays === 365
          ? s.amount / 12
          : s.intervalDays === 7
          ? s.amount * 4.3
          : s.amount;
        return sum + monthlyAmount;
      }, 0);

    sendSuccess(res, {
      subscriptions,
      summary: {
        total: subscriptions.length,
        active: subscriptions.filter((s) => s.isActive).length,
        totalMonthly: Math.round(totalMonthly * 100) / 100,
        totalAnnual: Math.round(totalMonthly * 12 * 100) / 100,
      },
    });
  } catch (err) { next(err); }
}

export async function toggleSubscription(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const sub = await prisma.subscription.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!sub) {
      res.status(404).json({ success: false, message: 'Subscription not found' });
      return;
    }

    const updated = await prisma.subscription.update({
      where: { id: req.params.id },
      data: { isActive: !sub.isActive },
    });
    sendSuccess(res, updated, `Subscription ${updated.isActive ? 'activated' : 'deactivated'}`);
  } catch (err) { next(err); }
}

export async function detectSubscriptions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Queue a re-scan
    await enqueueInsightGeneration({
      userId: req.user!.id,
      triggerType: 'manual',
    });
    sendSuccess(res, null, 'Subscription detection queued');
  } catch (err) { next(err); }
}
