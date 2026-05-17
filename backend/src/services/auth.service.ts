// src/services/auth.service.ts
// Core authentication service — register, login, refresh, logout.

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { RegisterInput, LoginInput } from '../validators/auth.validators';
import { AccessTokenPayload, RefreshTokenPayload } from '../types';
import {
  ConflictError,
  AuthenticationError,
  NotFoundError,
} from '../utils/errors';
import { addDays } from 'date-fns';

const SALT_ROUNDS = 12;

// ── Token Generation ─────────────────────────────────────────────

function generateAccessToken(userId: string, email: string, role: string): string {
  const payload: AccessTokenPayload = { userId, email, role, type: 'access' };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES as jwt.SignOptions['expiresIn'],
  });
}

function generateRefreshToken(userId: string, sessionId: string): string {
  const payload: RefreshTokenPayload = { userId, sessionId, type: 'refresh' };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES as jwt.SignOptions['expiresIn'],
  });
}

// ── Auth Operations ──────────────────────────────────────────────

export async function registerUser(input: RegisterInput, ipAddress?: string, userAgent?: string) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new ConflictError('An account with this email already exists');

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash,
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  const sessionId = randomUUID();
  const accessToken = generateAccessToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken(user.id, sessionId);

  await prisma.session.create({
    data: {
      id: sessionId,
      userId: user.id,
      refreshToken,
      ipAddress,
      userAgent,
      expiresAt: addDays(new Date(), 7),
    },
  });

  return { user, accessToken, refreshToken };
}

export async function loginUser(input: LoginInput, ipAddress?: string, userAgent?: string) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AuthenticationError('Invalid email or password');

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) throw new AuthenticationError('Invalid email or password');

  const sessionId = randomUUID();
  const accessToken = generateAccessToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken(user.id, sessionId);

  await prisma.session.create({
    data: {
      id: sessionId,
      userId: user.id,
      refreshToken,
      ipAddress,
      userAgent,
      expiresAt: addDays(new Date(), 7),
    },
  });

  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

export async function refreshAccessToken(refreshToken: string) {
  let payload: RefreshTokenPayload;
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch {
    throw new AuthenticationError('Invalid or expired refresh token');
  }

  if (payload.type !== 'refresh') throw new AuthenticationError('Invalid token type');

  const session = await prisma.session.findUnique({
    where: { refreshToken },
    include: { user: { select: { id: true, email: true, role: true } } },
  });

  if (!session || session.expiresAt < new Date()) {
    throw new AuthenticationError('Session expired — please login again');
  }

  const accessToken = generateAccessToken(
    session.user.id,
    session.user.email,
    session.user.role
  );

  return { accessToken, user: session.user };
}

export async function logoutUser(refreshToken: string) {
  await prisma.session.deleteMany({ where: { refreshToken } });
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      role: true,
      monthlyBudget: true,
      currency: true,
      onboardingDone: true,
      createdAt: true,
    },
  });
  if (!user) throw new NotFoundError('User');
  return user;
}
