// src/routes/budget.routes.ts
import { Router } from 'express';
import * as ctrl from '../controllers/budget.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',           ctrl.getBudgets);
router.post('/',          ctrl.setBudget);
router.get('/prediction', ctrl.getPrediction);

export default router;
