// src/ocr/pdf.parser.ts
// PDF parsing pipeline — extracts text and tables from PDF bank statements.

import pdfParse from 'pdf-parse';
import { logger } from '../utils/logger';
import { FileProcessingError } from '../utils/errors';

export interface PdfParseResult {
  text: string;
  pageCount: number;
  info: Record<string, unknown>;
}

export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<PdfParseResult> {
  logger.info('Starting PDF extraction');

  let result: pdfParse.Result;
  try {
    result = await pdfParse(pdfBuffer);
  } catch (err) {
    throw new FileProcessingError(`PDF parsing failed: ${(err as Error).message}`);
  }

  if (!result.text.trim()) {
    throw new FileProcessingError('PDF appears to be empty or image-only — try uploading a screenshot instead');
  }

  logger.info(`PDF parsed — ${result.numpages} pages, ${result.text.length} chars`);

  return {
    text: result.text.trim(),
    pageCount: result.numpages,
    info: result.info as Record<string, unknown>,
  };
}
