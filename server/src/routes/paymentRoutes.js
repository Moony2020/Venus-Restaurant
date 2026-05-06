import express from 'express';
import { createDepositSession, createPayPalOrder, createStripeCheckoutSession } from '../controllers/paymentController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { validatePaymentSession } from '../validators/paymentValidators.js';

const router = express.Router();

router.post('/stripe/checkout-session', validatePaymentSession, asyncHandler(createStripeCheckoutSession));
router.post('/paypal/create-order', validatePaymentSession, asyncHandler(createPayPalOrder));
router.post('/deposit', verifyToken, asyncHandler(createDepositSession));

export default router;
