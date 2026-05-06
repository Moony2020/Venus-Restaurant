import express from 'express';
import {
  createOrder,
  getTrackedOrder,
  getOrderByTrackingCode,
  getOrdersAdmin,
  updateOrderStatus
} from '../controllers/orderController.js';
import { getMyOrders } from '../controllers/userOrderController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { attachUserIfAny } from '../middleware/attachUserIfAny.js';
import { requireRole, verifyToken } from '../middleware/authMiddleware.js';
import {
  validateCreateOrder,
  validateUpdateOrderStatus
} from '../validators/orderValidators.js';

const router = express.Router();

router.post('/', attachUserIfAny, validateCreateOrder, asyncHandler(createOrder));
router.get('/my', verifyToken, asyncHandler(getMyOrders));
router.get('/', verifyToken, requireRole('admin'), asyncHandler(getOrdersAdmin));
router.get('/track/:trackingCode', asyncHandler(getTrackedOrder));
router.patch(
  '/:id/status',
  verifyToken,
  requireRole('admin'),
  validateUpdateOrderStatus,
  asyncHandler(updateOrderStatus)
);
router.get('/:trackingCode', asyncHandler(getOrderByTrackingCode));

export default router;
