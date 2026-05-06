import express from 'express';
import { changePassword, getMe, login, logout, register } from '../controllers/authController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  validateChangePassword,
  validateLogin,
  validateRegister
} from '../validators/authValidators.js';

const router = express.Router();

router.post('/register', validateRegister, asyncHandler(register));
router.post('/login', validateLogin, asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.get('/me', verifyToken, asyncHandler(getMe));
router.patch(
  '/change-password',
  verifyToken,
  validateChangePassword,
  asyncHandler(changePassword)
);

export default router;
