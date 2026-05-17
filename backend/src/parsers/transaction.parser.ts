// src/parsers/transaction.parser.ts
// Transaction extraction engine — parses raw text into structured transactions.
// Handles UPI statements, bank CSV exports, and OCR'd receipts.

import { TransactionType } from '@prisma/client';
import { ParsedTransaction } from '../types';
import { normalizeМerchantName } from './merchant.normalizer';
import { logger } from '../utils/logger';

// ── Amount Extraction Patterns ────────────────────────────────────
const AMOUNT_PATTERNS = [
  /(?:INR|₹|Rs\.?)\s*([\d,]+(?:\.\d{1,2})?)/gi,
  /([\d,]+(?:\.\d{1,2})?)\s*(?:INR|₹|Rs\.?)/gi,
  /(?:Dr|Cr)\s*([\d,]+(?:\.\d{1,2})?)/gi,
];

// ── Date Extraction Patterns ──────────────────────────────────────
const DATE_PATTERNS = [
  /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g,          // DD/MM/YYYY or DD-MM-YYYY
  /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g,              // YYYY-MM-DD
  /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/gi,
];

// ── Debit/Credit indicators ───────────────────────────────────────
const DEBIT_KEYWORDS = /\b(dr|debit|paid|purchase|withdrawal|sent|debited)\b/i;
const CREDIT_KEYWORDS = /\b(cr|credit|received|refund|cashback|credited|salary)\b/i;

function parseAmount(raw: string): number | null {
  for (const pattern of AMOUNT_PATTERNS) {
    pattern.lastIndex = 0;
    const match = pattern.exec(raw);
    if (match) {
      const cleaned = match[1].replace(/,/g, '');
      const amount = parseFloat(cleaned);
      if (!isNaN(amount) && amount > 0) return amount;
    }
  }
  return null;
}

function parseDate(raw: string): Date | null {
  // Try ISO format first
  const isoDate = new Date(raw);
  if (!isNaN(isoDate.getTime())) return isoDate;

  for (const pattern of DATE_PATTERNS) {
    pattern.lastIndex = 0;
    const match = pattern.exec(raw);
    if (match) {
      const candidate = new Date(match[0]);
      if (!isNaN(candidate.getTime())) return candidate;
    }
  }
  return null;
}

function detectTransactionType(line: string): TransactionType {
  if (DEBIT_KEYWORDS.test(line)) return TransactionType.DEBIT;
  if (CREDIT_KEYWORDS.test(line)) return TransactionType.CREDIT;
  return TransactionType.DEBIT; // Default to debit
}

// ── CSV Parser ────────────────────────────────────────────────────

export function parseCsvTransactions(csvText: string): ParsedTransaction[] {
  const lines = csvText.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/"/g, ''));
  const transactions: ParsedTransaction[] = [];

  // Detect column indices
  const dateIdx = header.findIndex((h) => h.includes('date'));
  const descIdx = header.findIndex((h) => h.includes('description') || h.includes('narration') || h.includes('particulars'));
  const amountIdx = header.findIndex((h) => h.includes('amount') || h.includes('debit') || h.includes('credit'));
  const typeIdx = header.findIndex((h) => h.includes('type') || h.includes('dr/cr'));

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim().replace(/"/g, ''));
    if (cols.length < 3) continue;

    const rawDate = dateIdx >= 0 ? cols[dateIdx] : '';
    const rawDesc = descIdx >= 0 ? cols[descIdx] : cols.join(' ');
    const rawAmount = amountIdx >= 0 ? cols[amountIdx] : '';
    const rawType = typeIdx >= 0 ? cols[typeIdx] : lines[i];

    const date = parseDate(rawDate) ?? new Date();
    const amount = parseAmount(rawAmount);
    if (!amount) continue;

    transactions.push({
      amount,
      type: detectTransactionType(rawType + ' ' + rawDesc),
      merchantRaw: rawDesc,
      merchantName: normalizeМerchantName(rawDesc),
      date,
      rawText: lines[i],
    });
  }

  logger.info(`CSV parsed: ${transactions.length} transactions found`);
  return transactions;
}

// ── Plain Text / OCR Parser ───────────────────────────────────────

export function parseTextTransactions(rawText: string): ParsedTransaction[] {
  const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 5);
  const transactions: ParsedTransaction[] = [];

  for (const line of lines) {
    const amount = parseAmount(line);
    if (!amount) continue;

    const date = parseDate(line) ?? new Date();

    transactions.push({
      amount,
      type: detectTransactionType(line),
      merchantRaw: line,
      merchantName: normalizeМerchantName(line),
      date,
      rawText: line,
    });
  }

  logger.info(`Text parsed: ${transactions.length} transactions found`);
  return transactions;
}
