// src/routes/insights.routes.ts
import { Router } from 'express';
import * as ctrl from '../controllers/insights.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',              ctrl.listInsights);
router.post('/refresh',      ctrl.triggerRefresh);
router.patch('/:id/read',    ctrl.markRead);
router.patch('/:id/dismiss', ctrl.dismiss);

export default router;
