// src/routes/subscriptions.routes.ts
import { Router } from 'express';
import * as ctrl from '../controllers/subscriptions.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',              ctrl.listSubscriptions);
router.post('/detect',       ctrl.detectSubscriptions);
router.patch('/:id/toggle',  ctrl.toggleSubscription);

export default router;
