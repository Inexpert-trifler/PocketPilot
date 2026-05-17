// src/validators/goals.validators.ts
import { z } from 'zod';
import { GoalStatus } from '@prisma/client';

export const createGoalSchema = z.object({
  name: z.string().min(1).max(200),
  emoji: z.string().max(10).optional(),
  targetAmount: z.number().positive(),
  targetDate: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
});

export const updateGoalSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  targetAmount: z.number().positive().optional(),
  targetDate: z.string().datetime().optional(),
  status: z.nativeEnum(GoalStatus).optional(),
  notes: z.string().max(1000).optional(),
  currentAmount: z.number().min(0).optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
