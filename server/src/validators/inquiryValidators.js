export const validateInquiry = (req, res, next) => {
  const { fullName, email, eventType, guests, message } = req.body;

  if (!fullName || typeof fullName !== 'string') return res.status(400).json({ message: 'Fullständigt namn krävs' });
  if (!email || typeof email !== 'string' || !email.includes('@')) return res.status(400).json({ message: 'Giltig e-postadress krävs' });
  if (!eventType || typeof eventType !== 'string') return res.status(400).json({ message: 'Typ av evenemang krävs' });
  if (!guests || isNaN(Number(guests)) || Number(guests) < 1) return res.status(400).json({ message: 'Antal gäster måste vara ett positivt tal' });
  if (!message || typeof message !== 'string') return res.status(400).json({ message: 'Meddelande krävs' });

  return next();
};

export const validateInquiryStatusUpdate = (req, res, next) => {
  const { status } = req.body;
  if (!['new', 'contacted', 'booked', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Ogiltig status' });
  }
  return next();
};
