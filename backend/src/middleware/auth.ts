// src/middleware/auth.ts
// JWT authentication guard — protects all private routes.

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { AuthRequest, AccessTokenPayload } from '../types';
import { AuthenticationError } from '../utils/errors';

export async function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    let payload: AccessTokenPayload;
    try {
      payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    } catch {
      throw new AuthenticationError('Invalid or expired token');
    }

    if (payload.type !== 'access') {
      throw new AuthenticationError('Invalid token type');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      throw new AuthenticationError('User no longer exists');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/** Require specific role(s) — use after authenticate */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AuthenticationError('Insufficient permissions'));
      return;
    }
    next();
  };
}
