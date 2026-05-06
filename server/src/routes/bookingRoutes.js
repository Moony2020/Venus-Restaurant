import express from 'express';
import { createBooking, getBookingsAdmin, updateBookingStatus } from '../controllers/bookingController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireRole, verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', asyncHandler(createBooking));
router.get('/', verifyToken, requireRole('admin'), asyncHandler(getBookingsAdmin));
router.patch('/:id/status', verifyToken, requireRole('admin'), asyncHandler(updateBookingStatus));

export default router;
