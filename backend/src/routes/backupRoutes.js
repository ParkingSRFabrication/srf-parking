import { Router } from 'express';
import { exportData } from '../controllers/backupController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/export', exportData);

export default router;
