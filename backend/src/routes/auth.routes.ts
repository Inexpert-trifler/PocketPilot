// src/routes/auth.routes.ts
import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validators';

const router = Router();

router.post('/register', validate(registerSchema), ctrl.register);
router.post('/login',    validate(loginSchema),    ctrl.login);
router.post('/refresh',  validate(refreshTokenSchema), ctrl.refresh);
router.post('/logout',   validate(refreshTokenSchema), ctrl.logout);
router.get('/me',        authenticate, ctrl.getMe);

export default router;
