// src/controllers/transaction.controller.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as txService from '../services/transaction.service';
import { CreateTransactionInput, TransactionQuery } from '../validators/transaction.validators';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tx = await txService.createTransaction(req.user!.id, req.body as CreateTransactionInput);
    sendCreated(res, tx, 'Transaction added');
  } catch (err) { next(err); }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const query = req.query as unknown as TransactionQuery;
    const { transactions, total } = await txService.listTransactions(req.user!.id, query);
    sendPaginated(res, transactions, total, query.page ?? 1, query.limit ?? 20);
  } catch (err) { next(err); }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tx = await txService.getTransactionById(req.user!.id, req.params.id);
    sendSuccess(res, tx);
  } catch (err) { next(err); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await txService.deleteTransaction(req.user!.id, req.params.id);
    sendSuccess(res, null, 'Transaction deleted');
  } catch (err) { next(err); }
}

export async function analytics(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const fromDate = from ? new Date(from) : startOfMonth(new Date());
    const toDate = to ? new Date(to) : endOfMonth(new Date());
    const data = await txService.getSpendingAnalytics(req.user!.id, fromDate, toDate);
    sendSuccess(res, data);
  } catch (err) { next(err); }
}

export async function trends(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const months = parseInt((req.query.months as string) ?? '6', 10);
    const data = await txService.getMonthlyTrends(req.user!.id, months);
    sendSuccess(res, data);
  } catch (err) { next(err); }
}
