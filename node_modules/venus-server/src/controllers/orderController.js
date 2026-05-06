import crypto from 'crypto';
import Order from '../models/Order.js';
import { getIO } from '../lib/socket.js';

const STATUS_FLOW = {
  pending: ['preparing'],
  preparing: ['ready'],
  ready: ['done'],
  done: []
};

export const createOrder = async (req, res) => {
  const trackingCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  const orderMode = req.body.orderMode === 'delivery' ? 'delivery' : 'pickup';
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
    quantity: Math.max(1, Number(item.quantity) || 1)
  }));

  const computedTotal = sanitizedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const order = await Order.create({
    customerName: req.body.customerName,
    email: req.body.email,
    items: sanitizedItems,
    totalAmount: computedTotal + deliveryFee,
    orderMode,
    deliveryFee,
    etaText,
    user: req.user?._id || null,
    trackingCode,
    status: 'pending'
  });

  const io = getIO();
  if (io) io.emit('order:new', order);

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
