// src/validators/transaction.validators.ts
import { z } from 'zod';
import { TransactionType, TransactionCategory } from '@prisma/client';

export const createTransactionSchema = z.object({
  amount: z.number().positive(),
  type: z.nativeEnum(TransactionType),
  category: z.nativeEnum(TransactionCategory).optional(),
  merchantName: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  date: z.string().datetime().or(z.date()),
  currency: z.string().length(3).default('INR'),
  tags: z.array(z.string()).default([]),
});

export const transactionQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  category: z.nativeEnum(TransactionCategory).optional(),
  type: z.nativeEnum(TransactionType).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['date', 'amount', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type TransactionQuery = z.infer<typeof transactionQuerySchema>;
