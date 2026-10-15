import { Router } from 'express';
import { getDashboardSummary, getDetailedReport } from '../controllers/reportController.js';
import { authenticate, requireAdmin, requireOperatorOrAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/summary', requireOperatorOrAdmin, getDashboardSummary);
router.get('/detailed', requireAdmin, getDetailedReport);

export default router;
