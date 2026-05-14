import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  changePassword,
  forgotPassword,
  getMe,
  login,
  logout,
  register,
  resetPassword
} from '../controllers/authController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  validateChangePassword,
  validateForgotPassword,
  validateLogin,
  validateResetPassword,
  validateRegister
} from '../validators/authValidators.js';

const router = express.Router();

const authWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again later.' }
});

router.post('/register', authWriteLimiter, validateRegister, asyncHandler(register));
router.post('/login', authWriteLimiter, validateLogin, asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.post('/forgot-password', authWriteLimiter, validateForgotPassword, asyncHandler(forgotPassword));
router.patch('/reset-password', authWriteLimiter, validateResetPassword, asyncHandler(resetPassword));
router.get('/me', verifyToken, asyncHandler(getMe));
router.patch(
  '/change-password',
  verifyToken,
  validateChangePassword,
  asyncHandler(changePassword)
);

export default router;
