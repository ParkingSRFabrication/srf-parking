import { Router } from 'express';
import {
  createEntry,
  lookupToken,
  processExit,
  cancelToken,
  getTokens,
  getTokenById
} from '../controllers/parkingController.js';
import { authenticate, requirePermission } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/entries', createEntry);
router.get('/lookup', lookupToken);
router.post('/tokens/:id/exit', processExit);
router.post('/tokens/:id/cancel', cancelToken);
router.get('/tokens', getTokens);
router.get('/tokens/:id', getTokenById);

export default router;
