import express from 'express';
import {
  createNeed,
  deleteNeed,
  getNeeds,
  getPublicRestaurantStatus,
  getRestaurantSettingsAdmin,
  updateNeed,
  updateRestaurantSettingsAdmin
} from '../controllers/restaurantController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireRole, verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/status', asyncHandler(getPublicRestaurantStatus));
router.get('/settings', verifyToken, requireRole('admin'), asyncHandler(getRestaurantSettingsAdmin));
router.patch('/settings', verifyToken, requireRole('admin'), asyncHandler(updateRestaurantSettingsAdmin));

router.get('/needs', verifyToken, requireRole('admin'), asyncHandler(getNeeds));
router.post('/needs', verifyToken, requireRole('admin'), asyncHandler(createNeed));
router.patch('/needs/:id', verifyToken, requireRole('admin'), asyncHandler(updateNeed));
router.delete('/needs/:id', verifyToken, requireRole('admin'), asyncHandler(deleteNeed));

export default router;

