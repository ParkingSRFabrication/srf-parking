import { Router } from 'express';
import { searchVehicle, getVehicleHistory } from '../controllers/vehicleController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/search', searchVehicle);
router.get('/:registrationNumber/history', getVehicleHistory);

export default router;
