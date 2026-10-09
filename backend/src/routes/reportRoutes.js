import { Router } from 'express';
import { getDashboardSummary, getDetailedReport } from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/summary', getDashboardSummary);
router.get('/detailed', getDetailedReport);

export default router;
