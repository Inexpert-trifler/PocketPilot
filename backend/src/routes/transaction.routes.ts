// src/routes/transaction.routes.ts
import { Router } from 'express';
import * as ctrl from '../controllers/transaction.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { createTransactionSchema, transactionQuerySchema } from '../validators/transaction.validators';

const router = Router();

router.use(authenticate); // All transaction routes are protected

router.get('/',           validate(transactionQuerySchema, 'query'), ctrl.list);
router.post('/',          validate(createTransactionSchema),         ctrl.create);
router.get('/analytics',  ctrl.analytics);
router.get('/trends',     ctrl.trends);
router.get('/:id',        ctrl.getOne);
router.delete('/:id',     ctrl.remove);

export default router;
