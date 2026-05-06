import express from 'express';
import {
  createLead,
  getLeadById,
  getLeads,
  getLeadStats,
  updateLeadStatus
} from '../controllers/leadController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { validateCreateLead, validateLeadStatusUpdate } from '../validators/leadValidators.js';
import { attachUserIfAny } from '../middleware/attachUserIfAny.js';

const router = express.Router();

router.post('/', attachUserIfAny, validateCreateLead, asyncHandler(createLead));
router.get('/stats', verifyToken, requireRole('admin'), asyncHandler(getLeadStats));
router.get('/', verifyToken, requireRole('admin'), asyncHandler(getLeads));
router.get('/:id', verifyToken, asyncHandler(getLeadById));
router.patch('/:id', verifyToken, requireRole('admin'), validateLeadStatusUpdate, asyncHandler(updateLeadStatus));

export default router;
