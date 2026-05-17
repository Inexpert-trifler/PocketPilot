// src/routes/upload.routes.ts
import { Router } from 'express';
import * as ctrl from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.post('/',         uploadSingle, ctrl.uploadFile);
router.get('/',          ctrl.listUploads);
router.get('/:id/status', ctrl.getUploadStatus);

export default router;
