import crypto from 'crypto';
import Order from '../models/Order.js';
import { getIO } from '../lib/socket.js';
import { sendOrderConfirmation } from '../lib/mailer.js';

const STATUS_FLOW = {
  pending: ['preparing'],
  preparing: ['ready'],
  ready: ['done'],
  done: []
};

export const createOrder = async (req, res) => {
  const trackingCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  const orderMode = req.body.orderMode === 'delivery' ? 'delivery' : 'pickup';
  const paymentMethod = ['pay_on_pickup', 'stripe', 'paypal'].includes(req.body.paymentMethod)
    ? req.body.paymentMethod
    : 'pay_on_pickup';
  const deliveryFee = orderMode === 'delivery' ? Math.max(0, Number(req.body.deliveryFee) || 0) : 0;
  const etaText =
    typeof req.body.etaText === 'string' && req.body.etaText.trim()
      ? req.body.etaText.trim()
      : orderMode === 'delivery'
        ? '25-40 min'
        : '10-15 min';

  const sanitizedItems = (req.body.items || []).map((item) => ({
    menuItemId: String(item.menuItemId || item.id || item._id || ''),
    name: item.name,
    price: Number(item.price) || 0,
    quantity: Math.max(1, Number(item.quantity) || 1),
    notes: typeof item.notes === 'string' ? item.notes.trim() : '',
    extras: Array.isArray(item.extras) ? item.extras.map(e => ({
      label: String(e.label || ''),
      price: Number(e.price) || 0,
      groupId: String(e.groupId || ''),
      optionId: String(e.optionId || '')
    })) : [],
    availabilityAction: ['remove', 'cancel', 'call'].includes(item.availabilityAction) ? item.availabilityAction : 'remove'
  }));

  const computedTotal = sanitizedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const order = await Order.create({
    customerName: req.body.customerName,
    email: req.body.email,
    phone: typeof req.body.phone === 'string' ? req.body.phone.trim() : '',
    items: sanitizedItems,
    totalAmount: computedTotal + deliveryFee,
    orderMode,
    deliveryFee,
    etaText,
    paymentMethod,
    paymentStatus: paymentMethod === 'pay_on_pickup' ? 'paid' : 'unpaid',
    user: req.user?._id || null,
    trackingCode,
    status: 'pending'
  });

  // Only notify kitchen and customer immediately if it's a "Pay on Pickup" order.
  // For online payments, the Stripe/PayPal webhook will handle this after payment is confirmed.
  if (order.paymentMethod === 'pay_on_pickup') {
    const io = getIO();
    if (io) io.emit('order:new', order);
    sendOrderConfirmation(order).catch(() => {});
  }

  res.status(201).json(order);
};

export const getOrderByTrackingCode = async (req, res) => {
  const order = await Order.findOne({ trackingCode: req.params.trackingCode });
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  return res.json(order);
};

export const getTrackedOrder = async (req, res) => {
  const trackingCode = String(req.params.trackingCode || '').toUpperCase();
  const order = await Order.findOne({ trackingCode }).select(
    'trackingCode status items totalAmount orderMode deliveryFee etaText createdAt'
  );

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  return res.json(order);
};

export const getOrdersAdmin = async (req, res) => {
  const { status, dateFrom, dateTo } = req.query;
  const query = {};

  if (status) query.status = status;
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  const orders = await Order.find(query).sort({ createdAt: -1 });
  res.json(orders);
};

export const getOrderAnalytics = async (req, res) => {
  const days = Math.min(90, Math.max(1, Number(req.query.days) || 14));
  const fromDate = new Date();
  fromDate.setHours(0, 0, 0, 0);
  fromDate.setDate(fromDate.getDate() - (days - 1));

  const rows = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: fromDate }
      }
    },
    {
      $group: {
        _id: {
          y: { $year: '$createdAt' },
          m: { $month: '$createdAt' },
          d: { $dayOfMonth: '$createdAt' }
        },
        ordersCount: { $sum: 1 },
        revenue: { $sum: '$totalAmount' }
      }
    }
  ]);

  const map = new Map();
  for (const row of rows) {
    const key = `${row._id.y}-${String(row._id.m).padStart(2, '0')}-${String(row._id.d).padStart(2, '0')}`;
    map.set(key, {
      date: key,
      ordersCount: row.ordersCount,
      revenue: Math.round(row.revenue || 0)
    });
  }

  const timeline = [];
  const cursor = new Date(fromDate);
  for (let i = 0; i < days; i += 1) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    const row = map.get(key) || { date: key, ordersCount: 0, revenue: 0 };
    timeline.push(row);
    cursor.setDate(cursor.getDate() + 1);
  }

  const totals = timeline.reduce(
    (acc, day) => {
      acc.orders += day.ordersCount;
      acc.revenue += day.revenue;
      return acc;
    },
    { orders: 0, revenue: 0 }
  );

  res.json({
    days,
    fromDate,
    totals,
    timeline
  });
};

export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) return res.status(404).json({ message: 'Order not found' });

  const allowedNext = STATUS_FLOW[order.status] || [];
  if (!allowedNext.includes(status)) {
    return res.status(400).json({
      message: `Invalid status transition from ${order.status} to ${status}`
    });
  }

  order.status = status;
  await order.save();

  const io = getIO();
  if (io) io.emit('order:update', order);

  return res.json(order);
};
