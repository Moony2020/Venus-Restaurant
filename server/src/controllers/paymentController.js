import Stripe from 'stripe';
import paypal from '@paypal/checkout-server-sdk';
import Lead from '../models/Lead.js';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const paypalEnvironment = process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_SECRET
  ? new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET)
  : null;

const paypalClient = paypalEnvironment ? new paypal.core.PayPalHttpClient(paypalEnvironment) : null;

export const createStripeCheckoutSession = async (req, res) => {
  if (!stripe) return res.status(500).json({ message: 'Stripe is not configured' });

  const { items = [], successUrl, cancelUrl } = req.body;

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

  const { leadId } = req.body;
  if (!leadId) return res.status(400).json({ message: 'leadId is required' });

  const lead = await Lead.findById(leadId);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });

  const isAdmin = req.user?.role === 'admin';
  const isOwner = lead.user && req.user?._id && lead.user.toString() === req.user._id.toString();
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
      leadId: lead._id.toString()
    },
    success_url: `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/booking-success?leadId=${lead._id}`,
    cancel_url: `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/bespoke`
  });

  res.json({ checkoutUrl: session.url, sessionId: session.id });
};

export const stripeWebhook = async (req, res) => {
  let event;

  if (process.env.STRIPE_WEBHOOK_SECRET) {
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } else {
    event = req.body;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const leadId = session.metadata?.leadId;

    if (leadId) {
      await Lead.findByIdAndUpdate(leadId, {
        status: 'booked',
        paymentStatus: 'paid',
        stripeSessionId: session.id
      });
    }
  }

  res.json({ received: true });
};
