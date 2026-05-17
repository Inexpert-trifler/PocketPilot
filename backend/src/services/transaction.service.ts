// src/services/transaction.service.ts
// Core transaction CRUD + analytics queries.

import { prisma } from '../config/database';
import { TransactionType, TransactionCategory, Prisma } from '@prisma/client';
import { CreateTransactionInput, TransactionQuery } from '../validators/transaction.validators';
import { SpendingAnalytics, MonthlyTrend, CategoryBreakdown } from '../types';
import { NotFoundError } from '../utils/errors';
import { getCache, setCache } from '../cache/redis.cache';

const CACHE_TTL = 300; // 5 min

export async function createTransaction(userId: string, input: CreateTransactionInput) {
  const tx = await prisma.transaction.create({
    data: {
      userId,
      amount: input.amount,
      type: input.type,
      category: input.category ?? TransactionCategory.OTHER,
      merchantName: input.merchantName,
      description: input.description,
      date: new Date(input.date),
      currency: input.currency,
      tags: input.tags,
    },
  });

  return tx;
}

export async function listTransactions(userId: string, query: TransactionQuery) {
  const { page, limit, category, type, from, to, search, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.TransactionWhereInput = {
    userId,
    ...(category && { category }),
    ...(type && { type }),
    ...(from || to
      ? {
          date: {
            ...(from && { gte: new Date(from) }),
            ...(to && { lte: new Date(to) }),
          },
        }
      : {}),
    ...(search && {
      OR: [
        { merchantName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [transactions, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.transaction.count({ where }),
  ]);

  return { transactions, total };
}

export async function getTransactionById(userId: string, txId: string) {
  const tx = await prisma.transaction.findFirst({
    where: { id: txId, userId },
  });
  if (!tx) throw new NotFoundError('Transaction');
  return tx;
}

export async function deleteTransaction(userId: string, txId: string) {
  const tx = await prisma.transaction.findFirst({ where: { id: txId, userId } });
  if (!tx) throw new NotFoundError('Transaction');
  await prisma.transaction.delete({ where: { id: txId } });
}

// ── Spending Analytics (cached) ──────────────────────────────────

export async function getSpendingAnalytics(
  userId: string,
  from: Date,
  to: Date
): Promise<SpendingAnalytics> {
  const cacheKey = `analytics:${userId}:${from.toISOString()}:${to.toISOString()}`;
  const cached = await getCache<SpendingAnalytics>(cacheKey);
  if (cached) return cached;

  const transactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: from, lte: to } },
  });

  const expenses = transactions.filter((t) => t.type === TransactionType.DEBIT);
  const income   = transactions.filter((t) => t.type === TransactionType.CREDIT);

  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome   = income.reduce((sum, t) => sum + t.amount, 0);

  // Category breakdown
  const categoryMap = new Map<TransactionCategory, { total: number; count: number }>();
  for (const tx of expenses) {
    const entry = categoryMap.get(tx.category) ?? { total: 0, count: 0 };
    entry.total += tx.amount;
    entry.count += 1;
    categoryMap.set(tx.category, entry);
  }

  const categoryBreakdown: CategoryBreakdown[] = Array.from(categoryMap.entries()).map(
    ([category, data]) => ({
      category,
      total: Math.round(data.total * 100) / 100,
      count: data.count,
      percentage:
        totalExpenses > 0
          ? Math.round((data.total / totalExpenses) * 10000) / 100
          : 0,
    })
  );

  // Top merchants
  const merchantMap = new Map<string, number>();
  for (const tx of expenses) {
    const name = tx.merchantName ?? 'Unknown';
    merchantMap.set(name, (merchantMap.get(name) ?? 0) + tx.amount);
  }
  const topMerchants = Array.from(merchantMap.entries())
    .map(([name, total]) => ({ name, total: Math.round(total * 100) / 100 }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const days = Math.max(
    1,
    Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
  );
  const netSavings = totalIncome - totalExpenses;

  const result: SpendingAnalytics = {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netSavings: Math.round(netSavings * 100) / 100,
    savingsRate:
      totalIncome > 0
        ? Math.round((netSavings / totalIncome) * 10000) / 100
        : 0,
    dailyAverage: Math.round((totalExpenses / days) * 100) / 100,
    transactionCount: transactions.length,
    categoryBreakdown: categoryBreakdown.sort((a, b) => b.total - a.total),
    topMerchants,
  };

  await setCache(cacheKey, result, CACHE_TTL);
  return result;
}

// ── Monthly Trends ───────────────────────────────────────────────

export async function getMonthlyTrends(
  userId: string,
  months = 6
): Promise<MonthlyTrend[]> {
  const cacheKey = `trends:${userId}:${months}`;
  const cached = await getCache<MonthlyTrend[]>(cacheKey);
  if (cached) return cached;

  const result = await prisma.$queryRaw<
    { month: string; income: number; expenses: number }[]
  >`
    SELECT
      TO_CHAR(date, 'YYYY-MM') as month,
      SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END)::float as income,
      SUM(CASE WHEN type = 'DEBIT'  THEN amount ELSE 0 END)::float as expenses
    FROM "Transaction"
    WHERE "userId" = ${userId}
      AND date >= NOW() - INTERVAL '${months} months'
    GROUP BY TO_CHAR(date, 'YYYY-MM')
    ORDER BY month ASC
  `;

  const trends: MonthlyTrend[] = result.map((r) => ({
    month: r.month,
    income: r.income ?? 0,
    expenses: r.expenses ?? 0,
    net: (r.income ?? 0) - (r.expenses ?? 0),
  }));

  await setCache(cacheKey, trends, CACHE_TTL);
  return trends;
}
