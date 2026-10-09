import { Router } from 'express';
import {
  createPass,
  renewPass,
  cancelPass,
  getPasses,
  getPassById
} from '../controllers/passController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', createPass);
router.get('/', getPasses);
router.get('/:id', getPassById);
router.post('/:id/renew', renewPass);
router.post('/:id/cancel', cancelPass);

export default router;
