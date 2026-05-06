export const validateCreateOrder = (req, res, next) => {
  const { customerName, email, items, totalAmount, orderMode, deliveryFee, etaText } = req.body;

  if (!customerName || typeof customerName !== 'string') {
    return res.status(400).json({ message: 'customerName is required' });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ message: 'valid email is required' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'items must be a non-empty array' });
  }

  if (typeof totalAmount !== 'number' || totalAmount <= 0) {
    return res.status(400).json({ message: 'totalAmount must be a positive number' });
  }

  if (orderMode && !['pickup', 'delivery'].includes(orderMode)) {
    return res.status(400).json({ message: 'orderMode must be pickup or delivery' });
  }

  if (deliveryFee != null && (typeof deliveryFee !== 'number' || deliveryFee < 0)) {
    return res.status(400).json({ message: 'deliveryFee must be a non-negative number' });
  }

  if (etaText != null && typeof etaText !== 'string') {
    return res.status(400).json({ message: 'etaText must be a string' });
  }

  return next();
};

export const validateUpdateOrderStatus = (req, res, next) => {
  const { status } = req.body;
  const allowed = ['pending', 'preparing', 'ready', 'done'];

  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ message: 'status must be one of pending, preparing, ready, done' });
  }

  return next();
};
