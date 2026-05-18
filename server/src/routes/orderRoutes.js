import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  createOrder,
  getTrackedOrder,
  getOrderByTrackingCode,
  getOrderAnalytics,
  getOrdersAdmin,
  updateOrderPayment,
  updateOrderStatus
} from '../controllers/orderController.js';
import { ensureRestaurantOpenForOrders, getKitchenOrders } from '../controllers/restaurantController.js';
import { getMyOrders } from '../controllers/userOrderController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { attachUserIfAny } from '../middleware/attachUserIfAny.js';
import { requireRole, verifyToken } from '../middleware/authMiddleware.js';
import {
  validateCreateOrder,
  validateUpdateOrderStatus
} from '../validators/orderValidators.js';

const router = express.Router();

const orderWriteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many order requests, please try again shortly.' }
});

router.post(
  '/',
  orderWriteLimiter,
  attachUserIfAny,
  asyncHandler(ensureRestaurantOpenForOrders),
  validateCreateOrder,
  asyncHandler(createOrder)
);
router.get('/my', verifyToken, asyncHandler(getMyOrders));
router.get('/', verifyToken, requireRole('admin'), asyncHandler(getOrdersAdmin));
router.get('/kitchen/active', verifyToken, requireRole('admin'), asyncHandler(getKitchenOrders));
router.get('/analytics/daily', verifyToken, requireRole('admin'), asyncHandler(getOrderAnalytics));
router.get('/track/:trackingCode', asyncHandler(getTrackedOrder));
router.patch(
  '/:id/status',
  verifyToken,
  requireRole('admin'),
  validateUpdateOrderStatus,
  asyncHandler(updateOrderStatus)
);
router.patch(
  '/:id/payment',
  verifyToken,
  requireRole('admin'),
  asyncHandler(updateOrderPayment)
);
router.get('/:trackingCode', asyncHandler(getOrderByTrackingCode));

export default router;
