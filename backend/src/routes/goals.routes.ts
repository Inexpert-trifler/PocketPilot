// src/routes/goals.routes.ts
import { Router } from 'express';
import * as ctrl from '../controllers/goals.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createGoalSchema, updateGoalSchema } from '../validators/goals.validators';

const router = Router();

router.use(authenticate);

router.get('/',      ctrl.listGoals);
router.post('/',     validate(createGoalSchema), ctrl.createGoal);
router.patch('/:id', validate(updateGoalSchema), ctrl.updateGoal);
router.delete('/:id', ctrl.deleteGoal);

export default router;
