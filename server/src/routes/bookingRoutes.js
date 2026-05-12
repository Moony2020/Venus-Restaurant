import express from 'express';
import rateLimit from 'express-rate-limit';
import { createBooking, getBookingsAdmin, updateBookingStatus } from '../controllers/bookingController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireRole, verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

const bookingWriteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many booking requests, please try again shortly.' }
});

router.post('/', bookingWriteLimiter, asyncHandler(createBooking));
router.get('/', verifyToken, requireRole('admin'), asyncHandler(getBookingsAdmin));
router.patch('/:id/status', verifyToken, requireRole('admin'), asyncHandler(updateBookingStatus));

export default router;
