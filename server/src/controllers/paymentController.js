import Stripe from 'stripe';
import paypal from '@paypal/checkout-server-sdk';
import Inquiry from '../models/Inquiry.js';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const isPayPalLiveMode = process.env.PAYPAL_MODE === 'live' || process.env.NODE_ENV === 'production';

const paypalEnvironment = process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_SECRET
  ? (isPayPalLiveMode
      ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET)
      : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET))
  : null;

const paypalClient = paypalEnvironment ? new paypal.core.PayPalHttpClient(paypalEnvironment) : null;

const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const isAllowedUrl = (url) => {
  try {
    const parsed = new URL(url);
    const origin = new URL(allowedOrigin);
    return parsed.origin === origin.origin;
  } catch {
    return false;
  }
};

export const createStripeCheckoutSession = async (req, res) => {
  if (!stripe) return res.status(500).json({ message: 'Stripe is not configured' });

  const { items = [], successUrl, cancelUrl } = req.body;

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

  lineItems.push({
    quantity: 1,
    price_data: {
      currency: 'sek',
      unit_amount: 20000,
      product_data: { name: 'Service & Sommelier' }
    }
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl
  });

  res.json({ url: session.url, id: session.id });
};

export const createPayPalOrder = async (req, res) => {
  if (!paypalClient) return res.status(500).json({ message: 'PayPal is not configured' });

  const { items = [], returnUrl, cancelUrl } = req.body;

  if (!isAllowedUrl(returnUrl) || !isAllowedUrl(cancelUrl)) {
    return res.status(400).json({ message: 'Invalid redirect URLs' });
  }
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + 200;

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{ amount: { currency_code: 'SEK', value: total.toFixed(2) } }],
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

export const createDepositSession = async (req, res) => {
  if (!stripe) return res.status(500).json({ message: 'Stripe is not configured' });

  const { inquiryId } = req.body;
  if (!inquiryId) return res.status(400).json({ message: 'inquiryId is required' });

  const inquiry = await Inquiry.findById(inquiryId);
  if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

  const isAdmin = req.user?.role === 'admin';
  const isOwner = inquiry.user && req.user?._id && inquiry.user.toString() === req.user._id.toString();
  if (!isAdmin && !isOwner) return res.status(403).json({ message: 'Forbidden' });

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
    const inquiryId = session.metadata?.inquiryId;

    if (inquiryId) {
      await Inquiry.findByIdAndUpdate(inquiryId, {
        status: 'booked',
        paymentStatus: 'paid',
        stripeSessionId: session.id
      });
    }
  }

  res.json({ received: true });
};
