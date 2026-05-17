// src/analytics/budget.predictor.ts
// Predicts end-of-month balance, overspending risk, and savings probability.

import { prisma } from '../config/database';
import { TransactionType } from '@prisma/client';
import { startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { getCache, setCache } from '../cache/redis.cache';
import { logger } from '../utils/logger';

export interface BudgetPrediction {
  daysRemaining: number;
  currentExpenses: number;
  currentIncome: number;
  projectedMonthlyExpenses: number;
  projectedBalance: number;
  overspendingRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  burnRate: number; // Average daily spend
  daysUntilBreak: number | null; // Days until balance hits 0 (if risk is HIGH)
  savingsProbability: number; // 0-100
}

export async function predictBudget(userId: string): Promise<BudgetPrediction> {
  const cacheKey = `budget-prediction:${userId}`;
  const cached = await getCache<BudgetPrediction>(cacheKey);
  if (cached) return cached;

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
  const daysPassed = differenceInDays(now, monthStart) + 1;
  const daysRemaining = daysInMonth - daysPassed;

  // Fetch current month transactions
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: monthStart, lte: now },
    },
    select: { amount: true, type: true },
  });

  const currentExpenses = transactions
    .filter((t) => t.type === TransactionType.DEBIT)
    .reduce((sum, t) => sum + t.amount, 0);

  const currentIncome = transactions
    .filter((t) => t.type === TransactionType.CREDIT)
    .reduce((sum, t) => sum + t.amount, 0);

  // Daily burn rate based on current month data
  const burnRate = daysPassed > 0 ? currentExpenses / daysPassed : 0;

  // Project to end of month
  const projectedMonthlyExpenses = currentExpenses + burnRate * daysRemaining;
  const projectedBalance = currentIncome - projectedMonthlyExpenses;

  // Historical average income (last 3 months)
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const historicalIncome = await prisma.transaction.aggregate({
    where: {
      userId,
      type: TransactionType.CREDIT,
      date: { gte: threeMonthsAgo, lt: monthStart },
    },
    _avg: { amount: true },
    _sum: { amount: true },
  });

  const avgMonthlyIncome = (historicalIncome._sum.amount ?? currentIncome) / 3;

  // Overspending risk calculation
  const expenseRatio = projectedMonthlyExpenses / Math.max(avgMonthlyIncome, 1);
  let overspendingRisk: BudgetPrediction['overspendingRisk'] = 'LOW';
  if (expenseRatio > 1.2) overspendingRisk = 'CRITICAL';
  else if (expenseRatio > 1.0) overspendingRisk = 'HIGH';
  else if (expenseRatio > 0.8) overspendingRisk = 'MEDIUM';

  // Days until balance runs out
  let daysUntilBreak: number | null = null;
  if (burnRate > 0 && currentIncome > 0) {
    const remainingBalance = currentIncome - currentExpenses;
    if (remainingBalance > 0) {
      daysUntilBreak = Math.floor(remainingBalance / burnRate);
    } else {
      daysUntilBreak = 0;
    }
  }

  // Savings probability (0-100)
  const savingsProbability = Math.max(
    0,
    Math.min(100, Math.round((1 - expenseRatio) * 100))
  );

  const prediction: BudgetPrediction = {
    daysRemaining,
    currentExpenses: Math.round(currentExpenses * 100) / 100,
    currentIncome: Math.round(currentIncome * 100) / 100,
    projectedMonthlyExpenses: Math.round(projectedMonthlyExpenses * 100) / 100,
    projectedBalance: Math.round(projectedBalance * 100) / 100,
    overspendingRisk,
    burnRate: Math.round(burnRate * 100) / 100,
    daysUntilBreak,
    savingsProbability,
  };

  await setCache(cacheKey, prediction, 3600); // Cache for 1 hour
  logger.info(`Budget prediction computed for user ${userId}: risk=${overspendingRisk}`);

  return prediction;
}
