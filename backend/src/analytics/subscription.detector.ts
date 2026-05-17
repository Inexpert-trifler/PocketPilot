// src/analytics/subscription.detector.ts
// Detects recurring payments from transaction history.

import { prisma } from '../config/database';
import { TransactionType } from '@prisma/client';
import { differenceInDays } from 'date-fns';
import { logger } from '../utils/logger';

const MIN_OCCURRENCES = 2;
const INTERVAL_TOLERANCE_DAYS = 5; // ±5 days tolerance

interface RecurringPattern {
  merchantName: string;
  amount: number;
  intervalDays: number;
  occurrences: number;
  lastDate: Date;
}

function detectInterval(dates: Date[]): number | null {
  if (dates.length < MIN_OCCURRENCES) return null;
  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());

  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    gaps.push(differenceInDays(sorted[i], sorted[i - 1]));
  }

  const avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;
  const maxDeviation = Math.max(...gaps.map((g) => Math.abs(g - avgGap)));

  // Consistent interval within tolerance
  if (maxDeviation > INTERVAL_TOLERANCE_DAYS) return null;

  // Map to known intervals
  if (avgGap >= 25 && avgGap <= 35) return 30;   // Monthly
  if (avgGap >= 6 && avgGap <= 8) return 7;       // Weekly
  if (avgGap >= 355 && avgGap <= 375) return 365; // Annual

  return Math.round(avgGap);
}

export async function detectSubscriptions(userId: string): Promise<number> {
  logger.info(`Running subscription detection for user ${userId}`);

  // Get all debit transactions in the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: TransactionType.DEBIT,
      date: { gte: sixMonthsAgo },
      merchantName: { not: null },
    },
    orderBy: { date: 'asc' },
  });

  // Group by merchant+amount
  const groups = new Map<string, Date[]>();
  for (const tx of transactions) {
    const key = `${tx.merchantName}|${Math.round(tx.amount)}`;
    const dates = groups.get(key) ?? [];
    dates.push(tx.date);
    groups.set(key, dates);
  }

  // Detect recurring patterns
  const patterns: RecurringPattern[] = [];
  for (const [key, dates] of groups) {
    if (dates.length < MIN_OCCURRENCES) continue;
    const interval = detectInterval(dates);
    if (!interval) continue;

    const [merchantName, amountStr] = key.split('|');
    patterns.push({
      merchantName,
      amount: parseFloat(amountStr),
      intervalDays: interval,
      occurrences: dates.length,
      lastDate: dates[dates.length - 1],
    });
  }

  // Upsert detected subscriptions
  let created = 0;
  for (const pattern of patterns) {
    const nextCharge = new Date(pattern.lastDate);
    nextCharge.setDate(nextCharge.getDate() + pattern.intervalDays);

    await prisma.subscription.upsert({
      where: {
        // Custom unique constraint: userId + merchantName + amount
        id: `${userId}-${pattern.merchantName}-${pattern.amount}`.slice(0, 25),
      },
      update: {
        lastChargedAt: pattern.lastDate,
        nextChargedAt: nextCharge,
        isActive: true,
      },
      create: {
        userId,
        name: pattern.merchantName,
        merchantName: pattern.merchantName,
        amount: pattern.amount,
        intervalDays: pattern.intervalDays,
        lastChargedAt: pattern.lastDate,
        nextChargedAt: nextCharge,
      },
    });
    created++;
  }

  logger.info(`Subscription detection complete — ${created} subscriptions found`);
  return created;
}
