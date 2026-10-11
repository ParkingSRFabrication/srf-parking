import { Router } from 'express';
import { login, logout, getMe, refreshToken, requestOtp, verifyOtp, googleLogin } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/login', loginLimiter, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/refresh', refreshToken);

// Email OTP and Google Sign-In Routes
router.post('/request-otp', loginLimiter, requestOtp);
router.post('/verify-otp', loginLimiter, verifyOtp);
router.post('/google', loginLimiter, googleLogin);

export default router;
