// src/controllers/auth.controller.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as authService from '../services/auth.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { RegisterInput, LoginInput } from '../validators/auth.validators';

export async function register(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = req.body as RegisterInput;
    const result = await authService.registerUser(
      input,
      req.ip,
      req.get('user-agent')
    );
    sendCreated(res, result, 'Account created successfully');
  } catch (err) { next(err); }
}

export async function login(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = req.body as LoginInput;
    const result = await authService.loginUser(input, req.ip, req.get('user-agent'));
    sendSuccess(res, result, 'Login successful');
  } catch (err) { next(err); }
}

export async function refresh(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    const result = await authService.refreshAccessToken(refreshToken);
    sendSuccess(res, result, 'Token refreshed');
  } catch (err) { next(err); }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    await authService.logoutUser(refreshToken);
    sendSuccess(res, null, 'Logged out successfully');
  } catch (err) { next(err); }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await authService.getUserProfile(req.user!.id);
    sendSuccess(res, user);
  } catch (err) { next(err); }
}
