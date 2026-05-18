import Stripe from 'stripe';
import paypal from '@paypal/checkout-server-sdk';
import Inquiry from '../models/Inquiry.js';
import Order from '../models/Order.js';
import { getIO } from '../lib/socket.js';
import { sendOrderConfirmation } from '../lib/mailer.js';

// Lazy initialization — env vars aren't available at import time
// because dotenv.config() runs after all ES module imports resolve.
let _stripe = null;
let _stripeInitialized = false;
const getStripe = () => {
  if (!_stripeInitialized) {
    _stripeInitialized = true;
    _stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
  }
  return _stripe;
};

let _paypalClient = null;
let _paypalInitialized = false;
const getPayPalClient = () => {
  if (!_paypalInitialized) {
    _paypalInitialized = true;
    const isLive = process.env.PAYPAL_MODE === 'live' || process.env.NODE_ENV === 'production';
    const env = process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_SECRET
      ? (isLive
          ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET)
          : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET))
      : null;
    _paypalClient = env ? new paypal.core.PayPalHttpClient(env) : null;
  }
  return _paypalClient;
};

const getAllowedOrigin = () => process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const isAllowedUrl = (url) => {
  try {
    const parsed = new URL(url);
    const origin = new URL(getAllowedOrigin());
    return parsed.origin === origin.origin;
  } catch {
    return false;
  }
};

const appendStripeSessionIdPlaceholder = (url) => {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');
    return parsed.toString();
  } catch {
    return url;
  }
};

export const createStripeCheckoutSession = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(500).json({ message: 'Stripe is not configured' });

  const {
    items = [],
    successUrl,
    cancelUrl,
    metadata = {},
    customerEmail,
    serviceFeeSek = 0,
    deliveryFeeSek = 0,
    orderId = ''
  } = req.body;

  if (!isAllowedUrl(successUrl) || !isAllowedUrl(cancelUrl)) {
    return res.status(400).json({ message: 'Invalid redirect URLs' });
  }

  const lineItems = items.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: 'sek',
      unit_amount: Math.round(item.price * 100),
      product_data: {
        name: item.name,
        images: item.image
          ? [item.image.startsWith('http') ? item.image : `${process.env.PUBLIC_APP_URL || 'http://localhost:5173'}${item.image}`]
          : []
      }
    }
  }));

  const normalizedServiceFeeSek = Math.max(0, Number(serviceFeeSek) || 0);
  const normalizedDeliveryFeeSek = Math.max(0, Number(deliveryFeeSek) || 0);

  if (normalizedServiceFeeSek > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: 'sek',
        unit_amount: Math.round(normalizedServiceFeeSek * 100),
        product_data: { name: 'Serviceavgift' }
      }
    });
  }

  if (normalizedDeliveryFeeSek > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: 'sek',
        unit_amount: Math.round(normalizedDeliveryFeeSek * 100),
        product_data: { name: 'Leveransavgift' }
      }
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    customer_email: typeof customerEmail === 'string' && customerEmail.includes('@') ? customerEmail : undefined,
    metadata: {
      ...(metadata && typeof metadata === 'object' ? metadata : {}),
      orderId: String(orderId || metadata?.orderId || '')
    },
    success_url: appendStripeSessionIdPlaceholder(successUrl),
    cancel_url: cancelUrl
  });

  res.json({ url: session.url, id: session.id });
};

export const createPayPalOrder = async (req, res) => {
  const paypalClient = getPayPalClient();
  if (!paypalClient) return res.status(500).json({ message: 'PayPal is not configured' });

  const { 
    items = [], 
    returnUrl, 
    cancelUrl,
    serviceFeeSek = 0,
    deliveryFeeSek = 0
  } = req.body;

  if (!isAllowedUrl(returnUrl) || !isAllowedUrl(cancelUrl)) {
    return res.status(400).json({ message: 'Invalid redirect URLs' });
  }

  const subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const total = subtotal + (Number(serviceFeeSek) || 0) + (Number(deliveryFeeSek) || 0);

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{ 
      amount: { 
        currency_code: 'SEK', 
        value: total.toFixed(2) 
      } 
    }],
    application_context: {
      return_url: returnUrl,
      cancel_url: cancelUrl,
      user_action: 'PAY_NOW'
    }
  });

  const response = await paypalClient.execute(request);
  const approveLink = response.result.links?.find((link) => link.rel === 'approve')?.href;
  res.json({ id: response.result.id, approveUrl: approveLink });
};

export const capturePayPalOrder = async (req, res) => {
  const paypalClient = getPayPalClient();
  if (!paypalClient) return res.status(500).json({ message: 'PayPal is not configured' });

  const { orderId, paypalOrderId } = req.body;
  if (!paypalOrderId) return res.status(400).json({ message: 'paypalOrderId is required' });

  try {
    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({});

    const response = await paypalClient.execute(request);
    const status = response.result.status;

    if (status === 'COMPLETED') {
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid';
          order.paypalOrderId = paypalOrderId;
          await order.save();

          const io = getIO();
          if (io) io.emit('order:new', order);
          sendOrderConfirmation(order).catch(() => {});
        }
      }
      return res.json({ success: true, status });
    }

    res.status(400).json({ success: false, status });
  } catch (error) {
    console.error('PayPal Capture Error:', error);
    res.status(500).json({ message: 'Failed to capture PayPal order' });
  }
};

export const createDepositSession = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(500).json({ message: 'Stripe is not configured' });

  const { inquiryId } = req.body;
  if (!inquiryId) return res.status(400).json({ message: 'inquiryId is required' });

  const inquiry = await Inquiry.findById(inquiryId);
  if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

  const amountSek = Number(process.env.BESPOKE_DEPOSIT_SEK || 500);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'sek',
          product_data: { name: 'Bespoke Dining Deposit' },
          unit_amount: amountSek * 100
        },
        quantity: 1
      }
    ],
    metadata: {
      inquiryId: inquiry._id.toString()
    },
    success_url: `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/booking-success?inquiryId=${inquiry._id}`,
    cancel_url: `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/bespoke`
  });

  res.json({ checkoutUrl: session.url, sessionId: session.id });
};

export const stripeWebhook = async (req, res) => {
  let event;

  if (process.env.STRIPE_WEBHOOK_SECRET) {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({ message: 'Stripe webhook is misconfigured' });
    }
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } else {
    event = req.body;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Handled below
    const inquiryId = session.metadata?.inquiryId;
    const orderId = session.metadata?.orderId;

    if (inquiryId) {
      await Inquiry.findByIdAndUpdate(inquiryId, {
        status: 'booked',
        paymentStatus: 'paid',
        stripeSessionId: session.id
      });
    }

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.stripeSessionId = session.id;
        await order.save();

        const io = getIO();
        if (io) io.emit('order:new', order);
        sendOrderConfirmation(order).catch(() => {});
      }
    }
  }

  res.json({ received: true });
};

export const confirmStripeSession = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(500).json({ message: 'Stripe is not configured' });

  const sessionId = String(req.query.session_id || '').trim();
  if (!sessionId) return res.status(400).json({ message: 'session_id is required' });

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (!session || session.payment_status !== 'paid') {
    return res.status(400).json({ message: 'Session is not paid' });
  }

  const orderId = session.metadata?.orderId;
  if (!orderId) return res.status(400).json({ message: 'Order metadata missing' });

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (order.paymentStatus !== 'paid') {
    order.paymentStatus = 'paid';
    order.stripeSessionId = session.id;
    await order.save();

    const io = getIO();
    if (io) io.emit('order:new', order);
    sendOrderConfirmation(order).catch(() => {});
  }

  return res.json({ success: true, orderId: order._id, paymentStatus: order.paymentStatus });
};
