import express from 'express';
import {
  createMenuItem,
  deleteMenuItem,
  getLunchOfTheDay,
  getMenuItems,
  reorderCategoryItems,
  setAvailability,
  updateMenuItem
} from '../controllers/menuController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireRole, verifyToken } from '../middleware/authMiddleware.js';
import { attachUserIfAny } from '../middleware/attachUserIfAny.js';

const router = express.Router();

router.get('/', attachUserIfAny, asyncHandler(getMenuItems));
router.get('/lunch-of-the-day', asyncHandler(getLunchOfTheDay));
router.post('/', verifyToken, requireRole('admin'), asyncHandler(createMenuItem));
router.patch('/reorder', verifyToken, requireRole('admin'), asyncHandler(reorderCategoryItems));
router.patch('/:id/availability', verifyToken, requireRole('admin'), asyncHandler(setAvailability));
router.patch('/:id', verifyToken, requireRole('admin'), asyncHandler(updateMenuItem));
router.delete('/:id', verifyToken, requireRole('admin'), asyncHandler(deleteMenuItem));

export default router;

