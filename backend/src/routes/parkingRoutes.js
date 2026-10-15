import { Router } from 'express';
import {
  createEntry,
  lookupToken,
  processExit,
  cancelToken,
  getTokens,
  getTokenById
} from '../controllers/parkingController.js';
import { authenticate, requireOperatorOrAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/entries', requireOperatorOrAdmin, createEntry);
router.get('/lookup', requireOperatorOrAdmin, lookupToken);
router.post('/tokens/:id/exit', requireOperatorOrAdmin, processExit);
router.post('/tokens/:id/cancel', requireOperatorOrAdmin, cancelToken);
router.get('/tokens', requireOperatorOrAdmin, getTokens);
router.get('/tokens/:id', getTokenById);

export default router;

