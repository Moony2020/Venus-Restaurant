import express from 'express';
import {
  createInquiry,
  getInquiryById,
  getInquiries,
  getInquiryStats,
  updateInquiryStatus
} from '../controllers/inquiryController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { validateInquiry, validateInquiryStatusUpdate } from '../validators/inquiryValidators.js';
import { attachUserIfAny } from '../middleware/attachUserIfAny.js';

const router = express.Router();

router.post('/', attachUserIfAny, validateInquiry, asyncHandler(createInquiry));
router.get('/stats', verifyToken, requireRole('admin'), asyncHandler(getInquiryStats));
router.get('/', verifyToken, requireRole('admin'), asyncHandler(getInquiries));
router.get('/:id', verifyToken, asyncHandler(getInquiryById));
router.patch('/:id/status', verifyToken, requireRole('admin'), validateInquiryStatusUpdate, asyncHandler(updateInquiryStatus));

export default router;
