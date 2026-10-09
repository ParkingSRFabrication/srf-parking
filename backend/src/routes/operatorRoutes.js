import { Router } from 'express';
import {
  getOperators,
  createOperator,
  updateOperator,
  getOperatorStats
} from '../controllers/operatorController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/', getOperators);
router.post('/', createOperator);
router.patch('/:id', updateOperator);
router.get('/:id/stats', getOperatorStats);

export default router;
