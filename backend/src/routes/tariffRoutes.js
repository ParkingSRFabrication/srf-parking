import { Router } from 'express';
import {
  getTariffs,
  createTariff,
  updateTariff,
  previewTariffCalculation
} from '../controllers/tariffController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getTariffs);
router.post('/preview', previewTariffCalculation);
router.post('/', requireAdmin, createTariff);
router.patch('/:id', requireAdmin, updateTariff);

export default router;
