// src/middleware/upload.ts
// Multer configuration for secure file upload with MIME validation.

import multer from 'multer';
import { Request } from 'express';
import { env } from '../config/env';
import { FileProcessingError } from '../utils/errors';

const storage = multer.memoryStorage(); // Store in memory, upload to cloud async

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  if (env.ALLOWED_UPLOAD_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new FileProcessingError(
        `File type "${file.mimetype}" is not allowed. Supported: ${env.ALLOWED_UPLOAD_MIMES.join(', ')}`
      )
    );
  }
}

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 5, // Max 5 files per request
  },
});

export const uploadSingle = uploadMiddleware.single('file');
export const uploadMultiple = uploadMiddleware.array('files', 5);
