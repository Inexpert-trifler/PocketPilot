// src/middleware/errorHandler.ts
// Global error handler — must be last middleware registered in app.

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Structured error log
  logger.error({
    message: err.message,
    name: err.name,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  // Zod validation error
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Operational application error
  if (err instanceof AppError) {
    const body: Record<string, unknown> = {
      success: false,
      message: err.message,
      code: err.code,
    };
    if (err instanceof ValidationError) body.errors = err.details;
    res.status(err.statusCode).json(body);
    return;
  }

  // Prisma unique constraint violation
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'A record with that value already exists',
        code: 'CONFLICT',
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Record not found',
        code: 'NOT_FOUND',
      });
      return;
    }
  }

  // Unhandled / programming error — don't leak details in production
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    code: 'INTERNAL_SERVER_ERROR',
  });
}

/** 404 handler for unmatched routes */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.path}`,
    code: 'NOT_FOUND',
  });
}
