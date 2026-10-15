import { Router } from 'express';
import {
  createPass,
  renewPass,
  cancelPass,
  getPasses,
  getPassById
} from '../controllers/passController.js';
import { authenticate, requireOperatorOrAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', requireOperatorOrAdmin, createPass);
router.get('/', requireOperatorOrAdmin, getPasses);
router.get('/:id', getPassById);
router.post('/:id/renew', requireOperatorOrAdmin, renewPass);
router.post('/:id/cancel', requireOperatorOrAdmin, cancelPass);

export default router;
