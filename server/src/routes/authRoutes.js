import express from 'express';
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

router.post('/register', validateRegister, asyncHandler(register));
router.post('/login', validateLogin, asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.post('/forgot-password', validateForgotPassword, asyncHandler(forgotPassword));
router.patch('/reset-password', validateResetPassword, asyncHandler(resetPassword));
router.get('/me', verifyToken, asyncHandler(getMe));
router.patch(
  '/change-password',
  verifyToken,
  validateChangePassword,
  asyncHandler(changePassword)
);

export default router;
