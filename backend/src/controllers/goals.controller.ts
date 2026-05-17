// src/controllers/goals.controller.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../config/database';
import { sendSuccess, sendCreated } from '../utils/response';
import { NotFoundError } from '../utils/errors';
import { CreateGoalInput, UpdateGoalInput } from '../validators/goals.validators';
import { differenceInDays } from 'date-fns';

export async function createGoal(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = req.body as CreateGoalInput;
    const goal = await prisma.savingsGoal.create({
      data: {
        userId: req.user!.id,
        name: input.name,
        emoji: input.emoji,
        targetAmount: input.targetAmount,
        targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
        notes: input.notes,
      },
    });
    sendCreated(res, goal, 'Savings goal created');
  } catch (err) { next(err); }
}

export async function listGoals(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const goals = await prisma.savingsGoal.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    // Enrich with progress and projections
    const enriched = goals.map((g) => {
      const progress = g.targetAmount > 0
        ? Math.round((g.currentAmount / g.targetAmount) * 100)
        : 0;

      const remaining = g.targetAmount - g.currentAmount;
      const daysLeft = g.targetDate ? differenceInDays(g.targetDate, new Date()) : null;
      const monthlyNeeded = daysLeft && daysLeft > 0
        ? Math.ceil(remaining / (daysLeft / 30))
        : null;

      return { ...g, progress, remaining, daysLeft, monthlyNeeded };
    });

    sendSuccess(res, enriched);
  } catch (err) { next(err); }
}

export async function updateGoal(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = req.body as UpdateGoalInput;
    const existing = await prisma.savingsGoal.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!existing) throw new NotFoundError('Savings goal');

    const goal = await prisma.savingsGoal.update({
      where: { id: req.params.id },
      data: {
        ...input,
        targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
      },
    });
    sendSuccess(res, goal, 'Goal updated');
  } catch (err) { next(err); }
}

export async function deleteGoal(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.savingsGoal.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!existing) throw new NotFoundError('Savings goal');
    await prisma.savingsGoal.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Goal deleted');
  } catch (err) { next(err); }
}
