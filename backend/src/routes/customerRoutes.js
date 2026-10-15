import { Router } from 'express';
import {
  getCustomerDashboard,
  getCustomerVehicles,
  addCustomerVehicle,
  removeCustomerVehicle,
  getCustomerHistory,
  getCustomerPasses,
  getCustomerReceipt
} from '../controllers/customerController.js';
import { authenticate, requireCustomer } from '../middleware/auth.js';

const router = Router();

// Protect all customer routes with authentication and customer/commuter/admin role check
router.use(authenticate);
router.use(requireCustomer);

router.get('/dashboard', getCustomerDashboard);
router.get('/vehicles', getCustomerVehicles);
router.post('/vehicles', addCustomerVehicle);
router.delete('/vehicles/:registrationNumber', removeCustomerVehicle);
router.get('/history', getCustomerHistory);
router.get('/passes', getCustomerPasses);
router.get('/receipt/:id', getCustomerReceipt);

export default router;
