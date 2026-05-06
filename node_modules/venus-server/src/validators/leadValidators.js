export const validateCreateLead = (req, res, next) => {
  const { fullName, email, eventType, guests, message } = req.body;

  if (!fullName || typeof fullName !== 'string') return res.status(400).json({ message: 'fullName is required' });
  if (!email || typeof email !== 'string' || !email.includes('@')) return res.status(400).json({ message: 'valid email is required' });
  if (!eventType || typeof eventType !== 'string') return res.status(400).json({ message: 'eventType is required' });
  if (typeof guests !== 'number' || guests < 1) return res.status(400).json({ message: 'guests must be a positive number' });
  if (!message || typeof message !== 'string') return res.status(400).json({ message: 'message is required' });

  return next();
};

export const validateLeadStatusUpdate = (req, res, next) => {
  const { status } = req.body;
  if (!['new', 'contacted', 'booked'].includes(status)) {
    return res.status(400).json({ message: 'status must be new, contacted, or booked' });
  }
  return next();
};
