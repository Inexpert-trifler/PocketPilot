// src/controllers/budget.controller.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../config/database';
import { predictBudget } from '../analytics/budget.predictor';
import { sendSuccess } from '../utils/response';
import { TransactionCategory } from '@prisma/client';
import { z } from 'zod';

const setBudgetSchema = z.object({
  category: z.nativeEnum(TransactionCategory),
  amount: z.number().positive(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020),
});

export async function getPrediction(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const prediction = await predictBudget(req.user!.id);
    sendSuccess(res, prediction);
  } catch (err) { next(err); }
}

export async function setBudget(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = setBudgetSchema.parse(req.body);
    const budget = await prisma.budget.upsert({
      where: {
        userId_category_month_year: {
          userId: req.user!.id,
          category: input.category,
          month: input.month,
          year: input.year,
        },
      },
      update: { amount: input.amount },
      create: {
        userId: req.user!.id,
        category: input.category,
        amount: input.amount,
        month: input.month,
        year: input.year,
      },
    });
    sendSuccess(res, budget, 'Budget set');
  } catch (err) { next(err); }
}

export async function getBudgets(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const month = parseInt(req.query.month as string ?? String(new Date().getMonth() + 1), 10);
    const year  = parseInt(req.query.year  as string ?? String(new Date().getFullYear()), 10);

    const budgets = await prisma.budget.findMany({
      where: { userId: req.user!.id, month, year },
      orderBy: { category: 'asc' },
    });

    // Enrich with actual spend
    const enriched = budgets.map((b) => ({
      ...b,
      remaining: Math.max(0, b.amount - b.spent),
      utilization: b.amount > 0 ? Math.round((b.spent / b.amount) * 100) : 0,
      isOver: b.spent > b.amount,
    }));

    sendSuccess(res, enriched);
  } catch (err) { next(err); }
}
