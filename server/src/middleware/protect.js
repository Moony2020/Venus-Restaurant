import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getAuthCookieName } from '../lib/auth.js';

export const protect = async (req, res, next) => {
  const token = req.cookies?.[getAuthCookieName()];
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const secret = process.env.JWT_SECRET || process.env.COOKIE_SECRET;
    const payload = jwt.verify(token, secret);
    const user = await User.findById(payload.userId).select('-password');
    if (!user) return res.status(401).json({ message: 'Invalid session' });

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
