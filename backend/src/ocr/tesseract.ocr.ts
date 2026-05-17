// src/ocr/tesseract.ocr.ts
// Tesseract.js OCR pipeline — extracts raw text from images.

import Tesseract from 'tesseract.js';
import { logger } from '../utils/logger';
import { FileProcessingError } from '../utils/errors';

export interface OcrResult {
  text: string;
  confidence: number;
  words: Array<{ text: string; confidence: number; bbox: object }>;
}

/**
 * Run OCR on an image buffer.
 * Supports JPEG, PNG, WEBP.
 */
export async function extractTextFromImage(imageBuffer: Buffer): Promise<OcrResult> {
  logger.info('Starting OCR extraction');

  const result = await Tesseract.recognize(imageBuffer, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        logger.debug(`OCR progress: ${Math.round(m.progress * 100)}%`);
      }
    },
  });

  const { text, confidence, words } = result.data;

  if (!text.trim()) {
    throw new FileProcessingError('OCR failed: no text detected in the image');
  }

  logger.info(`OCR complete — confidence: ${confidence.toFixed(1)}%`);

  return {
    text: text.trim(),
    confidence,
    words: words.map((w) => ({
      text: w.text,
      confidence: w.confidence,
      bbox: w.bbox,
    })),
  };
}
