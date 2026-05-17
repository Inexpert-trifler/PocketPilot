// src/types/index.ts
// Shared TypeScript types and interfaces used across the backend.

import { Request } from 'express';
import { TransactionCategory, TransactionType, UploadType } from '@prisma/client';

// ── Authenticated Request ────────────────────────────────────────
export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// ── JWT Payloads ─────────────────────────────────────────────────
export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  type: 'refresh';
}

// ── Pagination ───────────────────────────────────────────────────
export interface PaginationQuery {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ── Parsed Transaction (from OCR/CSV) ────────────────────────────
export interface ParsedTransaction {
  amount: number;
  type: TransactionType;
  merchantRaw: string;
  merchantName?: string;
  description?: string;
  date: Date;
  currency?: string;
  rawText?: string;
}

// ── Categorization Result ────────────────────────────────────────
export interface CategorizationResult {
  category: TransactionCategory;
  confidence: number;
  method: 'rule' | 'ai' | 'cache';
}

// ── Analytics ────────────────────────────────────────────────────
export interface CategoryBreakdown {
  category: TransactionCategory;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface SpendingAnalytics {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  dailyAverage: number;
  transactionCount: number;
  categoryBreakdown: CategoryBreakdown[];
  topMerchants: { name: string; total: number }[];
}

// ── File Upload ──────────────────────────────────────────────────
export interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  storageUrl?: string;
  storageKey?: string;
}

// ── Job Data ─────────────────────────────────────────────────────
export interface FileProcessingJobData {
  uploadId: string;
  userId: string;
  storageUrl: string;
  mimeType: string;
  type: UploadType;
}

export interface InsightGenerationJobData {
  userId: string;
  triggerType: 'upload' | 'scheduled' | 'manual';
}
